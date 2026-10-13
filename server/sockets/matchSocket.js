const { runJudge0 } = require("../utils/judge0Helper");
const { randomUUID } = require("crypto");
const { buildJsWrappedCode, buildPythonWrappedCode } = require("../utils/wrappers");
const { parseJudgeResult } = require("../utils/judgeResult");
const problemUtils = require("../utils/problemUtils");

const matchRooms = Object.create(null);
const matchData = Object.create(null);
const SUPPORTED_PROBLEM_IDS = new Set([2, 3, 4, 5]);
const LANGUAGE_RUNNERS = new Map([[63, buildJsWrappedCode], [71, buildPythonWrappedCode]]);
const MATCH_MINUTES_BY_DIFFICULTY = { easy: 15, medium: 20, hard: 30 };
const RECONNECT_GRACE_MS = 30 * 1000;

function publicConnection(player) {
  return { playerId: player.id, connected: Boolean(player.socket), reconnectBy: player.reconnectBy || null };
}

function cancelForDeparture(io, matchCode, player, reason) {
  const match = matchData[matchCode];
  if (!match || !['waiting', 'active'].includes(match.status)) return;
  if (match.status === 'active' && Date.now() >= match.deadlineAt) {
    completeMatch(io, matchCode, { status: 'expired', reason: 'time_expired' });
  } else {
    completeMatch(io, matchCode, { status: 'cancelled', reason, departedPlayerId: player.id });
  }
}

function resolveExpiredDisconnect(io, matchCode) {
  const player = matchRooms[matchCode]?.find((entry) => entry.reconnectBy && Date.now() >= entry.reconnectBy);
  if (player) cancelForDeparture(io, matchCode, player, 'player_abandoned');
}

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
    examples: problem.testCases.slice(0, 2).map((testCase) => ({
      input: testCase.input,
      output: testCase.expectedOutputs[0],
      acceptsOtherOutputs: problem.id === 2 || testCase.expectedOutputs.length > 1
    })),
    functionSignature: {
      javascript: problem.functionSignature.javascript,
      python: problem.functionSignature.python
    }
  };
}

function supportedProblems() {
  return problemUtils.getAllProblems().filter((problem) =>
    SUPPORTED_PROBLEM_IDS.has(problem.id) && problemUtils.validateProblem(problem).valid &&
    typeof problem.functionSignature.python === "string" && problem.functionSignature.python.trim()
  );
}

function matchingProblems({ difficulty, topic }) {
  return supportedProblems().filter((problem) =>
    (difficulty === 'any' || problem.difficulty === difficulty) &&
    (topic === 'any' || problem.category === topic)
  );
}

function getMatchOptions() {
  const combinations = supportedProblems().map((problem) => ({
    difficulty: problem.difficulty, topic: problem.category
  }));
  return { combinations };
}

function createMatch(preferences = {}) {
  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
    throw new Error('Match preferences must be an object.');
  }
  const { difficulty = 'any', topic = 'any' } = preferences;
  if (typeof difficulty !== 'string' || typeof topic !== 'string' ||
      !matchingProblems({ difficulty, topic }).length) {
    throw new Error('No supported problem matches this difficulty and topic.');
  }
  let roomCode;
  do {
    roomCode = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  } while (matchData[roomCode]);
  const savedPreferences = { difficulty, topic };
  const match = { status: 'waiting', preferences: savedPreferences };
  // Waiting rooms and finished matches are retained for a bounded resume window.
  match.timeout = setTimeout(() => {
    delete matchRooms[roomCode];
    delete matchData[roomCode];
  }, 15 * 60 * 1000);
  match.timeout.unref?.();
  matchData[roomCode] = match;
  return { roomCode, preferences: { ...savedPreferences } };
}

function completeMatch(io, matchCode, outcome) {
  const match = matchData[matchCode];
  if (!match || (match.status !== 'active' && !(match.status === 'waiting' && outcome.status === 'cancelled'))) return false;

  clearTimeout(match.timeout);
  for (const player of matchRooms[matchCode] || []) {
    clearTimeout(player.disconnectTimeout);
    player.disconnectTimeout = null;
    player.reconnectBy = null;
  }
  match.status = outcome.status;
  match.winnerId = outcome.winnerId || null;
  match.winnerName = outcome.winnerName || null;

  match.outcome = {
    status: match.status,
    winnerId: match.winnerId,
    winnerName: match.winnerName,
    reason: outcome.reason,
    results: outcome.results || null,
    departedPlayerId: outcome.departedPlayerId || null
  };
  match.timeout = setTimeout(() => {
    delete matchRooms[matchCode];
    delete matchData[matchCode];
  }, 15 * 60 * 1000);
  match.timeout.unref?.();
  io.to(matchCode).emit("match_over", match.outcome);
  io.to(matchCode).emit("lock_editor");
  return true;
}

