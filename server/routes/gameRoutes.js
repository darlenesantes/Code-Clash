const express = require('express');
const router = express.Router();
const gameService = require('../services/gameService');
const demoUsersService = require('../services/demoUsersService');
const { authenticateSession } = require('../middleware/auth');

// Create private room
router.post('/create-room', authenticateSession, async (req, res) => {
  try {
    const { user } = req;
    const { difficulty = 'medium' } = req.body;

    const result = await gameService.createRoom(user, difficulty);
    
    if (result.success) {
      res.json({
        success: true,
        roomCode: result.roomCode,
        room: result.room,
        message: `Room created with code ${result.roomCode}`
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room'
    });
  }
});

// Join private room
router.post('/join-room', authenticateSession, async (req, res) => {
  try {
    const { user } = req;
    const { roomCode } = req.body;

    if (!roomCode) {
      return res.status(400).json({
        success: false,
        error: 'Room code is required'
      });
    }

    const result = await gameService.joinRoom(user, roomCode.toUpperCase());
    
    if (result.success) {
      res.json({
        success: true,
        room: result.room,
        gameStarted: result.gameStarted,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join room'
    });
  }
});

// Quick match
router.post('/quick-match', authenticateSession, async (req, res) => {
  try {
    const { user } = req;
    const { difficulty = 'medium' } = req.body;

    const result = await gameService.findQuickMatch(user, difficulty);
    
    if (result.success) {
      res.json({
        success: true,
        matched: result.matched,
        roomCode: result.roomCode,
        room: result.room,
        opponent: result.opponent,
        message: result.message,
        queuePosition: result.queuePosition,
        estimatedWait: result.estimatedWait
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Quick match error:', error);
    res.status(500).json({
      success: false,
      error: 'Quick match failed'
    });
  }
});

// Submit solution
router.post('/submit', authenticateSession, async (req, res) => {
  try {
    const { user } = req;
    const { roomCode, code, language } = req.body;

    if (!roomCode || !code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Room code, code, and language are required'
      });
    }

    const result = await gameService.submitSolution(user, roomCode, code, language);
    
    if (result.success) {
      res.json({
        success: true,
        result: result.result,
        won: result.won,
        testResults: result.testResults,
        runtime: result.runtime,
        memory: result.memory,
        coinsEarned: result.coinsEarned,
        xpEarned: result.xpEarned,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      error: 'Submission failed'
    });
  }
});

// Get room info
router.get('/room/:roomCode', authenticateSession, async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const result = await gameService.getRoomInfo(roomCode.toUpperCase());
    
    if (result.success) {
      res.json({
        success: true,
        room: result.room,
        message: `Room ${roomCode} information`
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get room info'
    });
  }
});

// Get problem by ID
router.get('/problem/:id', authenticateSession, (req, res) => {
  try {
    const { id } = req.params;
    const problem = gameService.getProblemById(parseInt(id));
    
    if (problem) {
      res.json({
        success: true,
        problem,
        message: `Problem ${id} loaded`
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get problem'
    });
  }
});

// Get random problem by difficulty
router.get('/random-problem/:difficulty', authenticateSession, (req, res) => {
  try {
    const { difficulty } = req.params;
    const problem = gameService.getRandomProblem(difficulty);
    
    res.json({
      success: true,
      problem,
      message: `Random ${difficulty} problem loaded`
    });
  } catch (error) {
    console.error('Get random problem error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get random problem'
    });
  }
});

// Get game statistics
router.get('/stats', (req, res) => {
  try {
    const stats = gameService.getGameStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

// Get demo users for browsing
router.get('/demo-users', authenticateSession, (req, res) => {
  try {
    const users = demoUsersService.getAllDemoUsers();
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get demo users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get demo users'
    });
  }
});

// Get latest demo room code
router.get('/latest-room-code', authenticateSession, (req, res) => {
  try {
    const roomCode = demoUsersService.getLatestRoomCode();
    res.json({
      success: true,
      roomCode: roomCode.roomCode,
      creator: roomCode.creator,
      expiresAt: roomCode.expiresAt
    });
  } catch (error) {
    console.error('Get latest room code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get room code'
    });
  }
});

// Validate demo room code
router.post('/validate-room-code', authenticateSession, (req, res) => {
  try {
    const { roomCode } = req.body;
    const roomData = demoUsersService.getValidRoomCode(roomCode);
    
    if (roomData) {
      res.json({
        success: true,
        valid: true,
        roomData
      });
    } else {
      res.json({
        success: true,
        valid: false,
        message: 'Room code is invalid or expired'
      });
    }
  } catch (error) {
    console.error('Validate room code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate room code'
    });
  }
});

module.exports = router;