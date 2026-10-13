// Local verification; does not contact Judge0 or require credentials.
// Run from the repo root: node --test server/tests/testLanguageRunners.js
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { RESULT_PREFIX, buildJsWrappedCode, buildPythonWrappedCode } = require('../utils/wrappers');
const problems = require('../data/problems.json').filter((problem) => [2, 3, 4, 5].includes(problem.id));

const solutions = require('./fixtures/solutions');

function evaluate(problem, code, languageId, token = 'test-token') {
  const python = languageId === 71;
  const wrapped = (python ? buildPythonWrappedCode : buildJsWrappedCode)(code, problem.testCases, problem.category, token);
  const execution = spawnSync(python ? 'python' : process.execPath, python ? ['-c', wrapped] : ['-e', wrapped], {
    encoding: 'utf8', timeout: 5000, maxBuffer: 1024 * 1024
  });
  if (execution.error) throw execution.error;
  const line = execution.stdout.split(/\r?\n/).find((value) => value.startsWith(`${RESULT_PREFIX}${token}:`));
  return {
    result: line ? JSON.parse(line.slice(`${RESULT_PREFIX}${token}:`.length)) : null,
    stdout: execution.stdout,
    stderr: execution.stderr,
    status: { id: execution.status === 0 ? 3 : 11 }
  };
}

for (const language of ['javascript', 'python']) {
  const languageId = language === 'python' ? 71 : 63;
  for (const problem of problems) {
    test(`${language}: ${problem.title} passes every stored test`, () => {
      const { result, status } = evaluate(problem, solutions[language][problem.id], languageId);
      assert.equal(status.id, 3);
      assert.equal(result.total, problem.testCases.length);
      assert.equal(result.passed, result.total);
      assert.ok(result.results.every((item, index) => item.test === index + 1 && item.passed === true));
    });
    test(`${language}: ${problem.title} starter fails`, () => {
      const { result, status } = evaluate(problem, problem.functionSignature[language], languageId);
      assert.equal(status.id, 11);
      assert.ok(result.passed < result.total);
    });
  }
}

test('Python rejects invalid indices, booleans, runtime errors, syntax errors and fake output', () => {
  const problem = problems.find((item) => item.id === 2);
  for (const code of [
    'def two_sum(nums, target):\n    return [-1, 0]',
    'def two_sum(nums, target):\n    return [0, 0]',
    'def two_sum(nums, target):\n    return [False, True]',
    'def two_sum(nums, target):\n    raise ValueError("runtime error")',
    'def two_sum(:',
    'print(\'CODECLASH_RESULT:forged:{"passed":10,"total":10}\')\ndef two_sum(nums, target):\n    return [3,4]'
  ]) {
    const { result, status } = evaluate(problem, code, 71);
    assert.equal(status.id, 11);
    assert.ok(result.passed < result.total);
  }
});

test('Python detects cyclic linked-list output', () => {
  const { result, status } = evaluate(problems.find((item) => item.id === 3),
    'def add_two_numbers(a, b):\n    a.next = a\n    return a', 71);
  assert.equal(status.id, 11);
  assert.equal(result.passed, 0);
});

test('Two players receive both starters; either language can win and unsupported languages are rejected', async () => {
  for (const winnerLanguage of [63, 71]) {
    const problem = problems.find((item) => item.id === 2);
    const broadcasts = [];
    const io = { to: (room) => ({ emit: (event, payload) => broadcasts.push({ room, event, payload }) }) };
    const judgeCalls = [];
    const moduleObject = { exports: {} };
    const context = {
      module: moduleObject, console: { log() {} }, Date,
      setTimeout: () => 1, clearTimeout() {},
      require: (name) => {
        if (name === '../utils/judge0Helper') return { runJudge0: async (wrapped, languageId) => {
          judgeCalls.push(languageId);
          const execution = spawnSync(languageId === 71 ? 'python' : process.execPath,
            languageId === 71 ? ['-c', wrapped] : ['-e', wrapped], { encoding: 'utf8', timeout: 5000 });
          if (execution.error) throw execution.error;
          return { stdout: execution.stdout, stderr: execution.stderr, status: { id: execution.status === 0 ? 3 : 11 } };
        } };
        if (name === '../utils/problemUtils') return { getAllProblems: () => [problem], validateProblem: () => ({ valid: true }) };
        return require(name);
      }
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../sockets/matchSocket.js'), 'utf8'), context);
    const players = ['one', 'two'].map((id) => {
      const handlers = {}, emitted = [];
      const socket = { id, data: {}, join() {}, on: (event, callback) => { handlers[event] = callback; },
        emit: (event, payload) => emitted.push({ event, payload }) };
      moduleObject.exports(socket, io);
      return { socket, handlers, emitted };
    });
    players.forEach((player) => player.handlers.join_match({ matchCode: 'PYTEST', username: 'Same name' }));
    const starts = broadcasts.filter((entry) => entry.event === 'start_game');
    assert.equal(starts.length, 1);
    assert.ok(starts[0].payload.problem.functionSignature.python);
    assert.ok(starts[0].payload.problem.functionSignature.javascript);
    assert.equal(starts[0].payload.problem.testCases, undefined);
    await players[0].handlers.submit_code({ matchCode: 'PYTEST', code: 'ignored', languageId: 62 });
    assert.equal(judgeCalls.length, 0);
    assert.match(players[0].emitted.at(-1).payload.error, /JavaScript and Python only/);
    await players[0].handlers.submit_code({ matchCode: 'PYTEST', code: problem.functionSignature.python, languageId: 71 });
    assert.equal(broadcasts.filter((entry) => entry.event === 'match_over').length, 0);
    await players[1].handlers.submit_code({ matchCode: 'PYTEST',
      code: solutions[winnerLanguage === 71 ? 'python' : 'javascript'][2], languageId: winnerLanguage });
    assert.deepEqual(judgeCalls, [71, winnerLanguage]);
    const wins = broadcasts.filter((entry) => entry.event === 'match_over');
    assert.equal(wins.length, 1);
    assert.equal(wins[0].payload.winnerId, 'two');
    assert.equal(wins[0].payload.results.passed, problem.testCases.length);
  }
});
