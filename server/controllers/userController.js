/**
 * User Controller
 * Handles user-related actions
 */

const { User } = require('../models');

// Function to find or create a user based on Google ID
// Here we use async to handle asynchronous DB operations
async function findOrCreateUser(googleId) {
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
        const newUser = await User.create({ googleId: googleId });
        console.log('New user created');
        return newUser;
    
    }

    catch (error) {
        console.error('Error finding or creating user:', error);
        throw error; // rethrow the error to be handled by the calling function 
    }
    
};

// Export the findOrCreateUser function for use in other parts of the application
module.exports = {
    findOrCreateUser
};
