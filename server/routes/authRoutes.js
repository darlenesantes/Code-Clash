const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

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

module.exports = router;