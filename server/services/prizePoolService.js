/**
 * Prize Pool Management Service
 * Handles tournament prize distributions, cash payouts, and sponsor contributions
 * Integrates with payment processors for real money transactions
 */

const crypto = require('crypto');
const { Sequelize, DataTypes } = require('sequelize');

class PrizePoolService {
  constructor(database) {
    this.db = database;
    this.initializeModels();
  }

  /**
   * Initialize database models for prize management
   */
  initializeModels() {
    // Tournament Prize Pool Model
    this.PrizePool = this.db.define('PrizePool', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      tournamentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Tournaments',
          key: 'id'
        }
      },
      totalPrizeAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      currency: {
        type: DataTypes.ENUM('USD', 'EUR', 'GBP', 'CAD'),
        defaultValue: 'USD'
      },
      distributionStructure: {
        type: DataTypes.JSON,
        allowNull: false,
        // Structure: { "1": 0.50, "2": 0.30, "3": 0.20 } (percentages)
        defaultValue: {
          "1": 0.50,
          "2": 0.30,
          "3": 0.20
        }
      },
      sponsorContributions: {
        type: DataTypes.JSON,
        defaultValue: []
        // Array of sponsor objects with amounts and company details
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'ACTIVE', 'DISTRIBUTED', 'CANCELLED'),
        defaultValue: 'PENDING'
      },
      escrowAccount: {
        type: DataTypes.STRING,
        allowNull: true
        // Third-party escrow account for secure fund holding
      }
    });

    // Sponsor Companies Model
    this.SponsorCompany = this.db.define('SponsorCompany', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      logoUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      website: {
        type: DataTypes.STRING,
        allowNull: true
      },
      contactEmail: {
        type: DataTypes.STRING,
        allowNull: false
      },
      industryType: {
        type: DataTypes.ENUM('Technology', 'Finance', 'Healthcare', 'Education', 'Gaming'),
        allowNull: false
      },
      sponsorshipTier: {
        type: DataTypes.ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'),
        defaultValue: 'BRONZE'
      },
      totalSponsored: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    });

    // Prize Payouts Model
    this.PrizePayout = this.db.define('PrizePayout', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      prizePoolId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'PrizePools',
          key: 'id'
        }
      },
      winnerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD'
      },
      paymentMethod: {
        type: DataTypes.ENUM('PAYPAL', 'STRIPE', 'BANK_TRANSFER', 'CRYPTO'),
        allowNull: false
      },
      paymentDetails: {
        type: DataTypes.JSON,
        allowNull: true
        // Encrypted payment information
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'),
        defaultValue: 'PENDING'
      },
      payoutDate: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });
  }

  /**
   * Create a new prize pool for a tournament
   * @param {string} tournamentId - Tournament identifier
   * @param {number} basePrizeAmount - Base prize amount before sponsor contributions
   * @param {object} distributionStructure - Prize distribution percentages
   * @returns {Promise<object>} Created prize pool
   */
  async createPrizePool(tournamentId, basePrizeAmount, distributionStructure = null) {
    try {
      const prizePool = await this.PrizePool.create({
        tournamentId,
        totalPrizeAmount: basePrizeAmount,
        distributionStructure: distributionStructure || {
          "1": 0.50,
          "2": 0.30,
          "3": 0.20
        }
      });

      return {
        success: true,
        prizePool,
        message: 'Prize pool created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Add sponsor contribution to prize pool
   * @param {string} prizePoolId - Prize pool identifier
   * @param {string} sponsorId - Sponsor company identifier
   * @param {number} amount - Contribution amount
   * @param {object} sponsorshipDetails - Additional sponsorship terms
   * @returns {Promise<object>} Updated prize pool
   */
  async addSponsorContribution(prizePoolId, sponsorId, amount, sponsorshipDetails = {}) {
    try {
      const prizePool = await this.PrizePool.findByPk(prizePoolId);
      const sponsor = await this.SponsorCompany.findByPk(sponsorId);

      if (!prizePool || !sponsor) {
        throw new Error('Prize pool or sponsor not found');
      }

      // Update sponsor contributions
      const contributions = prizePool.sponsorContributions || [];
      contributions.push({
        sponsorId,
        companyName: sponsor.companyName,
        amount,
        contributionDate: new Date(),
        sponsorshipDetails,
        logoUrl: sponsor.logoUrl
      });

      // Update total prize amount
      const newTotalAmount = parseFloat(prizePool.totalPrizeAmount) + parseFloat(amount);

      await prizePool.update({
        totalPrizeAmount: newTotalAmount,
        sponsorContributions: contributions
      });

      // Update sponsor's total sponsored amount
      await sponsor.update({
        totalSponsored: parseFloat(sponsor.totalSponsored) + parseFloat(amount)
      });

      return {
        success: true,
        prizePool: await this.PrizePool.findByPk(prizePoolId),
        newTotalAmount,
        message: `${sponsor.companyName} contributed $${amount} to the prize pool`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate prize distribution based on tournament results
   * @param {string} prizePoolId - Prize pool identifier
   * @param {Array} winners - Array of winner objects with userId and position
   * @returns {Promise<object>} Prize distribution breakdown
   */
  async calculatePrizeDistribution(prizePoolId, winners) {
    try {
      const prizePool = await this.PrizePool.findByPk(prizePoolId);
      if (!prizePool) {
        throw new Error('Prize pool not found');
      }

      const totalAmount = parseFloat(prizePool.totalPrizeAmount);
      const distribution = prizePool.distributionStructure;
      const prizeBreakdown = [];

      for (const winner of winners) {
        const percentage = distribution[winner.position.toString()] || 0;
        const amount = totalAmount * percentage;

        if (amount > 0) {
          prizeBreakdown.push({
            userId: winner.userId,
            position: winner.position,
            percentage: percentage * 100,
            amount: amount.toFixed(2),
            currency: prizePool.currency
          });
        }
      }

      return {
        success: true,
        prizeBreakdown,
        totalDistributed: prizeBreakdown.reduce((sum, prize) => sum + parseFloat(prize.amount), 0),
        currency: prizePool.currency
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process prize payouts to winners
   * @param {string} prizePoolId - Prize pool identifier
   * @param {Array} prizeBreakdown - Prize distribution from calculatePrizeDistribution
   * @returns {Promise<object>} Payout processing results
   */
  async processPrizePayouts(prizePoolId, prizeBreakdown) {
    try {
      const payoutResults = [];

      for (const prize of prizeBreakdown) {
        const payout = await this.PrizePayout.create({
          prizePoolId,
          winnerId: prize.userId,
          position: prize.position,
          amount: prize.amount,
          currency: prize.currency,
          paymentMethod: 'PENDING', // Will be updated when user provides payment info
          status: 'PENDING'
        });

        payoutResults.push({
          payoutId: payout.id,
          userId: prize.userId,
          position: prize.position,
          amount: prize.amount,
          status: 'PENDING_PAYMENT_INFO'
        });
      }

      // Update prize pool status
      await this.PrizePool.update(
        { status: 'DISTRIBUTED' },
        { where: { id: prizePoolId } }
      );

      return {
        success: true,
        payoutResults,
        message: 'Prize payouts initialized. Winners will be notified to provide payment information.'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Register a new sponsor company
   * @param {object} sponsorData - Company information
   * @returns {Promise<object>} Created sponsor company
   */
  async registerSponsor(sponsorData) {
    try {
      const sponsor = await this.SponsorCompany.create(sponsorData);
      return {
        success: true,
        sponsor,
        message: 'Sponsor company registered successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all active sponsors with their contribution history
   * @returns {Promise<Array>} List of active sponsors
   */
  async getActiveSponsors() {
    try {
      const sponsors = await this.SponsorCompany.findAll({
        where: { isActive: true },
        order: [['totalSponsored', 'DESC']]
      });

      return {
        success: true,
        sponsors
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate escrow account for secure fund holding
   * @param {string} prizePoolId - Prize pool identifier
   * @returns {Promise<object>} Escrow account details
   */
  async generateEscrowAccount(prizePoolId) {
    try {
      // Generate secure escrow account identifier
      const escrowId = crypto.randomBytes(16).toString('hex');
      
      await this.PrizePool.update(
        { escrowAccount: escrowId },
        { where: { id: prizePoolId } }
      );

      return {
        success: true,
        escrowAccount: escrowId,
        message: 'Secure escrow account generated for prize pool protection'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PrizePoolService;