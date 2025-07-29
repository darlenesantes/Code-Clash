const fs = require('fs');
const path = require('path');

class ProblemUtils {
  constructor() {
    this.problems = null;
    this.loadProblems();
  }

  loadProblems() {
    try {
      const problemsPath = path.join(__dirname, '../data/problems.json');
      const problemsData = fs.readFileSync(problemsPath, 'utf8');
      this.problems = JSON.parse(problemsData);
      console.log('Problems loaded successfully from problems.json');
    } catch (error) {
      console.error('Error loading problems:', error);
      // Fallback to empty problems structure
      this.problems = {
        easy: [],
        medium: [],
        hard: []
      };
    }
  }

  getRandomProblem(difficulty = 'medium') {
    try {
      const difficultyLower = difficulty.toLowerCase();
      const problemsArray = this.problems[difficultyLower] || this.problems.medium;
      
      if (!problemsArray || problemsArray.length === 0) {
        console.warn(`No problems found for difficulty: ${difficulty}`);
        return this.getDefaultProblem();
      }

      const randomIndex = Math.floor(Math.random() * problemsArray.length);
      return problemsArray[randomIndex];
    } catch (error) {
      console.error('Error getting random problem:', error);
      return this.getDefaultProblem();
    }
  }

  getProblemById(id) {
    try {
      for (const difficulty in this.problems) {
        const problem = this.problems[difficulty].find(p => p.id === id);
        if (problem) {
          return problem;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting problem by ID:', error);
      return null;
    }
  }

  getProblemsByDifficulty(difficulty) {
    try {
      const difficultyLower = difficulty.toLowerCase();
      return this.problems[difficultyLower] || [];
    } catch (error) {
      console.error('Error getting problems by difficulty:', error);
      return [];
    }
  }

  getAllProblems() {
    try {
      const allProblems = [];
      for (const difficulty in this.problems) {
        allProblems.push(...this.problems[difficulty]);
      }
      return allProblems;
    } catch (error) {
      console.error('Error getting all problems:', error);
      return [];
    }
  }

  getTotalProblemsCount() {
    try {
      let count = 0;
      for (const difficulty in this.problems) {
        count += this.problems[difficulty].length;
      }
      return count;
    } catch (error) {
      console.error('Error getting total problems count:', error);
      return 0;
    }
  }

  getProblemsCountByDifficulty() {
    try {
      return {
        easy: this.problems.easy.length,
        medium: this.problems.medium.length,
        hard: this.problems.hard.length
      };
    } catch (error) {
      console.error('Error getting problems count by difficulty:', error);
      return { easy: 0, medium: 0, hard: 0 };
    }
  }

  validateProblem(problem) {
    const requiredFields = ['id', 'title', 'difficulty', 'description', 'starterCode', 'testCases'];
    
    for (const field of requiredFields) {
      if (!problem[field]) {
        return {
          valid: false,
          error: `Missing required field: ${field}`
        };
      }
    }

    // Validate starter code has required languages
    const requiredLanguages = ['javascript', 'python', 'java', 'cpp'];
    for (const lang of requiredLanguages) {
      if (!problem.starterCode[lang]) {
        return {
          valid: false,
          error: `Missing starter code for language: ${lang}`
        };
      }
    }

    // Validate test cases
    if (!Array.isArray(problem.testCases) || problem.testCases.length === 0) {
      return {
        valid: false,
        error: 'Problem must have at least one test case'
      };
    }

    return { valid: true };
  }

  getDefaultProblem() {
    return {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
        }
      ],
      constraints: [
        "2 ≤ nums.length ≤ 10⁴",
        "-10⁹ ≤ nums[i] ≤ 10⁹",
        "Only one valid answer exists."
      ],
      starterCode: {
        javascript: "var twoSum = function(nums, target) {\n    // Your code here\n    \n};",
        python: "def twoSum(self, nums: List[int], target: int) -> List[int]:\n    # Your code here\n    pass",
        java: "public int[] twoSum(int[] nums, int target) {\n    // Your code here\n    return new int[2];\n}",
        cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n    return {};\n}"
      },
      testCases: [
        { input: { nums: [2,7,11,15], target: 9 }, expected: [0,1] },
        { input: { nums: [3,2,4], target: 6 }, expected: [1,2] }
      ]
    };
  }

  searchProblems(query, difficulty = null) {
    try {
      let problems = this.getAllProblems();
      
      if (difficulty) {
        problems = this.getProblemsByDifficulty(difficulty);
      }

      const queryLower = query.toLowerCase();
      return problems.filter(problem => 
        problem.title.toLowerCase().includes(queryLower) ||
        problem.description.toLowerCase().includes(queryLower)
      );
    } catch (error) {
      console.error('Error searching problems:', error);
      return [];
    }
  }

  getStarterCode(problemId, language) {
    try {
      const problem = this.getProblemById(problemId);
      if (!problem) {
        return null;
      }
      
      return problem.starterCode[language] || null;
    } catch (error) {
      console.error('Error getting starter code:', error);
      return null;
    }
  }
}

module.exports = new ProblemUtils();