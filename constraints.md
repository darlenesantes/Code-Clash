# Code Clash implementation constraints

Use this document before changing Code Clash. It records the current MVP contract and protects the working two-player match flow.

## MVP scope

The current product scope is one private match with exactly two players:

1. Both players join using the same match code.
2. The server starts the match only after the second player joins.
3. Both players receive the same programming problem.
4. Each player independently chooses and submits JavaScript or Python code.
5. The server evaluates submissions and declares the first fully correct submission the winner.

The server sets the deadline from the selected problem's difficulty: easy 15 minutes, medium 20 minutes, hard 30 minutes. `start_game` includes `deadlineAt` and `durationMs`; the client uses these for countdown and elapsed time. `MATCH_DURATION_MS` is no longer used.

Only the Create Room card offers difficulty and topic selectors, each with `any` as the default. `GET /api/game/options` reports available combinations from the supported JSON problems. Disable unavailable combinations (including Hard until a runner supports it). `POST /api/game/rooms` validates and saves the creator's preferences and returns a server-generated code. Joining requires an existing code and cannot overwrite preferences. Select randomly from matching supported problems when the second player joins.

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
- `functionSignature.javascript` and `functionSignature.python` are the starter codes shown in the MVP client. Preserve separate drafts when switching languages.
- Send only the first two test cases as public `examples` with their `input` and one valid `output`. Note when other valid outputs may be accepted. Keep the complete `testCases` and `expectedOutputs` collections on the server; all cases still participate in judging.

## Problem runner constraints

The current JavaScript and Python runners support these problem IDs only:

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

Judge0 wrappers produce `CODECLASH_OUTPUT:<token>:` with `{ outputs: [{ test, actual }] }` (or `{ test, error: true }`). These values are untrusted. `server/utils/judgeResult.js` compares them against the untouched server-side JSON catalog and derives the client-facing `passed`, `total`, and boolean results. Never accept pass flags or totals printed by a submission. Reject missing, duplicate, or malformed output records and ambiguous protocol lines. Never send `expectedOutputs` to Judge0.

JavaScript solution functions load in a separate lexical scope from the collector. This is convenience isolation, not a security sandbox: untrusted programs execute only in Judge0. Two Sum validation uses the original server inputs, permits either index order, and rejects repeated, non-integer, boolean, or out-of-range indices.

## Server authority

The server owns match state and winner selection.

- `server/sockets/matchSocket.js` is responsible for joining, starting, evaluating, and completing matches.
- A match has one active winner at most.
- Set match state to completed before broadcasting `match_over`.
- Clients may display results but must never determine whether code passed or who won.
- Validate that the submitting socket belongs to the active match.
- Keep the two-player capacity check.
- Validate socket payloads before destructuring, inside protected handlers. Reject null, arrays, primitives, and invalid fields without crashing or starting a judge request.
- Preserve seats through transport disconnects. Each seat has a stable public player ID and a private per-tab resume token; never broadcast that token or use the public ID as a resume credential.
- `match_state` restores the public problem, original deadline, status, pending submission, and final outcome. Rejoining must not select a new problem or restart the deadline.
- Keep waiting rooms and completed outcomes for 15 minutes; active matches retain their original deadline even when both players disconnect. Match state is in memory and does not survive a server restart.
- Store the room, resume token, selected language, and both drafts in tab-scoped `sessionStorage`. Clear the session on deliberate navigation away from the match or logout.
- A transport disconnect starts a 30-second reconnection grace period and broadcasts `player_connection`. Keep the match deadline running. A timely authenticated resume clears the grace timer; snapshots include public connection states. At grace expiry, cancel waiting or active matches with no winner (`player_abandoned`). Explicit `leave_match` cancels immediately (`player_left`). If the match deadline has already expired, preserve the timeout result. Completion clears all grace timers; late judge results must never change a final outcome.

## Language support

The current MVP supports **JavaScript and Python only**.

- Use Judge0 language ID `63` for JavaScript and `71` for Python 3.
- Python submissions use the standalone snake_case functions in the JSON starters. The runner supplies `ListNode(val, next)` and `TreeNode(val, left, right)` for the relevant problems.
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
| `join_match` | client ? server | `{ matchCode, username, resumeToken }` |
| `match_settings` | server ? client | own stable `playerId` and creator's saved preferences |
| `match_state` | server ? client | own ID, status, public problem, deadline/duration, pending/result, and final outcome |
| `player_connection` | server ? room | `{ playerId, connected, reconnectBy }` |
| `leave_match` | client ? server | `{ matchCode, resumeToken }`; explicit departure, distinct from transport disconnect |
| `start_game` | server ? room | `{ problem: publicProblem }` |
| `submit_code` | client ? server | `{ matchCode, code, languageId }` |
| `submission_result` | server ? submitting client | failed result or error |
| `match_over` | server ? room | status, winner/result, reason, and optional departed player ID; cancellations have no winner |
| `lock_editor` | server ? opponent | disable further editing |

The public problem payload may include ID, title, category, difficulty, description, and JavaScript/Python function signatures. It must exclude test cases.

## Safe change checklist

Before considering a match-flow change complete:

1. Parse changed JavaScript and JSX files.
2. Verify every supported problem runner against its saved JSON test cases.
3. Verify two Socket.IO clients receive one `start_game` event with the same public problem.
4. Run `git diff --check`.
5. Run `npm test --workspace=server` for local runner, result-parser, and server-flow checks. When authorized to use the configured Judge0 service, run `npm run test:judge0 --workspace=server` for live execution checks; this sends code and stored tests externally and uses the provider's quota.

`/health` checks configuration only and must not claim execution is verified. Live scripts consume the decoded output from `runJudge0` and use the same result parser as the match server. Never decode that output a second time or count emoji results. Test failures must exit with a nonzero status.

## Out of scope technical debt

The client has unrelated legacy UI and build issues. Do not mix those changes into MVP judging or socket work unless specifically asked. Keep changes small and focused so the interview demo remains stable.
