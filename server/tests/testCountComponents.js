require("dotenv").config();
const problems = require("../data/problems.json");
const { runJudge0 } = require("../utils/judge0Helper");
const { buildJsWrappedCode, formatTestCasesAsStdin } = require("../utils/wrappers");

async function test() {
  const problem = problems.find(p => p.id === 5); // Graph: countComponents
  const testCases = problem.testCases;

  const userCode = `
// Union-Find solution
function countComponents(n, edges) {
  const parent = new Array(n).fill(0).map((_, i) => i);

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }

  function union(x, y) {
    const rootX = find(x);
    const rootY = find(y);
    if (rootX !== rootY) {
      parent[rootX] = rootY;
    }
  }

  for (const [a, b] of edges) {
    union(a, b);
  }

  const uniqueRoots = new Set(parent.map(find));
  return uniqueRoots.size;
}
`;

  const wrappedCode = buildJsWrappedCode(userCode, testCases, "graph");
  const stdin = formatTestCasesAsStdin(testCases, "graph");

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
