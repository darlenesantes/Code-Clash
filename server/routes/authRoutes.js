const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticateSession } = require('../middleware/auth');

// Google OAuth login
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        message: 'Google token is required' 
      });
    }

    const result = await authService.authenticateWithGoogle(token);
    
    if (result.success) {
      res.json({
        user: result.user,
        sessionId: result.sessionId,
        message: 'Authentication successful'
      });
    } else {
      res.status(400).json({
        message: 'Authentication failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateSession, async (req, res) => {
  try {
    const { user } = req;
    const profileData = req.body;

    const result = await authService.updateUserProfile(user.id, profileData);
    
    if (result.success) {
      res.json({
        user: result.user,
        message: 'Profile updated successfully'
      });
    } else {
      res.status(400).json({
        message: 'Profile update failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Profile update failed',
      error: error.message
    });
  }
});

// Get current user
router.get('/me', authenticateSession, async (req, res) => {
  try {
    const { user } = req;
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Failed to get user data',
      error: error.message
    });
  }
});

// Logout
router.post('/logout', authenticateSession, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    await authService.invalidateSession(sessionId);
    
    res.json({ 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout failed',
      error: error.message
    });
  }
});

module.exports = router;