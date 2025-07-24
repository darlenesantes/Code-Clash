//every time a user joins, it will set up all socket logic for that user
function matchSocketHandler(socket, io) {
    //sends welcome message to new users
    socket.emit("server_message", "Welcome to Code Clash!");
    socket.on("client_message", (msg) => {
        console.log(`Message from client ${socket.id}:`, msg);
    });