function matchSocketHandler(socket, io) {
  socket.emit("server_message", "Welcome to Code Clash!");

  const joinMatch = (payload) => {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new Error('Match request must be an object.');
    }
    const { matchCode, username, resumeToken } = payload;
    if (typeof matchCode !== "string" || !matchCode.trim()) {
      socket.emit("submission_result", { error: "A match code is required." });
      return;
    }

    const roomCode = matchCode.trim().toUpperCase();
    const match = matchData[roomCode];
    if (!match) {
      socket.emit('submission_result', { error: 'Room not found. Ask the creator for a new code.' });
      return;
    }
    if (resumeToken !== undefined && (typeof resumeToken !== 'string' || resumeToken.length < 16 || resumeToken.length > 128)) {
      socket.emit('submission_result', { error: 'Invalid match resume token.' });
      return;
    }
    if (!matchRooms[roomCode]) matchRooms[roomCode] = [];
    const players = matchRooms[roomCode];
    let player = players.find((entry) => entry.socket?.id === socket.id ||
      (resumeToken && entry.resumeToken === resumeToken));
    if (!player && match.status !== 'waiting') {
      socket.emit('submission_result', { error: 'This match has already started or ended. Create a new room.' });
      return;
    }
    if (!player && players.length >= 2) {
      socket.emit("submission_result", { error: "This match already has two players." });
      return;
    }

    if (!player) {
      player = { id: randomUUID(), resumeToken: resumeToken || randomUUID(),
        username: typeof username === 'string' && username.trim() ? username.trim() : 'Player',
        pending: false, submissionResult: null };
      players.push(player);
    }
    // Enforce the cutoff even if the timer callback was delayed by the event loop.
    resolveExpiredDisconnect(io, roomCode);
    const wasDisconnected = Boolean(player.reconnectBy);
    clearTimeout(player.disconnectTimeout);
    player.disconnectTimeout = null;
    player.reconnectBy = null;
    // A refresh may connect before the old transport has finished disconnecting.
    if (player.socket && player.socket !== socket) player.socket.leave?.(roomCode);
    player.socket = socket;
    socket.data.username = player.username;
    socket.join(roomCode);
    socket.emit('match_settings', { preferences: match.preferences, playerId: player.id });
    if (wasDisconnected && ['waiting', 'active'].includes(match.status)) {
      io.to(roomCode).emit('player_connection', publicConnection(player));
    }
    console.log(`${socket.data.username} joined match ${roomCode}`);

    if (players.length === 2 && players.every((entry) => entry.socket) && match.status === 'waiting') {
      clearTimeout(match.timeout);
      const candidates = matchingProblems(match.preferences);
      const problem = candidates[Math.floor(Math.random() * candidates.length)];
      if (!problem) {
        io.to(roomCode).emit("submission_result", { error: "No runnable problem is configured." });
        return;
      }

      const durationMs = matchDurationMs(problem.difficulty);
      const deadlineAt = Date.now() + durationMs;
      Object.assign(match, {
        problem,
        status: "active",
        winnerId: null,
        winnerName: null,
        deadlineAt,
        durationMs,
        timeout: setTimeout(() => {
          completeMatch(io, roomCode, { status: "expired", reason: "time_expired" });
        }, Math.max(0, deadlineAt - Date.now()))
      });
      io.to(roomCode).emit("start_game", { problem: publicProblem(problem), deadlineAt, durationMs });
    }
    if (match.status === 'active' && Date.now() >= match.deadlineAt) {
      completeMatch(io, roomCode, { status: 'expired', reason: 'time_expired' });
    }
    socket.emit('match_state', {
      playerId: player.id, status: match.status, preferences: match.preferences,
      problem: match.problem ? publicProblem(match.problem) : null,
      deadlineAt: match.deadlineAt || null, durationMs: match.durationMs || null,
      outcome: match.outcome || null, pending: player.pending,
      submissionResult: player.submissionResult,
      players: players.map(publicConnection)
    });
  };
  socket.on('join_match', (payload) => {
    try {
      joinMatch(payload);
    } catch {
      socket.emit('submission_result', { passed: false, error: 'Invalid match join request.' });
    }
  });

  socket.on('leave_match', (payload, acknowledge) => {
    try {
      if (!payload || typeof payload !== 'object' || Array.isArray(payload) || typeof payload.matchCode !== 'string') {
        throw new Error('Invalid match leave request.');
      }
      const matchCode = payload.matchCode.trim().toUpperCase();
      const player = matchRooms[matchCode]?.find((entry) => entry.socket === socket ||
        (!entry.socket && typeof payload.resumeToken === 'string' && entry.resumeToken === payload.resumeToken));
      if (!player) throw new Error('You do not belong to this match.');
      cancelForDeparture(io, matchCode, player, 'player_left');
      socket.leave(matchCode);
      player.socket = null;
      if (typeof acknowledge === 'function') acknowledge({ ok: true });
    } catch (error) {
      socket.emit('submission_result', { passed: false, error: error.message });
      if (typeof acknowledge === 'function') acknowledge({ ok: false });
    }
  });

  socket.on("submit_code", async (payload) => {
    let player;
    let evaluating = false;
    const sendResult = (result) => {
      if (player) {
        player.submissionResult = result;
        player.socket?.emit('submission_result', result);
      } else socket.emit('submission_result', result);
    };
    try {
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw new Error('Submission request must be an object.');
      }
      const { matchCode, code, languageId } = payload;
      if (typeof matchCode !== 'string' || !matchCode.trim()) throw new Error('A match code is required.');
      resolveExpiredDisconnect(io, matchCode);
      const match = matchData[matchCode];
      player = matchRooms[matchCode]?.find((entry) => entry.socket === socket);
      if (!match || match.status !== "active" || !player) {
        throw new Error("There is no active match for this submission.");
      }
      if (player.pending) throw new Error('Your previous submission is still being evaluated.');
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
      player.pending = true;
      player.submissionResult = null;
      evaluating = true;
      const judgeResult = await runJudge0(wrappedCode, languageId);
      resolveExpiredDisconnect(io, matchCode);
      if (match.status !== "active" || Date.now() >= match.deadlineAt) {
        completeMatch(io, matchCode, { status: "expired", reason: "time_expired" });
        return;
      }
      const statusId = judgeResult.status?.id;
      const results = parseJudgeResult(judgeResult.stdout, resultToken, match.problem.testCases, match.problem.category);
      if (statusId !== 3) {
        const error = judgeResult.compile_output || judgeResult.stderr || judgeResult.message || "The solution could not run.";
        sendResult({ passed: false, results, error: results ? undefined : error });
        return;
      }

      if (!results) {
        sendResult({ passed: false, error: "The judge returned an invalid test result." });
        return;
      }
      if (results.passed !== results.total) {
        sendResult({ passed: false, results });
        return;
      }

      completeMatch(io, matchCode, {
        status: "completed",
        reason: "solved",
        winnerId: player.id,
        winnerName: player.username,
        results
      });
    } catch (error) {
      sendResult({ passed: false, error: error.message });
    } finally {
      if (evaluating) player.pending = false;
    }
  });

  socket.on("disconnect", () => {
    for (const [matchCode, players] of Object.entries(matchRooms)) {
      for (const player of players) {
        if (player.socket !== socket) continue;
        player.socket = null;
        if (!['waiting', 'active'].includes(matchData[matchCode]?.status)) continue;
        player.reconnectBy = Date.now() + RECONNECT_GRACE_MS;
        io.to(matchCode).emit('player_connection', publicConnection(player));
        player.disconnectTimeout = setTimeout(() => {
          if (!player.socket) cancelForDeparture(io, matchCode, player, 'player_abandoned');
        }, RECONNECT_GRACE_MS);
        player.disconnectTimeout.unref?.();
      }
    }
  });
}

module.exports = matchSocketHandler;
module.exports.createMatch = createMatch;
module.exports.getMatchOptions = getMatchOptions;
module.exports.RECONNECT_GRACE_MS = RECONNECT_GRACE_MS;
