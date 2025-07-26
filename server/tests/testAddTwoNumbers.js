require("dotenv").config();
const fs = require("fs");
const problems = require("../data/problems.json");
const { runJudge0 } = require("../utils/judge0Helper");
const { buildJsWrappedCode, formatTestCasesAsStdin } = require("../utils/wrappers");

async function test() {
  const problem = problems.find(p => p.id === 3); // Add Two Numbers
  const testCases = problem.testCases;

  const userCode = `
// DO NOT redefine ListNode, it's included in the wrapper!
function addTwoNumbers(l1, l2) {
  let dummy = new ListNode(0);
  let curr = dummy;
  let carry = 0;

  while (l1 || l2 || carry) {
    let sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10);
    curr.next = new ListNode(sum % 10);
    curr = curr.next;
    l1 = l1 ? l1.next : null;
    l2 = l2 ? l2.next : null;
  }

  return dummy.next;
}
`;

  const wrappedCode = buildJsWrappedCode(userCode, testCases, "linkedlist");
  const stdin = formatTestCasesAsStdin(testCases, "linkedlist");


  try {
    const result = await runJudge0(wrappedCode, 63, "", stdin); // JavaScript = 63
    const { stdout, stderr, compile_output } = result;

    if (stdout) {
      const decoded = Buffer.from(stdout, "base64").toString("utf-8");
      console.log("✅ Decoded Output:\n", decoded);

      const lines = decoded.split("\n").filter(line => line.trim() !== "");
      const passedCount = lines.filter(line => line.startsWith("✅")).length;
      const totalCount = testCases.length;

      console.log(`\n🎯 Result: ${passedCount}/${totalCount} tests passed.`);
      console.log(passedCount === totalCount ? "✅ All tests passed!" : "❌ Some tests failed.");
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
