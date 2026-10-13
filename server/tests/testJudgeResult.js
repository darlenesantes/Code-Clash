const assert = require('node:assert/strict');
const { test } = require('node:test');
const { parseJudgeResult } = require('../utils/judgeResult');

const good = { passed: 1, total: 2, results: [{ test: 1, passed: true }, { test: 2, passed: false }] };
const line = (result, token = 'token') => 'CODECLASH_RESULT:' + token + ':' + JSON.stringify(result);

test('Parser reads already-decoded stdout and verifies totals and test order', () => {
  assert.deepEqual(parseJudgeResult('debug output\n' + line(good) + '\n', 'token', 2), good);
  assert.equal(parseJudgeResult(line(good, 'forged'), 'token', 2), null);
  assert.equal(parseJudgeResult(Buffer.from(line(good)).toString('base64'), 'token', 2), null);
  for (const invalid of [
    { ...good, passed: 2 }, { ...good, total: 1 },
    { ...good, results: [{ test: 1, passed: true }] },
    { ...good, results: [{ test: 1, passed: true }, { test: 1, passed: false }] },
    { ...good, results: [{ test: 1, passed: 'true' }, { test: 2, passed: false }] }
  ]) assert.equal(parseJudgeResult(line(invalid), 'token', 2), null);
  assert.equal(parseJudgeResult('CODECLASH_RESULT:token:{invalid', 'token', 2), null);
});
