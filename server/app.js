require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { OAuth2Client } = require('google-auth-library');

const app = express();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// CORS Configuration
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'CodeClash API Server',
    version: '1.0.0',
    status: 'Online',
    documentation: '/api',
    health: '/health'
  });
});

// ==================== AUTH ENDPOINTS ====================

// Google authentication
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: 'Google token is required'
      });
    }

    console.log('Verifying Google token...');

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('Google token verified for:', payload.email);

    const user = {
      id: payload.sub,
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      languagePreference: 'javascript',
      difficultyLevel: 'medium',
      wins: 0,
      losses: 0,
      totalMatchesPlayed: 0,
      winStreak: 0
    };

    res.json({
      user: user,
      message: 'Authentication successful'
    });

  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(400).json({
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// Profile update
app.post('/api/auth/profile', (req, res) => {
  try {
    const profileData = req.body;
    
    console.log('Profile data received:', profileData);
    
    res.json({
      success: true,
      message: 'Profile saved successfully',
      user: profileData,
      profile: profileData
    });
    
  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save profile'
    });
  }
});

// ==================== GAME ENDPOINTS ====================

// Create quick match
app.post('/api/game/quick-match', (req, res) => {
  try {
    const { playerId, preferences } = req.body;
    
    // Mock quick match creation
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    res.json({
      success: true,
      roomCode,
      message: 'Quick match created',
      gameData: {
        roomCode,
        gameType: 'quickMatch',
        difficulty: preferences?.difficulty || 'medium',
        timeLimit: 600,
        problem: null // Will be assigned when match starts
      }
    });
  } catch (error) {
    console.error('Quick match error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create quick match'
    });
  }
});

// Join room
app.post('/api/game/join-room', (req, res) => {
  try {
    const { roomCode, playerId } = req.body;
    
    // Mock room joining
    res.json({
      success: true,
      message: 'Joined room successfully',
      gameData: {
        roomCode,
        players: [
          { id: playerId, name: 'You', status: 'ready' },
          { id: 'opponent', name: 'Opponent', status: 'waiting' }
        ]
      }
    });
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join room'
    });
  }
});

// Submit solution
app.post('/api/game/submit', (req, res) => {
  try {
    const { roomCode, playerId, solution, testResults } = req.body;
    
    // Mock solution submission
    const passed = testResults?.every(test => test.passed) || false;
    
    res.json({
      success: true,
      result: {
        passed,
        score: passed ? 100 : Math.floor(Math.random() * 80),
        time: Date.now(),
        winner: passed ? playerId : null
      }
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution'
    });
  }
});

// ==================== UTILITY ENDPOINTS ====================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'CodeClash Server Online',
    timestamp: new Date().toISOString(),
    googleAuth: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing',
    features: {
      authentication: 'Active',
      gaming: 'Active'
    }
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'CodeClash API v1.0',
    endpoints: {
      auth: {
        'POST /api/auth/google': 'Google OAuth authentication',
        'POST /api/auth/profile': 'Update user profile'
      },
      game: {
        'POST /api/game/quick-match': 'Create quick match',
        'POST /api/game/join-room': 'Join game room',
        'POST /api/game/submit': 'Submit solution'
      },
      utility: {
        'GET /health': 'Server health check',
        'GET /api': 'API documentation'
      }
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: [
      'POST /api/auth/google',
      'POST /api/auth/profile',
      'POST /api/game/quick-match',
      'GET /health'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('==========================================');
  console.log('CodeClash Server Started');
  console.log(`Server running on: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API docs: http://localhost:${PORT}/api`);
  console.log(`Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Missing'}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('==========================================');
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /api/auth/google - Google authentication');
  console.log('  POST /api/auth/profile - Profile update');
  console.log('  POST /api/game/quick-match - Quick match');
  console.log('  GET /health - Server health check');
  console.log('==========================================');
});

module.exports = app;