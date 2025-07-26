require("dotenv").config(); 
const fs = require("fs");
const problems = require("../data/problems.json");
const { runJudge0 } = require("../utils/judge0Helper");
const { buildJsWrappedCode, formatTestCasesAsStdin } = require("../utils/wrappers");


async function test() {
  const problem = problems.find(p => p.id === 2); // Two Sum
  const testCases = problem.testCases;

  const userCode = `
function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) return [map[complement], i];
    map[nums[i]] = i;
  }
}
`;

  const wrappedCode = buildJsWrappedCode(userCode, testCases);
  const stdin = formatTestCasesAsStdin(testCases);

  try {
    const result = await runJudge0(wrappedCode, 63, "", stdin); // JS = 63
    const { stdout, stderr, compile_output } = result;

    if (stdout) {
      const decoded = Buffer.from(stdout, "base64").toString("utf-8");
      console.log("✅ Decoded Output:\n", decoded);

      // Count passed tests
      const lines = decoded.split("\n").filter(line => line.trim() !== "");
      const passedCount = lines.filter(line => line.startsWith("✅")).length;
      const totalCount = testCases.length;

      const allPassed = passedCount === totalCount;
      console.log(`\n🎯 Result: ${passedCount}/${totalCount} tests passed.`);
      console.log(allPassed ? "✅ All tests passed!" : "❌ Some tests failed.");
    } else if (stderr || compile_output) {
      const errMsg = Buffer.from(stderr || compile_output, "base64").toString("utf-8");
      console.error("❌ Error Output:\n", errMsg);
    } else {
      console.log("🤷 No output returned.");
    }
  } catch (err) {
    console.error("❌ Judge0 Error:", err);
  }
}


test();
