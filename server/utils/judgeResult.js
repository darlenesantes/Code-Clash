const { RESULT_PREFIX } = require('./wrappers');

function parseJudgeResult(stdout, resultToken, testCases, category) {
  if (!Array.isArray(testCases) || !testCases.length || typeof category !== 'string') return null;
  const prefix = `${RESULT_PREFIX}${resultToken}:`;
  const lines = String(stdout || '').split(/\r?\n/).filter((line) => line.startsWith(prefix));
  // Ambiguous or fabricated result summaries must never become victories.
  if (lines.length !== 1) return null;

  try {
    const payload = JSON.parse(lines[0].slice(prefix.length));
    if (!payload || Object.keys(payload).length !== 1 || !Array.isArray(payload.outputs) ||
        payload.outputs.length !== testCases.length) return null;
    const type = category.toLowerCase().replace(/\s/g, '');
    if (!['array', 'arrays', 'linkedlist', 'binarytree', 'graph'].includes(type)) return null;
    const valid = payload.outputs.every((item, index) => item && Object.keys(item).length === 2 &&
      item.test === index + 1 && (Object.hasOwn(item, 'actual') || item.error === true));
    if (!valid) return null;
    const results = payload.outputs.map((item, index) => {
      let passed = false;
      if (item.error !== true) {
        const testCase = testCases[index];
        if (type === 'array' || type === 'arrays') {
          // These inputs are parsed from the untouched server catalog, never
          // from the arrays that submitted code was allowed to mutate.
          const [nums, target] = testCase.input.split('\n').map((line) => JSON.parse(line));
          const indices = item.actual;
          passed = Array.isArray(indices) && indices.length === 2 &&
            indices.every((value) => Number.isInteger(value) && value >= 0 && value < nums.length) &&
            indices[0] !== indices[1] && nums[indices[0]] + nums[indices[1]] === target;
        } else {
          passed = testCase.expectedOutputs.some((expected) =>
            JSON.stringify(item.actual) === JSON.stringify(JSON.parse(expected)));
        }
      }
      return { test: index + 1, passed };
    });
    return { passed: results.filter((item) => item.passed).length, total: results.length, results };
  } catch {
    return null;
  }
}

module.exports = { parseJudgeResult };

