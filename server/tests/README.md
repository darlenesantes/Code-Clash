# Judging checks

From the repository root:

```powershell
npm test --workspace=server
```

These local checks require Node.js and Python 3. They use the saved JSON tests, validate both language runners and result parsing, and exercise server winner selection without contacting Judge0.

```powershell
npm run test:judge0 --workspace=server
```

This live check loads `server/.env` regardless of your working directory and uses your configured Judge0 endpoint and credentials. It sends code and test inputs to that service, keeping expected outputs on the server, and makes 16 submissions on a successful run. It checks correct solutions for all four enabled problems in JavaScript and Python, then rejects wrong answers, runtime errors, and syntax errors in each language. JavaScript checks also cover attempts to access the result collector or mutate inputs to pass validation. A request or assertion failure exits with a nonzero status and stops the run.

The individual legacy scripts also work, for example:

```powershell
node server/tests/testAddTwoNumbers.js
```

`/health` checks configuration only. It makes no paid execution requests and cannot prove that credentials, subscription, or execution are working. A passing live check verifies the service at the time you run it; repeat it after changing providers or credentials.
