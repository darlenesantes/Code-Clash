// Store matches in memory (matchCode -> [sockets])
const matchRooms = {};

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
            const problem = "Implement a function that returns the square of a number."; // Temp problem
            io.to(matchCode).emit("start_game", { problem }); 
        }
    });
    
    // Listen for a test message from the client
    socket.on("client_message", (msg) => {
        console.log(`Message from client ${socket.id}:`, msg);
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