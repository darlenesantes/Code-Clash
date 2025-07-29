require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const matchSocketHandler = require("./sockets/matchSocket"); 
require('dotenv').config();


const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const gameRoutes = require("./routes/gameRoutes");


const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://code-clash-tan.vercel.app/',
  'https://code-clash-89bb.onrender.com',
  'http://localhost:3000'
];

// CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);  // this route handles user-related actions and needs to be used in frontend
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ message: 'Server error' });
});

// Socket.IO
const io = new Server(server, {
  cors: { origin: process.env.NODE_ENV === 'production' ?
  "https://code-clash-tan.vercel.app/" :
  "http://localhost:3000" }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  matchSocketHandler(socket, io);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`CodeClash Server running on port ${PORT}`);
});