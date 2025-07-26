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
    const [numsLine, targetLine, ...expectedLines] = block.trim().split('\\n');
    const nums = JSON.parse(numsLine);
    const target = JSON.parse(targetLine);
    const expectedList = expectedLines.map(line => JSON.parse(line));
    let result, passed = false;

    try {
      result = twoSum(nums, target);
      passed = expectedList.some(expected => arraysEqual(result, expected));
    } catch (e) {
      console.log(\`❌ Test \${index + 1}: Error - \${e.message}\`);
      return;
    }

    if (passed) {
      console.log(\`✅ Test \${index + 1}: Passed\`);
    } else {
      console.log(\`❌ Test \${index + 1}: Failed\\n   Input: \${numsLine}, \${targetLine}\\n   Expected: \${JSON.stringify(expectedList)}\\n   Got: \${JSON.stringify(result)}\`);
    }
  });
}

runTests();
`;
  return `${userCode}\n${testRunner}`;
}

function formatTestCasesAsStdin(testCases) {
  return testCases
    .map(({ input, expectedOutput, expectedOutputs }) => {
      const [nums, target] = input.split('\n');
      const expectedLines = expectedOutputs || [expectedOutput];
      return `${nums}\n${target}\n${expectedLines.join('\n')}`;
    })
    .join('\n\n');
}


module.exports = {
  buildJsWrappedCode,
  formatTestCasesAsStdin
};