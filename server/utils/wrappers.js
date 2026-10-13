// The runner prints one machine-readable line after user code has run. Do not
// use user-facing text or emoji to decide who won a match.
const RESULT_PREFIX = "CODECLASH_RESULT:";

function testCasesLiteral(testCases) {
  return JSON.stringify(Array.isArray(testCases) ? testCases : []);
}

function runnerPreamble(testCases) {
  return `
const __codeClashCases = ${testCasesLiteral(testCases)};
const __codeClashResults = [];
function __codeClashEqual(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}
function __codeClashExpected(testCase) {
  return testCase.expectedOutputs.map((value) => JSON.parse(value));
}
function __codeClashFinish() {
  const passed = __codeClashResults.filter((result) => result.passed).length;
  console.log('${RESULT_PREFIX}' + JSON.stringify({
    passed,
    total: __codeClashResults.length,
    results: __codeClashResults
  }));
}
`;
}

function _buildArrayWrapper(userCode, testCases) {
  return `${userCode}\n${runnerPreamble(testCases)}
for (const [index, testCase] of __codeClashCases.entries()) {
  try {
    const [nums, target] = testCase.input.split('\\n').map((line) => JSON.parse(line));
    const actual = twoSum(nums, target);
    const passed = __codeClashExpected(testCase).some((expected) => __codeClashEqual(actual, expected));
    __codeClashResults.push({ test: index + 1, passed });
  } catch (error) {
    __codeClashResults.push({ test: index + 1, passed: false, error: error.message });
  }
}
__codeClashFinish();`;
}

function _buildLinkedListWrapper(userCode, testCases) {
  return `${userCode}\n${runnerPreamble(testCases)}
class ListNode {
  constructor(val = 0, next = null) { this.val = val; this.next = next; }
}
function arrayToLinkedList(values) {
  const dummy = new ListNode();
  let tail = dummy;
  for (const value of values) { tail.next = new ListNode(value); tail = tail.next; }
  return dummy.next;
}
function linkedListToArray(head) {
  const values = [];
  while (head) { values.push(head.val); head = head.next; }
  return values;
}
for (const [index, testCase] of __codeClashCases.entries()) {
  try {
    const [left, right] = testCase.input.split('\\n').map((line) => JSON.parse(line));
    const actual = linkedListToArray(addTwoNumbers(arrayToLinkedList(left), arrayToLinkedList(right)));
    const passed = __codeClashExpected(testCase).some((expected) => __codeClashEqual(actual, expected));
    __codeClashResults.push({ test: index + 1, passed });
  } catch (error) {
    __codeClashResults.push({ test: index + 1, passed: false, error: error.message });
  }
}
__codeClashFinish();`;
}

function _buildBinaryTreeWrapper(userCode, testCases) {
  return `${userCode}\n${runnerPreamble(testCases)}
class TreeNode {
  constructor(val, left = null, right = null) { this.val = val; this.left = left; this.right = right; }
}
function arrayToBinaryTree(values) {
  if (!values.length || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let cursor = 1;
  while (cursor < values.length) {
    const node = queue.shift();
    for (const side of ['left', 'right']) {
      if (cursor >= values.length) break;
      const value = values[cursor++];
      if (value !== null) { node[side] = new TreeNode(value); queue.push(node[side]); }
    }
  }
  return root;
}
for (const [index, testCase] of __codeClashCases.entries()) {
  try {
    const actual = inorderTraversal(arrayToBinaryTree(JSON.parse(testCase.input)));
    const passed = __codeClashExpected(testCase).some((expected) => __codeClashEqual(actual, expected));
    __codeClashResults.push({ test: index + 1, passed });
  } catch (error) {
    __codeClashResults.push({ test: index + 1, passed: false, error: error.message });
  }
}
__codeClashFinish();`;
}

function _buildGraphWrapper(userCode, testCases) {
  return `${userCode}\n${runnerPreamble(testCases)}
for (const [index, testCase] of __codeClashCases.entries()) {
  try {
    const [n, edges] = testCase.input.split('\\n').map((line) => JSON.parse(line));
    const actual = countComponents(n, edges);
    const passed = __codeClashExpected(testCase).some((expected) => __codeClashEqual(actual, expected));
    __codeClashResults.push({ test: index + 1, passed });
  } catch (error) {
    __codeClashResults.push({ test: index + 1, passed: false, error: error.message });
  }
}
__codeClashFinish();`;
}

function buildJsWrappedCode(userCode, testCases, type = "arrays") {
  switch (type.toLowerCase().replace(/\s/g, "")) {
    case "linkedlist": return _buildLinkedListWrapper(userCode, testCases);
    case "binarytree": return _buildBinaryTreeWrapper(userCode, testCases);
    case "graph": return _buildGraphWrapper(userCode, testCases);
    case "array":
    case "arrays": return _buildArrayWrapper(userCode, testCases);
    default: throw new Error(`No JavaScript runner is configured for problem category: ${type}`);
  }
}

// Kept for the standalone Judge0 scripts. The match runner embeds the trusted
// test cases in its wrapper, so user input cannot alter them.
function formatTestCasesAsStdin(testCases) {
  return (testCases || []).map(({ input, expectedOutputs }) =>
    `${input}\n${(expectedOutputs || []).join('\n')}`
  ).join('\n\n');
}

module.exports = { RESULT_PREFIX, buildJsWrappedCode, formatTestCasesAsStdin };
