const { runJudge0 } = require("../utils/judge0Helper");
const { randomUUID } = require("crypto");
const { buildJsWrappedCode, buildPythonWrappedCode } = require("../utils/wrappers");
const { parseJudgeResult } = require("../utils/judgeResult");
const problemUtils = require("../utils/problemUtils");

const matchRooms = {};
const matchData = {};
const SUPPORTED_PROBLEM_IDS = new Set([2, 3, 4, 5]);
const LANGUAGE_RUNNERS = new Map([[63, buildJsWrappedCode], [71, buildPythonWrappedCode]]);
const MATCH_MINUTES_BY_DIFFICULTY = { easy: 15, medium: 20, hard: 30 };

function matchDurationMs(difficulty) {
  const minutes = MATCH_MINUTES_BY_DIFFICULTY[difficulty];
  if (!minutes) throw new Error(`Unsupported problem difficulty: ${difficulty}`);
  return minutes * 60 * 1000;
}

function publicProblem(problem) {
  return {
    id: problem.id,
    title: problem.title,
    category: problem.category,
    difficulty: problem.difficulty,
    description: problem.description,
    functionSignature: {
      javascript: problem.functionSignature.javascript,
      python: problem.functionSignature.python
    }
  };
}

function chooseProblem() {
  const supported = problemUtils.getAllProblems().filter((problem) =>
    SUPPORTED_PROBLEM_IDS.has(problem.id) && problemUtils.validateProblem(problem).valid &&
    typeof problem.functionSignature.python === "string" && problem.functionSignature.python.trim()
  );
  return supported[Math.floor(Math.random() * supported.length)] || null;
}


function completeMatch(io, matchCode, outcome) {
  const match = matchData[matchCode];
  if (!match || match.status !== "active") return false;

  clearTimeout(match.timeout);
  match.status = outcome.status;
  match.winnerId = outcome.winnerId || null;
  match.winnerName = outcome.winnerName || null;

  io.to(matchCode).emit("match_over", {
    winnerId: match.winnerId,
    winnerName: match.winnerName,
    reason: outcome.reason,
    results: outcome.results || null
  });
  io.to(matchCode).emit("lock_editor");
  return true;
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

      const durationMs = matchDurationMs(problem.difficulty);
      const deadlineAt = Date.now() + durationMs;
      matchData[roomCode] = {
        problem,
        status: "active",
        winnerId: null,
        winnerName: null,
        deadlineAt,
        timeout: setTimeout(() => {
          completeMatch(io, roomCode, { status: "expired", reason: "time_expired" });
        }, Math.max(0, deadlineAt - Date.now()))
      };
      io.to(roomCode).emit("start_game", { problem: publicProblem(problem), deadlineAt, durationMs });
    }
  });

  socket.on("submit_code", async ({ matchCode, code, languageId } = {}) => {
    try {
      const match = matchData[matchCode];
      if (!match || match.status !== "active" || !matchRooms[matchCode]?.some((player) => player.id === socket.id)) {
        throw new Error("There is no active match for this submission.");
      }
      if (Date.now() >= match.deadlineAt) {
        completeMatch(io, matchCode, { status: "expired", reason: "time_expired" });
        return;
      }
      const buildWrappedCode = LANGUAGE_RUNNERS.get(languageId);
      if (!buildWrappedCode) {
        throw new Error("The MVP judge supports JavaScript and Python only.");
      }
      if (typeof code !== "string" || !code.trim()) throw new Error("Submit a solution first.");
      if (code.length > 50000) throw new Error("The solution is too large to evaluate.");

      const resultToken = randomUUID();
      const wrappedCode = buildWrappedCode(code, match.problem.testCases, match.problem.category, resultToken);
      const judgeResult = await runJudge0(wrappedCode, languageId);
      if (match.status !== "active" || Date.now() >= match.deadlineAt) {
        completeMatch(io, matchCode, { status: "expired", reason: "time_expired" });
        return;
      }
      const statusId = judgeResult.status?.id;
      const results = parseJudgeResult(judgeResult.stdout, resultToken, match.problem.testCases.length);
      if (statusId !== 3) {
        const error = judgeResult.compile_output || judgeResult.stderr || judgeResult.message || "The solution could not run.";
        socket.emit("submission_result", { passed: false, results, error: results ? undefined : error });
        return;
      }

      if (!results || results.passed !== results.total) {
        socket.emit("submission_result", { passed: false, error: "The judge returned an invalid test result." });
        return;
      }

      completeMatch(io, matchCode, {
        status: "completed",
        reason: "solved",
        winnerId: socket.id,
        winnerName: socket.data.username,
        results
      });
    } catch (error) {
      socket.emit("submission_result", { passed: false, error: error.message });
    }
  });

  socket.on("disconnect", () => {
    for (const [code, players] of Object.entries(matchRooms)) {
      matchRooms[code] = players.filter((player) => player.id !== socket.id);
      if (matchRooms[code].length === 0) {
        clearTimeout(matchData[code]?.timeout);
        delete matchRooms[code];
        delete matchData[code];
      }
    }
  });
}

module.exports = matchSocketHandler;
