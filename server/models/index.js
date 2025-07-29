/**
 * Central file for Sequelize models
 * 
 * This file initializes the Sequelize models for the application
 * so that they can be used throughout the app
 * 
 * We are importing the user and problem models here
 */

const sequelize = require('./database');
const defineUser = require('./user');
const Problem = require('./Problem'); // Import the problem model

// Initialize the User model and Problem model with the sequelize instance
const User = defineUser(sequelize);

// Export the models
module.exports = {
    sequelize,
    User,
    Problem
};


