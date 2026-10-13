const fs = require('fs');
const path = require('path');

class ProblemUtils {
  constructor() {
    this.problems = [];
    this.loadProblems();
  }

  loadProblems() {
    const problemsPath = path.join(__dirname, '../data/problems.json');
    try {
      const parsed = JSON.parse(fs.readFileSync(problemsPath, 'utf8'));
      if (!Array.isArray(parsed)) throw new Error('problems.json must contain an array');
      this.problems = parsed;
    } catch (error) {
      console.error('Error loading problems:', error.message);
      this.problems = [];
    }
  }

  getAllProblems() { return [...this.problems]; }
  getProblemById(id) { return this.problems.find((problem) => problem.id === Number(id)) || null; }
  getProblemsByDifficulty(difficulty) {
    return this.problems.filter((problem) => problem.difficulty === String(difficulty).toLowerCase());
  }
  getRandomProblem(difficulty = null) {
    const choices = difficulty ? this.getProblemsByDifficulty(difficulty) : this.problems;
    return choices.length ? choices[Math.floor(Math.random() * choices.length)] : null;
  }
  getTotalProblemsCount() { return this.problems.length; }
  getProblemsCountByDifficulty() {
    return ['easy', 'medium', 'hard'].reduce((counts, difficulty) => {
      counts[difficulty] = this.getProblemsByDifficulty(difficulty).length;
      return counts;
    }, {});
  }
  validateProblem(problem) {
    if (!problem || typeof problem !== 'object') return { valid: false, error: 'Problem is missing' };
    for (const field of ['id', 'title', 'category', 'difficulty', 'description', 'functionSignature', 'testCases']) {
      if (!problem[field]) return { valid: false, error: `Missing required field: ${field}` };
    }
    if (!problem.functionSignature.javascript) return { valid: false, error: 'Missing JavaScript function signature' };
    if (!Array.isArray(problem.testCases) || !problem.testCases.length) return { valid: false, error: 'Problem must have test cases' };
    return { valid: true };
  }
  searchProblems(query, difficulty = null) {
    const normalized = String(query).toLowerCase();
    return (difficulty ? this.getProblemsByDifficulty(difficulty) : this.problems).filter((problem) =>
      problem.title.toLowerCase().includes(normalized) || problem.description.toLowerCase().includes(normalized)
    );
  }
  getStarterCode(problemId, language) {
    return this.getProblemById(problemId)?.functionSignature?.[language] || null;
  }
}

module.exports = new ProblemUtils();
