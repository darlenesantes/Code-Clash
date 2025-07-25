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
        displayName: {
            type: DataTypes.STRING, // Each user will input their display name in profile setup
            allowNull: true // Display name will be null when the user first signs up, to be filled in profile setup
        },
        languagePreference: {
            type: DataTypes.STRING, // Each user will select their preferred coding language in profile setup
            allowNull: true // Language preference will be null when the user first signs up, to be filled in profile setup
        },
        difficultyLevel: {
            type: DataTypes.STRING, // Each user will select their preferred difficulty level in profile setup
            allowNull: true // Difficulty level will be null when the user first signs up, to be filled in profile setup
        },
        wins: { // Number of wins the user has in matches
            type: DataTypes.INTEGER,
            defaultValue: 0 // Initialize wins to 0
        },
        totalMatchesPlayed: { // Total number of matches played by the user
            type: DataTypes.INTEGER,
            defaultValue: 0 // Initialize total matches played to 0
        }
    });
};
