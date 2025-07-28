/**
 * Game Routes
 * This file contains routes for game-related actions
 * These routes are:
 * - Randomly selecting a problem for the game
 */

const express = require("express");
const router = express.Router();
const problems = require('../data/problems.json');
 
/**
 * GET /game/question
 * This route will randomly select a problem from the problems.json file
 * and return it to the client
 * Query parameters:
 * - language: the language of the problem (e.g. javascript, python, cpp, java)
 * - difficulty: the difficulty of the problem (e.g. easy, medium, hard)
 * - optional category: the category of the problem
 * Returns:
 * - A random problem object from the problems.json file
 */
router.get('/question', (req, res) => {
    const { language, difficulty, category } = req.query;

    // verify that language and difficulty are provided
    if (!language || !difficulty) {
        return res.status(400).json({ error: 'Language and difficulty are required' });
    }

    // filter problems based on language and difficulty
    const filteredProblems = problems.filter((problem) => {
        return (
            problem.difficulty === difficulty &&
            problem.functionSignature[language] && // check if the problem has a function signature for the requested language
            // if category is provided, filter by category as well
            (!category || problem.category === category)
        );
    });

    // Handle case where no problems match the criteria
    if (filteredProblems.length === 0) {
        return res.status(404).json({error: 'No problems found matching the criteria'});
    }

    // Randomly select a problem from the filtered problems
    const randomProblem = filteredProblems[Math.floor(Math.random() * filteredProblems.length)];

    // Return the selected problem
    res.status(200).json({
        id: randomProblem.id,
        title: randomProblem.title,
        description: randomProblem.description,
        difficulty: randomProblem.difficulty,
        language: language,
        functionSignature: randomProblem.functionSignature[language], // this returns the starter code for requested language
        testCases: randomProblem.testCases
    });
});

// Export the router
module.exports = router;
