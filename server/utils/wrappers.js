// Judge0 reports untrusted outputs only. The backend owns every comparison.
const RESULT_PREFIX = "CODECLASH_OUTPUT:";

function testCasesLiteral(testCases) {
  return JSON.stringify((Array.isArray(testCases) ? testCases : []).map(({ input }) => ({ input })));
}

function runnerPreamble(userCode, testCases, resultToken, functionName) {
  return `
(() => {
const __codeClashCases = ${testCasesLiteral(testCases)};
const __codeClashResults = [];
const __codeClashResultPrefix = ${JSON.stringify(RESULT_PREFIX + resultToken + ':')};
const __codeClashWrite = console.log.bind(console);
const __codeClashExit = process.exit.bind(process);
const __codeClashStringify = JSON.stringify.bind(JSON);
const __codeClashParse = JSON.parse.bind(JSON);
let __codeClashSolution;
function __codeClashLoad(ListNode, TreeNode) {
  // A Function constructor cannot access this collector's lexical scope.
  // Execution remains in Judge0; this is not an in-process security sandbox.
  __codeClashSolution = new Function('ListNode', 'TreeNode',
    ${JSON.stringify(userCode + '\n;return ' + functionName + ';')})(ListNode, TreeNode);
}
function __codeClashRecord(test, actual) {
  const value = __codeClashStringify(actual);
  if (value === undefined) throw new Error('Missing return value');
  __codeClashResults.push({ test, actual: __codeClashParse(value) });
}
function __codeClashFinish() {
  __codeClashWrite('\\n' + __codeClashResultPrefix + __codeClashStringify({ outputs: __codeClashResults }));
  __codeClashExit(__codeClashResults.some((result) => result.error) ? 1 : 0);
}
`;
}

function _buildArrayWrapper(userCode, testCases, resultToken) {
  return `${runnerPreamble(userCode, testCases, resultToken, 'twoSum')}
try { __codeClashLoad(); } catch {}
for (const [index, testCase] of __codeClashCases.entries()) {
  try {
    const [nums, target] = testCase.input.split('\\n').map((line) => JSON.parse(line));
    __codeClashRecord(index + 1, __codeClashSolution(nums, target));
  } catch (error) {
    __codeClashResults.push({ test: index + 1, error: true });
  }
}
__codeClashFinish();
})();`;
}

function _buildLinkedListWrapper(userCode, testCases, resultToken) {
  return `${runnerPreamble(userCode, testCases, resultToken, 'addTwoNumbers')}
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
  const seen = new Set();
  while (head) {
    if (seen.has(head) || values.length >= 10000) throw new Error('Invalid output list');
    seen.add(head); values.push(head.val); head = head.next;
  }
  return values;
}
try { __codeClashLoad(ListNode); } catch {}
for (const [index, testCase] of __codeClashCases.entries()) {
  try {
    const [left, right] = testCase.input.split('\\n').map((line) => JSON.parse(line));
    const actual = linkedListToArray(__codeClashSolution(arrayToLinkedList(left), arrayToLinkedList(right)));
    __codeClashRecord(index + 1, actual);
  } catch (error) {
    __codeClashResults.push({ test: index + 1, error: true });
  }
}
__codeClashFinish();
})();`;
}

function _buildBinaryTreeWrapper(userCode, testCases, resultToken) {
  return `${runnerPreamble(userCode, testCases, resultToken, 'inorderTraversal')}
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
try { __codeClashLoad(undefined, TreeNode); } catch {}
for (const [index, testCase] of __codeClashCases.entries()) {
  try {
    const actual = __codeClashSolution(arrayToBinaryTree(JSON.parse(testCase.input)));
    __codeClashRecord(index + 1, actual);
  } catch (error) {
    __codeClashResults.push({ test: index + 1, error: true });
  }
}
__codeClashFinish();
})();`;
}

function _buildGraphWrapper(userCode, testCases, resultToken) {
  return `${runnerPreamble(userCode, testCases, resultToken, 'countComponents')}
try { __codeClashLoad(); } catch {}
for (const [index, testCase] of __codeClashCases.entries()) {
  try {
    const [n, edges] = testCase.input.split('\\n').map((line) => JSON.parse(line));
    __codeClashRecord(index + 1, __codeClashSolution(n, edges));
  } catch (error) {
    __codeClashResults.push({ test: index + 1, error: true });
  }
}
__codeClashFinish();
})();`;
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

// Kept for legacy callers. Expected outputs must never be sent to Judge0.
function formatTestCasesAsStdin(testCases) {
  return (testCases || []).map(({ input }) => input).join('\n\n');
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
        try:
            if setup_failed:
                raise ValueError('Solution could not load')
            inputs = [loads(line) for line in case['input'].split('\\n')]
            solution = namespace[${JSON.stringify(functionName)}]
            category = ${JSON.stringify(category)}
            if category in ('array', 'arrays'):
                nums, target = inputs
                actual = solution(nums, target)
            else:
                if category == 'linkedlist':
                    actual = list_values(solution(linked_list(inputs[0]), linked_list(inputs[1])))
                elif category == 'binarytree':
                    actual = solution(binary_tree(inputs[0]))
                else:
                    actual = solution(*inputs)
            actual = loads(dumps(actual, allow_nan=False))
            results.append({'test': index + 1, 'actual': actual})
        except (Exception, SystemExit):
            results.append({'test': index + 1, 'error': True})
    write('\\n' + prefix + dumps({'outputs': results}) + '\\n')
    flush()
    exit_program(1 if any(item.get('error') for item in results) else 0)

_run_codeclash()
`;
}

module.exports = { RESULT_PREFIX, buildJsWrappedCode, buildPythonWrappedCode, formatTestCasesAsStdin };
