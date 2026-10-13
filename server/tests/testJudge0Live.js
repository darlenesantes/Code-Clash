// Uses the configured Judge0 endpoint/key; makes 14 submissions on a successful run.
// Run: npm run test:judge0 --workspace=server
const { verifySubmission, reportFailure } = require('./judge0TestHelper');
const solutions = require('./fixtures/solutions');

async function main() {
  for (const language of ['javascript', 'python']) {
    for (const problemId of [2, 3, 4, 5]) {
      await verifySubmission({ problemId, language, code: solutions[language][problemId], expectPass: true });
    }
    const failures = language === 'python' ? [
      { code: 'def two_sum(nums, target):\n    return [0,0]' },
      { code: 'def two_sum(nums, target):\n    raise ValueError("runtime error")' },
      { code: 'def two_sum(:', expectStructured: false }
    ] : [
      { code: 'function twoSum() { return [0,0]; }' },
      { code: 'function twoSum() { throw new Error("runtime error"); }' },
      { code: 'function twoSum( {', expectStructured: false }
    ];
    for (const failure of failures) {
      await verifySubmission({ problemId: 2, language, expectPass: false, ...failure });
    }
  }
  console.log('Live Judge0 verification passed for JavaScript and Python.');
}
main().catch(reportFailure);

