const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  languagePreference: {
    type: DataTypes.STRING,
    defaultValue: 'javascript'
  },
  difficultyLevel: {
    type: DataTypes.STRING,
    defaultValue: 'medium'
  },
  wins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  losses: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalMatchesPlayed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  winStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = User;