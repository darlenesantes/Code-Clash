// Local verification; does not contact Judge0 or require credentials.
// Run from the repo root: node --test server/tests/testLanguageRunners.js
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { buildJsWrappedCode, buildPythonWrappedCode } = require('../utils/wrappers');
const { parseJudgeResult } = require('../utils/judgeResult');
const problems = require('../data/problems.json').filter((problem) => [2, 3, 4, 5].includes(problem.id));

const solutions = require('./fixtures/solutions');

function evaluate(problem, code, languageId, token = 'test-token') {
  const python = languageId === 71;
  const wrapped = (python ? buildPythonWrappedCode : buildJsWrappedCode)(code, problem.testCases, problem.category, token);
  const execution = spawnSync(python ? 'python' : process.execPath, python ? ['-c', wrapped] : ['-e', wrapped], {
    encoding: 'utf8', timeout: 5000, maxBuffer: 1024 * 1024
  });
  if (execution.error) throw execution.error;
  return {
    result: parseJudgeResult(execution.stdout, token, problem.testCases, problem.category),
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
      assert.ok([3, 11].includes(status.id));
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
    assert.ok([3, 11].includes(status.id));
    assert.ok(result.passed < result.total);
  }
});

test('Python detects cyclic linked-list output', () => {
  const { result, status } = evaluate(problems.find((item) => item.id === 3),
    'def add_two_numbers(a, b):\n    a.next = a\n    return a', 71);
  assert.equal(status.id, 11);
  assert.equal(result.passed, 0);
});

test('JavaScript cannot access the collector, mutate expected answers, or pass Two Sum by changing nums', () => {
  const problem = problems.find((item) => item.id === 2);
  const original = JSON.stringify(problem.testCases);
  for (const code of [
    'for (let i=0;i<10;i++) __codeClashResults.push({test:i+1,passed:true}); __codeClashFinish();',
    'function twoSum() { __codeClashResults.length=0; __codeClashFinish(); return [0,0]; }',
    'function twoSum(nums,target) { nums[0]=0; nums[1]=target; return [0,1]; }',
    'function twoSum() { return [0,0]; }',
    'console.log(\'CODECLASH_RESULT:test-token:{"passed":10,"total":10,"results":[]}\'); function twoSum(){return [0,0];}'
  ]) {
    const { result } = evaluate(problem, code, 63);
    assert.ok(!result || result.passed < result.total);
    assert.equal(JSON.stringify(problem.testCases), original);
  }
  for (const language of ['javascript', 'python']) {
    const wrapper = (language === 'python' ? buildPythonWrappedCode : buildJsWrappedCode)(
      solutions[language][problem.id], problem.testCases, problem.category, 'test-token');
    assert.ok(!wrapper.includes('expectedOutputs'));
  }
});

test('JavaScript supports arrow functions and rejects cyclic linked-list output', () => {
  const arrayProblem = problems.find((item) => item.id === 2);
  const arrow = solutions.javascript[2].replace('function twoSum(nums, target)', 'const twoSum = (nums, target) =>');
  assert.equal(evaluate(arrayProblem, arrow, 63).result.passed, arrayProblem.testCases.length);
  const { result, status } = evaluate(problems.find((item) => item.id === 3),
    'function addTwoNumbers(a,b) { a.next=a; return a; }', 63);
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
    const { roomCode } = moduleObject.exports.createMatch();
    players.forEach((player) => player.handlers.join_match({ matchCode: roomCode, username: 'Same name' }));
    const starts = broadcasts.filter((entry) => entry.event === 'start_game');
    assert.equal(starts.length, 1);
    assert.ok(starts[0].payload.problem.functionSignature.python);
    assert.ok(starts[0].payload.problem.functionSignature.javascript);
    assert.equal(starts[0].payload.problem.testCases, undefined);
    assert.equal(starts[0].payload.problem.expectedOutputs, undefined);
    assert.equal(starts[0].room, roomCode);
    assert.equal(starts[0].payload.problem.examples.length, 2);
    starts[0].payload.problem.examples.forEach((example, index) => {
      assert.equal(example.input, problem.testCases[index].input);
      assert.equal(example.output, problem.testCases[index].expectedOutputs[0]);
      assert.equal(example.expectedOutputs, undefined);
      assert.equal(example.acceptsOtherOutputs, true);
    });
    await players[0].handlers.submit_code({ matchCode: roomCode, code: 'ignored', languageId: 62 });
    assert.equal(judgeCalls.length, 0);
    assert.match(players[0].emitted.at(-1).payload.error, /JavaScript and Python only/);
    await players[0].handlers.submit_code({ matchCode: roomCode, code: problem.functionSignature.python, languageId: 71 });
    assert.equal(broadcasts.filter((entry) => entry.event === 'match_over').length, 0);
    await players[1].handlers.submit_code({ matchCode: roomCode,
      code: solutions[winnerLanguage === 71 ? 'python' : 'javascript'][2], languageId: winnerLanguage });
    assert.deepEqual(judgeCalls, [71, winnerLanguage]);
    const wins = broadcasts.filter((entry) => entry.event === 'match_over');
    assert.equal(wins.length, 1);
    assert.equal(wins[0].payload.winnerId,
      players[1].emitted.find((entry) => entry.event === 'match_settings').payload.playerId);
    assert.equal(wins[0].payload.results.passed, problem.testCases.length);
  }
});

