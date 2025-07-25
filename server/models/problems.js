/**
 * This is the table that will keep track of all problems
 * Problem table stores:
 * - id (primary key)
 * - title (string, title of the problem)
 * - description (text, detailed description of the problem)
 * - difficulty (string, difficulty level of the problem)
 * - testCases (text, JSON string of test cases for the problem)
 * - starterCode (JSON, for different languages)
 * - time limit (integer, time limit for the problem in seconds)
 * - memory limit (integer, memory limit for the problem in MB)
 */


const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Problem', {
        // Problem details
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true // Each problem must have a unique title
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false // Description is mandatory for each problem
        },
        difficulty: {
            type: DataTypes.STRING, // Possible values = easy, medium, hard
            allowNull: false
        },
        testCases: {
            type: DataTypes.JSONB, // JSON string of test cases for the problem
            allowNull: false
        },
        starterCode: {
            type: DataTypes.JSONB, // Starter code in different languages
            allowNull: true // Optional field, can be null if no starter code is provided
        },
        timeLimit: {
            type: DataTypes.INTEGER, // Time limit in seconds
            allowNull: false
        },
        memoryLimit: {
            type: DataTypes.INTEGER, // Memory limit in MB
            allowNull: false
        }
    });
}

