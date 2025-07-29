/**
 * This is the user model
 * This model will keep track of user information
 * User table stores:
 * - id (primary key)
 * - googleID (string, passed from Google OAuth)
 * - displayName (string, user's name)
 * - languagePreference (string, user's preferred coding language)
 * - difficultyLevel (string, user's preferred difficulty level)
 *
 * NOTE: I will add a more detailed description of interactions with this model later
 **/

const { data } = require('react-router-dom');

const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('User', {
        // Profile details
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        googleId: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true // Ensures that each user has a unique Google ID
        },

        // User will set these fields up in profile setup
        avatar: {
            type: DataTypes.STRING, // Each user will have a 2 letter initial avatar
            allowNull: true // Avatar will be null when the user first signs up, to be filled in profile setup
        },
        displayName: {
            type: DataTypes.STRING, // Each user will input their display name in profile setup
            allowNull: true, // Display name will be null when the user first signs up, to be filled in profile setup
            unique: true // Each display name must be unique
        },
        favoriteLanguages: {
            type: DataTypes.ARRAY(DataTypes.STRING), // Each user will select their preferred coding language in profile setup
            allowNull: true // Language preference will be null when the user first signs up, to be filled in profile setup
        },
        skillLevel: {
            type: DataTypes.STRING, // Each user will select their preferred skill level in profile setup
            allowNull: true // Skill level will be null when the user first signs up, to be filled in profile setup
            // Possible values = beginner, intermediate, advanced, expert
        },
        goals: {
            type: DataTypes.ARRAY(DataTypes.STRING), // Each user will select their goals in profile setup
            allowNull: true // This will be filled in during profile setup
            // Possible values = improve problem solving, learn new algorithms, practice coding interviews, etc.
        },
        // User Avatar
        avatarTheme: {
            type: DataTypes.STRING,
            allowNull: true // This will be filled in during profile setup
        },
        avatarColor: {
            type: DataTypes.STRING,
            allowNull: true // This will be filled in during profile setup
        },
        setupComplete: {
            type: DataTypes.BOOLEAN, // Indicates whether the user has completed their profile setup
            defaultValue: false // Default to false when the user first signs up
        },
        // User statistics
        wins: { // Number of wins the user has in matches
            type: DataTypes.INTEGER,
            defaultValue: 0 // Initialize wins to 0
        },
        totalMatchesPlayed: { // Total number of matches played by the user
            type: DataTypes.INTEGER,
            defaultValue: 0 // Initialize total matches played to 0
        },

        // Game components
        rank: {
            type: DataTypes.STRING, // User's rank based on their performance
            defaultValue: "Bronze I" // Default rank when the user first signs up
            // Possible values = Bronze I, Bronze II, Silver I, etc.
        },
        coins: {
            type: DataTypes.INTEGER,
            defaultValue: 100 // Initialize coins to 100
        },
        winStreak: {
            type: DataTypes.INTEGER,
            defaultValue: 0 // Initialize win streak to 0
            // this will be reset to 0 when the user loses a match
        },
        dateCreated: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW // Automatically set to the current date and time when the user is created
        },
        lastLogin: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW // Automatically set to the current date and time when the user logs in
            // this will be updated every time the user logs in
        }
    });
};
