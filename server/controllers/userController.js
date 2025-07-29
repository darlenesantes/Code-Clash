/**
 * User Controller
 * Handles user-related actions
 * 
 * These functions interact with the User model to perform operations such as:
 * - finding or creating a user based on Google ID
 * - updating user preferences
 * - retrieving user stats (wins, losses, matches played, win rate)
 * - updating match stats after a game ends
 */

const { User } = require('../models');

// Function to find or create a user based on Google ID
// Here we use async to handle asynchronous DB operations
async function findOrCreateUser(googleId, googleName) {
    // first, check if the user already exists
    try {
        const existingUser = await User.findOne({ where: { googleId: googleId } });
        if (existingUser) {
            // if user exists, return the user instance. This can be converted to JSON later if needed
            console.log('User found, already registered');
            return existingUser;
        }
        // if user does not exist, create a new user
        console.log('User not found, creating new user');
        const newUser = await User.create({ 
            googleId: googleId,
            displayName: googleName
        });
        console.log('New user created');
        return newUser;
    
    }

    catch (error) {
        console.error('Error finding or creating user:', error);
        throw error; // rethrow the error to be handled by the calling function 
    }
    
};

// This controller will be used to update user preferences
async function updateUserPreferences(userId, language, difficulty) {
    const user = await User.findByPk(userId);

    // Check if user exists
    if (!user) {
        throw new Error('User not found');
    }
    // Update user preferences (such as language and difficulty level)
    user.languagePreference = language;
    user.difficultyLevel = difficulty;
    await user.save();

    return user;
}

// This controller will be used to retrieve user stats, which will be used in the profile view
// It will return the user's wins, losses, matches played, and win rate
async function getUserStats(userId) {
    const user = await User.findByPk(userId);

    // Check if user exists
    if (!user) {
        throw new Error('User not found');
    }

    return {
        wins: user.wins,
        losses: user.losses,
        matchesPlayed: user.totalMatchesPlayed,
        winStreak: user.winStreak,
        winRate: Number((user.wins / (user.totalMatchesPlayed || 1)).toFixed(2)) // Avoid division by zero
    };
}

// This controller will be used to update the user's match record after a game ends
async function updateMatchStats(userId, isWin) {
    // isWin is a boolean indicating if the user won the match
    // If isWin is true, increment wins and win streak, else reset win streak to 0
    const user = await User.findByPk(userId);

    // Check if user exists
    if (!user) {
        throw new Error('User not found');
    }

    // Update user's match stats based on win/loss
    user.totalMatchesPlayed += 1;

    if (isWin) {
        user.wins += 1;
        user.winStreak += 1; // Increment win streak
    } else {
        user.winStreak = 0; // Reset win streak on loss
    }

    await user.save();
    return user;
}

// Export the findOrCreateUser function for use in other parts of the application
module.exports = {
    findOrCreateUser,
    updateUserPreferences,
    getUserStats,
    updateMatchStats
};
