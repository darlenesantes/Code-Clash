require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

// Import routes
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");

// Import services
const socketService = require("./services/socketService");

const app = express();
const server = http.createServer(app);

// CORS Configuration
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Health check
app.get('/health', (req, res) => {
  const gameService = require("./services/gameService");
  res.json({ 
    status: 'CodeClash Server Online', 
    timestamp: new Date().toISOString(),
    activeRooms: gameService.getActiveRoomsCount(),
    playersInQueue: gameService.getQueueCount()
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    availableEndpoints: [
      'POST /api/auth/google',
      'PUT /api/auth/profile', 
      'GET /api/auth/me',
      'POST /api/game/create-room',
      'POST /api/game/join-room',
      'POST /api/game/quick-match',
      'POST /api/game/submit'
    ]
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Initialize Socket.IO
const io = new Server(server, {
  cors: { 
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize socket service
socketService.initialize(io);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`CodeClash Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing'}`);
});