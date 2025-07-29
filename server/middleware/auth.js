const authService = require('../services/authService');

const authenticateSession = (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(401).json({
        message: 'Authentication required. Please provide session ID.'
      });
    }

    const user = authService.getUserFromSession(sessionId);
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid or expired session. Please log in again.'
      });
    }

    // Add user to request object
    req.user = user;
    req.sessionId = sessionId;
    
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      message: 'Authentication error',
      error: error.message
    });
  }
};

const optionalAuth = (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (sessionId) {
      const user = authService.getUserFromSession(sessionId);
      if (user) {
        req.user = user;
        req.sessionId = sessionId;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Continue without authentication
  }
};

module.exports = {
  authenticateSession,
  optionalAuth
};