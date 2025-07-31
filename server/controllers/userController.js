/**
 * User Controller
 * File: server/controllers/userController.js
 * Handles user-related database operations
 */

const { User } = require('../models');

/**
 * Find or create a user based on Google ID
 * @param {string} googleId - Google OAuth ID
 * @returns {Promise<User>} User instance
 */
async function findOrCreateUser(googleId) {
  try {
    console.log('Looking for user with Google ID:', googleId);
    
    // First, check if the user already exists
    let existingUser = await User.findOne({ 
      where: { googleId: googleId } 
    });
    
    if (existingUser) {
      console.log('User found:', existingUser.email || existingUser.id);
      return existingUser;
    }
    
    // If user does not exist, create a new user
    console.log('Creating new user with Google ID:', googleId);
    const newUser = await User.create({ 
      googleId: googleId,
      lastLoginAt: new Date()
    });
    
    console.log('New user created with ID:', newUser.id);
    return newUser;
    
  } catch (error) {
    console.error('Error finding or creating user:', error);
    throw error;
  }
}

/**
 * Update user preferences
 * @param {number} userId - User ID
 * @param {string} language - Programming language preference
 * @param {string} difficulty - Difficulty level preference
 * @returns {Promise<User>} Updated user instance
 */
async function updateUserPreferences(userId, language, difficulty) {
  try {
    console.log('Updating preferences for user:', userId);
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Prepare updates object
    const updates = {};
    
    if (language && ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust'].includes(language)) {
      updates.languagePreference = language;
    }
    
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      updates.difficultyLevel = difficulty;
    }
    
    // Only update if there are valid changes
    if (Object.keys(updates).length > 0) {
      await user.update(updates);
      console.log('User preferences updated:', updates);
    } else {
      console.log('ℹNo valid preferences to update');
    }
    
    return user;
    
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

/**
 * Get user statistics
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User statistics
 */
async function getUserStats(userId) {
  try {
    console.log('Getting stats for user:', userId);
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const stats = {
      wins: user.wins || 0,
      losses: user.losses || 0,
      matchesPlayed: user.totalMatchesPlayed || 0,
      winStreak: user.winStreak || 0,
      winRate: user.totalMatchesPlayed > 0 
        ? Number(((user.wins || 0) / user.totalMatchesPlayed * 100).toFixed(2))
        : 0
    };
    
    console.log('User stats retrieved:', stats);
    return stats;
    
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
}

/**
 * Update match statistics after a game
 * @param {number} userId - User ID
 * @param {boolean} isWin - Whether the user won the match
 * @returns {Promise<User>} Updated user instance
 */
async function updateMatchStats(userId, isWin) {
  try {
    console.log('🎮 Updating match stats for user:', userId, 'Win:', isWin);
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Calculate new stats
    const updates = {
      totalMatchesPlayed: (user.totalMatchesPlayed || 0) + 1
    };
    
    if (isWin) {
      updates.wins = (user.wins || 0) + 1;
      updates.winStreak = (user.winStreak || 0) + 1;
    } else {
      updates.losses = (user.losses || 0) + 1;
      updates.winStreak = 0; // Reset win streak on loss
    }
    
    await user.update(updates);
    
    console.log('Match stats updated:', {
      wins: updates.wins || user.wins,
      losses: updates.losses || user.losses,
      winStreak: updates.winStreak,
      totalMatches: updates.totalMatchesPlayed
    });
    
    return user;
    
  } catch (error) {
    console.error('Error updating match stats:', error);
    throw error;
  }
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<User>} User instance
 */
async function getUserById(userId) {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
    
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
}

/**
 * Get user by Google ID
 * @param {string} googleId - Google OAuth ID
 * @returns {Promise<User>} User instance
 */
async function getUserByGoogleId(googleId) {
  try {
    const user = await User.findOne({ 
      where: { googleId: googleId } 
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
    
  } catch (error) {
    console.error('Error getting user by Google ID:', error);
    throw error;
  }
}

/**
 * Update user's last login time
 * @param {number} userId - User ID
 * @returns {Promise<User>} Updated user instance
 */
async function updateLastLogin(userId) {
  try {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    await user.update({ lastLoginAt: new Date() });
    return user;
    
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
}

/**
 * Get top users by wins (leaderboard)
 * @param {number} limit - Number of users to return
 * @returns {Promise<User[]>} Array of top users
 */
async function getTopUsers(limit = 10) {
  try {
    const topUsers = await User.findAll({
      order: [
        ['wins', 'DESC'],
        ['winStreak', 'DESC'],
        ['totalMatchesPlayed', 'ASC'] // Less matches played is better for same wins
      ],
      limit: limit,
      attributes: [
        'id', 'name', 'email', 'picture', 
        'wins', 'losses', 'totalMatchesPlayed', 'winStreak',
        'languagePreference', 'createdAt'
      ]
    });
    
    return topUsers;
    
  } catch (error) {
    console.error('Error getting top users:', error);
    throw error;
  }
}

module.exports = {
  findOrCreateUser,
  updateUserPreferences,
  getUserStats,
  updateMatchStats,
  getUserById,
  getUserByGoogleId,
  updateLastLogin,
  getTopUsers
};