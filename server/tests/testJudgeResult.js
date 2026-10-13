const assert = require('node:assert/strict');
const { test } = require('node:test');
const { parseJudgeResult } = require('../utils/judgeResult');

const { RESULT_PREFIX } = require('../utils/wrappers');
const cases = [
  { input: '[2,7,11,15]\n9', expectedOutputs: ['[0,1]'] },
  { input: '[1,2,5,6,10]\n15', expectedOutputs: ['[2,4]'] }
];
const line = (payload, token = 'token') => RESULT_PREFIX + token + ':' + JSON.stringify(payload);
const good = { outputs: [{ test: 1, actual: [1, 0] }, { test: 2, actual: [3, 4] }] };
const parse = (stdout) => parseJudgeResult(stdout, 'token', cases, 'arrays');

test('backend derives pass counts from actual outputs and original inputs, accepting either Two Sum order', () => {
  const original = JSON.stringify(cases);
  assert.deepEqual(parse('debug output\n' + line(good) + '\n'), {
    passed: 1, total: 2, results: [{ test: 1, passed: true }, { test: 2, passed: false }]
  });
  assert.equal(parse(line({ outputs: [{ test: 1, actual: [0, 1] }, { test: 2, actual: [4, 2] }] })).passed, 2);
  assert.equal(JSON.stringify(cases), original);
  for (const actual of [[0, 0], [-1, 0], [false, true], [0, 99], [0, 1, 2], null, '0,1']) {
    assert.equal(parse(line({ outputs: [{ test: 1, actual }, { test: 2, error: true }] })).passed, 0);
  }
});

test('fabricated totals, malformed outputs, mismatched tokens, duplicated lines and legacy results fail closed', () => {
  const fabricated = { passed: 2, total: 2, results: [{ test: 1, passed: true }, { test: 2, passed: true }] };
  for (const payload of [null, fabricated, { ...good, passed: 2 },
    { outputs: [good.outputs[0]] },
    { outputs: [good.outputs[0], { test: 1, actual: [2, 4] }] },
    { outputs: [{ test: 1, passed: true }, { test: 2, passed: true }] },
    { outputs: [{ test: 1, actual: [0, 1], passed: true }, good.outputs[1]] },
    { outputs: [{ test: 1, error: false }, good.outputs[1]] }
  ]) assert.equal(parse(line(payload)), null);
  assert.equal(parse(line(good, 'forged')), null);
  assert.equal(parse(Buffer.from(line(good)).toString('base64')), null);
  assert.equal(parse(line(good) + '\n' + line(good)), null);
  assert.equal(parse(RESULT_PREFIX + 'token:{invalid'), null);
  assert.equal(parse('CODECLASH_RESULT:token:' + JSON.stringify(fabricated)), null);
  assert.equal(parseJudgeResult(line(good), 'token', 2), null);
});

test('linked-list, tree and graph outputs are checked against every saved expected output', () => {
  for (const [category, actual, expected] of [
    ['linked list', [7, 0, 8], ['[0]', '[7,0,8]']],
    ['binary tree', [1, 3, 2], ['[1,3,2]']],
    ['graph', 2, ['2']]
  ]) {
    const testCases = [{ input: 'unused', expectedOutputs: expected }];
    const payload = { outputs: [{ test: 1, actual }] };
    assert.equal(parseJudgeResult(line(payload), 'token', testCases, category).passed, 1);
    payload.outputs[0].actual = false;
    assert.equal(parseJudgeResult(line(payload), 'token', testCases, category).passed, 0);
  }
});
