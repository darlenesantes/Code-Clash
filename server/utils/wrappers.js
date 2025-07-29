function _buildArrayWrapper(userCode, testCases) {
  // 1. gets name and number of params
  const match    = userCode.match(/function\s+([^(]+)\s*\(([^)]*)\)/);
  const fnName   = match ? match[1] : "solutionFunc";
  const params   = match[2]
                      .split(',')
                      .map(p => p.trim())
                      .filter(p => p);

  // 2. decide runner based on params
  let testRunner;
  if (params.length === 1) {
    // just a param
    testRunner = `
function runTests() {
  const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
  const blocks = input.split('\\n\\n');
  blocks.forEach((block, idx) => {
    const [inp, ...expLines] = block.split('\\n');
    let result;
    try {
      const arg = JSON.parse(inp);
      result = ${fnName}(arg);
    } catch (e) {
      console.log(\`❌ Test \${idx+1}: Error - \${e.message}\`);
      return;
    }
    const expected = expLines.map(l => JSON.parse(l));
    if (expected.includes(result)) {
      console.log(\`✅ Test \${idx+1}: Passed\`);
    } else {
      console.log(\`❌ Test \${idx+1}: Failed\\n  Input: \${inp}\\n  Expected: \${JSON.stringify(expected)}\\n  Got: \${JSON.stringify(result)}\`);
    }
  });
}
runTests();
`;
  } else {
    // two params (ej. twoSum(nums, target))
    testRunner = `
function arraysEqual(a, b) {
  return Array.isArray(a) && a.length === b.length && a.every((v,i) => v === b[i]);
}
function runTests() {
  const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
  const blocks = input.split('\\n\\n');
  blocks.forEach((block, idx) => {
    const [aLine, bLine, ...expLines] = block.split('\\n');
    const arg1 = JSON.parse(aLine), arg2 = JSON.parse(bLine);
    const expected = expLines.map(l => JSON.parse(l));
    let res, passed=false;
    try {
      res = ${fnName}(arg1, arg2);
      passed = expected.some(e => arraysEqual(res, e));
    } catch(e) {
      console.log(\`❌ Test \${idx+1}: Error - \${e.message}\`);
      return;
    }
    if (passed) {
      console.log(\`✅ Test \${idx+1}: Passed\`);
    } else {
      console.log(\`❌ Test \${idx+1}: Failed\\n  Input: \${aLine}, \${bLine}\\n  Expected: \${JSON.stringify(expected)}\\n  Got: \${JSON.stringify(res)}\`);
    }
  });
}
runTests();
`;
  }

  // 3. returns whole code
  return `${userCode}\n${testRunner}`;
}


