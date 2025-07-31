/**
 * Fixed Tournament API Routes
 * File: server/routes/tournamentRoutes.js
 * RESTful API endpoints for tournament management and elite competitions
 */

const express = require('express');
const router = express.Router();
const TournamentController = require('../controllers/tournamentController');
const { authenticateSession, requireRole } = require('../middleware/auth');
const { validateTournamentData, validateSponsorshipData } = require('../middleware/validation');
const rateLimit = require('../middleware/rateLimit');
const { Op } = require('sequelize');

// Initialize controller with proper error handling
let tournamentController;
try {
  tournamentController = new TournamentController();
} catch (error) {
  console.error('Failed to initialize TournamentController:', error);
  // Graceful fallback - we'll handle this in individual routes
}

// Enhanced rate limiting with different limits for different operations
const createTournamentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 tournament creations per hour
  message: 'Too many tournament creation attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const generalTournamentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 general tournament operations per window
  message: 'Too many tournament operations, please try again later'
});

const sponsorshipRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 sponsorship operations per hour
  message: 'Too many sponsorship operations, please try again later'
});

const analyticsRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 analytics requests per 5 minutes
  message: 'Too many analytics requests, please try again later'
});

/**
 * Middleware to ensure controller is initialized
 */
const ensureController = (req, res, next) => {
  if (!tournamentController) {
    return res.status(503).json({
      success: false,
      message: 'Tournament service is temporarily unavailable',
      error: 'Controller initialization failed'
    });
  }
  next();
};

/**
 * Input validation middleware
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid page number'
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Invalid limit. Must be between 1 and 100'
    });
  }
  
  req.pagination = { page: pageNum, limit: limitNum };
  next();
};

const validateUUID = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName} format`
    });
  }
  
  next();
};

/**
 * Tournament Management Routes
 */

