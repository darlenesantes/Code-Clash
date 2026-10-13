const { runJudge0 } = require("../utils/judge0Helper");
const { RESULT_PREFIX, buildJsWrappedCode } = require("../utils/wrappers");
const problemUtils = require("../utils/problemUtils");

const matchRooms = {};
const matchData = {};
const SUPPORTED_PROBLEM_IDS = new Set([2, 3, 4, 5]);
const JAVASCRIPT_LANGUAGE_ID = 63;

function publicProblem(problem) {
  return {
    id: problem.id,
    title: problem.title,
    category: problem.category,
    difficulty: problem.difficulty,
    description: problem.description,
    functionSignature: { javascript: problem.functionSignature.javascript }
  };
}

function chooseProblem() {
  const supported = problemUtils.getAllProblems().filter((problem) =>
    SUPPORTED_PROBLEM_IDS.has(problem.id) && problemUtils.validateProblem(problem).valid
  );
  return supported[Math.floor(Math.random() * supported.length)] || null;
}

function parseJudgeResult(stdout) {
  const resultLine = String(stdout || "").split(/\r?\n/)
    .filter((line) => line.startsWith(RESULT_PREFIX)).pop();
  if (!resultLine) return null;

  try {
    const result = JSON.parse(resultLine.slice(RESULT_PREFIX.length));
    if (!Number.isInteger(result.passed) || !Number.isInteger(result.total) || !Array.isArray(result.results)) return null;
    return result;
  } catch {
    return null;
  }
}

function matchSocketHandler(socket, io) {
  socket.emit("server_message", "Welcome to Code Clash!");

  socket.on("join_match", ({ matchCode, username } = {}) => {
    if (typeof matchCode !== "string" || !matchCode.trim()) {
      socket.emit("submission_result", { error: "A match code is required." });
      return;
    }

    const roomCode = matchCode.trim();
    socket.data.username = typeof username === "string" && username.trim() ? username.trim() : "Player";
    if (!matchRooms[roomCode]) matchRooms[roomCode] = [];

    if (matchRooms[roomCode].some((player) => player.id === socket.id)) return;
    if (matchRooms[roomCode].length >= 2) {
      socket.emit("submission_result", { error: "This match already has two players." });
      return;
    }

    matchRooms[roomCode].push(socket);
    socket.join(roomCode);
    console.log(`${socket.data.username} joined match ${roomCode}`);

    if (matchRooms[roomCode].length === 2 && !matchData[roomCode]) {
      const problem = chooseProblem();
      if (!problem) {
        io.to(roomCode).emit("submission_result", { error: "No runnable problem is configured." });
        return;
      }

      matchData[roomCode] = { problem, status: "active", winner: null };
      io.to(roomCode).emit("start_game", { problem: publicProblem(problem) });
    }
  });

  socket.on("submit_code", async ({ matchCode, code, languageId } = {}) => {
    try {
      const match = matchData[matchCode];
      if (!match || match.status !== "active" || !matchRooms[matchCode]?.some((player) => player.id === socket.id)) {
        throw new Error("There is no active match for this submission.");
      }
      if (languageId !== JAVASCRIPT_LANGUAGE_ID) {
        throw new Error("The MVP judge currently supports JavaScript only.");
      }
      if (typeof code !== "string" || !code.trim()) throw new Error("Submit a JavaScript solution first.");
      if (code.length > 50000) throw new Error("The solution is too large to evaluate.");

      const wrappedCode = buildJsWrappedCode(code, match.problem.testCases, match.problem.category);
      const judgeResult = await runJudge0(wrappedCode, JAVASCRIPT_LANGUAGE_ID);
      const statusId = judgeResult.status?.id;
      if (statusId !== 3) {
        const error = judgeResult.compile_output || judgeResult.stderr || judgeResult.message || "The solution could not run.";
        socket.emit("submission_result", { passed: false, error });
        return;
      }

      const results = parseJudgeResult(judgeResult.stdout);
      if (!results) {
        socket.emit("submission_result", { passed: false, error: "The judge returned an invalid test result." });
        return;
      }

      const passedAll = results.total > 0 && results.passed === results.total;
      if (!passedAll) {
        socket.emit("submission_result", { passed: false, results });
        return;
      }

      // Set match state before emitting so two near-simultaneous correct submissions
      // cannot both win.
      if (match.status === "active") {
        match.status = "completed";
        match.winner = socket.data.username;
        io.to(matchCode).emit("match_over", { winner: match.winner, results });
        socket.to(matchCode).emit("lock_editor");
      }
    } catch (error) {
      socket.emit("submission_result", { passed: false, error: error.message });
    }
  });

  socket.on("disconnect", () => {
    for (const [code, players] of Object.entries(matchRooms)) {
      matchRooms[code] = players.filter((player) => player.id !== socket.id);
      if (matchRooms[code].length === 0) {
        delete matchRooms[code];
        delete matchData[code];
      }
    }
  });
}

module.exports = matchSocketHandler;
