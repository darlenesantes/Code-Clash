/**
 * Tournament Management Controller
 * File: server/controllers/tournamentController.js
 * Handles all tournament-related API endpoints for elite competitions
 */

const TournamentSystem = require('../services/tournamentSystem');
const PrizePoolService = require('../services/prizePoolService');
const PaymentProcessingService = require('../services/paymentProcessingService');

class TournamentController {
  constructor() {
    this.tournamentSystem = new TournamentSystem();
    this.prizePoolService = new PrizePoolService();
    this.paymentService = new PaymentProcessingService();
  }

  /**
   * Create new elite tournament
   * POST /api/tournaments/create-elite
   */
  async createEliteTournament(req, res) {
    try {
      const {
        name,
        description,
        format,
        skillLevel,
        maxParticipants,
        entryFee,
        basePrizeAmount,
        registrationStartDate,
        registrationEndDate,
        tournamentStartDate,
        sponsorshipTiers
      } = req.body;

      // Create tournament with prize pool
      const tournamentResult = await this.tournamentSystem.createTournament({
        name,
        description,
        format: format || 'SINGLE_ELIMINATION',
        tournamentType: 'SPECIAL_EVENT',
        skillLevel: skillLevel || 'PROFESSIONAL',
        maxParticipants: maxParticipants || 512,
        entryFee: entryFee || 0,
        registrationStartDate: new Date(registrationStartDate),
        registrationEndDate: new Date(registrationEndDate),
        tournamentStartDate: new Date(tournamentStartDate),
        status: 'UPCOMING'
      }, {
        basePrizeAmount: basePrizeAmount || 50000,
        distributionStructure: {
          "1": 0.40,  // 40% to winner
          "2": 0.25,  // 25% to runner-up
          "3": 0.15,  // 15% to third
          "4": 0.10,  // 10% to fourth
          "5-8": 0.025 // 2.5% each to 5th-8th
        }
      });

      if (!tournamentResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to create tournament',
          error: tournamentResult.error
        });
      }

      // Create escrow for prize security
      const escrowResult = await this.paymentService.createPrizeEscrow(
        tournamentResult.tournament.id,
        basePrizeAmount
      );

