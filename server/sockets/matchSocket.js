// Store matches in memory (matchCode -> [sockets])
const axios = require('axios');
const { runJudge0 } = require("../utils/judge0Helper");
const {
  buildJsWrappedCode,
  formatTestCasesAsStdin,
  buildPythonWrapper
} = require("../utils/wrappers");
const matchRooms = {};
const matchData = {};
const LANGUAGE_ID = {
  javascript: 63,
  python:     71,
  java:       62,
  cpp:        54
};

//Utility: generate random room codes
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function runAllTestCases(code, languageId, testCases) {
  const results = [];

  for (const { input, expectedOutput } of testCases) {
    try {
      const result = await runJudge0(code, languageId, expectedOutput, input);
      results.push({
        input,
        expectedOutput,
        actual: (result.stdout || result.stderr || "").trim(),
        passed: result.status?.id === 3
      });
    } catch (err) {
      results.push({
        input,
        expectedOutput,
        actual: err.message || "Error during execution",
        passed: false
      });
    }
  }

  return results;
}

//every time a user joins, it will set up all socket logic for that user
function matchSocketHandler(socket, io) {

    //sends welcome message to new users
    socket.emit("server_message", "Welcome to Code Clash!");

    //Create Room (Private)
    socket.on("create_room", ({ difficulty, language, category, creator }) => {
    console.log("🔥 Received create_room from:", creator?.username);

    let roomCode;

    do {
      roomCode = generateRoomCode();
    } while (matchRooms[roomCode]);

    matchRooms[roomCode] = [socket];
      matchData[roomCode] = {
      difficulty,
      language,
      category,
      players: [creator],
      createdAt: Date.now()
    };

    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.username = creator.username;
    socket.data.userId = creator.id;

    console.log(`${creator.username} created room ${roomCode} with`, { difficulty, language, category });
    socket.emit("room_created", { roomCode });
  });

  // ✅ Join Room
  socket.on("join_room", async ({ roomCode, player }) => {
    const room = matchRooms[roomCode];

    if (!room || room.length >= 2) {
      socket.emit("room_error", { message: "Room not found or full" });
      return;
    }

    matchRooms[roomCode].push(socket);
    matchData[roomCode].players.push(player);
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.username = player.username;
    socket.data.userId = player.id;

    console.log(`${player.username} joined room ${roomCode}`);

    io.to(roomCode).emit("room_joined", {
      roomCode,
      playerCount: matchRooms[roomCode].length
    });

    // Start game when 2 players are in
    if (matchRooms[roomCode].length === 2) {
      const { difficulty, language, category } = matchData[roomCode];
          const response = await axios.get(
      "http://localhost:3001/api/game/question",
      { params: { difficulty, language, category } }
    );
      const problem = response.data;

      matchData[roomCode].problem = problem;

      console.log(
        `🔥 [matchSocket] BOTH PLAYERS JOINED — starting game in room ${roomCode}`,
        { difficulty, language, category, problemId: problem.id }
      );

      io.to(roomCode).emit("start_game", {
        roomCode,
        problem,
        timeLimit: 600
      });
    }
  });

  // 🧪 Test messaging
  socket.on("client_message", (msg) => {
    console.log(`Message from client ${socket.id}:`, msg);
  });

    //User wants to join a match
    socket.on ("join_match", async({ matchCode, username}) => {
        socket.data.username = username; // Store username on socket
        
        // Create match if it doesn't exist
        if (!matchRooms[matchCode]) {
            matchRooms[matchCode] = [];
    }

        matchRooms[matchCode].push(socket);
        socket.join(matchCode); // Join the room

        console.log(`${username} joined match ${matchCode}`);

        // If 2 players are in, start the game
        if (matchRooms[matchCode].length === 2) {
          const difficulty = "easy"; // You can later let this be dynamic
          const response = await axios.get(`http://localhost:3001/api/game/question?difficulty=${difficulty}`);
          const problem = response.data;

          matchData[matchCode] = { problem };

          console.log("🔥 [matchSocket] Quick match started:", matchCode);
          console.log("📦 [matchSocket] Problem sent:", problem.id, problem.title);

          io.to(matchCode).emit("start_game", {
            roomCode: matchCode, 
            problem,
            timeLimit: 600
          });
            }
    });
    

    // Listen for a submission from the client
// Inside your matchSocketHandler(socket, io), replace your existing handler with this:
socket.on("submit_solution", async ({ roomCode: matchCode, code, language }) => {
  try {
    console.log(`🛰️ [Server] submit_solution received in room: ${matchCode}, language: ${language}`);

    // 1. Look up the problem data for this room
    const problem = matchData[matchCode]?.problem;
    if (!problem) {
      socket.emit("submission_result", { passed: false, error: "Problem not found" });
      return;
    }

    // 2. Map languages to Judge0 IDs
    const languageIds = {
      javascript: 63,
      python:     71,
      java:       62,
      cpp:        54
    };
    const languageId = languageIds[language] || 63;

    // ── Branch by language ──
    if (language === "javascript") {
      // JavaScript: use your bulk‐wrapper
      const wrapperType = problem.category === "linked list"
        ? "linkedlist"
        : problem.category === "binary tree"
          ? "binarytree"
          : problem.category === "graph"
            ? "graph"
            : "array";

      const wrappedCode = buildJsWrappedCode(code, problem.testCases, wrapperType);
      const stdin       = formatTestCasesAsStdin(problem.testCases, wrapperType);
      console.log("=== DEBUG: generated stdin ===\n" + stdin + "\n=== END DEBUG ===");

      const result = await runJudge0(wrappedCode, languageId, "", stdin);
      const rawBase64 = result.stdout || result.stderr || "";
      const decoded   = Buffer.from(rawBase64, "base64").toString("utf-8");
      console.log("✅ Decoded Output:\n", decoded);

      const lines     = decoded.split("\n").filter(l => l.trim().length);
      const allPassed = lines.every(line => line.startsWith("✅"));

      io.to(matchCode).emit("submission_result", {
        output: decoded,
        allPassed,
        winner: allPassed ? socket.data.username : null
      });

      if (allPassed) {
        socket.to(matchCode).emit("lock_editor");
      }

    } else if (language === "python") {
  // 1) Build & run the Python wrapper
  const wrappedCode = buildPythonWrapper(code, problem.testCases);
  // Only send the actual input lines (ignore expectedOutputs)
  const stdin = formatTestCasesAsStdin(problem.testCases, "array");;
  console.log("=== DEBUG PYTHON stdin ===\n" + stdin + "\n=== END DEBUG ===");

  const result  = await runJudge0(wrappedCode, languageId, "", stdin);
  const decoded = Buffer.from(result.stdout || result.stderr || "", "base64")
                      .toString("utf8")
                      .trim();
  console.log("✅ Python decoded:\n", decoded);

  // 2) Break into lines and compare
  const lines   = decoded.split("\n").filter(l => l.trim().length);
  const results = problem.testCases.map((tc, i) => {
    let actual;
    try {
      actual = JSON.parse(lines[i]);
    } catch {
      actual = lines[i];
    }
    // see if any of the allowed expected outputs matches
    const passed = tc.expectedOutputs.some(exp => {
      try {
        return exp === JSON.stringify(actual);
      } catch {
        return false;
      }
    });
    return {
      idx: i + 1,
      passed,
      input: tc.input.trim(),
      expected: tc.expectedOutputs,
      actual
    };
  });

  const allPassed = results.every(r => r.passed);

  // 3) Emit exactly the same format you have for JS
      const formatted = results.map((r, i) => {
        if (r.passed) {
          return `✅ Test ${i + 1}: Passed`;
        } else {
          return [
            `❌ Test ${i + 1}: Failed`,
            `  Input: ${r.input}`,
            `  Expected: ${JSON.stringify(r.expected)}`,
            `  Got: ${JSON.stringify(r.actual)}`
          ].join("\n");
        }
      }).join("\n\n");

      io.to(matchCode).emit("submission_result", {
        output: formatted,
        allPassed,
        winner: allPassed ? socket.data.username : null
      });

      if (allPassed) {
        socket.to(matchCode).emit("lock_editor");
      }
}
    else if (language === "java") {
      // fallback: run each test case one by one
      const results = await runAllTestCases(code, languageId, problem.testCases);
      const allPassed = results.every(r => r.passed);

      const formatted = results.map((r, i) => {
        if (r.passed) {
          return `✅ Test ${i + 1}: Passed`;
        } else {
          return [
            `❌ Test ${i + 1}: Failed`,
            `  Input: ${r.input}`,
            `  Expected: ${JSON.stringify(r.expectedOutput || r.expectedOutputs)}`,
            `  Got: ${JSON.stringify(r.actual)}`
          ].join("\n");
        }
      }).join("\n\n");

      io.to(matchCode).emit("submission_result", {
        output: formatted,
        allPassed,
        winner: allPassed ? socket.data.username : null
      });

      if (allPassed) {
        socket.to(matchCode).emit("lock_editor");
      }
          }
    else {
      socket.emit("submission_result", {
        passed: false,
        error: `Unsupported language: ${language}`
      });
    }
  } catch (err) {
    console.error("❌ submit_solution error:", err);
    socket.emit("submission_result", {
      passed: false,
      error: err.message
    });
  }
});

}


module.exports = matchSocketHandler;