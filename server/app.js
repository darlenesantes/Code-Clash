require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const matchSocketHandler = require("./sockets/matchSocket");

const app = express();
const server = http.createServer(app); // Create the HTTP server

app.use(cors());
app.use(express.json());

// Initialize Socket.IO and allow CORS (frontend can connect)
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL in production
    methods: ["GET", "POST"]
  }
});

// When a client connects, hand the socket to our handler
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  matchSocketHandler(socket, io);
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});