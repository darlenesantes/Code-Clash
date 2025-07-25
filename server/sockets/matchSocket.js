// Store matches in memory (matchCode -> [sockets])
const { runJudge0 } = require("../utils/judge0Helper");
const matchRooms = {};
const matchData = {};

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
            const problem = "Write a function that returns the square of a number.";
            const expectedOutput = "25\n"; // Let's say the input is 5, and correct output is 25
            const stdin = "5"; //remove later
            matchData[matchCode] = { expectedOutput, stdin };
            io.to(matchCode).emit("start_game", { problem }); 
        }
    });
    
    // Listen for a test message from the client
    socket.on("client_message", (msg) => {
        console.log(`Message from client ${socket.id}:`, msg);
    });

    // Listen for a submission from the client
    socket.on("submit_code", async ({ matchCode, code, languageId }) => {
        try {
            console.log("🔧 runJudge0 loaded?", typeof runJudge0);
            //const result = await runJudge0(code, languageId);
            const expectedOutput = matchData[matchCode]?.expectedOutput || "";
            const stdin = matchData[matchCode]?.stdin || ""; //remove later
            const result = await runJudge0(code, languageId, expectedOutput, stdin);
            

    // If status.id === 3, all test cases passed (3 is for success)
            if (result.status.id === 3) {
                io.to(matchCode).emit("match_over", {
                    winner: socket.data.username,
                    output: result.stdout
                });
    // Optionally lock the opponent's editor
                socket.to(matchCode).emit("lock_editor");

        }   else {
            socket.emit("submission_result", {
            passed: false,
            output: result.stdout || result.stderr || result.message
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