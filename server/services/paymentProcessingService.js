/**
 * Fixed Payment Processing Service
 * File: server/services/paymentProcessingService.js
 * Handles secure financial transactions with proper error handling and validation
 */

const crypto = require('crypto');
const { Sequelize, DataTypes, Op } = require('sequelize');

class PaymentProcessingService {
  constructor(database) {
    this.db = database;
    this.initializeModels();
    
    // Payment processor configurations
    this.paymentProcessors = {
      stripe: {
        apiKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        enabled: !!process.env.STRIPE_SECRET_KEY
      },
      paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        enabled: !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
      },
      crypto: {
        bitcoinAddress: process.env.BITCOIN_WALLET_ADDRESS,
        ethereumAddress: process.env.ETHEREUM_WALLET_ADDRESS,
        enabled: false // Enable when crypto payments are needed
      }
    };
  }

  /**
   * Initialize payment-related database models
   */
  initializeModels() {
    // Payment Accounts Model - Store user payment information securely
    this.PaymentAccount = this.db.define('PaymentAccount', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      paymentMethod: {
        type: DataTypes.ENUM('PAYPAL', 'STRIPE', 'BANK_TRANSFER', 'CRYPTO_BITCOIN', 'CRYPTO_ETHEREUM'),
        allowNull: false
      },
      accountIdentifier: {
        type: DataTypes.STRING, // Email for PayPal, encrypted bank details, etc.
        allowNull: false
      },
      encryptedDetails: {
        type: DataTypes.TEXT, // Encrypted additional payment details
        allowNull: true
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      verificationDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lastUsed: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });

    // Financial Transactions Model - Track all money movement
    this.FinancialTransaction = this.db.define('FinancialTransaction', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      transactionType: {
        type: DataTypes.ENUM('ENTRY_FEE', 'PRIZE_PAYOUT', 'SPONSORSHIP_PAYMENT', 'REFUND', 'PLATFORM_FEE'),
        allowNull: false
      },
      fromUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      toUserId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
          isDecimal: true
        }
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD',
        validate: {
          isIn: [['USD', 'EUR', 'GBP', 'CAD', 'AUD']]
        }
      },
      platformFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
          min: 0.00,
          isDecimal: true
        }
      },
      netAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.00,
          isDecimal: true
        }
      },
      paymentProcessor: {
        type: DataTypes.ENUM('STRIPE', 'PAYPAL', 'BANK_TRANSFER', 'CRYPTO', 'INTERNAL'),
        allowNull: false
      },
      externalTransactionId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'),
        defaultValue: 'PENDING'
      },
      failureReason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        validate: {
          isValidJSON(value) {
            try {
              if (typeof value === 'string') {
                JSON.parse(value);
              } else if (typeof value === 'object') {
                JSON.stringify(value);
              }
            } catch (error) {
              throw new Error('Invalid JSON format in metadata');
            }
          }
        }
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      escrowReleaseDate: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      indexes: [
        {
          fields: ['transactionType', 'status']
        },
        {
          fields: ['fromUserId']
        },
        {
          fields: ['toUserId']
        },
        {
          fields: ['externalTransactionId']
        },
        {
          fields: ['createdAt']
        }
      ],
      hooks: {
        beforeValidate: (transaction) => {
          // Ensure netAmount is calculated correctly
          if (transaction.amount && transaction.platformFee) {
            const calculatedNet = parseFloat(transaction.amount) - parseFloat(transaction.platformFee);
            if (Math.abs(calculatedNet - parseFloat(transaction.netAmount)) > 0.01) {
              throw new Error('Net amount calculation mismatch');
            }
          }
        }
      }
    });

    // Prize Escrow Model - Secure holding of tournament prizes
    this.PrizeEscrow = this.db.define('PrizeEscrow', {
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
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.00,
          isDecimal: true
        }
      },
      lockedAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
          min: 0.00,
          isDecimal: true
        }
      },
      releasedAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00,
        validate: {
          min: 0.00,
          isDecimal: true
        }
      },
      escrowAccountId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'LOCKED', 'RELEASING', 'COMPLETED', 'DISPUTED'),
        defaultValue: 'PENDING'
      },
      lockDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      releaseDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      disputeDetails: {
        type: DataTypes.JSON,
        allowNull: true
      }
    }, {
      indexes: [
        {
          fields: ['tournamentId'],
          unique: true
        },
        {
          fields: ['status']
        },
        {
          fields: ['escrowAccountId'],
          unique: true
        }
      ],
      hooks: {
        beforeValidate: (escrow) => {
          // Validate amount calculations
          const total = parseFloat(escrow.totalAmount) || 0;
          const locked = parseFloat(escrow.lockedAmount) || 0;
          const released = parseFloat(escrow.releasedAmount) || 0;
          
          if (locked + released > total + 0.01) { // Allow small floating point differences
            throw new Error('Locked and released amounts cannot exceed total amount');
          }
          
          if (locked < 0 || released < 0 || total < 0) {
            throw new Error('Amounts cannot be negative');
          }
        }
      }
    });
  }

  /**
   * Process tournament entry fee payment with enhanced validation
   * @param {string} userId - User paying the fee
   * @param {string} tournamentId - Tournament being entered
   * @param {number} amount - Entry fee amount
   * @param {string} paymentMethod - Payment method to use
   * @returns {Promise<object>} Payment processing result
   */
  async processEntryFee(userId, tournamentId, amount, paymentMethod) {
    const transaction = await this.db.transaction();
    
    try {
      // Input validation
      if (!userId || !tournamentId || !amount || !paymentMethod) {
        throw new Error('Missing required parameters for entry fee processing');
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Invalid entry fee amount');
      }

      if (numericAmount > 10000) { // Max entry fee limit
        throw new Error('Entry fee exceeds maximum allowed amount');
      }

      // Check if payment method is supported
      const supportedMethods = ['STRIPE', 'PAYPAL', 'BANK_TRANSFER'];
      if (!supportedMethods.includes(paymentMethod.toUpperCase())) {
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }

      // Calculate platform fee (5% of entry fee, min $0.50, max $50)
      const platformFeeRate = 0.05;
      let platformFee = numericAmount * platformFeeRate;
      platformFee = Math.max(0.50, Math.min(50.00, platformFee)); // Apply min/max limits
      platformFee = Math.round(platformFee * 100) / 100; // Round to 2 decimal places
      
      const netAmount = Math.round((numericAmount - platformFee) * 100) / 100;

      // Create financial transaction record
      const financialTransaction = await this.FinancialTransaction.create({
        transactionType: 'ENTRY_FEE',
        fromUserId: userId,
        toUserId: null, // Platform receives entry fees
        amount: numericAmount,
        platformFee: platformFee,
        netAmount: netAmount,
        paymentProcessor: paymentMethod.toUpperCase(),
        metadata: {
          tournamentId: tournamentId,
          description: 'Tournament entry fee payment',
          processingAttempts: 1,
          clientInfo: {
            userAgent: 'CodeClash-Platform',
            timestamp: new Date().toISOString()
          }
        }
      }, { transaction });

      // Process payment based on method
      let paymentResult;
      switch (paymentMethod.toUpperCase()) {
        case 'STRIPE':
          paymentResult = await this.processStripePayment(financialTransaction, numericAmount);
          break;
        case 'PAYPAL':
          paymentResult = await this.processPayPalPayment(financialTransaction, numericAmount);
          break;
        case 'BANK_TRANSFER':
          paymentResult = await this.processBankTransfer(financialTransaction, numericAmount, { method: 'BANK_TRANSFER' });
          break;
        default:
          throw new Error('Payment method not implemented');
      }

      if (paymentResult.success) {
        await financialTransaction.update({
          status: 'COMPLETED',
          externalTransactionId: paymentResult.transactionId,
          processedAt: new Date()
        }, { transaction });

        await transaction.commit();

        return {
          success: true,
          transaction: financialTransaction,
          paymentId: paymentResult.transactionId,
          netAmount: netAmount,
          platformFee: platformFee,
          message: 'Entry fee payment processed successfully'
        };
      } else {
        await financialTransaction.update({
          status: 'FAILED',
          failureReason: paymentResult.error || 'Payment processing failed'
        }, { transaction });

        await transaction.commit();

        return {
          success: false,
          error: paymentResult.error || 'Payment processing failed',
          transactionId: financialTransaction.id
        };
      }
    } catch (error) {
      await transaction.rollback();
      
      return {
        success: false,
        error: error.message,
        code: 'ENTRY_FEE_PROCESSING_ERROR'
      };
    }
  }

  /**
   * Process prize payout to tournament winner with enhanced security
   * @param {string} winnerId - Winner receiving the prize
   * @param {string} tournamentId - Tournament that ended  
   * @param {number} amount - Prize amount
   * @param {object} payoutDetails - Payout method and details
   * @returns {Promise<object>} Payout processing result
   */
  async processPrizePayout(winnerId, tournamentId, amount, payoutDetails) {
    const dbTransaction = await this.db.transaction();
    
    try {
      // Input validation
      if (!winnerId || !tournamentId || !amount || !payoutDetails) {
        throw new Error('Missing required parameters for prize payout');
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Invalid prize amount');
      }

      if (!payoutDetails.method || !payoutDetails.position) {
        throw new Error('Missing payout method or position information');
      }

      // Verify escrow has sufficient funds
      const escrow = await this.PrizeEscrow.findOne({
        where: { tournamentId },
        transaction: dbTransaction,
        lock: true // Lock for update to prevent race conditions
      });

      if (!escrow) {
        throw new Error('Prize escrow not found for tournament');
      }

      if (escrow.status !== 'LOCKED') {
        throw new Error(`Escrow is not in locked state. Current status: ${escrow.status}`);
      }

      const availableAmount = parseFloat(escrow.lockedAmount);
      if (availableAmount < numericAmount) {
        throw new Error(`Insufficient escrow funds. Available: $${availableAmount}, Required: $${numericAmount}`);
      }

      // Get winner's verified payment account
      const paymentAccount = await this.PaymentAccount.findOne({
        where: { 
          userId: winnerId, 
          paymentMethod: payoutDetails.method.toUpperCase(),
          isVerified: true
        },
        transaction: dbTransaction
      });

      if (!paymentAccount) {
        throw new Error(`Winner does not have a verified ${payoutDetails.method} payment account`);
      }

      // Calculate platform fee for payout processing (2% for payouts, max $100)
      const platformFeeRate = 0.02;
      let platformFee = numericAmount * platformFeeRate;
      platformFee = Math.min(100.00, platformFee); // Cap at $100
      platformFee = Math.round(platformFee * 100) / 100;
      
      const netAmount = Math.round((numericAmount - platformFee) * 100) / 100;

      // Create payout transaction
      const payoutTransaction = await this.FinancialTransaction.create({
        transactionType: 'PRIZE_PAYOUT',
        fromUserId: null, // Platform pays out
        toUserId: winnerId,
        amount: numericAmount,
        platformFee: platformFee,
        netAmount: netAmount,
        paymentProcessor: payoutDetails.method.toUpperCase(),
        metadata: {
          tournamentId: tournamentId,
          position: payoutDetails.position,
          escrowId: escrow.id,
          paymentAccountId: paymentAccount.id,
          description: `Prize payout for position ${payoutDetails.position}`,
          processingAttempts: 1
        }
      }, { transaction: dbTransaction });

      // Process payout based on method
      let payoutResult;
      switch (payoutDetails.method.toUpperCase()) {
        case 'PAYPAL':
          payoutResult = await this.processPayPalPayout(payoutTransaction, netAmount, paymentAccount);
          break;
        case 'STRIPE':
          payoutResult = await this.processStripePayout(payoutTransaction, netAmount, paymentAccount);
          break;
        case 'BANK_TRANSFER':
          payoutResult = await this.processBankTransfer(payoutTransaction, netAmount, paymentAccount);
          break;
        default:
          throw new Error(`Unsupported payout method: ${payoutDetails.method}`);
      }

      if (payoutResult.success) {
        // Update transaction status
        await payoutTransaction.update({
          status: 'COMPLETED',
          externalTransactionId: payoutResult.transactionId,
          processedAt: new Date()
        }, { transaction: dbTransaction });

        // Update escrow amounts with proper decimal handling
        const newLockedAmount = Math.round((availableAmount - numericAmount) * 100) / 100;
        const newReleasedAmount = Math.round((parseFloat(escrow.releasedAmount) + numericAmount) * 100) / 100;

        await escrow.update({
          lockedAmount: newLockedAmount,
          releasedAmount: newReleasedAmount
        }, { transaction: dbTransaction });

        // Update payment account last used
        await paymentAccount.update({
          lastUsed: new Date()
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        return {
          success: true,
          transaction: payoutTransaction,
          payoutId: payoutResult.transactionId,
          netAmount: netAmount,
          platformFee: platformFee,
          message: 'Prize payout processed successfully'
        };
      } else {
        await payoutTransaction.update({
          status: 'FAILED',
          failureReason: payoutResult.error || 'Payout processing failed'
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        return {
          success: false,
          error: payoutResult.error || 'Payout processing failed',
          transactionId: payoutTransaction.id
        };
      }
    } catch (error) {
      await dbTransaction.rollback();
      
      return {
        success: false,
        error: error.message,
        code: 'PRIZE_PAYOUT_ERROR'
      };
    }
  }

  /**
   * Create and lock escrow for tournament prizes with validation
   * @param {string} tournamentId - Tournament identifier
   * @param {number} totalAmount - Total prize pool amount
   * @returns {Promise<object>} Escrow creation result
   */
  async createPrizeEscrow(tournamentId, totalAmount) {
    const transaction = await this.db.transaction();
    
    try {
      // Input validation
      if (!tournamentId || !totalAmount) {
        throw new Error('Missing required parameters for escrow creation');
      }

      const numericAmount = parseFloat(totalAmount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        throw new Error('Invalid total amount for escrow');
      }

      // Check if escrow already exists for this tournament
      const existingEscrow = await this.PrizeEscrow.findOne({
        where: { tournamentId },
        transaction
      });

      if (existingEscrow) {
        throw new Error('Prize escrow already exists for this tournament');
      }

      // Generate secure escrow account identifier
      const escrowAccountId = `escrow_${tournamentId}_${crypto.randomBytes(8).toString('hex')}`;

      const escrow = await this.PrizeEscrow.create({
        tournamentId,
        totalAmount: numericAmount,
        lockedAmount: numericAmount,
        releasedAmount: 0.00,
        escrowAccountId,
        status: 'LOCKED',
        lockDate: new Date(),
        releaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        escrow,
        escrowAccountId,
        message: 'Prize escrow created and locked successfully'
      };
    } catch (error) {
      await transaction.rollback();
      
      return {
        success: false,
        error: error.message,
        code: 'ESCROW_CREATION_ERROR'
      };
    }
  }

  /**
   * Add funds to existing escrow with proper validation
   * @param {string} tournamentId - Tournament identifier
   * @param {number} amount - Amount to add
   * @returns {Promise<object>} Addition result
   */
  async addToEscrow(tournamentId, amount) {
    const transaction = await this.db.transaction();
    
    try {
      if (!tournamentId || !amount) {
        throw new Error('Missing required parameters for escrow funding');
      }

      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Invalid amount to add to escrow');
      }

      const escrow = await this.PrizeEscrow.findOne({
        where: { tournamentId },
        transaction,
        lock: true
      });

      if (!escrow) {
        // Create new escrow if none exists
        await transaction.rollback();
        return await this.createPrizeEscrow(tournamentId, numericAmount);
      }

      const newTotalAmount = Math.round((parseFloat(escrow.totalAmount) + numericAmount) * 100) / 100;
      const newLockedAmount = Math.round((parseFloat(escrow.lockedAmount) + numericAmount) * 100) / 100;

      await escrow.update({
        totalAmount: newTotalAmount,
        lockedAmount: newLockedAmount
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        escrow,
        newTotal: newTotalAmount,
        addedAmount: numericAmount,
        message: 'Funds added to escrow successfully'
      };
    } catch (error) {
      await transaction.rollback();
      
      return {
        success: false,
        error: error.message,
        code: 'ESCROW_FUNDING_ERROR'
      };
    }
  }

  /**
   * Enhanced Stripe payment processing with better error handling
   * @param {object} transaction - Transaction record
   * @param {number} amount - Payment amount
   * @returns {Promise<object>} Payment result
   */
  async processStripePayment(transaction, amount) {
    try {
      // Check if Stripe is configured
      if (!this.paymentProcessors.stripe.enabled) {
        throw new Error('Stripe payment processor is not configured');
      }

      // In real implementation, this would use Stripe SDK
      // For demo purposes, we'll simulate payment with random success/failure
      const simulateFailure = Math.random() < 0.1; // 10% failure rate for demo
      
      if (simulateFailure) {
        const errorMessages = [
          'Card declined',
          'Insufficient funds',
          'Invalid card number',
          'Card expired'
        ];
        
        throw new Error(errorMessages[Math.floor(Math.random() * errorMessages.length)]);
      }

      // Mock successful Stripe API response
      const mockStripeResponse = {
        id: `pi_${crypto.randomBytes(12).toString('hex')}`,
        status: 'succeeded',
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: 'usd',
        created: Math.floor(Date.now() / 1000),
        metadata: {
          transaction_id: transaction.id
        }
      };

      return {
        success: true,
        transactionId: mockStripeResponse.id,
        status: mockStripeResponse.status,
        processorResponse: mockStripeResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'STRIPE_PAYMENT_ERROR'
      };
    }
  }

  /**
   * Enhanced PayPal payment processing
   * @param {object} transaction - Transaction record
   * @param {number} amount - Payment amount
   * @returns {Promise<object>} Payment result
   */
  async processPayPalPayment(transaction, amount) {
    try {
      // Check if PayPal is configured
      if (!this.paymentProcessors.paypal.enabled) {
        throw new Error('PayPal payment processor is not configured');
      }

      // Simulate random failure for demo
      const simulateFailure = Math.random() < 0.08; // 8% failure rate
      
      if (simulateFailure) {
        throw new Error('PayPal payment was declined by the financial institution');
      }

      // Mock PayPal API response
      const mockPayPalResponse = {
        id: `PAY-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
        state: 'approved',
        amount: {
          total: amount.toFixed(2),
          currency: 'USD'
        },
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      };

      return {
        success: true,
        transactionId: mockPayPalResponse.id,
        status: mockPayPalResponse.state,
        processorResponse: mockPayPalResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'PAYPAL_PAYMENT_ERROR'
      };
    }
  }

  /**
   * Enhanced bank transfer processing
   * @param {object} transaction - Transaction record
   * @param {number} amount - Transfer amount
   * @param {object} paymentDetails - Bank/payment details
   * @returns {Promise<object>} Transfer result
   */
  async processBankTransfer(transaction, amount, paymentDetails) {
    try {
      // Validate minimum amount for bank transfers
      if (amount < 10.00) {
        throw new Error('Minimum amount for bank transfer is $10.00');
      }

      // Mock bank transfer processing
      const mockTransferResponse = {
        reference: `BT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: 'PENDING', // Bank transfers are typically pending initially
        amount: amount,
        currency: 'USD',
        processingTime: '1-3 business days',
        created: new Date().toISOString()
      };

      return {
        success: true,
        transactionId: mockTransferResponse.reference,
        status: mockTransferResponse.status,
        processorResponse: mockTransferResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'BANK_TRANSFER_ERROR'
      };
    }
  }

  /**
   * Enhanced PayPal payout processing
   * @param {object} transaction - Transaction record
   * @param {number} amount - Payout amount
   * @param {object} paymentAccount - Recipient payment account
   * @returns {Promise<object>} Payout result
   */
  async processPayPalPayout(transaction, amount, paymentAccount) {
    try {
      if (!this.paymentProcessors.paypal.enabled) {
        throw new Error('PayPal payout processor is not configured');
      }

      if (amount < 1.00) {
        throw new Error('Minimum payout amount is $1.00');
      }

      // Simulate random payout failure
      const simulateFailure = Math.random() < 0.05; // 5% failure rate
      
      if (simulateFailure) {
        throw new Error('Recipient PayPal account is not eligible to receive payments');
      }

      const mockPayoutResponse = {
        batch_id: `batch_${crypto.randomBytes(8).toString('hex')}`,
        batch_status: 'SUCCESS',
        amount: amount,
        currency: 'USD',
        recipient: paymentAccount.accountIdentifier,
        time_created: new Date().toISOString()
      };

      return {
        success: true,
        transactionId: mockPayoutResponse.batch_id,
        status: mockPayoutResponse.batch_status,
        processorResponse: mockPayoutResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'PAYPAL_PAYOUT_ERROR'
      };
    }
  }

  /**
   * Enhanced Stripe payout processing
   * @param {object} transaction - Transaction record
   * @param {number} amount - Payout amount
   * @param {object} paymentAccount - Recipient payment account
   * @returns {Promise<object>} Payout result
   */
  async processStripePayout(transaction, amount, paymentAccount) {
    try {
      if (!this.paymentProcessors.stripe.enabled) {
        throw new Error('Stripe payout processor is not configured');
      }

      if (amount < 1.00) {
        throw new Error('Minimum payout amount is $1.00');
      }

      // Simulate random failure
      const simulateFailure = Math.random() < 0.03; // 3% failure rate
      
      if (simulateFailure) {
        throw new Error('Bank account verification failed');
      }

      const mockTransferResponse = {
        id: `tr_${crypto.randomBytes(12).toString('hex')}`,
        status: 'paid',
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: 'usd',
        destination: paymentAccount.accountIdentifier,
        created: Math.floor(Date.now() / 1000)
      };

      return {
        success: true,
        transactionId: mockTransferResponse.id,
        status: mockTransferResponse.status,
        processorResponse: mockTransferResponse
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'STRIPE_PAYOUT_ERROR'
      };
    }
  }

  /**
   * Get comprehensive financial analytics with better error handling
   * @param {string} timeframe - Analytics timeframe
   * @returns {Promise<object>} Financial analytics
   */
  async getFinancialAnalytics(timeframe = 'monthly') {
    try {
      const startDate = this.getAnalyticsStartDate(timeframe);
      
      const analytics = await this.FinancialTransaction.findAll({
        where: {
          createdAt: {
            [Op.gte]: startDate
          },
          status: 'COMPLETED'
        },
        attributes: [
          'transactionType',
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount'],
          [Sequelize.fn('SUM', Sequelize.col('platformFee')), 'totalFees'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'transactionCount'],
          [Sequelize.fn('AVG', Sequelize.col('amount')), 'averageAmount']
        ],
        group: ['transactionType'],
        raw: true
      });

      // Calculate summary statistics
      const summary = {
        totalRevenue: 0,
        totalFees: 0,
        totalTransactions: 0,
        averageTransactionSize: 0
      };

      analytics.forEach(item => {
        summary.totalRevenue += parseFloat(item.totalAmount) || 0;
        summary.totalFees += parseFloat(item.totalFees) || 0;
        summary.totalTransactions += parseInt(item.transactionCount) || 0;
      });

      summary.averageTransactionSize = summary.totalTransactions > 0 
        ? summary.totalRevenue / summary.totalTransactions 
        : 0;

      return {
        success: true,
        analytics,
        summary,
        timeframe,
        generatedAt: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'ANALYTICS_ERROR'
      };
    }
  }

  /**
   * Helper function to get start date for analytics
   * @param {string} timeframe - Analytics timeframe
   * @returns {Date} Start date for analytics
   */
  getAnalyticsStartDate(timeframe) {
    const now = new Date();
    switch (timeframe.toLowerCase()) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'quarterly':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case 'yearly':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Process refund for failed or cancelled transactions
   * @param {string} originalTransactionId - Original transaction to refund
   * @param {string} reason - Refund reason
   * @returns {Promise<object>} Refund result
   */
  async processRefund(originalTransactionId, reason = 'Tournament cancelled') {
    const transaction = await this.db.transaction();
    
    try {
      // Find original transaction
      const originalTransaction = await this.FinancialTransaction.findByPk(originalTransactionId, {
        transaction
      });

      if (!originalTransaction) {
        throw new Error('Original transaction not found');
      }

      if (originalTransaction.status !== 'COMPLETED') {
        throw new Error('Can only refund completed transactions');
      }

      // Create refund transaction
      const refundTransaction = await this.FinancialTransaction.create({
        transactionType: 'REFUND',
        fromUserId: originalTransaction.toUserId,
        toUserId: originalTransaction.fromUserId,
        amount: originalTransaction.netAmount, // Refund net amount (excluding platform fee)
        platformFee: 0.00,
        netAmount: originalTransaction.netAmount,
        paymentProcessor: originalTransaction.paymentProcessor,
        status: 'COMPLETED',
        processedAt: new Date(),
        metadata: {
          originalTransactionId: originalTransactionId,
          refundReason: reason,
          refundType: 'FULL'
        }
      }, { transaction });

      // Update original transaction status
      await originalTransaction.update({
        status: 'REFUNDED'
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        refundTransaction,
        refundAmount: originalTransaction.netAmount,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      await transaction.rollback();
      
      return {
        success: false,
        error: error.message,
        code: 'REFUND_ERROR'
      };
    }
  }
}

module.exports = PaymentProcessingService;