const { RESULT_PREFIX } = require('./wrappers');

function parseJudgeResult(stdout, resultToken, expectedTotal) {
  const prefix = `${RESULT_PREFIX}${resultToken}:`;
  const resultLine = String(stdout || "").split(/\r?\n/)
    .filter((line) => line.startsWith(prefix)).pop();
  if (!resultLine) return null;

  try {
    const result = JSON.parse(resultLine.slice(prefix.length));
    const validResults = Array.isArray(result.results) &&
      result.results.length === expectedTotal &&
      result.results.every((item, index) => item && item.test === index + 1 && typeof item.passed === "boolean");
    const passed = validResults ? result.results.filter((item) => item.passed).length : -1;
    if (!Number.isInteger(result.passed) || result.passed !== passed || result.total !== expectedTotal || !validResults) return null;
    return result;
  } catch {
    return null;
  }
}

module.exports = { parseJudgeResult };

