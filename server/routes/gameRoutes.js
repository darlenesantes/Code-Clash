/**
 * Game Routes
 * This file contains routes for game-related actions
 * These routes are:
 * - Starting a new game -> I don't think this is needed since this logic is handled by socket.io
 * - Randomly selecting a problem for the game
 * - Submitting a solution to the problem --> TODO: implement tomorrow
 */

const express = require("express");
const router = express.Router();

// this route will be used to start a new game
// waiting on problems 