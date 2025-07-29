/**
 * User Routes
 * This file contains routes for user-related actions
 * These endpoints allow the frontend to interact with user data
 * - creating or updating a user from google OAuth login
 * - Updating user preferences
 * - Tracking user stats like wins, losses, and matches played
 * - Retrieving user data for profile views
 * authentication is handled in authRoutes.js
 */

const express = require("express");
const app = express();
const router = express.Router();
app.use(express.json());
const { User } = require('../models');

const { findOrCreateUser, updateUserPreferences, updateMatchStats, getUserStats } = require('../controllers/userController');

// Route to handle Google OAuth login
router.post('/auth/google', async (req, res) => {
  const { googleId, name } = req.body;
  console.log("Received Google ID:", googleId);

  try {
    const user = await findOrCreateUser(googleId, name);
    res.json(user);
  } catch (err) {
    console.error("🔥 Error in /auth/google:", err);
    res.status(500).json({ error: 'Failed to find or create user' });
  }
});

// route to set profile up
router.put('/profile', async (req, res) => {
    try {
        const {
            googleId,
            avatarTheme,
            avatarColor,
            favoriteLanguages,
            skillLevel,
            goals,
            setupComplete
        } = req.body;
        console.log('Updating user profile with data:', req.body); // debugging log

        const user = await User.findOne({ where: { googleId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await user.update({
            avatarTheme,
            avatarColor,
            favoriteLanguages,
            skillLevel,
            goals,
            setupComplete: true
        });

        console.log('User profile updated successfully');
        res.json({ user });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});


// Route to update user preferences
router.put('/update-preferences/:id', async (req, res) => {
    const { id } = req.params;
    const { language, difficulty } = req.body;
    try {
        const updatedUser = await updateUserPreferences(id, language, difficulty);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user preferences:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// this route will be used to retrieve user stats
router.get('/stats/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const userStats = await getUserStats(id);
        res.status(200).json(userStats);
    } catch (error) {
        console.error('Error retrieving user stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update match stats (wins, matches played)
router.put('/update-stats', async (req, res) => {
    const {userId, isWin} = req.body;

    // Update match stats based on the outcome of a match
    try {
        const updatedUser = await updateMatchStats(userId, isWin);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating match stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