      res.status(201).json({
        success: true,
        tournament: tournamentResult.tournament,
        prizePool: tournamentResult.prizePool,
        escrow: escrowResult.escrow,
        message: 'Elite tournament created successfully'
      });

    } catch (error) {
      console.error('Create elite tournament error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * Register for elite tournament with entry fee
   * POST /api/tournaments/:tournamentId/register
   */
  async registerForTournament(req, res) {
    try {
      const { tournamentId } = req.params;
      const { user } = req;
      const { paymentMethod, paymentDetails } = req.body;

      // Get tournament details
      const tournament = await this.tournamentSystem.Tournament.findByPk(tournamentId);
      if (!tournament) {
        return res.status(404).json({
          success: false,
          message: 'Tournament not found'
        });
      }

      // Process entry fee if required
      let paymentResult = null;
      if (tournament.entryFee > 0) {
        paymentResult = await this.paymentService.processEntryFee(
          user.id,
          tournamentId,
          tournament.entryFee,
          paymentMethod
        );

        if (!paymentResult.success) {
          return res.status(400).json({
            success: false,
            message: 'Payment processing failed',
            error: paymentResult.error
          });
        }
      }

      // Register participant
      const registrationResult = await this.tournamentSystem.registerParticipant(
        tournamentId,
        user.id
      );

      if (!registrationResult.success) {
        // Refund entry fee if registration fails
        if (paymentResult) {
          await this.paymentService.processRefund(paymentResult.transaction.id);
        }

        return res.status(400).json({
          success: false,
          message: 'Registration failed',
          error: registrationResult.error
        });
      }

      res.json({
        success: true,
        participant: registrationResult.participant,
        payment: paymentResult?.transaction,
        currentParticipants: registrationResult.currentParticipants,
        message: 'Successfully registered for elite tournament'
      });

    } catch (error) {
      console.error('Tournament registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  /**
   * Add corporate sponsorship to tournament
   * POST /api/tournaments/:tournamentId/sponsor
   */
  async addSponsorship(req, res) {
    try {
      const { tournamentId } = req.params;
      const {
        sponsorId,
        amount,
        tier,
        paymentMethod,
        companyName,
        logoUrl,
        benefits
      } = req.body;

      // Process sponsorship payment
      const paymentResult = await this.paymentService.processSponsorshipPayment(
        sponsorId,
        tournamentId,
        amount,
        {
          method: paymentMethod,
          tier: tier,
          companyName: companyName
        }
      );

      if (!paymentResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Sponsorship payment failed',
          error: paymentResult.error
        });
      }

      // Get or create prize pool
      let prizePool = await this.prizePoolService.PrizePool.findOne({
        where: { tournamentId }
      });

      if (!prizePool) {
        const createResult = await this.prizePoolService.createPrizePool(tournamentId, 0);
        prizePool = createResult.prizePool;
      }

      // Add sponsor contribution
      const sponsorshipResult = await this.prizePoolService.addSponsorContribution(
        prizePool.id,
        sponsorId,
        amount,
        {
          tier: tier,
          companyName: companyName,
          logoUrl: logoUrl,
          benefits: benefits,
          paymentId: paymentResult.paymentId
        }
      );

      res.json({
        success: true,
        sponsorship: sponsorshipResult,
        payment: paymentResult.transaction,
        newPrizePool: sponsorshipResult.newTotalAmount,
        message: `${companyName} successfully sponsored tournament with $${amount}`
      });

    } catch (error) {
      console.error('Add sponsorship error:', error);
      res.status(500).json({
        success: false,
        message: 'Sponsorship processing failed',
        error: error.message
      });
    }
  }

  /**
   * Start tournament and generate bracket
   * POST /api/tournaments/:tournamentId/start
   */
  async startTournament(req, res) {
    try {
      const { tournamentId } = req.params;

      // Generate tournament bracket
      const bracketResult = await this.tournamentSystem.generateBracket(tournamentId);

      if (!bracketResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to generate tournament bracket',
          error: bracketResult.error
        });
      }

      res.json({
        success: true,
        bracket: bracketResult.bracket,
        matches: bracketResult.matches,
        message: 'Tournament started successfully'
      });

    } catch (error) {
      console.error('Start tournament error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start tournament',
        error: error.message
      });
    }
  }

  /**
   * Update match result and advance bracket
   * POST /api/tournaments/matches/:matchId/result
   */
  async updateMatchResult(req, res) {
    try {
      const { matchId } = req.params;
      const {
        winnerId,
        player1Score,
        player2Score,
        completionTime,
        accuracy,
        problemsSolved
      } = req.body;

      const matchStats = {
        player1Score,
        player2Score,
        completionTime,
        accuracy,
        problemsSolved
      };

      // Update match result and advance bracket
      const updateResult = await this.tournamentSystem.updateMatchResult(
        matchId,
        winnerId,
        matchStats
      );

      if (!updateResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to update match result',
          error: updateResult.error
        });
      }

      // Check if tournament is complete
      const tournamentComplete = await this.checkTournamentCompletion(
        updateResult.match.tournamentId
      );

      if (tournamentComplete.isComplete) {
        await this.processTournamentCompletion(
          updateResult.match.tournamentId,
          tournamentComplete.winners
        );
      }

      res.json({
        success: true,
        match: updateResult.match,
        advancement: updateResult.advancement,
        tournamentComplete: tournamentComplete.isComplete,
        message: 'Match result updated successfully'
      });

    } catch (error) {
      console.error('Update match result error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update match result',
        error: error.message
      });
    }
  }

  /**
   * Get live tournament data for spectators
   * GET /api/tournaments/:tournamentId/live
   */
  async getLiveTournamentData(req, res) {
    try {
      const { tournamentId } = req.params;

      // Get tournament with all related data
      const tournament = await this.tournamentSystem.Tournament.findByPk(tournamentId, {
        include: [
          {
            model: this.tournamentSystem.TournamentParticipant,
            include: [{
              model: this.tournamentSystem.db.models.User,
              attributes: ['username', 'profilePicture', 'currentRank', 'country']
            }]
          },
          {
            model: this.tournamentSystem.TournamentMatch,
            where: { status: 'IN_PROGRESS' },
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

      // Get prize pool information
      const prizePool = await this.prizePoolService.PrizePool.findOne({
        where: { tournamentId }
      });

      // Get live match data with real-time progress
      const liveMatches = await this.getLiveMatchData(tournamentId);

      // Get current standings
      const standings = await this.tournamentSystem.getTournamentStandings(tournamentId);

      res.json({
        success: true,
        tournament: {
          ...tournament.toJSON(),
          prizePool: prizePool?.toJSON(),
          liveMatches: liveMatches,
          standings: standings.standings,
          viewerCount: Math.floor(Math.random() * 5000) + 1000 // Mock viewer count
        }
      });

    } catch (error) {
      console.error('Get live tournament data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tournament data',
        error: error.message
      });
    }
  }

  /**
   * Process tournament completion and prize distribution
   * @param {string} tournamentId - Tournament identifier
   * @param {Array} winners - Tournament winners with positions
   */
  async processTournamentCompletion(tournamentId, winners) {
    try {
      // Get prize pool
      const prizePool = await this.prizePoolService.PrizePool.findOne({
        where: { tournamentId }
      });

      if (!prizePool) {
        throw new Error('Prize pool not found for tournament');
      }

      // Calculate prize distribution
      const distributionResult = await this.prizePoolService.calculatePrizeDistribution(
        prizePool.id,
        winners
      );

      if (!distributionResult.success) {
        throw new Error('Failed to calculate prize distribution');
      }

      // Process prize payouts
      const payoutResult = await this.prizePoolService.processPrizePayouts(
        prizePool.id,
        distributionResult.prizeBreakdown
      );

      if (!payoutResult.success) {
        throw new Error('Failed to process prize payouts');
      }

      // Update tournament status
      await this.tournamentSystem.Tournament.update(
        { 
          status: 'COMPLETED',
          tournamentEndDate: new Date()
        },
        { where: { id: tournamentId } }
      );

      // Send notifications to winners
      await this.sendWinnerNotifications(winners, distributionResult.prizeBreakdown);

      console.log(`Tournament ${tournamentId} completed successfully with ${distributionResult.prizeBreakdown.length} prize payouts`);

    } catch (error) {
      console.error('Process tournament completion error:', error);
      throw error;
    }
  }

  /**
   * Check if tournament is complete
   * @param {string} tournamentId - Tournament identifier
   * @returns {Promise<object>} Completion status and winners
   */
  async checkTournamentCompletion(tournamentId) {
    try {
      const tournament = await this.tournamentSystem.Tournament.findByPk(tournamentId);
      
      // Check if we have a final match winner
      const finalMatches = await this.tournamentSystem.TournamentMatch.findAll({
        where: {
          tournamentId,
          status: 'COMPLETED'
        },
        order: [['roundNumber', 'DESC']],
        limit: 1
      });

      if (finalMatches.length === 0) {
        return { isComplete: false };
      }

      const finalMatch = finalMatches[0];
      
      // Determine if this was the final round
      const totalRounds = Math.ceil(Math.log2(tournament.maxParticipants));
      const isComplete = finalMatch.roundNumber >= totalRounds;

      if (isComplete) {
        // Get all winners with their final positions
        const winners = await this.getFinalStandings(tournamentId);
        return { isComplete: true, winners };
      }

      return { isComplete: false };

    } catch (error) {
      console.error('Check tournament completion error:', error);
      return { isComplete: false };
    }
  }

  /**
   * Get final tournament standings
   * @param {string} tournamentId - Tournament identifier
   * @returns {Promise<Array>} Final standings with positions
   */
  async getFinalStandings(tournamentId) {
    try {
      const participants = await this.tournamentSystem.TournamentParticipant.findAll({
        where: { tornamentId },
        include: [{
          model: this.tournamentSystem.db.models.User,
          attributes: ['id', 'username', 'profilePicture', 'email']
        }],
        order: [
          ['isEliminated', 'ASC'],
          ['finalPosition', 'ASC'],
          ['totalScore', 'DESC']
        ]
      });

      return participants.map((participant, index) => ({
        userId: participant.userId,
        position: participant.finalPosition || (index + 1),
        username: participant.User.username,
        totalScore: participant.totalScore,
        isEliminated: participant.isEliminated
      }));

    } catch (error) {
      console.error('Get final standings error:', error);
      return [];
    }
  }

  /**
   * Get live match data with real-time progress
   * @param {string} tournamentId - Tournament identifier
   * @returns {Promise<Array>} Live match data
   */
  async getLiveMatchData(tournamentId) {
    try {
      const liveMatches = await this.tournamentSystem.TournamentMatch.findAll({
        where: {
          tournamentId,
          status: 'IN_PROGRESS'
        },
        include: [
          {
            model: this.tournamentSystem.db.models.User,
            as: 'Player1',
            attributes: ['username', 'profilePicture', 'currentRank', 'country']
          },
          {
            model: this.tournamentSystem.db.models.User,
            as: 'Player2',
            attributes: ['username', 'profilePicture', 'currentRank', 'country']
          }
        ]
      });

      // Add real-time progress data (would come from websockets in production)
      return liveMatches.map(match => ({
        ...match.toJSON(),
        player1Progress: Math.floor(Math.random() * 100),
        player2Progress: Math.floor(Math.random() * 100),
        spectatorCount: Math.floor(Math.random() * 500) + 50,
        timeRemaining: this.calculateTimeRemaining(match.matchStartTime)
      }));

    } catch (error) {
      console.error('Get live match data error:', error);
      return [];
    }
  }

  /**
   * Calculate time remaining in match
   * @param {Date} startTime - Match start time
   * @returns {string} Time remaining formatted
   */
  calculateTimeRemaining(startTime) {
    const now = new Date();
    const elapsed = now - new Date(startTime);
    const matchDuration = 60 * 60 * 1000; // 1 hour in milliseconds
    const remaining = Math.max(0, matchDuration - elapsed);
    
    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Send notifications to tournament winners
   * @param {Array} winners - Tournament winners
   * @param {Array} prizeBreakdown - Prize distribution details
   */
  async sendWinnerNotifications(winners, prizeBreakdown) {
    try {
      // This would integrate with email/notification service
      for (const winner of winners) {
        const prize = prizeBreakdown.find(p => p.userId === winner.userId);
        if (prize) {
          console.log(`Notification sent to ${winner.username}: Congratulations! You won $${prize.amount} for position ${prize.position}`);
          // await notificationService.sendWinnerNotification(winner, prize);
        }
      }
    } catch (error) {
      console.error('Send winner notifications error:', error);
    }
  }
}

module.exports = TournamentController;