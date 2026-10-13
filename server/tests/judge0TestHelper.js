const path = require('node:path');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const problems = require('../data/problems.json');
const { runJudge0 } = require('../utils/judge0Helper');
const { buildJsWrappedCode, buildPythonWrappedCode } = require('../utils/wrappers');
const { parseJudgeResult } = require('../utils/judgeResult');

async function verifySubmission({ problemId, language, code, expectPass, expectStructured = true }) {
  const problem = problems.find((item) => item.id === problemId);
  assert.ok(problem, 'Test problem is missing from the JSON catalog');
  assert.ok(['javascript', 'python'].includes(language), 'Unsupported test language');
  const resultToken = randomUUID();
  const wrapper = language === 'python' ? buildPythonWrappedCode : buildJsWrappedCode;
  // runJudge0 already decodes stdout/stderr. Test data is embedded in the wrapper.
  const judge = await runJudge0(wrapper(code, problem.testCases, problem.category, resultToken),
    language === 'python' ? 71 : 63);
  assert.ok(Number.isInteger(judge.status?.id) && judge.status.id >= 3,
    'Judge0 returned an unfinished or invalid execution status');
  const result = parseJudgeResult(judge.stdout, resultToken, problem.testCases.length);
  if (expectStructured) assert.ok(result, 'Judge0 did not return a valid structured test result');
  if (expectPass) {
    assert.equal(judge.status?.id, 3, 'Judge0 did not accept the correct solution');
    assert.equal(result.passed, result.total, 'The correct solution failed stored tests');
  } else {
    assert.ok([6, 11].includes(judge.status.id),
      'Expected a compilation/runtime failure, not an accepted result or infrastructure error');
    if (result) assert.ok(result.passed < result.total, 'The failing solution claimed every test passed');
  }
  console.log(language + ': ' + problem.title + ' - ' +
    (expectPass ? 'correct solution passed' : 'failing solution rejected') +
    (result ? ' (' + result.passed + '/' + result.total + ')' : ' (execution error)'));
  return { judge, result };
}

function reportFailure(error) {
  // Never print the axios error object: it can contain API keys and source code.
  console.error('Judge0 verification failed: ' + error.message);
  process.exitCode = 1;
}

module.exports = { verifySubmission, reportFailure };