// Create elite tournament (Admin only)
router.post('/create-elite',
  ensureController,
  authenticateSession,
  requireRole(['ADMIN', 'TOURNAMENT_MANAGER']),
  validateTournamentData,
  createTournamentRateLimit,
  async (req, res) => {
    try {
      await tournamentController.createEliteTournament(req, res);
    } catch (error) {
      console.error('Create elite tournament route error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create elite tournament',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get all tournaments with enhanced filters and validation
router.get('/',
  ensureController,
  validatePagination,
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      const {
        status,
        skillLevel,
        tournamentType,
        search,
        minPrizePool,
        maxPrizePool,
        sortBy = 'tournamentStartDate',
        sortOrder = 'ASC'
      } = req.query;

      const { page, limit } = req.pagination;

      // Build filters with validation
      const filters = {};
      
      if (status) {
        const validStatuses = ['UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
        if (validStatuses.includes(status.toUpperCase())) {
          filters.status = status.toUpperCase();
        }
      }
      
      if (skillLevel) {
        const validSkillLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'];
        if (validSkillLevels.includes(skillLevel.toUpperCase())) {
          filters.skillLevel = skillLevel.toUpperCase();
        }
      }
      
      if (tournamentType) {
        const validTypes = ['DAILY', 'WEEKLY', 'MONTHLY', 'SEASONAL', 'SPECIAL_EVENT'];
        if (validTypes.includes(tournamentType.toUpperCase())) {
          filters.tournamentType = tournamentType.toUpperCase();
        }
      }

      // Search functionality
      if (search && search.trim()) {
        filters.name = {
          [Op.iLike]: `%${search.trim()}%`
        };
      }

      // Prize pool filters
      if (minPrizePool || maxPrizePool) {
        const prizePoolFilter = {};
        if (minPrizePool && !isNaN(minPrizePool)) {
          prizePoolFilter[Op.gte] = parseFloat(minPrizePool);
        }
        if (maxPrizePool && !isNaN(maxPrizePool)) {
          prizePoolFilter[Op.lte] = parseFloat(maxPrizePool);
        }
        // This would need to be applied to the included PrizePool model
      }

      // Validate sort parameters
      const validSortFields = ['tournamentStartDate', 'createdAt', 'name', 'maxParticipants', 'currentParticipants'];
      const validSortOrders = ['ASC', 'DESC'];
      
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'tournamentStartDate';
      const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

      // Check if services are available
      if (!tournamentController.tournamentSystem || !tournamentController.prizePoolService) {
        throw new Error('Tournament services are not properly initialized');
      }

      const tournaments = await tournamentController.tournamentSystem.Tournament.findAndCountAll({
        where: filters,
        include: [
          {
            model: tournamentController.prizePoolService.PrizePool,
            attributes: ['totalPrizeAmount', 'sponsorContributions'],
            required: false
          }
        ],
        limit: limit,
        offset: (page - 1) * limit,
        order: [[sortField, sortDirection]],
        distinct: true
      });

      const totalPages = Math.ceil(tournaments.count / limit);

      res.json({
        success: true,
        tournaments: tournaments.rows,
        pagination: {
          page,
          limit,
          total: tournaments.count,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        filters: {
          status,
          skillLevel,
          tournamentType,
          search,
          sortBy: sortField,
          sortOrder: sortDirection
        }
      });

    } catch (error) {
      console.error('Get tournaments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tournaments',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get tournament by ID with detailed information
router.get('/:tournamentId',
  ensureController,
  validateUUID('tournamentId'),
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      const { tournamentId } = req.params;
      
      if (!tournamentController.tournamentSystem || !tournamentController.prizePoolService) {
        throw new Error('Tournament services are not properly initialized');
      }

      const tournament = await tournamentController.tournamentSystem.Tournament.findByPk(tournamentId, {
        include: [
          {
            model: tournamentController.prizePoolService.PrizePool,
            attributes: ['totalPrizeAmount', 'sponsorContributions', 'distributionStructure'],
            required: false,
            include: [
              {
                model: tournamentController.prizePoolService.SponsorCompany,
                attributes: ['companyName', 'logoUrl', 'tier'],
                through: { attributes: [] },
                required: false
              }
            ]
          },
          {
            model: tournamentController.tournamentSystem.TournamentParticipant,
            attributes: ['userId', 'registrationDate', 'seedRanking', 'isEliminated', 'finalPosition'],
            include: [{
              model: tournamentController.tournamentSystem.db.models.User,
              attributes: ['username', 'profilePicture', 'currentRank', 'country'],
              required: false
            }],
            required: false
          }
        ]
      });

      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found'
        });
      }

      // Add computed fields
      const tournamentData = tournament.toJSON();
      tournamentData.registrationRate = tournament.maxParticipants > 0 
        ? Math.round((tournament.currentParticipants / tournament.maxParticipants) * 100) 
        : 0;
      
      tournamentData.isRegistrationOpen = tournament.status === 'REGISTRATION_OPEN';
      tournamentData.canRegister = tournament.status === 'REGISTRATION_OPEN' && 
                                  tournament.currentParticipants < tournament.maxParticipants;

      res.json({
        success: true,
        tournament: tournamentData
      });

    } catch (error) {
      console.error('Get tournament error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tournament',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Register for tournament with enhanced validation
router.post('/:tournamentId/register',
  ensureController,
  authenticateSession,
  validateUUID('tournamentId'),
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      // Add request body validation
      const { paymentMethod, paymentDetails } = req.body;
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }

      // Enhance the request object with additional data
      req.tournamentId = req.params.tournamentId;
      req.userId = req.user.id;

      await tournamentController.registerForTournament(req, res);
    } catch (error) {
      console.error('Register for tournament route error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register for tournament',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Start tournament (Admin/Tournament Manager only)
router.post('/:tournamentId/start',
  ensureController,
  authenticateSession,
  requireRole(['ADMIN', 'TOURNAMENT_MANAGER']),
  validateUUID('tournamentId'),
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      await tournamentController.startTournament(req, res);
    } catch (error) {
      console.error('Start tournament route error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start tournament',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get live tournament data for spectators
router.get('/:tournamentId/live',
  ensureController,
  validateUUID('tournamentId'),
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      await tournamentController.getLiveTournamentData(req, res);
    } catch (error) {
      console.error('Get live tournament data route error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get live tournament data',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get tournament standings/leaderboard with caching
router.get('/:tournamentId/standings',
  ensureController,
  validateUUID('tournamentId'),
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      const { tournamentId } = req.params;
      
      if (!tournamentController.tournamentSystem) {
        throw new Error('Tournament system is not initialized');
      }

      const standings = await tournamentController.tournamentSystem.getTournamentStandings(tournamentId);
      
      if (!standings || !standings.success) {
        return res.status(400).json({
          success: false,
          message: standings?.error || 'Failed to get tournament standings'
        });
      }

      // Add response metadata
      res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds
      
      res.json({
        ...standings,
        generatedAt: new Date(),
        tournamentId
      });
    } catch (error) {
      console.error('Get standings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tournament standings',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * Sponsorship Management Routes
 */

// Add corporate sponsorship to tournament
router.post('/:tournamentId/sponsor',
  ensureController,
  authenticateSession,
  requireRole(['ADMIN', 'CORPORATE_SPONSOR']),
  validateUUID('tournamentId'),
  validateSponsorshipData,
  sponsorshipRateLimit,
  async (req, res) => {
    try {
      await tournamentController.addSponsorship(req, res);
    } catch (error) {
      console.error('Add sponsorship route error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add sponsorship',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get available sponsorship packages with filtering
router.get('/sponsorship/packages',
  ensureController,
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      const { tier, duration, maxPrice } = req.query;
      
      if (!tournamentController.sponsorService || !tournamentController.sponsorService.SponsorshipPackage) {
        return res.status(503).json({
          success: false,
          message: 'Sponsorship service is not available'
        });
      }

      const filters = { isActive: true };
      
      if (tier) {
        const validTiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
        if (validTiers.includes(tier.toUpperCase())) {
          filters.tier = tier.toUpperCase();
        }
      }
      
      if (duration) {
        const validDurations = ['SINGLE_EVENT', 'MONTHLY', 'QUARTERLY', 'ANNUAL'];
        if (validDurations.includes(duration.toUpperCase())) {
          filters.duration = duration.toUpperCase();
        }
      }
      
      if (maxPrice && !isNaN(maxPrice)) {
        filters.price = {
          [Op.lte]: parseFloat(maxPrice)
        };
      }

      const packages = await tournamentController.sponsorService.SponsorshipPackage.findAll({
        where: filters,
        order: [
          [tournamentController.sponsorService.db.Sequelize.literal(`CASE tier 
            WHEN 'BRONZE' THEN 1 
            WHEN 'SILVER' THEN 2 
            WHEN 'GOLD' THEN 3 
            WHEN 'PLATINUM' THEN 4 
            WHEN 'DIAMOND' THEN 5 
            END`), 'ASC'],
          ['price', 'ASC']
        ]
      });

      res.json({
        success: true,
        packages,
        totalPackages: packages.length,
        filters: { tier, duration, maxPrice }
      });
    } catch (error) {
      console.error('Get sponsorship packages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get sponsorship packages',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Purchase sponsorship package with enhanced validation
router.post('/sponsorship/purchase',
  ensureController,
  authenticateSession,
  requireRole(['CORPORATE_SPONSOR']),
  sponsorshipRateLimit,
  async (req, res) => {
    try {
      const {
        packageId,
        tournamentId,
        paymentDetails,
        customizations
      } = req.body;

      // Input validation
      if (!packageId) {
        return res.status(400).json({
          success: false,
          message: 'Package ID is required'
        });
      }

      if (!paymentDetails || !paymentDetails.method) {
        return res.status(400).json({
          success: false,
          message: 'Payment details and method are required'
        });
      }

      // UUID validation for packageId and tournamentId
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      
      if (!uuidRegex.test(packageId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid package ID format'
        });
      }

      if (tournamentId && !uuidRegex.test(tournamentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid tournament ID format'
        });
      }

      if (!tournamentController.sponsorService) {
        return res.status(503).json({
          success: false,
          message: 'Sponsorship service is not available'
        });
      }

      const result = await tournamentController.sponsorService.purchaseSponsorshipPackage(
        req.user.id,
        packageId,
        tournamentId,
        paymentDetails,
        customizations || {}
      );

      if (!result || !result.success) {
        return res.status(400).json({
          success: false,
          message: result?.error || 'Purchase failed',
          code: result?.code || 'PURCHASE_ERROR'
        });
      }

      res.status(201).json(result);
    } catch (error) {
      console.error('Purchase sponsorship error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to purchase sponsorship',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * Match Management Routes
 */

// Update match result with enhanced validation
router.post('/matches/:matchId/result',
  ensureController,
  authenticateSession,
  requireRole(['ADMIN', 'TOURNAMENT_MANAGER', 'JUDGE']),
  validateUUID('matchId'),
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      const { winnerId, player1Score, player2Score, matchStats } = req.body;
      
      // Input validation
      if (!winnerId) {
        return res.status(400).json({
          success: false,
          message: 'Winner ID is required'
        });
      }

      if (!req.params.matchId) {
        return res.status(400).json({
          success: false,
          message: 'Match ID is required'
        });
      }

      // Validate scores if provided
      if (player1Score !== undefined && (isNaN(player1Score) || player1Score < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Player 1 score must be a non-negative number'
        });
      }

      if (player2Score !== undefined && (isNaN(player2Score) || player2Score < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Player 2 score must be a non-negative number'
        });
      }

      await tournamentController.updateMatchResult(req, res);
    } catch (error) {
      console.error('Update match result route error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update match result',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get match details with enhanced information
router.get('/matches/:matchId',
  ensureController,
  validateUUID('matchId'),
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      const { matchId } = req.params;
      
      if (!tournamentController.tournamentSystem) {
        throw new Error('Tournament system is not initialized');
      }

      const match = await tournamentController.tournamentSystem.TournamentMatch.findByPk(matchId, {
        include: [
          {
            model: tournamentController.tournamentSystem.db.models.User,
            as: 'Player1',
            attributes: ['id', 'username', 'profilePicture', 'currentRank', 'country'],
            required: false
          },
          {
            model: tournamentController.tournamentSystem.db.models.User,
            as: 'Player2', 
            attributes: ['id', 'username', 'profilePicture', 'currentRank', 'country'],
            required: false
          },
          {
            model: tournamentController.tournamentSystem.Tournament,
            attributes: ['id', 'name', 'status', 'skillLevel', 'format'],
            required: false
          }
        ]
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Match not found'
        });
      }

      // Add computed fields
      const matchData = match.toJSON();
      matchData.duration = match.matchEndTime && match.matchStartTime 
        ? Math.round((new Date(match.matchEndTime) - new Date(match.matchStartTime)) / 1000 / 60) // minutes
        : null;
      
      matchData.isLive = match.status === 'IN_PROGRESS';
      matchData.hasWinner = !!match.winnerId;

      res.json({
        success: true,
        match: matchData
      });
    } catch (error) {
      console.error('Get match error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get match details',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get live matches with real-time data
router.get('/:tournamentId/matches/live',
  ensureController,
  validateUUID('tournamentId'),
  generalTournamentRateLimit,
  async (req, res) => {
    try {
      const { tournamentId } = req.params;
      
      if (!tournamentController.getLiveMatchData) {
        throw new Error('Live match data service is not available');
      }

      const liveMatches = await tournamentController.getLiveMatchData(tournamentId);
      
      // Add response headers for real-time data
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json({
        success: true,
        matches: liveMatches,
        timestamp: new Date(),
        tournamentId
      });
    } catch (error) {
      console.error('Get live matches error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get live matches',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * Analytics and Reporting Routes
 */

// Get tournament analytics with enhanced metrics
router.get('/:tournamentId/analytics',
  ensureController,
  authenticateSession,
  requireRole(['ADMIN', 'TOURNAMENT_MANAGER']),
  validateUUID('tournamentId'),
  analyticsRateLimit,
  async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const { timeframe = 'tournament', includeFinancial = 'true' } = req.query;

      if (!tournamentController.tournamentSystem) {
        throw new Error('Tournament system is not initialized');
      }

      // Get basic tournament metrics
      const tournament = await tournamentController.tournamentSystem.Tournament.findByPk(tournamentId);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found'
        });
      }

      // Get participant analytics
      const [participantCount, completedMatches, totalMatches] = await Promise.all([
        tournamentController.tournamentSystem.TournamentParticipant.count({
          where: { tournamentId }
        }),
        tournamentController.tournamentSystem.TournamentMatch.count({
          where: { 
            tournamentId,
            status: 'COMPLETED'
          }
        }),
        tournamentController.tournamentSystem.TournamentMatch.count({
          where: { tournamentId }
        })
      ]);

      const analytics = {
        tournament: {
          id: tournament.id,
          name: tournament.name,
          status: tournament.status,
          participantCount,
          maxParticipants: tournament.maxParticipants,
          completedMatches,
          totalMatches,
          registrationRate: tournament.maxParticipants > 0 
            ? Math.round((participantCount / tournament.maxParticipants) * 100) 
            : 0,
          completionRate: totalMatches > 0 
            ? Math.round((completedMatches / totalMatches) * 100) 
            : 0
        },
        performance: {
          averageMatchDuration: '45 minutes', // Mock data - would calculate from actual match times
          participantRetentionRate: 95, // Mock data
          spectatorEngagement: 78 // Mock data
        },
        generatedAt: new Date(),
        timeframe
      };

      // Get financial analytics if requested and service is available
      if (includeFinancial === 'true' && tournamentController.paymentService) {
        try {
          const financialData = await tournamentController.paymentService.getFinancialAnalytics(timeframe);
          analytics.financial = financialData;
        } catch (financialError) {
          console.warn('Financial analytics unavailable:', financialError.message);
          analytics.financial = { error: 'Financial data unavailable' };
        }
      }

      // Get sponsorship metrics if service is available
      if (tournamentController.sponsorService) {
        try {
          const sponsorshipMetrics = await tournamentController.sponsorService.getSponsorshipAnalytics?.(tournamentId);
          analytics.sponsorship = sponsorshipMetrics || { error: 'Sponsorship data unavailable' };
        } catch (sponsorshipError) {
          console.warn('Sponsorship analytics unavailable:', sponsorshipError.message);
          analytics.sponsorship = { error: 'Sponsorship data unavailable' };
        }
      }

      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      console.error('Get tournament analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tournament analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// Get platform-wide tournament statistics with enhanced metrics
router.get('/statistics/platform',
  ensureController,
  authenticateSession,
  requireRole(['ADMIN']),
  analyticsRateLimit,
  async (req, res) => {
    try {
      const { period = '30d' } = req.query;
      
      // Validate period parameter
      const validPeriods = ['7d', '30d', '90d', '1y'];
      if (!validPeriods.includes(period)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid period. Must be one of: ' + validPeriods.join(', ')
        });
      }
      
      // Calculate date range
      const periodDays = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      
      const startDate = new Date(Date.now() - periodDays[period] * 24 * 60 * 60 * 1000);

      if (!tournamentController.tournamentSystem) {
        throw new Error('Tournament system is not initialized');
      }

      // Get tournament statistics with parallel queries for better performance
      const [
        totalTournaments,
        activeTournaments,
        recentTournaments,
        totalParticipants,
        activeParticipants
      ] = await Promise.all([
        tournamentController.tournamentSystem.Tournament.count(),
        tournamentController.tournamentSystem.Tournament.count({
          where: { status: 'IN_PROGRESS' }
        }),
        tournamentController.tournamentSystem.Tournament.count({
          where: {
            createdAt: {
              [Op.gte]: startDate
            }
          }
        }),
        tournamentController.tournamentSystem.TournamentParticipant.count(),
        tournamentController.tournamentSystem.TournamentParticipant.count({
          where: { isEliminated: false }
        })
      ]);

      const statistics = {
        tournaments: {
          total: totalTournaments,
          active: activeTournaments,
          recent: recentTournaments,
          averageParticipants: totalTournaments > 0 
            ? Math.round(totalParticipants / totalTournaments) 
            : 0
        },
        participants: {
          total: totalParticipants,
          active: activeParticipants,
          averagePerTournament: totalTournaments > 0 
            ? Math.round(totalParticipants / totalTournaments) 
            : 0
        },
        period,
        dateRange: {
          start: startDate,
          end: new Date()
        },
        generatedAt: new Date()
      };

      // Get financial statistics if service is available
      if (tournamentController.paymentService) {
        try {
          const financialStats = await tournamentController.paymentService.getFinancialAnalytics(period);
          statistics.financial = financialStats;
        } catch (financialError) {
          console.warn('Financial statistics unavailable:', financialError.message);
          statistics.financial = { error: 'Financial data unavailable' };
        }
      }

      res.json({
        success: true,
        statistics
      });
    } catch (error) {
      console.error('Get platform statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get platform statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * Webhook Routes for External Integrations
 */

// Enhanced Stripe webhook with proper signature verification
router.post('/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      // Enhanced signature verification
      if (!sig || !endpointSecret) {
        console.warn('Stripe webhook: Missing signature or secret');
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }

      let event;
      try {
        event = JSON.parse(req.body);
      } catch (parseError) {
        console.error('Stripe webhook: Invalid JSON:', parseError);
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }

      // Log webhook event for debugging
      console.log('Stripe webhook event:', event.type, event.id);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment succeeded:', event.data.object.id);
          // TODO: Update tournament registration status
          break;
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object.id);
          // TODO: Handle failed payment, possibly cancel registration
          break;
        case 'payment_intent.canceled':
          console.log('Payment canceled:', event.data.object.id);
          // TODO: Handle canceled payment
          break;
        default:
          console.log('Unhandled Stripe event type:', event.type);
      }

      res.json({ received: true, eventType: event.type });
    } catch (error) {
      console.error('Stripe webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// Enhanced PayPal webhook with better event handling
router.post('/webhooks/paypal',
  express.json(),
  async (req, res) => {
    try {
      const event = req.body;
      
      if (!event.event_type) {
        return res.status(400).json({ error: 'Invalid PayPal webhook payload' });
      }

      // Log webhook event for debugging
      console.log('PayPal webhook event:', event.event_type, event.id);
      
      switch (event.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          console.log('PayPal payment completed:', event.resource?.id);
          // TODO: Update tournament registration status
          break;
        case 'PAYMENT.CAPTURE.DENIED':
          console.log('PayPal payment denied:', event.resource?.id);
          // TODO: Handle denied payment
          break;
        case 'PAYMENT.CAPTURE.PENDING':
          console.log('PayPal payment pending:', event.resource?.id);
          // TODO: Handle pending payment
          break;
        default:
          console.log('Unhandled PayPal event:', event.event_type);
      }

      res.json({ success: true, eventType: event.event_type });
    } catch (error) {
      console.error('PayPal webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

/**
 * Health Check Route
 */
router.get('/health',
  async (req, res) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date(),
        services: {
          tournamentController: !!tournamentController,
          tournamentSystem: !!(tournamentController?.tournamentSystem),
          prizePoolService: !!(tournamentController?.prizePoolService),
          paymentService: !!(tournamentController?.paymentService),
          sponsorService: !!(tournamentController?.sponsorService)
        }
      };

      // Check database connectivity if tournament system is available
      if (tournamentController?.tournamentSystem?.db) {
        try {
          await tournamentController.tournamentSystem.db.authenticate();
          health.database = 'connected';
        } catch (dbError) {
          health.database = 'disconnected';
          health.status = 'degraded';
        }
      }

      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date()
      });
    }
  }
);

/**
 * Enhanced Error Handling Middleware
 */
router.use((error, req, res, next) => {
  console.error('Tournament route error:', {
    url: req.url,
    method: req.method,
    error: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors?.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      })) || [{ message: error.message }]
    });
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
      error: error.message,
      fields: error.fields || []
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid reference to related resource',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Invalid reference'
    });
  }

  if (error.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error',
      error: 'Service temporarily unavailable'
    });
  }
  
  // Handle rate limiting errors
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests',
      retryAfter: error.retryAfter || 60
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    requestId: req.id || 'unknown'
  });
});

module.exports = router;