// The runner prints one machine-readable line after user code has run. Do not
// use user-facing text or emoji to decide who won a match.
const RESULT_PREFIX = "CODECLASH_RESULT:";

function testCasesLiteral(testCases) {
  return JSON.stringify(Array.isArray(testCases) ? testCases : []);
}

function runnerPreamble(testCases, resultToken) {
  return `
const __codeClashCases = ${testCasesLiteral(testCases)};
const __codeClashResults = [];
const __codeClashResultPrefix = '${RESULT_PREFIX}${resultToken}:';
const __codeClashWrite = console.log.bind(console);
const __codeClashExit = process.exit.bind(process);
function __codeClashEqual(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}
function __codeClashExpected(testCase) {
  return testCase.expectedOutputs.map((value) => JSON.parse(value));
}
function __codeClashFinish() {
  const passed = __codeClashResults.filter((result) => result.passed).length;
  __codeClashWrite(__codeClashResultPrefix + JSON.stringify({
    passed,
    total: __codeClashResults.length,
    results: __codeClashResults
  }));
  __codeClashExit(passed === __codeClashResults.length ? 0 : 1);
}
`;
}

function _buildArrayWrapper(userCode, testCases, resultToken) {
  return `${runnerPreamble(testCases, resultToken)}\n${userCode}
function __codeClashValidTwoSum(result, nums, target) {
  return Array.isArray(result) &&
    result.length === 2 &&
    Number.isInteger(result[0]) &&
    Number.isInteger(result[1]) &&
    result[0] !== result[1] &&
    result[0] >= 0 && result[0] < nums.length &&
    result[1] >= 0 && result[1] < nums.length &&
    nums[result[0]] + nums[result[1]] === target;
}
for (const [index, testCase] of __codeClashCases.entries()) {
  try {
    const [nums, target] = testCase.input.split('\\n').map((line) => JSON.parse(line));
    const actual = twoSum(nums, target);
    const passed = __codeClashValidTwoSum(actual, nums, target);
    __codeClashResults.push({ test: index + 1, passed });
  } catch (error) {
    __codeClashResults.push({ test: index + 1, passed: false, error: error.message });
  }
}
__codeClashFinish();`;
}

function _buildLinkedListWrapper(userCode, testCases, resultToken) {
  return `${runnerPreamble(testCases, resultToken)}\n${userCode}
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

function _buildBinaryTreeWrapper(userCode, testCases, resultToken) {
  return `${runnerPreamble(testCases, resultToken)}\n${userCode}
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

function _buildGraphWrapper(userCode, testCases, resultToken) {
  return `${runnerPreamble(testCases, resultToken)}\n${userCode}
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

function buildJsWrappedCode(userCode, testCases, type = "arrays", resultToken = "local") {
  switch (type.toLowerCase().replace(/\s/g, "")) {
    case "linkedlist": return _buildLinkedListWrapper(userCode, testCases, resultToken);
    case "binarytree": return _buildBinaryTreeWrapper(userCode, testCases, resultToken);
    case "graph": return _buildGraphWrapper(userCode, testCases, resultToken);
    case "array":
    case "arrays": return _buildArrayWrapper(userCode, testCases, resultToken);
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

function buildPythonWrappedCode(userCode, testCases, type = "arrays", resultToken = "local") {
  const categories = {
    array: 'two_sum', arrays: 'two_sum', linkedlist: 'add_two_numbers',
    binarytree: 'inorder_traversal', graph: 'count_components'
  };
  const category = type.toLowerCase().replace(/\s/g, "");
  const functionName = categories[category];
  if (!functionName) throw new Error(`No Python runner is configured for problem category: ${type}`);

  // Keep judge data and captured output functions outside the solution namespace.
  return `import json
import sys
from collections import deque

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def _run_codeclash():
    loads, dumps = json.loads, json.dumps
    write, flush, exit_program = sys.stdout.write, sys.stdout.flush, sys.exit
    cases = loads(${JSON.stringify(testCasesLiteral(testCases))})
    prefix = ${JSON.stringify(RESULT_PREFIX + resultToken + ':')}
    node_type, tree_type = ListNode, TreeNode
    namespace = {'ListNode': node_type, 'TreeNode': tree_type, '__name__': '__main__'}

    def linked_list(values):
        dummy = tail = node_type()
        for value in values:
            tail.next = node_type(value)
            tail = tail.next
        return dummy.next

    def list_values(head):
        values, seen = [], set()
        while head is not None:
            if id(head) in seen:
                raise ValueError('Cyclic output list')
            seen.add(id(head))
            values.append(head.val)
            head = head.next
        return values

    def binary_tree(values):
        if not values or values[0] is None:
            return None
        root = tree_type(values[0])
        queue, cursor = deque([root]), 1
        while queue and cursor < len(values):
            node = queue.popleft()
            for side in ('left', 'right'):
                if cursor >= len(values):
                    break
                value = values[cursor]
                cursor += 1
                if value is not None:
                    child = tree_type(value)
                    setattr(node, side, child)
                    queue.append(child)
        return root

    setup_failed = False
    try:
        exec(compile(${JSON.stringify(userCode)}, '<solution>', 'exec'), namespace)
    except (Exception, SystemExit):
        setup_failed = True

    results = []
    for index, case in enumerate(cases):
        passed = False
        try:
            if setup_failed:
                raise ValueError('Solution could not load')
            inputs = [loads(line) for line in case['input'].split('\\n')]
            solution = namespace[${JSON.stringify(functionName)}]
            category = ${JSON.stringify(category)}
            if category in ('array', 'arrays'):
                nums, target = inputs
                original = nums[:]
                actual = solution(nums, target)
                passed = (isinstance(actual, (list, tuple)) and len(actual) == 2
                          and all(type(i) is int and 0 <= i < len(original) for i in actual)
                          and actual[0] != actual[1]
                          and original[actual[0]] + original[actual[1]] == target)
            else:
                if category == 'linkedlist':
                    actual = list_values(solution(linked_list(inputs[0]), linked_list(inputs[1])))
                elif category == 'binarytree':
                    actual = solution(binary_tree(inputs[0]))
                else:
                    actual = solution(*inputs)
                passed = any(dumps(actual, sort_keys=True) == dumps(loads(expected), sort_keys=True)
                             for expected in case['expectedOutputs'])
        except (Exception, SystemExit):
            passed = False
        results.append({'test': index + 1, 'passed': bool(passed)})
    passed_count = sum(item['passed'] for item in results)
    write('\\n' + prefix + dumps({'passed': passed_count, 'total': len(results), 'results': results}) + '\\n')
    flush()
    exit_program(0 if passed_count == len(results) else 1)

_run_codeclash()
`;
}

module.exports = { RESULT_PREFIX, buildJsWrappedCode, buildPythonWrappedCode, formatTestCasesAsStdin };
