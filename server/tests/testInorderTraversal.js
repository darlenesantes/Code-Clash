require("dotenv").config();
const problems = require("../data/problems.json");
const { runJudge0 } = require("../utils/judge0Helper");
const { buildJsWrappedCode, formatTestCasesAsStdin } = require("../utils/wrappers");

async function test() {
  const problem = problems.find(p => p.id === 4); // Binary Tree Inorder Traversal
  const testCases = problem.testCases;

  const userCode = `
function inorderTraversal(root) {
  const result = [];
  function dfs(node) {
    if (!node) return;
    dfs(node.left);
    result.push(node.val);
    dfs(node.right);
  }
  dfs(root);
  return result;
}
`;

  const wrappedCode = buildJsWrappedCode(userCode, testCases, "binarytree");
  const stdin = formatTestCasesAsStdin(testCases, "binarytree");

  try {
    const result = await runJudge0(wrappedCode, 63, "", stdin); // JavaScript = 63
    const { stdout, stderr, compile_output } = result;

    if (stdout) {
      const decoded = Buffer.from(stdout, "base64").toString("utf-8");
      console.log("✅ Decoded Output:\n", decoded);

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
