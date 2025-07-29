const problemUtils = require('../utils/problemUtils');
const authService = require('./authService');
const demoUsersService = require('./demoUsersService');

class GameService {
  constructor() {
    this.gameRooms = new Map(); // roomCode -> room data
    this.matchmakingQueue = new Map(); // difficulty -> array of players
    this.io = null; // Will be set by socketService
  }

  setSocketIO(io) {
    this.io = io;
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async createRoom(user, difficulty) {
    try {
      const roomCode = this.generateRoomCode();
      
      const room = {
        roomCode,
        difficulty,
        createdBy: user.id,
        creatorName: user.displayName,
        players: [],
        status: 'waiting', // waiting, ready, active, completed
        problem: null,
        createdAt: new Date(),
        type: 'private'
      };
      
      this.gameRooms.set(roomCode, room);
      
      console.log(`Room ${roomCode} created by ${user.displayName} (${difficulty})`);
      
      // Simulate demo opponent joining after 5 seconds
      setTimeout(() => {
        this.addDemoOpponent(roomCode);
      }, 5000);
      
      return {
        success: true,
        roomCode,
        room
      };
      
    } catch (error) {
      console.error('Create room error:', error);
      return {
        success: false,
        error: 'Failed to create room'
      };
    }
  }

  async addDemoOpponent(roomCode) {
    try {
      const room = this.gameRooms.get(roomCode);
      if (!room || room.status !== 'waiting' || room.players.length >= 2) {
        return;
      }

      const demoUser = demoUsersService.getRandomDemoUser();
      const demoPlayer = {
        userId: demoUser.id,
        username: demoUser.displayName,
        avatar: demoUser.avatar,
        joinedAt: new Date(),
        status: 'ready',
        isDemo: true,
        stats: {
          rank: demoUser.rank,
          wins: demoUser.wins,
          winRate: demoUser.winRate
        }
      };

      room.players.push(demoPlayer);
      room.status = 'ready'; // Ready for countdown

      console.log(`Demo opponent ${demoUser.displayName} joined room ${roomCode}`);

      // Notify via Socket.IO
      if (this.io) {
        this.io.to(roomCode).emit('opponent_joined', {
          opponent: demoPlayer,
          message: `${demoUser.displayName} joined the battle!`,
          roomReady: true
        });
      }

      this.gameRooms.set(roomCode, room);
      
      return {
        success: true,
        opponent: demoPlayer
      };

    } catch (error) {
      console.error('Add demo opponent error:', error);
      return {
        success: false,
        error: 'Failed to add demo opponent'
      };
    }
  }

  async joinRoom(user, roomCode) {
    try {
      const room = this.gameRooms.get(roomCode);
      
      if (!room) {
        return {
          success: false,
          error: 'Room not found'
        };
      }

      // Allow room creator to rejoin their own room
      const isCreator = room.createdBy === user.id;
      const existingPlayer = room.players.find(p => p.userId === user.id);
      
      if (existingPlayer && !isCreator) {
        return {
          success: false,
          error: 'You are already in this room'
        };
      }

      if (!isCreator && room.players.length >= 2) {
        return {
          success: false,
          error: 'Room is full'
        };
      }
      
      if (room.status === 'active') {
        return {
          success: false,
          error: 'Game already in progress'
        };
      }

      // Add player to room if not already there
      if (!existingPlayer) {
        const player = {
          userId: user.id,
          username: user.displayName,
          avatar: {
            theme: user.avatarTheme || 'coder',
            color: user.avatarColor || 'blue'
          },
          joinedAt: new Date(),
          status: 'ready',
          isDemo: false
        };
        
        room.players.push(player);
      }

      // Start demo opponent timer if this is the first real player
      if (room.players.filter(p => !p.isDemo).length === 1) {
        console.log(`Starting 5-second demo opponent timer for room ${roomCode}`);
        setTimeout(() => {
          this.addDemoOpponentToGame(roomCode);
        }, 5000);
      }
      
      this.gameRooms.set(roomCode, room);
      
      console.log(`${user.displayName} joined room ${roomCode}`);
      
      return {
        success: true,
        room,
        gameStarted: false,
        message: isCreator ? 'Rejoined your room' : 'Joined room successfully'
      };
      
    } catch (error) {
      console.error('Join room error:', error);
      return {
        success: false,
        error: 'Failed to join room'
      };
    }
  }

  async addDemoOpponentToGame(roomCode) {
    try {
      const room = this.gameRooms.get(roomCode);
      if (!room || room.status === 'active' || room.players.length >= 2) {
        return;
      }

      const demoUser = demoUsersService.getRandomDemoUser();
      const demoPlayer = {
        userId: demoUser.id,
        username: demoUser.displayName,
        avatar: demoUser.avatar,
        joinedAt: new Date(),
        status: 'ready',
        isDemo: true,
        stats: {
          rank: demoUser.rank,
          wins: demoUser.wins,
          winRate: demoUser.winRate
        }
      };

      room.players.push(demoPlayer);
      room.status = 'ready'; // Ready for countdown

      console.log(`Demo opponent ${demoUser.displayName} joined room ${roomCode}`);

      // Notify via Socket.IO that opponent joined
      if (this.io) {
        this.io.to(roomCode).emit('opponent_joined', {
          opponent: demoPlayer,
          message: `${demoUser.displayName} joined the battle!`,
          roomReady: true
        });

        // Start ready countdown after 2 seconds
        setTimeout(() => {
          this.io.to(roomCode).emit('ready_countdown', {
            message: 'Both players ready! Starting countdown...',
            room
          });
        }, 2000);
      }

      this.gameRooms.set(roomCode, room);
      
      return {
        success: true,
        opponent: demoPlayer
      };

    } catch (error) {
      console.error('Add demo opponent to game error:', error);
      return {
        success: false,
        error: 'Failed to add demo opponent'
      };
    }
  }

  async startGame(roomCode) {
    try {
      const room = this.gameRooms.get(roomCode);
      if (!room || room.players.length < 2) {
        return { success: false, error: 'Room not ready for game start' };
      }

      room.status = 'active';
      room.problem = problemUtils.getRandomProblem(room.difficulty);
      room.startedAt = new Date();
      room.timeLimit = 600; // 10 minutes

      console.log(`Game started in room ${roomCode}`);

      // Notify players via Socket.IO
      if (this.io) {
        this.io.to(roomCode).emit('game_started', {
          problem: room.problem,
          players: room.players,
          roomCode,
          timeLimit: room.timeLimit,
          message: 'Battle begins! Code your way to victory!'
        });
      }

      this.gameRooms.set(roomCode, room);

      return {
        success: true,
        room
      };

    } catch (error) {
      console.error('Start game error:', error);
      return {
        success: false,
        error: 'Failed to start game'
      };
    }
  }

  async findQuickMatch(user, difficulty) {
    try {
      const player = {
        userId: user.id,
        username: user.displayName,
        difficulty,
        avatar: {
          theme: user.avatarTheme || 'coder',
          color: user.avatarColor || 'blue'
        },
        joinedAt: new Date(),
        socketId: null
      };
      
      // Initialize queue for difficulty if not exists
      if (!this.matchmakingQueue.has(difficulty)) {
        this.matchmakingQueue.set(difficulty, []);
      }
      
      const queue = this.matchmakingQueue.get(difficulty);
      
      // Remove player if already in queue
      const existingIndex = queue.findIndex(p => p.userId === user.id);
      if (existingIndex !== -1) {
        queue.splice(existingIndex, 1);
      }
      
      queue.push(player);
      
      console.log(`${user.displayName} joined ${difficulty} matchmaking queue (${queue.length} players)`);
      
      // Try to match with another player
      if (queue.length >= 2) {
        const player1 = queue.shift();
        const player2 = queue.shift();
        
        // Create battle room for matched players
        const roomCode = this.generateRoomCode();
        const room = {
          roomCode,
          difficulty,
          players: [player1, player2],
          status: 'active',
          problem: problemUtils.getRandomProblem(difficulty),
          createdAt: new Date(),
          startedAt: new Date(),
          timeLimit: 600,
          type: 'quick_match'
        };
        
        this.gameRooms.set(roomCode, room);
        
        console.log(`Quick match found: ${player1.username} VS ${player2.username} in room ${roomCode}`);
        
        return {
          success: true,
          matched: true,
          roomCode,
          room,
          opponent: player2,
          message: 'Opponent found! Game starting...'
        };
        
      } else {
        return {
          success: true,
          matched: false,
          message: 'Searching for opponent...',
          queuePosition: queue.length,
          estimatedWait: '10-30 seconds'
        };
      }
      
    } catch (error) {
      console.error('Quick match error:', error);
      return {
        success: false,
        error: 'Quick match failed'
      };
    }
  }

  async submitSolution(user, roomCode, code, language) {
    try {
      const room = this.gameRooms.get(roomCode);
      
      if (!room) {
        return {
          success: false,
          error: 'Room not found'
        };
      }

      if (room.status !== 'active') {
        return {
          success: false,
          error: 'Game is not active'
        };
      }

      console.log(`${user.displayName} submitted solution in ${language} for room ${roomCode}`);
      
      // TODO: Integrate with Judge0 API here
      // For now, simulate solution validation
      const judgeResult = this.simulateJudgeResult(room.problem);
      
      if (judgeResult.allPassed) {
        // Victory!
        room.status = 'completed';
        room.winner = user.id;
        room.winnerName = user.displayName;
        room.completedAt = new Date();
        room.solution = { code, language, userId: user.id };
        
        // Update user stats
        const statsUpdate = {
          wins: (user.wins || 0) + 1,
          totalGames: (user.totalGames || 0) + 1,
          coins: (user.coins || 100) + 50,
          xp: (user.xp || 0) + 25
        };
        statsUpdate.winRate = Math.round((statsUpdate.wins / statsUpdate.totalGames) * 100);
        
        authService.updateUserStats(user.id, statsUpdate);
        
        console.log(`Victory! ${user.displayName} won room ${roomCode}`);
        
        // Notify players via Socket.IO
        if (this.io) {
          this.io.to(roomCode).emit('game_ended', {
            winner: user.id,
            winnerName: user.displayName,
            room,
            message: `${user.displayName} wins!`
          });
        }
        
        return {
          success: true,
          result: 'victory',
          won: true,
          testResults: judgeResult.testResults,
          runtime: judgeResult.runtime,
          memory: judgeResult.memory,
          coinsEarned: 50,
          xpEarned: 25,
          message: 'Victory! You won the battle!'
        };
        
      } else {
        console.log(`${user.displayName} solution failed in room ${roomCode}`);
        
        return {
          success: true,
          result: 'failed',
          won: false,
          testResults: judgeResult.testResults,
          runtime: judgeResult.runtime,
          memory: judgeResult.memory,
          message: 'Some test cases failed. Keep trying!'
        };
      }
      
    } catch (error) {
      console.error('Submit solution error:', error);
      return {
        success: false,
        error: 'Submission failed'
      };
    }
  }

  simulateJudgeResult(problem) {
    // 70% chance of correct solution for demo
    const isCorrect = Math.random() > 0.3;
    const testResults = problem.testCases.map((testCase, index) => ({
      id: index + 1,
      input: JSON.stringify(testCase.input),
      expected: JSON.stringify(testCase.expected),
      actual: isCorrect ? JSON.stringify(testCase.expected) : JSON.stringify(null),
      passed: isCorrect,
      runtime: Math.floor(Math.random() * 100) + 'ms',
      memory: Math.floor(Math.random() * 50) + 'MB'
    }));
    
    return {
      allPassed: isCorrect,
      testResults,
      runtime: Math.floor(Math.random() * 100) + 'ms',
      memory: Math.floor(Math.random() * 50) + 'MB'
    };
  }

  getRoomInfo(roomCode) {
    try {
      const room = this.gameRooms.get(roomCode);
      
      if (!room) {
        return {
          success: false,
          error: 'Room not found'
        };
      }
      
      return {
        success: true,
        room
      };
    } catch (error) {
      console.error('Get room info error:', error);
      return {
        success: false,
        error: 'Failed to get room info'
      };
    }
  }

  getProblemById(id) {
    return problemUtils.getProblemById(id);
  }

  getRandomProblem(difficulty) {
    return problemUtils.getRandomProblem(difficulty);
  }

  getActiveRoomsCount() {
    return this.gameRooms.size;
  }

  getQueueCount() {
    return Array.from(this.matchmakingQueue.values())
      .reduce((total, queue) => total + queue.length, 0);
  }

  getGameStats() {
    return {
      totalRooms: this.gameRooms.size,
      activeSessions: authService.getActiveSessionsCount(),
      totalProblems: problemUtils.getTotalProblemsCount(),
      playersInQueue: this.getQueueCount(),
      supportedLanguages: ['javascript', 'python', 'java', 'cpp']
    };
  }
}

module.exports = new GameService();