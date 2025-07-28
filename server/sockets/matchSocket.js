// Store matches in memory (matchCode -> [sockets])
const { runJudge0 } = require("../utils/judge0Helper");
const matchRooms = {};
const matchData = {};
const {
  buildJsWrappedCode,
  formatTestCasesAsStdin
} = require("../utils/wrappers");
const problems = require("../data/problems.json");

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

    //User wants to join a match
    socket.on ("join_match",({ matchCode, username}) => {
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
            const problem = problems.find(p => p.id === 2); // Pick any for now — maybe random later
            if (!problem) return;

            matchData[matchCode] = { problem };

            io.to(matchCode).emit("start_game", {
                problem: problem.description
            });
            }
    });
    
    // Listen for a test message from the client
    socket.on("client_message", (msg) => {
        console.log(`Message from client ${socket.id}:`, msg);
    });

    // Listen for a submission from the client
    socket.on("submit_code", async ({ matchCode, code, languageId }) => {
        try {
            const problem = matchData[matchCode]?.problem;
            if (!problem) throw new Error("Problem not found");

            const wrappedCode = buildJsWrappedCode(code, problem.testCases);
            const stdin = formatTestCasesAsStdin(problem.testCases);

            const result = await runJudge0(wrappedCode, languageId, "", stdin);
            const output = (result.stdout || result.stderr || "").trim();

            // Check if all tests passed by searching for ❌
            const passedAll = !output.includes("❌");

            if (passedAll) {
            io.to(matchCode).emit("match_over", {
                winner: socket.data.username,
                output
            });
            socket.to(matchCode).emit("lock_editor");
            } else {
            socket.emit("submission_result", {
                passed: false,
                output
            });
            }

}       catch (err) {
        socket.emit("submission_result", {
            passed: false,
             error: err.message
        });
    }
});
    
    // Disconnect cleanup
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);

    for (const [code, sockets] of Object.entries(matchRooms)) {
        matchRooms[code] = sockets.filter(s => s.id !== socket.id);
        if (matchRooms[code].length === 0) {
            delete matchRooms[code];
            }
        }
    });
}


module.exports = matchSocketHandler;