function matchHarness(randomValue = 0) {
  const broadcasts = [];
  const players = [];
  const io = { to: (room) => ({ emit: (event, payload) => {
    broadcasts.push({ room, event, payload });
    players.filter((player) => player.rooms.has(room)).forEach((player) => player.emitted.push({ event, payload }));
  } }) };
  const moduleObject = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../sockets/matchSocket.js'), 'utf8'), {
    module: moduleObject, console: { log() {} }, Date,
    Math: Object.assign(Object.create(Math), { random: () => randomValue }),
    setTimeout: () => 1, clearTimeout() {},
    require: (name) => name === '../utils/judge0Helper' ? { runJudge0() { throw new Error('Unexpected Judge0 request'); } } : require(name)
  });
  for (const id of ['creator', 'guest']) {
    const handlers = {}, emitted = [], rooms = new Set();
    const socket = { id, data: {}, join: (room) => rooms.add(room),
      on: (event, handler) => { handlers[event] = handler; },
      emit: (event, payload) => emitted.push({ event, payload }) };
    moduleObject.exports(socket, io);
    players.push({ handlers, emitted, rooms });
  }
  return { handler: moduleObject.exports, players, broadcasts };
}

test('creator filters select each supported problem and both players receive identical examples and starters', () => {
  for (const problem of problems) {
    const { handler, players, broadcasts } = matchHarness();
    const preferences = { difficulty: problem.difficulty, topic: problem.category };
    const { roomCode } = handler.createMatch(preferences);
    preferences.topic = 'invalid'; // Mutating caller data must not change saved settings.
    players[0].handlers.join_match({ matchCode: roomCode, username: 'Host' });
    assert.equal(broadcasts.length, 0);
    players[1].handlers.join_match({ matchCode: roomCode, username: 'Guest', difficulty: 'easy', topic: 'arrays' });
    const starts = players.map((player) => player.emitted.filter((event) => event.event === 'start_game'));
    assert.equal(starts[0].length, 1);
    assert.equal(starts[1].length, 1);
    assert.deepEqual(starts[0][0].payload, starts[1][0].payload);
    const payload = starts[0][0].payload;
    assert.equal(payload.problem.id, problem.id);
    assert.equal(payload.problem.functionSignature.python, problem.functionSignature.python);
    assert.equal(payload.problem.functionSignature.javascript, problem.functionSignature.javascript);
    assert.equal(payload.problem.examples.length, 2);
    assert.equal(payload.problem.testCases, undefined);
    assert.equal(payload.durationMs, (problem.difficulty === 'easy' ? 15 : 20) * 60 * 1000);
    players.forEach((player) => {
      const settings = player.emitted.find((event) => event.event === 'match_settings').payload.preferences;
      assert.equal(settings.topic, problem.category);
      assert.equal(settings.difficulty, problem.difficulty);
    });
  }
});

test('Any allows selection of all four problems, and each single filter is respected', () => {
  const selected = new Set();
  for (const randomValue of [0, 0.25, 0.5, 0.99]) {
    const { handler, players, broadcasts } = matchHarness(randomValue);
    const { roomCode } = handler.createMatch({ difficulty: 'any', topic: 'any' });
    players.forEach((player) => player.handlers.join_match({ matchCode: roomCode }));
    selected.add(broadcasts[0].payload.problem.id);
  }
  assert.deepEqual([...selected].sort(), [2, 3, 4, 5]);
  for (const preferences of [{ difficulty: 'easy' }, { difficulty: 'medium' }, { topic: 'arrays' }, { topic: 'graph' }]) {
    const { handler, players, broadcasts } = matchHarness(0.99);
    const { roomCode } = handler.createMatch(preferences);
    players.forEach((player) => player.handlers.join_match({ matchCode: roomCode }));
    const problem = broadcasts[0].payload.problem;
    if (preferences.difficulty) assert.equal(problem.difficulty, preferences.difficulty);
    if (preferences.topic) assert.equal(problem.category, preferences.topic);
  }
});

test('unavailable combinations and unknown codes are rejected without starting a match', () => {
  const { handler, players, broadcasts } = matchHarness();
  const available = handler.getMatchOptions().combinations;
  assert.equal(available.length, 4);
  assert.ok(!available.some((combination) => combination.difficulty === 'hard'));
  for (const preferences of [null, [], { difficulty: 'hard' }, { difficulty: 'easy', topic: 'graph' },
    { difficulty: 'medium', topic: 'arrays' }, { topic: 'unknown' }, { difficulty: 1 }]) {
    assert.throws(() => handler.createMatch(preferences));
  }
  players[0].handlers.join_match({ matchCode: 'UNKNOWN' });
  assert.match(players[0].emitted.at(-1).payload.error, /Room not found/);
  assert.equal(broadcasts.length, 0);
});
