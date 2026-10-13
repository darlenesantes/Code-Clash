# Code Clash implementation constraints

Use this document before changing Code Clash. It records the current MVP contract and protects the working two-player match flow.

## MVP scope

The current product scope is one private match with exactly two players:

1. Both players join using the same match code.
2. The server starts the match only after the second player joins.
3. Both players receive the same programming problem.
4. Each player submits JavaScript code.
5. The server evaluates submissions and declares the first fully correct submission the winner.

Do not add tournaments, matchmaking queues, rankings, AI opponents, persistent match history, or extra game modes while working on the MVP unless the user explicitly asks.

## Source of truth

- `server/data/problems.json` is the local problem catalog. Keep using it; do not replace it with a LeetCode API.
- The catalog is a **flat JSON array**, not an object grouped by difficulty.
- Each problem must use this shape:

```json
{
  "id": 2,
  "title": "Two Sum",
  "category": "arrays",
  "difficulty": "easy",
  "description": "...",
  "functionSignature": {
    "javascript": "function twoSum(nums, target) {\n  // your code here\n}"
  },
  "testCases": [
    {
      "input": "[2,7,11,15]\n9",
      "expectedOutputs": ["[0,1]"]
    }
  ]
}
```

- `testCases` must be non-empty.
- `expectedOutputs` is an array because more than one output can be correct.
- `functionSignature.javascript` is the starter code shown in the MVP client.
- Do not send `testCases` or `expectedOutputs` to the browser. They are server-side judging data.

## Problem runner constraints

The current JavaScript runners support these problem IDs only:

| ID | Problem | Category |
| --- | --- | --- |
| 2 | Two Sum | `arrays` |
| 3 | Add Two Numbers | `linked list` |
| 4 | Binary Tree Inorder Traversal | `binary tree` |
| 5 | Number of Connected Components | `graph` |

`server/utils/wrappers.js` contains the adapter for each supported data structure. A new catalog problem must not be selected for matches until it has a matching runner and passing tests.

For a new category or function shape:

1. Add a category-specific adapter in `server/utils/wrappers.js`.
2. Build inputs from the stored JSON format.
3. Compare against every value in `expectedOutputs`.
4. Return a structured machine-readable result.
5. Add the problem ID to `SUPPORTED_PROBLEM_IDS` in `server/sockets/matchSocket.js` only after local verification.

Do not judge by searching user output for text, symbols, emoji, or a hard-coded message.

## Server authority

The server owns match state and winner selection.

- `server/sockets/matchSocket.js` is responsible for joining, starting, evaluating, and completing matches.
- A match has one active winner at most.
- Set match state to completed before broadcasting `match_over`.
- Clients may display results but must never determine whether code passed or who won.
- Validate that the submitting socket belongs to the active match.
- Keep the two-player capacity check.

## Language support

The current MVP supports **JavaScript only**.

- Use Judge0 language ID `63`.
- The client must not offer languages the server cannot judge.
- Add another language only after implementing its wrapper, input conversion, output comparison, server validation, and tests.

## Judge0 integration

Judge0 is an external execution service.

- Required server environment values: `JUDGE0_API_URL`; RapidAPI deployments also require `JUDGE0_API_KEY` and `JUDGE0_API_HOST`.
- Keep `base64_encoded=true` and decode Judge0 response fields before inspecting them.
- Do not log credentials, request headers, source code, hidden test data, or complete Judge0 payloads.
- Treat compilation errors, runtime errors, time-limit errors, and malformed judge results as failed submissions.
- The client receives a concise error or pass-count summary, never hidden expected values.

## Client/server event contract

Keep these Socket.IO events compatible:

| Event | Direction | Purpose |
| --- | --- | --- |
| `join_match` | client ? server | `{ matchCode, username }` |
| `start_game` | server ? room | `{ problem: publicProblem }` |
| `submit_code` | client ? server | `{ matchCode, code, languageId }` |
| `submission_result` | server ? submitting client | failed result or error |
| `match_over` | server ? room | winner and structured result |
| `lock_editor` | server ? opponent | disable further editing |

The public problem payload may include ID, title, category, difficulty, description, and JavaScript function signature. It must exclude test cases.

## Safe change checklist

Before considering a match-flow change complete:

1. Parse changed JavaScript and JSX files.
2. Verify every supported problem runner against its saved JSON test cases.
3. Verify two Socket.IO clients receive one `start_game` event with the same public problem.
4. Run `git diff --check`.
5. If Judge0 credentials are available, manually verify one passing and one failing submission.

## Out of scope technical debt

The client has unrelated legacy UI and build issues. Do not mix those changes into MVP judging or socket work unless specifically asked. Keep changes small and focused so the interview demo remains stable.
