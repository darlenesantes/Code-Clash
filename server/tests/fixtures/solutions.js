const solutions = {
  javascript: {
    2: `function twoSum(nums, target) { for(let i=0;i<nums.length;i++) for(let j=i+1;j<nums.length;j++) if(nums[i]+nums[j]===target) return [j,i]; }`,
    3: `function addTwoNumbers(a,b) { let head=new ListNode(), tail=head, carry=0; while(a||b||carry) { const sum=(a?a.val:0)+(b?b.val:0)+carry; tail.next=new ListNode(sum%10); tail=tail.next; carry=Math.floor(sum/10); a=a?a.next:null; b=b?b.next:null; } return head.next; }`,
    4: `function inorderTraversal(root) { return root ? [...inorderTraversal(root.left),root.val,...inorderTraversal(root.right)] : []; }`,
    5: `function countComponents(n,edges) { const parent=Array.from({length:n},(_,i)=>i); const find=x=>parent[x]===x?x:parent[x]=find(parent[x]); for(const [a,b] of edges) if(find(a)!==find(b)) {parent[find(a)]=find(b); n--;} return n; }`
  },
  python: {
    2: `def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [j, i]`,
    3: `def add_two_numbers(a, b):
    head = tail = ListNode()
    carry = 0
    while a or b or carry:
        total = (a.val if a else 0) + (b.val if b else 0) + carry
        tail.next = ListNode(total % 10)
        tail = tail.next
        carry = total // 10
        a = a.next if a else None
        b = b.next if b else None
    return head.next`,
    4: `def inorder_traversal(root):
    return inorder_traversal(root.left) + [root.val] + inorder_traversal(root.right) if root else []`,
    5: `def count_components(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            x = parent[x]
        return x
    for a, b in edges:
        if find(a) != find(b):
            parent[find(a)] = find(b)
            n -= 1
    return n`
  }
};

module.exports = solutions;

