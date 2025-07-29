const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models'); // Import User model

const router = express.Router();

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Simple in-memory storage (replace with database later)
const users = [];
const activeSessions = new Map(); // userId -> sessionData
let userIdCounter = 1;

// Helper functions
const findUserByEmail = (email) => {
  return users.find(u => u.email === email.toLowerCase());
};

const findUserByGoogleId = (googleId) => {
  return users.find(u => u.googleId === googleId);
};

const createSession = (user) => {
  const sessionId = Math.random().toString(36).substring(2, 15);
  activeSessions.set(sessionId, {
    userId: user.id,
    user: user,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
  });
  return sessionId;
};

const getSession = (sessionId) => {
  const session = activeSessions.get(sessionId);
  if (!session) return null;
  
  // Check if expired
  if (new Date() > session.expiresAt) {
    activeSessions.delete(sessionId);
    return null;
  }
  
  return session;
};

// Google OAuth ONLY
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is required' });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = findUserByEmail(email) || findUserByGoogleId(googleId);

    if (!user) {
      // Create new user
      user = {
        id: userIdCounter++,
        username: name.replace(/\s+/g, '_').toLowerCase(),
        email: email.toLowerCase(),
        googleId,
        displayName: name,
        profilePicture: picture,
        avatar: name.substring(0, 2).toUpperCase(),
        setupComplete: false,
        rank: 'Bronze I',
        coins: 100,
        totalMatches: 0,
        wins: 0,
        losses: 0,
        winStreak: 0,
        createdAt: new Date()
      };
      users.push(user);
    }

    // Create session
    const sessionId = createSession(user);

    // Return success
    res.json({
      message: 'Google authentication successful',
      user: user,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(401).json({ message: 'No session provided' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Find user
    const user = users.find(u => u.id === session.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const updates = req.body;
    Object.assign(user, updates);
    user.setupComplete = true;

    // Update session
    session.user = user;

    res.json({
      message: 'Profile updated successfully',
      user: user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (!sessionId) {
      return res.status(401).json({ message: 'No session provided' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    const { googleId } = session.user;
    const dbUser = await User.findOne({ where: { googleId } });

    if (!dbUser) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    // Optionally update session in memory too
    session.user = dbUser;
    res.json({ user: dbUser.toJSON() });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    if (sessionId) {
      activeSessions.delete(sessionId);
    }
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Only Google OAuth

module.exports = router;