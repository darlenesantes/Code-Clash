/**
 * Authentication Middleware
 * File: server/middleware/auth.js
 * Middleware for session validation and user authentication
 */

const authService = require('../services/authService');

/**
 * Middleware to authenticate user sessions
 * Validates session ID and attaches user data to request
 */
const authenticateSession = async (req, res, next) => {
  try {
    // Get session ID from header
    const sessionId = req.headers['x-session-id'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!sessionId) {
      return res.status(401).json({
        message: 'Authentication required',
        error: 'No session ID provided'
      });
    }

    console.log('Validating session:', sessionId.substring(0, 8) + '...');

    // Validate session
    const sessionResult = await authService.validateSession(sessionId);
    
    if (!sessionResult.success) {
      return res.status(401).json({
        message: 'Authentication failed',
        error: sessionResult.error
      });
    }

    // Attach user data to request
    req.user = sessionResult.user;
    req.sessionData = sessionResult.sessionData;
    req.sessionId = sessionId;

    console.log('Session validated for user:', req.user.email);
    next();

  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      message: 'Authentication error',
      error: 'Internal server error'
    });
  }
};

/**
 * Middleware to require specific user roles
 * @param {string[]} roles - Array of required roles
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required',
          error: 'User not authenticated'
        });
      }

      // For now, we don't have roles in our user model
      // This is a placeholder for future role-based access control
      const userRole = req.user.role || 'user';
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          message: 'Access denied',
          error: 'Insufficient permissions'
        });
      }

      next();

    } catch (error) {
      console.error('Role validation error:', error);
      res.status(500).json({
        message: 'Authorization error',
        error: 'Internal server error'
      });
    }
  };
};

/**
 * Optional authentication middleware
 * Attaches user data if session is valid, but doesn't require authentication
 */
const optionalAuth = async (req, res, next) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (sessionId) {
      const sessionResult = await authService.validateSession(sessionId);
      
      if (sessionResult.success) {
        req.user = sessionResult.user;
        req.sessionData = sessionResult.sessionData;
        req.sessionId = sessionId;
        console.log('Optional auth: User authenticated:', req.user.email);
      } else {
        console.log('Optional auth: Invalid session, proceeding without auth');
      }
    } else {
      console.log('ℹOptional auth: No session provided, proceeding without auth');
    }

    next();

  } catch (error) {
    console.error('Optional auth error:', error);
    // Don't fail the request, just proceed without authentication
    next();
  }
};

/**
 * Middleware to validate API keys (for future use)
 */
const validateApiKey = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        message: 'API key required',
        error: 'No API key provided'
      });
    }

    // For now, just check if API key is provided
    // In production, validate against database
    if (apiKey !== process.env.API_KEY && process.env.NODE_ENV === 'production') {
      return res.status(401).json({
        message: 'Invalid API key',
        error: 'API key validation failed'
      });
    }

    next();

  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({
      message: 'API key validation error',
      error: 'Internal server error'
    });
  }
};

/**
 * Rate limiting middleware (basic implementation)
 */
const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later'
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    try {
      const identifier = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      
      // Clean up old entries
      for (const [key, data] of requests.entries()) {
        if (now - data.resetTime > windowMs) {
          requests.delete(key);
        }
      }

      // Get or create request data for this identifier
      let requestData = requests.get(identifier);
      if (!requestData) {
        requestData = {
          count: 0,
          resetTime: now
        };
        requests.set(identifier, requestData);
      }

      // Reset count if window has passed
      if (now - requestData.resetTime > windowMs) {
        requestData.count = 0;
        requestData.resetTime = now;
      }

      // Check if limit exceeded
      if (requestData.count >= maxRequests) {
        return res.status(429).json({
          message,
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((windowMs - (now - requestData.resetTime)) / 1000)
        });
      }

      // Increment request count
      requestData.count++;

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - requestData.count),
        'X-RateLimit-Reset': new Date(requestData.resetTime + windowMs).toISOString()
      });

      next();

    } catch (error) {
      console.error('Rate limiting error:', error);
      // Don't fail the request due to rate limiting errors
      next();
    }
  };
};

module.exports = {
  authenticateSession,
  requireRole,
  optionalAuth,
  validateApiKey,
  rateLimit
};