function _buildLinkedListWrapper(userCode, testCases) {
  // 1. Extract the user’s function name dynamically
  const match = userCode.match(/function\s+([^(]+)\s*\(/);
  const fnName = match ? match[1] : "addTwoNumbers";

  // 2. Build the test runner that transforms input arrays into linked lists,
  //    invokes the user’s function, converts the result back to an array,
  //    and compares it against expected output
  const testRunner = `
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function arrayToLinkedList(arr) {
  const dummy = new ListNode(0);
  let current = dummy;
  for (let val of arr) {
    current.next = new ListNode(val);
    current = current.next;
  }
  return dummy.next;
}

function linkedListToArray(head) {
  const result = [];
  while (head) {
    result.push(head.val);
    head = head.next;
  }
  return result;
}

function arraysEqual(a, b) {
  return Array.isArray(a) && a.length === b.length && a.every((v,i) => v === b[i]);
}

function runTests() {
  const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
  const blocks = input.split('\\n\\n');
  blocks.forEach((block, idx) => {
    const [l1Line, l2Line, expectedLine] = block.split('\\n');
    let arr1, arr2, expected, resultArr;
    try {
      arr1 = JSON.parse(l1Line);
      arr2 = JSON.parse(l2Line);
      expected = JSON.parse(expectedLine);
      const l1 = arrayToLinkedList(arr1);
      const l2 = arrayToLinkedList(arr2);
      const res = ${fnName}(l1, l2);
      resultArr = linkedListToArray(res);
    } catch (e) {
      console.log(\`❌ Test \${idx+1}: Error - \${e.message}\`);
      return;
    }
    if (arraysEqual(resultArr, expected)) {
      console.log(\`✅ Test \${idx+1}: Passed\`);
    } else {
      console.log(\`❌ Test \${idx+1}: Failed\\n  Input: \${l1Line}, \${l2Line}\\n  Expected: \${JSON.stringify(expected)}\\n  Got: \${JSON.stringify(resultArr)}\`);
    }
  });
}
runTests();
`;

  // 3. Return the combined user code plus test runner
  return `${userCode}\n${testRunner}`;
}

function _buildBinaryTreeWrapper(userCode, testCases) {
  // 1. Extract the user’s function name dynamically
  const match = userCode.match(/function\s+([^(]+)\s*\(/);
  const fnName = match ? match[1] : "inorderTraversal";

  // 2. Build the test runner that:
  //    a) Parses the input array into a binary tree
  //    b) Calls the user’s function on the tree
  //    c) Compares the returned array against expected results
  const testRunner = `
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function arrayToBinaryTree(arr) {
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null && arr[i] !== undefined) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i++;
    if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function arraysEqual(a, b) {
  return Array.isArray(a) && a.length === b.length && a.every((v,i) => v === b[i]);
}

function runTests() {
  const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
  const blocks = input.split('\\n\\n');
  blocks.forEach((block, idx) => {
    const lines = block.split('\\n');
    let treeArr, expectedList, resultArr;
    try {
      treeArr = JSON.parse(lines[0]);
      expectedList = lines.slice(1).map(l => JSON.parse(l));
      const root = arrayToBinaryTree(treeArr);
      const res = ${fnName}(root);
      resultArr = Array.isArray(res) ? res : [];
    } catch (e) {
      console.log(\`❌ Test \${idx+1}: Error - \${e.message}\`);
      return;
    }
    if (expectedList.some(exp => arraysEqual(resultArr, exp))) {
      console.log(\`✅ Test \${idx+1}: Passed\`);
    } else {
      console.log(\`❌ Test \${idx+1}: Failed\\n  Input: \${JSON.stringify(treeArr)}\\n  Expected: \${JSON.stringify(expectedList)}\\n  Got: \${JSON.stringify(resultArr)}\`);
    }
  });
}
runTests();
`;

  // 3. Return user code plus test runner
  return `${userCode}\n${testRunner}`;
}


function _buildGraphWrapper(userCode, testCases) {
  // 1. Dynamically extract the user’s function name
  const match = userCode.match(/function\s+([^(]+)\s*\(/);
  const fnName = match ? match[1] : "countComponents";

  // 2. Build a test runner that:
  //    a) Reads n and edges from stdin
  //    b) Calls the user’s function with those arguments
  //    c) Compares the returned number against each expected output
  const testRunner = `
function runTests() {
  const input = require('fs').readFileSync('/dev/stdin','utf8').trim();
  const blocks = input.split('\\n\\n');
  blocks.forEach((block, idx) => {
    const [nLine, edgesLine, ...expLines] = block.split('\\n');
    let n, edges, expectedList, result;
    try {
      n = JSON.parse(nLine);
      edges = JSON.parse(edgesLine);
      expectedList = expLines.map(l => JSON.parse(l));
      result = ${fnName}(n, edges);
    } catch (e) {
      console.log(\`❌ Test \${idx+1}: Error - \${e.message}\`);
      return;
    }
    if (expectedList.includes(result)) {
      console.log(\`✅ Test \${idx+1}: Passed\`);
    } else {
      console.log(\`❌ Test \${idx+1}: Failed\\n  Input: n=\${n}, edges=\${JSON.stringify(edges)}\\n  Expected: \${JSON.stringify(expectedList)}\\n  Got: \${result}\`);
    }
  });
}
runTests();
`;

  // 3. Return the combined user code plus the test runner
  return `${userCode}\n${testRunner}`;
}


function buildJsWrappedCode(userCode, testCases, type = "array") {
  switch (type.toLowerCase()) {
    case "linkedlist":
      return _buildLinkedListWrapper(userCode, testCases);
    case "binarytree":
      return _buildBinaryTreeWrapper(userCode, testCases);
    case "graph":
      return _buildGraphWrapper(userCode, testCases);
    case "array":
    default:
      return _buildArrayWrapper(userCode, testCases);
  }
}

function formatTestCasesAsStdin(testCases, type = "array") {
  return testCases
    .map(({ input, expectedOutputs }) => {
      const inputLines = input.trim().split('\n');
      const expectedLines = expectedOutputs || [];
      return [...inputLines, ...expectedLines].join('\n');
    })
    .join('\n\n');
}


function buildPythonWrapper(userCode /* string */, testCases /* array */) {
  const match  = userCode.match(/def\s+([^(]+)\s*\(/);
  const fnName = match ? match[1] : "solution";

  return `
${userCode}

import sys, json

def run_tests():
    data = sys.stdin.read().strip()
    if not data:
        return
    blocks = data.split("\\n\\n")
    for idx, block in enumerate(blocks, start=1):
        lines = block.split("\\n")
        try:
            args = [ json.loads(l) for l in lines if l.strip() ]
            res = ${fnName}(*args)
            output = json.dumps(res)

            expected = [ json.loads(l) for l in lines[len(args):] ]
            passed = output in [ json.dumps(e) for e in expected ]

            if passed:
                print(f"✅ Test {idx}: Passed")
            else:
                print(f"❌ Test {idx}: Failed")
                print(f"  Input: {' | '.join(lines[:len(args)])}")
                print(f"  Expected: {expected}")
                print(f"  Got: {output}")
        except Exception as e:
            print(f"❌ Test {idx}: Error")
            print(f"  Input: {' | '.join(lines[:len(args)])}")
            print(f"  Error: {e}")

if __name__ == "__main__":
    run_tests()
`;
}




module.exports = {
  buildJsWrappedCode,
  formatTestCasesAsStdin,
  buildPythonWrapper
};
