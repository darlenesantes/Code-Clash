const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const router = express.Router();

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Simple in-memory storage (replace with database later)
const users = [];
let userIdCounter = 1;

// Helper functions
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '14d' }
  );
};

const findUserByEmail = (email) => {
  return users.find(u => u.email === email.toLowerCase());
};

const findUserByUsername = (username) => {
  return users.find(u => u.username === username);
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check existing users
    if (findUserByEmail(email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (findUserByUsername(username)) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      id: userIdCounter++,
      username,
      email: email.toLowerCase(),
      passwordHash,
      avatar: username.substring(0, 2).toUpperCase(),
      setupComplete: false,
      rank: 'Bronze I',
      coins: 100,
      createdAt: new Date()
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser);

    // Return success
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword,
      accessToken: token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Return success
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken: token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Google OAuth
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
    const { email, name } = payload;

    // Check if user exists
    let user = findUserByEmail(email);

    if (!user) {
      // Create new user
      user = {
        id: userIdCounter++,
        username: name.replace(/\s+/g, '_').toLowerCase(),
        email: email.toLowerCase(),
        passwordHash: null, // No password for Google users
        avatar: name.substring(0, 2).toUpperCase(),
        setupComplete: false,
        rank: 'Bronze I',
        coins: 100,
        createdAt: new Date()
      };
      users.push(user);
    }

    // Generate token
    const accessToken = generateToken(user);

    // Return success
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Google authentication successful',
      user: userWithoutPassword,
      accessToken
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// Update profile
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const updates = req.body;
    Object.assign(user, updates);
    user.setupComplete = true;

    // Return updated user
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find user
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;