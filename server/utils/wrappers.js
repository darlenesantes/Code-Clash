function _buildArrayWrapper(userCode, testCases) {
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

function _buildLinkedListWrapper(userCode, testCases) {
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
  return Array.isArray(a) && Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

function runTests() {
  const input = require('fs').readFileSync('/dev/stdin', 'utf8');
  const blocks = input.trim().split('\\n\\n');

  blocks.forEach((block, index) => {
    const [inputLine, expectedLine] = block.trim().split('\\n');
    const inputArr = JSON.parse(inputLine);
    const expected = JSON.parse(expectedLine);

    let resultArr = [];
    try {
      const l1 = arrayToLinkedList(inputArr[0]);
      const l2 = arrayToLinkedList(inputArr[1]);
      const result = addTwoNumbers(l1, l2);
      resultArr = linkedListToArray(result);
    } catch (e) {
      console.log(\`❌ Test \${index + 1}: Error - \${e.message}\`);
      return;
    }

    const passed = arraysEqual(resultArr, expected);
    if (passed) {
      console.log(\`✅ Test \${index + 1}: Passed\`);
    } else {
      console.log(\`❌ Test \${index + 1}: Failed\\n  Input: \${JSON.stringify(inputArr)}\\n  Expected: \${JSON.stringify(expected)}\\n  Got: \${JSON.stringify(resultArr)}\`);
    }
  });
}

runTests();
`;
  return `${userCode}\n${testRunner}`;
}

function _buildBinaryTreeWrapper(userCode, testCases) {
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
  return JSON.stringify(a) === JSON.stringify(b);
}

function runTests() {
  const input = require('fs').readFileSync('/dev/stdin', 'utf8');
  const blocks = input.trim().split('\\n\\n');

  blocks.forEach((block, index) => {
    const [inputLine, ...expectedLines] = block.trim().split('\\n');
    const inputArr = JSON.parse(inputLine);
    const expectedList = expectedLines
        .map(line => {
            try {
            return JSON.parse(line);
            } catch {
            return undefined;
            }
        })
        .filter(e => e !== undefined);

    let resultArr = [];
    try {
      const root = arrayToBinaryTree(inputArr);
      const result = inorderTraversal(root);
      resultArr = Array.isArray(result) ? result : [];
    } catch (e) {
      console.log(\`❌ Test \${index + 1}: Error - \${e.message}\`);
      return;
    }

    const passed = expectedList.some(expected => JSON.stringify(resultArr) === JSON.stringify(expected));
    if (passed) {
      console.log(\`✅ Test \${index + 1}: Passed\`);
    } else {
      console.log(\`❌ Test \${index + 1}: Failed\\n  Input: \${inputLine}\\n  Expected: \${JSON.stringify(expectedList)}\\n  Got: \${JSON.stringify(resultArr)}\`);
    }
  });
}

runTests();
`;
  return `${userCode}\n${testRunner}`;
}

function _buildGraphWrapper(userCode, testCases) {
  const testRunner = `
function runTests() {
  const input = require('fs').readFileSync('/dev/stdin', 'utf8');
  const blocks = input.trim().split('\\n\\n');

  blocks.forEach((block, index) => {
    const [nLine, edgesLine, ...expectedLines] = block.trim().split('\\n');
    const n = JSON.parse(nLine);
    const edges = JSON.parse(edgesLine);
    const expectedList = expectedLines.map(line => JSON.parse(line));

    let result;
    try {
      result = countComponents(n, edges); // expects user-defined function
    } catch (e) {
      console.log(\`❌ Test \${index + 1}: Error - \${e.message}\`);
      return;
    }

    const passed = expectedList.some(expected => result === expected);
    if (passed) {
      console.log(\`✅ Test \${index + 1}: Passed\`);
    } else {
      console.log(\`❌ Test \${index + 1}: Failed\\n  Input: \${nLine}, \${edgesLine}\\n  Expected: \${JSON.stringify(expectedList)}\\n  Got: \${result}\`);
    }
  });
}

runTests();
`;
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
    return testCases.map(({ input, expectedOutputs }) => {
    const [part1, part2] = input.trim().split('\n');
    const inputLine = type === "linkedlist" ? `[${part1},${part2}]` : `${part1}\n${part2}`;
    const expectedLines = expectedOutputs.map(out => `${out}`).join('\n');
    return `${inputLine}\n${expectedLines}`;
    }).join('\n\n');
}


module.exports = {
  buildJsWrappedCode,
  formatTestCasesAsStdin
};
