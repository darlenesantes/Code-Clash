const gameService = require('./gameService');
const problemUtils = require('../utils/problemUtils');

class SocketService {
  constructor() {
    this.io = null;
    this.socketToUser = new Map(); // socketId -> user data
    this.userToSocket = new Map(); // userId -> socketId
  }

  initialize(io) {
    this.io = io;
    gameService.setSocketIO(io);
    
    console.log('Socket.IO service initialized');
    
    io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);
      
      this.setupSocketHandlers(socket);
    });
  }

  setupSocketHandlers(socket) {
    // Handle user identification
    socket.on('identify', (userData) => {
      this.socketToUser.set(socket.id, userData);
      this.userToSocket.set(userData.id, socket.id);
      console.log(`User identified: ${userData.displayName || userData.name} (${socket.id})`);
    });
    
    // Handle room joining
    socket.on('join_room', ({ roomCode, userId, username }) => {
      socket.join(roomCode);
      console.log(`${username} joined room ${roomCode}`);
      
      // Notify others in room
      socket.to(roomCode).emit('player_joined', { 
        userId, 
        username,
        message: `${username} joined the battle`,
        timestamp: Date.now()
      });
    });

    // William's join_match event (for compatibility)
    socket.on('join_match', ({ matchCode, username }) => {
      socket.join(matchCode);
      console.log(`${username} joined match ${matchCode}`);
      
      // For demo, emit start_game after short delay
      setTimeout(() => {
        const problem = problemUtils.getRandomProblem('medium');
        this.io.to(matchCode).emit('start_game', { 
          problem,
          message: `Battle begins! ${username} ready to fight`
        });
      }, 2000);
    });
    
    // Real-time typing indicators
    socket.on('typing', ({ roomCode, isTyping, userId }) => {
      socket.to(roomCode).emit('opponent_typing', { 
        isTyping, 
        userId,
        timestamp: Date.now()
      });
    });
    
    // Real-time progress updates
    socket.on('progress_update', ({ roomCode, progress, linesOfCode, userId }) => {
      socket.to(roomCode).emit('opponent_progress', { 
        progress, 
        linesOfCode, 
        userId,
        timestamp: Date.now()
      });
    });
    
    // Chat messages
    socket.on('chat_message', ({ roomCode, message, username, userId }) => {
      this.io.to(roomCode).emit('chat_message', { 
        message, 
        username, 
        userId,
        timestamp: Date.now()
      });
      console.log(`Chat in ${roomCode} - ${username}: ${message}`);
    });
    
    // Code submission notifications
    socket.on('solution_submitted', ({ roomCode, userId, username }) => {
      socket.to(roomCode).emit('opponent_submitted', {
        userId,
        username,
        message: `${username} submitted solution`,
        timestamp: Date.now()
      });
      console.log(`${username} submitted solution in room ${roomCode}`);
    });
    
    // Handle forfeit
    socket.on('forfeit', ({ roomCode, userId, username }) => {
      const roomInfo = gameService.getRoomInfo(roomCode);
      if (roomInfo.success && roomInfo.room.status === 'active') {
        const room = roomInfo.room;
        const opponent = room.players.find(p => p.userId !== userId);
        
        this.io.to(roomCode).emit('game_ended', {
          winner: opponent?.userId,
          winnerName: opponent?.username,
          reason: 'forfeit',
          message: `${username} forfeited. ${opponent?.username} wins!`
        });
        
        console.log(`${username} forfeited in room ${roomCode}`);
      }
    });

    // Handle ready countdown trigger
    socket.on('start_ready_countdown', ({ roomCode }) => {
      const gameService = require('./gameService');
      setTimeout(() => {
        gameService.startGame(roomCode);
      }, 5000); // 5 second countdown
    });

    // Handle language change
    socket.on('language_changed', ({ roomCode, language, userId, username }) => {
      socket.to(roomCode).emit('opponent_language_changed', {
        language,
        userId,
        username,
        message: `${username} switched to ${language}`,
        timestamp: Date.now()
      });
    });

    // Handle test runs
    socket.on('test_run', ({ roomCode, userId, username, results }) => {
      socket.to(roomCode).emit('opponent_test_run', {
        userId,
        username,
        results,
        message: `${username} ran tests`,
        timestamp: Date.now()
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      const userData = this.socketToUser.get(socket.id);
      if (userData) {
        console.log(`User disconnected: ${userData.displayName || userData.name} (${socket.id})`);
        
        // Notify rooms about disconnection
        const rooms = Array.from(socket.rooms);
        rooms.forEach(roomCode => {
          if (roomCode !== socket.id) {
            socket.to(roomCode).emit('player_disconnected', { 
              userId: userData.id,
              username: userData.displayName || userData.name,
              message: `${userData.displayName || userData.name} disconnected`
            });
          }
        });
        
        // Clean up mappings
        this.socketToUser.delete(socket.id);
        this.userToSocket.delete(userData.id);
      } else {
        console.log(`Anonymous user disconnected: ${socket.id}`);
      }
    });
    
    // William's server_message handler
    socket.on('server_message', (message) => {
      console.log(`Server message: ${message}`);
      socket.emit('server_message', message);
    });

    // Handle ping/pong for connection monitoring
    socket.on('ping', () => {
      socket.emit('pong');
    });
  }

  // Helper methods
  notifyRoom(roomCode, event, data) {
    if (this.io) {
      this.io.to(roomCode).emit(event, data);
    }
  }

  notifyUser(userId, event, data) {
    const socketId = this.userToSocket.get(userId);
    if (socketId && this.io) {
      this.io.to(socketId).emit(event, data);
    }
  }

  getConnectedUsersCount() {
    return this.socketToUser.size;
  }

  isUserConnected(userId) {
    return this.userToSocket.has(userId);
  }
}

module.exports = new SocketService();