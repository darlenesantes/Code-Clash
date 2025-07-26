function buildJsWrappedCode(userCode, testCases) {
  const testRunner = `
function arraysEqual(a, b) {
  return Array.isArray(a) && Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

function runTests() {
  const input = require('fs').readFileSync('/dev/stdin', 'utf8');
  const lines = input.trim().split('\\n\\n');
  lines.forEach((block, index) => {
    const [numsLine, targetLine, expectedLine] = block.trim().split('\\n');
    const nums = JSON.parse(numsLine);
    const target = JSON.parse(targetLine);
    const expected = JSON.parse(expectedLine);
    let passed = false;
    let result = null;

    try {
      result = twoSum(nums, target);
      passed = arraysEqual(result, expected);
    } catch (e) {
      console.log(\`❌ Test \${index + 1}: Error - \${e.message}\`);
      return;
    }

    if (passed) {
      console.log(\`✅ Test \${index + 1}: Passed\`);
    } else {
      console.log(\`❌ Test \${index + 1}: Failed\\n   Input: \${numsLine}, \${targetLine}\\n   Expected: \${JSON.stringify(expected)}\\n   Got: \${JSON.stringify(result)}\`);
    }
  });
}

runTests();
`;

  return `${userCode}\n${testRunner}`;
}

function formatTestCasesAsStdin(testCases) {
  return testCases
    .map(({ input, expectedOutput }) => {
      const [nums, target] = input.split('\n');
      return `${nums}\n${target}\n${expectedOutput}`;
    })
    .join('\n\n');
}


module.exports = {
  buildJsWrappedCode,
  formatTestCasesAsStdin
};