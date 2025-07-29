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

// route to update user coins and rank after a game ends
/**
 * This route updates the user's coins and rank based on the game result.
 * input: { googleId: string, isWin: boolean }
 * isWin is true if the user won the game, false if they lost.
 * googleId is the user's unique identifier
 * The rank is determined based on the user's coins
 * result is json containing the user google ID, coins, and rank
 */
router.put('/update-coins-rank', async (req, res) => {
    const { googleId, isWin } = req.body; // result can be 'true', 'false', draws can be treated as a loss
    
    if (!googleId || typeof isWin !== 'boolean') {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    try {
        const user = await User.findOne({ where: { googleId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // update coins:
        const coinsChange = isWin ? 100 : -50; // win gives 100 coins, loss deducts 50 coins
        const newCoins = Math.max(0, user.coins + coinsChange); // ensure coins don't go below 0
        user.coins = newCoins;

        // update rank based on coins
        let rank;
        const c = newCoins;
        if (c >= 1350) rank = 'Legend';
        else if (c >= 1200) rank = 'Gold 3';
        else if (c >= 1050) rank = 'Gold 2';
        else if (c >= 900) rank = 'Gold 1';
        else if (c >= 750) rank = 'Silver 3';
        else if (c >= 600) rank = 'Silver 2';
        else if (c >= 450) rank = 'Silver 1';
        else if (c >= 300) rank = 'Bronze 3';
        else if (c >= 150) rank = 'Bronze 2';
        else rank = 'Bronze 1';

        user.rank = rank;

        // save and respond
        await user.save();
        res.json({
            message: 'User coins and rank updated successfully',
            user: {
                googleId: user.googleId,
                coins: user.coins,
                rank: user.rank
            }
        });
    } catch (error) {
        console.error('Error updating user coins and rank:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Export the router
module.exports = router;
