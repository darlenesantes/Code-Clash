const { DataTypes } = require('sequelize');
const sequelize = require('../models/database');

const Problem = sequelize.define('Problem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 10000]
    }
  },
  difficulty: {
    type: DataTypes.STRING(10),
    allowNull: false,
    validate: {
      isIn: [['easy', 'medium', 'hard']]
    }
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    validate: {
      isValidTags(value) {
        if (!Array.isArray(value)) {
          throw new Error('Tags must be an array');
        }
        const validTags = [
          'array', 'string', 'hash-table', 'dynamic-programming', 'math',
          'sorting', 'greedy', 'depth-first-search', 'binary-search',
          'breadth-first-search', 'tree', 'matrix', 'two-pointers',
          'binary-tree', 'heap', 'stack', 'graph', 'linked-list',
          'backtracking', 'sliding-window', 'recursion', 'divide-and-conquer'
        ];
        
        for (const tag of value) {
          if (!validTags.includes(tag)) {
            throw new Error(`Invalid tag: ${tag}`);
          }
        }
      }
    }
  },
  testCases: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'test_cases',
    validate: {
      isValidTestCases(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error('Test cases must be a non-empty array');
        }
        
        for (const testCase of value) {
          if (!testCase.input || testCase.expected === undefined) {
            throw new Error('Each test case must have input and expected properties');
          }
        }
      }
    }
  },
  starterCode: {
    type: DataTypes.JSONB,
    field: 'starter_code',
    validate: {
      isValidStarterCode(value) {
        if (value && typeof value !== 'object') {
          throw new Error('Starter code must be an object');
        }
        
        const supportedLanguages = ['python', 'javascript', 'java', 'cpp', 'csharp'];
        if (value) {
          for (const lang in value) {
            if (!supportedLanguages.includes(lang)) {
              throw new Error(`Unsupported language: ${lang}`);
            }
          }
        }
      }
    }
  },
  solution: {
    type: DataTypes.JSONB,
    validate: {
      isValidSolution(value) {
        if (value && typeof value !== 'object') {
          throw new Error('Solution must be an object');
        }
      }
    }
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 5000, // 5 seconds
    field: 'time_limit',
    validate: {
      min: 1000,  // Minimum 1 second
      max: 30000  // Maximum 30 seconds
    }
  },
  memoryLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 256, // 256 MB
    field: 'memory_limit',
    validate: {
      min: 64,   // Minimum 64 MB
      max: 1024  // Maximum 1 GB
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  
  // Usage statistics
  timesUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'times_used',
    validate: {
      min: 0
    }
  },
  averageSolveTime: {
    type: DataTypes.INTEGER, // In milliseconds
    defaultValue: null,
    field: 'average_solve_time'
  },
  successRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    field: 'success_rate',
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'problems',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  // Indexes
  indexes: [
    {
      fields: ['difficulty']
    },
    {
      fields: ['tags'],
      using: 'gin' // GIN index for array queries
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['times_used']
    }
  ]
});

// Instance methods
Problem.prototype.getDifficultyScore = function() {
  const scores = { easy: 1, medium: 2, hard: 3 };
  return scores[this.difficulty] || 1;
};

Problem.prototype.getFormattedTestCases = function() {
  return this.testCases.map((testCase, index) => ({
    id: index + 1,
    input: testCase.input,
    expected: testCase.expected,
    hidden: index >= 3 // Hide test cases after the first 3
  }));
};

Problem.prototype.getStarterCodeForLanguage = function(language) {
  if (!this.starterCode || !this.starterCode[language]) {
    // Return default starter code if not available
    const defaultCode = {
      python: '# Your code here\n',
      javascript: '// Your code here\n',
      java: '// Your code here\n',
      cpp: '// Your code here\n',
      csharp: '// Your code here\n'
    };
    return defaultCode[language] || '// Your code here\n';
  }
  
  return this.starterCode[language];
};

Problem.prototype.updateUsageStats = async function(solved, solveTime) {
  this.timesUsed += 1;
  
  // Update success rate
  const totalSolved = Math.round(this.timesUsed * (this.successRate / 100));
  const newTotalSolved = totalSolved + (solved ? 1 : 0);
  this.successRate = (newTotalSolved / this.timesUsed) * 100;
  
  // Update average solve time (only for solved problems)
  if (solved && solveTime) {
    if (this.averageSolveTime === null) {
      this.averageSolveTime = solveTime;
    } else {
      // Weighted average
      const totalSolvedBefore = totalSolved - (solved ? 1 : 0);
      this.averageSolveTime = Math.round(
        (this.averageSolveTime * totalSolvedBefore + solveTime) / newTotalSolved
      );
    }
  }
  
  await this.save();
};

// Class methods
Problem.findByDifficulty = async function(difficulty, limit = 10) {
  return await this.findAll({
    where: { 
      difficulty,
      isActive: true
    },
    order: [['timesUsed', 'ASC']], // Prefer less used problems
    limit
  });
};

Problem.findByTags = async function(tags, limit = 10) {
  return await this.findAll({
    where: {
      tags: {
        [sequelize.Sequelize.Op.overlap]: tags
      },
      isActive: true
    },
    order: [['timesUsed', 'ASC']],
    limit
  });
};

Problem.getRandomProblem = async function(difficulty = null, excludeIds = []) {
  const whereClause = {
    isActive: true
  };
  
  if (difficulty) {
    whereClause.difficulty = difficulty;
  }
  
  if (excludeIds.length > 0) {
    whereClause.id = {
      [sequelize.Sequelize.Op.notIn]: excludeIds
    };
  }
  
  const problems = await this.findAll({
    where: whereClause,
    order: sequelize.literal('RANDOM()'),
    limit: 1
  });
  
  return problems[0] || null;
};

Problem.getPopularProblems = async function(limit = 20) {
  return await this.findAll({
    where: { isActive: true },
    order: [
      ['timesUsed', 'DESC'],
      ['successRate', 'ASC'] // Prefer challenging but solvable problems
    ],
    limit
  });
};

Problem.searchProblems = async function(query, filters = {}) {
  const whereClause = { isActive: true };
  
  // Text search in title and description
  if (query) {
    whereClause[sequelize.Sequelize.Op.or] = [
      {
        title: {
          [sequelize.Sequelize.Op.iLike]: `%${query}%`
        }
      },
      {
        description: {
          [sequelize.Sequelize.Op.iLike]: `%${query}%`
        }
      }
    ];
  }
  
  // Apply filters
  if (filters.difficulty) {
    whereClause.difficulty = filters.difficulty;
  }
  
  if (filters.tags && filters.tags.length > 0) {
    whereClause.tags = {
      [sequelize.Sequelize.Op.overlap]: filters.tags
    };
  }
  
  return await this.findAll({
    where: whereClause,
    order: [['title', 'ASC']],
    limit: filters.limit || 50
  });
};

module.exports = Problem;