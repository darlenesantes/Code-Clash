/**
 * Fixed Sponsor Management Service
 * File: server/services/sponsorManagementService.js
 * Complete implementation with all syntax errors resolved
 */

const { Sequelize, DataTypes, Op } = require('sequelize');
const crypto = require('crypto');

class SponsorManagementService {
  constructor(database, paymentService) {
    this.db = database;
    this.paymentService = paymentService;
    this.initializeModels();
  }

  /**
   * Initialize sponsor-related database models with proper validation
   */
  initializeModels() {
    // Corporate Sponsor Profiles
    this.CorporateSponsor = this.db.define('CorporateSponsor', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      companyName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          name: 'unique_company_name',
          msg: 'Company name must be unique'
        },
        validate: {
          len: {
            args: [2, 255],
            msg: 'Company name must be between 2 and 255 characters'
          },
          notEmpty: {
            msg: 'Company name cannot be empty'
          }
        }
      },
      industry: {
        type: DataTypes.ENUM(
          'Technology', 'Finance', 'Healthcare', 'Education', 
          'Gaming', 'E-commerce', 'Consulting', 'Startup',
          'Manufacturing', 'Media', 'Telecommunications', 'Other'
        ),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Industry is required'
          }
        }
      },
      companySize: {
        type: DataTypes.ENUM('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Company size is required'
          }
        }
      },
      headquarters: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: {
            args: [2, 255],
            msg: 'Headquarters must be between 2 and 255 characters'
          },
          notEmpty: {
            msg: 'Headquarters location is required'
          }
        }
      },
      website: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          isUrl: {
            msg: 'Website must be a valid URL'
          },
          notEmpty: {
            msg: 'Website URL is required'
          }
        }
      },
      logoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: {
            msg: 'Logo URL must be a valid URL'
          }
        }
      },
      brandColors: {
        type: DataTypes.JSON,
        defaultValue: { primary: '#000000', secondary: '#ffffff' },
        validate: {
          isValidColorScheme(value) {
            if (!value || typeof value !== 'object') {
              throw new Error('Brand colors must be a valid object');
            }
            if (!value.primary || !value.secondary) {
              throw new Error('Both primary and secondary colors are required');
            }
            // Basic hex color validation
            const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexColorRegex.test(value.primary) || !hexColorRegex.test(value.secondary)) {
              throw new Error('Colors must be valid hex codes');
            }
          }
        }
      },
      contactPerson: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: {
            args: [2, 255],
            msg: 'Contact person name must be between 2 and 255 characters'
          },
          notEmpty: {
            msg: 'Contact person is required'
          }
        }
      },
      contactEmail: {
        type: DataTypes.STRING(320), // Maximum email length per RFC 5321
        allowNull: false,
        validate: {
          isEmail: {
            msg: 'Contact email must be a valid email address'
          },
          notEmpty: {
            msg: 'Contact email is required'
          }
        }
      },
      contactPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: {
            args: /^[\+]?[1-9][\d]{0,15}$/,
            msg: 'Phone number must be a valid international format'
          }
        }
      },
      currentTier: {
        type: DataTypes.ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'),
        defaultValue: 'BRONZE',
        validate: {
          notEmpty: {
            msg: 'Current tier is required'
          }
        }
      },
      totalSponsored: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0.00,
        validate: {
          min: {
            args: 0,
            msg: 'Total sponsored amount cannot be negative'
          },
          isDecimal: {
            msg: 'Total sponsored must be a valid decimal number'
          }
        }
      },
      annualBudget: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: {
          min: {
            args: 0,
            msg: 'Annual budget cannot be negative'
          },
          isDecimal: {
            msg: 'Annual budget must be a valid decimal number'
          }
        }
      },
      targetAudience: {
        type: DataTypes.JSON,
        defaultValue: {
          skillLevels: ['INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'],
          demographics: ['SOFTWARE_ENGINEERS', 'STUDENTS', 'PROFESSIONALS'],
          geographies: ['GLOBAL']
        },
        validate: {
          isValidTargetAudience(value) {
            if (!value || typeof value !== 'object') {
              throw new Error('Target audience must be a valid object');
            }
            if (!Array.isArray(value.skillLevels) || !Array.isArray(value.demographics) || !Array.isArray(value.geographies)) {
              throw new Error('Target audience must contain arrays for skillLevels, demographics, and geographies');
            }
          }
        }
      },
      sponsorshipGoals: {
        type: DataTypes.JSON,
        defaultValue: {
          brandAwareness: true,
          talentAcquisition: true,
          developerEngagement: false,
          productPromotion: false
        },
        validate: {
          isValidGoals(value) {
            if (!value || typeof value !== 'object') {
              throw new Error('Sponsorship goals must be a valid object');
            }
            const validKeys = ['brandAwareness', 'talentAcquisition', 'developerEngagement', 'productPromotion'];
            const hasValidKeys = validKeys.some(key => key in value);
            if (!hasValidKeys) {
              throw new Error('Sponsorship goals must contain at least one valid goal');
            }
          }
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      partnershipStartDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      contractEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isAfterStart(value) {
            if (value && this.partnershipStartDate && value <= this.partnershipStartDate) {
              throw new Error('Contract end date must be after partnership start date');
            }
          }
        }
      }
    }, {
      indexes: [
        {
          fields: ['companyName'],
          unique: true
        },
        {
          fields: ['currentTier']
        },
        {
          fields: ['isActive']
        },
        {
          fields: ['industry']
        },
        {
          fields: ['companySize']
        }
      ]
    });

    // Sponsorship Packages
    this.SponsorshipPackage = this.db.define('SponsorshipPackage', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: {
            args: [3, 255],
            msg: 'Package name must be between 3 and 255 characters'
          },
          notEmpty: {
            msg: 'Package name is required'
          }
        }
      },
      tier: {
        type: DataTypes.ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Package tier is required'
          }
        }
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: 0,
            msg: 'Package price cannot be negative'
          },
          isDecimal: {
            msg: 'Package price must be a valid decimal number'
          }
        }
      },
      duration: {
        type: DataTypes.ENUM('SINGLE_EVENT', 'MONTHLY', 'QUARTERLY', 'ANNUAL'),
        defaultValue: 'SINGLE_EVENT',
        validate: {
          notEmpty: {
            msg: 'Package duration is required'
          }
        }
      },
      maxTournaments: {
        type: DataTypes.INTEGER,
        allowNull: true, // null means unlimited for annual packages
        validate: {
          min: {
            args: 1,
            msg: 'Maximum tournaments must be at least 1'
          },
          isInt: {
            msg: 'Maximum tournaments must be an integer'
          }
        }
      },
      benefits: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isValidBenefits(value) {
            if (!value || typeof value !== 'object') {
              throw new Error('Benefits must be a valid object');
            }
            const requiredSections = ['branding', 'promotion', 'engagement', 'analytics', 'special'];
            const hasRequiredSections = requiredSections.every(section => section in value);
            if (!hasRequiredSections) {
              throw new Error('Benefits must contain all required sections: branding, promotion, engagement, analytics, special');
            }
          }
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      popularity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: {
            args: 0,
            msg: 'Popularity cannot be negative'
          },
          isInt: {
            msg: 'Popularity must be an integer'
          }
        }
      }
    }, {
      indexes: [
        {
          fields: ['tier', 'isActive']
        },
        {
          fields: ['duration']
        },
        {
          fields: ['price']
        },
        {
          fields: ['popularity']
        }
      ]
    });

    // Active Sponsorships
    this.ActiveSponsorship = this.db.define('ActiveSponsorship', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      sponsorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'CorporateSponsors',
          key: 'id'
        },
        validate: {
          notEmpty: {
            msg: 'Sponsor ID is required'
          }
        }
      },
      packageId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'SponsorshipPackages',
          key: 'id'
        },
        validate: {
          notEmpty: {
            msg: 'Package ID is required'
          }
        }
      },
      tournamentId: {
        type: DataTypes.UUID,
        allowNull: true, // null for ongoing/annual sponsorships
        references: {
          model: 'Tournaments',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: 0,
            msg: 'Sponsorship amount cannot be negative'
          },
          isDecimal: {
            msg: 'Sponsorship amount must be a valid decimal number'
          }
        }
      },
      startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: {
            msg: 'Start date must be a valid date'
          }
        }
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: {
            msg: 'End date must be a valid date'
          },
          isAfterStart(value) {
            if (value && this.startDate && value <= this.startDate) {
              throw new Error('End date must be after start date');
            }
          }
        }
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'PENDING',
        validate: {
          notEmpty: {
            msg: 'Sponsorship status is required'
          }
        }
      },
      paymentStatus: {
        type: DataTypes.ENUM('PENDING', 'PAID', 'PARTIAL', 'REFUNDED'),
        defaultValue: 'PENDING',
        validate: {
          notEmpty: {
            msg: 'Payment status is required'
          }
        }
      },
      customizations: {
        type: DataTypes.JSON,
        defaultValue: {},
        validate: {
          isValidJSON(value) {
            if (value && typeof value !== 'object') {
              throw new Error('Customizations must be a valid JSON object');
            }
          }
        }
      },
      performanceMetrics: {
        type: DataTypes.JSON,
        defaultValue: {
          impressions: 0,
          clicks: 0,
          engagement: 0,
          conversions: 0,
          reach: 0
        },
        validate: {
          isValidMetrics(value) {
            if (!value || typeof value !== 'object') {
              throw new Error('Performance metrics must be a valid object');
            }
            const requiredMetrics = ['impressions', 'clicks', 'engagement', 'conversions', 'reach'];
            const hasRequiredMetrics = requiredMetrics.every(metric => 
              metric in value && typeof value[metric] === 'number' && value[metric] >= 0
            );
            if (!hasRequiredMetrics) {
              throw new Error('Performance metrics must contain all required numeric fields: impressions, clicks, engagement, conversions, reach');
            }
          }
        }
      }
    }, {
      indexes: [
        {
          fields: ['sponsorId']
        },
        {
          fields: ['packageId']
        },
        {
          fields: ['tournamentId']
        },
        {
          fields: ['status']
        },
        {
          fields: ['paymentStatus']
        },
        {
          fields: ['startDate', 'endDate']
        }
      ]
    });

    // Sponsorship Analytics
    this.SponsorshipAnalytics = this.db.define('SponsorshipAnalytics', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      sponsorshipId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'ActiveSponsorships',
          key: 'id'
        },
        validate: {
          notEmpty: {
            msg: 'Sponsorship ID is required'
          }
        }
      },
      dateRecorded: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: {
            msg: 'Date recorded must be a valid date'
          }
        }
      },
      metrics: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isValidAnalyticsMetrics(value) {
            if (!value || typeof value !== 'object') {
              throw new Error('Analytics metrics must be a valid object');
            }
            const requiredSections = ['brandMetrics', 'engagementMetrics', 'conversionMetrics', 'audienceMetrics'];
            const hasRequiredSections = requiredSections.every(section => section in value);
            if (!hasRequiredSections) {
              throw new Error('Analytics metrics must contain all required sections');
            }
          }
        }
      },
      calculatedROI: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
          isDecimal: {
            msg: 'Calculated ROI must be a valid decimal number'
          }
        }
      }
    }, {
      indexes: [
        {
          fields: ['sponsorshipId']
        },
        {
          fields: ['dateRecorded']
        },
        {
          fields: ['calculatedROI']
        }
      ]
    });

    // Define associations
    this.CorporateSponsor.hasMany(this.ActiveSponsorship, { 
      foreignKey: 'sponsorId', 
      as: 'sponsorships' 
    });
    this.ActiveSponsorship.belongsTo(this.CorporateSponsor, { 
      foreignKey: 'sponsorId', 
      as: 'sponsor' 
    });
    
    this.SponsorshipPackage.hasMany(this.ActiveSponsorship, { 
      foreignKey: 'packageId', 
      as: 'activeSponsorships' 
    });
    this.ActiveSponsorship.belongsTo(this.SponsorshipPackage, { 
      foreignKey: 'packageId', 
      as: 'package' 
    });
    
    this.ActiveSponsorship.hasMany(this.SponsorshipAnalytics, { 
      foreignKey: 'sponsorshipId', 
      as: 'analytics' 
    });
    this.SponsorshipAnalytics.belongsTo(this.ActiveSponsorship, { 
      foreignKey: 'sponsorshipId', 
      as: 'sponsorship' 
    });
  }

  /**
   * Register new corporate sponsor with enhanced validation
   * @param {object} sponsorData - Company information and goals
   * @returns {Promise<object>} Registration result
   */
  async registerCorporateSponsor(sponsorData) {
    const transaction = await this.db.transaction();
    
    try {
      // Enhanced input validation
      const requiredFields = [
        'companyName', 'industry', 'companySize', 'headquarters', 
        'website', 'contactPerson', 'contactEmail'
      ];
      
      const missingFields = requiredFields.filter(field => !sponsorData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sponsorData.contactEmail)) {
        throw new Error('Invalid email format for contact email');
      }

      // Validate website URL
      try {
        new URL(sponsorData.website);
      } catch (error) {
        throw new Error('Invalid website URL format');
      }

      // Check if company already exists (case-insensitive)
      const existingSponsor = await this.CorporateSponsor.findOne({
        where: {
          companyName: {
            [Op.iLike]: sponsorData.companyName.trim()
          }
        },
        transaction
      });

      if (existingSponsor) {
        throw new Error(`Company "${sponsorData.companyName}" is already registered as a sponsor`);
      }

      // Determine initial tier based on annual budget
      let initialTier = 'BRONZE';
      if (sponsorData.annualBudget) {
        const budget = parseFloat(sponsorData.annualBudget);
        if (isNaN(budget) || budget < 0) {
          throw new Error('Annual budget must be a valid positive number');
        }
        initialTier = this.calculateSponsorTier(budget);
      }

      // Validate and set default target audience
      const defaultTargetAudience = {
        skillLevels: ['INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'],
        demographics: ['SOFTWARE_ENGINEERS', 'STUDENTS', 'PROFESSIONALS'],
        geographies: ['GLOBAL']
      };

      // Validate and set default sponsorship goals
      const defaultSponsorshipGoals = {
        brandAwareness: true,
        talentAcquisition: true,
        developerEngagement: false,
        productPromotion: false
      };

      // Create sponsor profile
      const sponsor = await this.CorporateSponsor.create({
        ...sponsorData,
        companyName: sponsorData.companyName.trim(),
        contactEmail: sponsorData.contactEmail.toLowerCase().trim(),
        currentTier: initialTier,
        targetAudience: sponsorData.targetAudience || defaultTargetAudience,
        sponsorshipGoals: sponsorData.sponsorshipGoals || defaultSponsorshipGoals,
        totalSponsored: 0.00
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        sponsor: sponsor.toJSON(),
        message: `${sponsorData.companyName} successfully registered as ${initialTier} tier sponsor`
      };

    } catch (error) {
      await transaction.rollback();
      
      return {
        success: false,
        error: error.message,
        code: 'SPONSOR_REGISTRATION_ERROR'
      };
    }
  }

  /**
   * Create sponsorship package with enhanced validation
   * @param {object} packageData - Package details and benefits
   * @returns {Promise<object>} Package creation result
   */
  async createSponsorshipPackage(packageData) {
    const transaction = await this.db.transaction();
    
    try {
      const {
        name,
        tier,
        price,
        duration,
        maxTournaments,
        benefits
      } = packageData;

      // Input validation
      if (!name || !tier || price === undefined || !benefits) {
        throw new Error('Missing required fields: name, tier, price, or benefits');
      }

      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        throw new Error('Price must be a valid non-negative number');
      }

      const validTiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
      if (!validTiers.includes(tier)) {
        throw new Error(`Invalid tier. Must be one of: ${validTiers.join(', ')}`);
      }

      const validDurations = ['SINGLE_EVENT', 'MONTHLY', 'QUARTERLY', 'ANNUAL'];
      if (duration && !validDurations.includes(duration)) {
        throw new Error(`Invalid duration. Must be one of: ${validDurations.join(', ')}`);
      }

      // Check for duplicate package names
      const existingPackage = await this.SponsorshipPackage.findOne({
        where: {
          name: {
            [Op.iLike]: name.trim()
          },
          tier: tier
        },
        transaction
      });

      if (existingPackage) {
        throw new Error(`A ${tier} package with name "${name}" already exists`);
      }

      // Validate and apply tier-appropriate benefits
      const validatedBenefits = this.validateTierBenefits(tier, benefits);

      const packageRecord = await this.SponsorshipPackage.create({
        name: name.trim(),
        tier,
        price: numericPrice,
        duration: duration || 'SINGLE_EVENT',
        maxTournaments: maxTournaments || null,
        benefits: validatedBenefits
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        package: packageRecord.toJSON(),
        message: 'Sponsorship package created successfully'
      };

    } catch (error) {
      await transaction.rollback();
      
      return {
        success: false,
        error: error.message,
        code: 'PACKAGE_CREATION_ERROR'
      };
    }
  }

  /**
   * Purchase sponsorship package with comprehensive validation
   * @param {string} sponsorId - Sponsor company ID
   * @param {string} packageId - Package ID
   * @param {string} tournamentId - Tournament ID (optional for ongoing packages)
   * @param {object} paymentDetails - Payment information
   * @param {object} customizations - Custom branding requests
   * @returns {Promise<object>} Purchase result
   */
  async purchaseSponsorshipPackage(sponsorId, packageId, tournamentId, paymentDetails, customizations = {}) {
    const transaction = await this.db.transaction();
    
    try {
      // Input validation
      if (!sponsorId || !packageId || !paymentDetails) {
        throw new Error('Missing required parameters: sponsorId, packageId, or paymentDetails');
      }

      if (!paymentDetails.method) {
        throw new Error('Payment method is required');
      }

      // Get sponsor and package details with lock
      const sponsor = await this.CorporateSponsor.findByPk(sponsorId, {
        transaction,
        lock: true
      });
      
      const packageRecord = await this.SponsorshipPackage.findByPk(packageId, {
        transaction
      });

      if (!sponsor) {
        throw new Error('Sponsor company not found');
      }

      if (!packageRecord) {
        throw new Error('Sponsorship package not found');
      }

      if (!sponsor.isActive) {
        throw new Error('Sponsor account is not active');
      }

      if (!packageRecord.isActive) {
        throw new Error('Sponsorship package is not available');
      }

      // Check if sponsor already has an active sponsorship for this tournament
      if (tournamentId) {
        const existingSponsorship = await this.ActiveSponsorship.findOne({
          where: {
            sponsorId,
            tournamentId,
            status: {
              [Op.in]: ['PENDING', 'ACTIVE']
            }
          },
          transaction
        });

        if (existingSponsorship) {
          throw new Error('Sponsor already has an active sponsorship for this tournament');
        }
      }

      // Calculate duration and end date
      const startDate = new Date();
      let endDate;
      
      switch (packageRecord.duration) {
        case 'SINGLE_EVENT':
          if (tournamentId) {
            endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days after tournament
          } else {
            throw new Error('Tournament ID is required for single event packages');
          }
          break;
        case 'MONTHLY':
          endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        case 'QUARTERLY':
          endDate = new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000);
          break;
        case 'ANNUAL':
          endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      const packagePrice = parseFloat(packageRecord.price);

      // Process payment if amount > 0
      let paymentResult = null;
      if (packagePrice > 0) {
        if (!this.paymentService) {
          throw new Error('Payment service is not available');
        }

        paymentResult = await this.paymentService.processSponsorshipPayment(
          sponsorId,
          tournamentId,
          packagePrice,
          {
            method: paymentDetails.method,
            tier: packageRecord.tier,
            companyName: sponsor.companyName
          }
        );

        if (!paymentResult || !paymentResult.success) {
          throw new Error(`Payment processing failed: ${paymentResult?.error || 'Unknown payment error'}`);
        }
      }

      // Create active sponsorship
      const sponsorship = await this.ActiveSponsorship.create({
        sponsorId,
        packageId,
        tournamentId: tournamentId || null,
        amount: packagePrice,
        startDate,
        endDate,
        status: 'ACTIVE',
        paymentStatus: paymentResult ? 'PAID' : 'PENDING',
        customizations: customizations || {},
        performanceMetrics: {
          impressions: 0,
          clicks: 0,
          engagement: 0,
          conversions: 0,
          reach: 0
        }
      }, { transaction });

      // Update sponsor total and tier
      const newTotal = parseFloat(sponsor.totalSponsored) + packagePrice;
      const newTier = this.calculateSponsorTier(newTotal);
      
      await sponsor.update({
        totalSponsored: newTotal,
        currentTier: newTier
      }, { transaction });

      // Update package popularity
      await packageRecord.update({
        popularity: packageRecord.popularity + 1
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        sponsorship: sponsorship.toJSON(),
        payment: paymentResult?.transaction,
        newTier,
        totalInvestment: newTotal,
        message: `Sponsorship package purchased successfully. ${sponsor.companyName} is now ${newTier} tier sponsor.`
      };

    } catch (error) {
      await transaction.rollback();
      
      return {
        success: false,
        error: error.message,
        code: 'SPONSORSHIP_PURCHASE_ERROR'
      };
    }
  }

  /**
   * Track sponsorship performance metrics with validation
   * @param {string} sponsorshipId - Active sponsorship ID
   * @param {object} metrics - Performance data
   * @returns {Promise<object>} Tracking result
   */
  async trackSponsorshipMetrics(sponsorshipId, metrics) {
    const transaction = await this.db.transaction();
    
    try {
      if (!sponsorshipId || !metrics) {
        throw new Error('Missing required parameters: sponsorshipId or metrics');
      }

      const sponsorship = await this.ActiveSponsorship.findByPk(sponsorshipId, {
        transaction,
        lock: true
      });
      
      if (!sponsorship) {
        throw new Error('Active sponsorship not found');
      }

      if (sponsorship.status !== 'ACTIVE') {
        throw new Error('Cannot track metrics for inactive sponsorship');
      }

      // Validate metrics data
      const numericFields = ['impressions', 'clicks', 'engagement', 'conversions', 'reach'];
      const validatedMetrics = {};
      
      numericFields.forEach(field => {
        const value = metrics[field] || 0;
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) || numericValue < 0) {
          throw new Error(`Invalid ${field} value: must be a non-negative number`);
        }
        validatedMetrics[field] = numericValue;
      });

      // Update performance metrics (cumulative)
      const currentMetrics = sponsorship.performanceMetrics || {
        impressions: 0, clicks: 0, engagement: 0, conversions: 0, reach: 0
      };
      
      const updatedMetrics = {
        impressions: (currentMetrics.impressions || 0) + validatedMetrics.impressions,
        clicks: (currentMetrics.clicks || 0) + validatedMetrics.clicks,
        engagement: (currentMetrics.engagement || 0) + validatedMetrics.engagement,
        conversions: (currentMetrics.conversions || 0) + validatedMetrics.conversions,
        reach: Math.max(currentMetrics.reach || 0, validatedMetrics.reach)
      };

      await sponsorship.update({
        performanceMetrics: updatedMetrics
      }, { transaction });

      // Calculate ROI
      const roi = this.calculateROI(sponsorship.amount, updatedMetrics);

      // Store detailed analytics
      const analyticsRecord = await this.SponsorshipAnalytics.create({
        sponsorshipId,
        metrics: {
          brandMetrics: {
            logoImpressions: metrics.logoImpressions || 0,
            brandMentions: metrics.brandMentions || 0,
            socialMediaReach: metrics.socialMediaReach || 0
          },
          engagementMetrics: {
            clickThroughRate: metrics.clickThroughRate || 0,
            participantInteraction: metrics.participantInteraction || 0,
            surveyResponses: metrics.surveyResponses || 0
          },
          conversionMetrics: {
            websiteVisits: metrics.websiteVisits || 0,
            signups: metrics.signups || 0,
            applications: metrics.applications || 0
          },
          audienceMetrics: metrics.audienceMetrics || {}
        },
        calculatedROI: roi
      }, { transaction });

      await transaction.commit();

      return {
        success: true,
        updatedMetrics,
        roi,
        analyticsId: analyticsRecord.id,
        message: 'Sponsorship metrics updated successfully'
      };

    } catch (error) {
      await transaction.rollback();
      
      return {
        success: false,
        error: error.message,
        code: 'METRICS_TRACKING_ERROR'
      };
    }
  }

  /**
   * Get comprehensive sponsor dashboard data with error handling
   * @param {string} sponsorId - Sponsor company ID
   * @returns {Promise<object>} Dashboard data
   */
  async getSponsorDashboard(sponsorId) {
    try {
      if (!sponsorId) {
        throw new Error('Sponsor ID is required');
      }

      const sponsor = await this.CorporateSponsor.findByPk(sponsorId);
      if (!sponsor) {
        throw new Error('Sponsor company not found');
      }

      // Get active sponsorships with package details
      const activeSponsorships = await this.ActiveSponsorship.findAll({
        where: { 
          sponsorId,
          status: 'ACTIVE'
        },
        include: [
          {
            model: this.SponsorshipPackage,
            as: 'package',
            attributes: ['name', 'tier', 'benefits', 'duration']
          }
        ]
      });

      // Get recent analytics (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sponsorshipIds = activeSponsorships.map(s => s.id);
      
      const recentAnalytics = sponsorshipIds.length > 0 ? await this.SponsorshipAnalytics.findAll({
        where: {
          sponsorshipId: {
            [Op.in]: sponsorshipIds
          },
          dateRecorded: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        order: [['dateRecorded', 'DESC']],
        limit: 50
      }) : [];

      // Calculate aggregate metrics
      const aggregateMetrics = this.calculateAggregateMetrics(activeSponsorships, recentAnalytics);

      // Get available packages for upselling
      const availablePackages = await this.getAvailablePackages(sponsor.currentTier);

      // Get next tier benefits
      const nextTierBenefits = this.getNextTierBenefits(sponsor.currentTier);

      return {
        success: true,
        dashboard: {
          sponsor: {
            id: sponsor.id,
            companyName: sponsor.companyName,
            industry: sponsor.industry,
            currentTier: sponsor.currentTier,
            totalSponsored: parseFloat(sponsor.totalSponsored),
            isActive: sponsor.isActive,
            partnershipStartDate: sponsor.partnershipStartDate
          },
          activeSponsorships: activeSponsorships.length,
          totalInvestment: parseFloat(sponsor.totalSponsored),
          currentTier: sponsor.currentTier,
          metrics: aggregateMetrics,
          recentPerformance: recentAnalytics.slice(0, 10),
          availableUpgrades: availablePackages,
          nextTierBenefits: nextTierBenefits,
          generatedAt: new Date()
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: 'DASHBOARD_ERROR'
      };
    }
  }

  /**
   * Calculate sponsor tier based on total spending
   * @param {number} totalSponsored - Total amount sponsored
   * @returns {string} Calculated tier
   */
  calculateSponsorTier(totalSponsored) {
    const amount = parseFloat(totalSponsored) || 0;
    if (amount >= 250000) return 'DIAMOND';
    if (amount >= 100000) return 'PLATINUM';
    if (amount >= 50000) return 'GOLD';
    if (amount >= 15000) return 'SILVER';
    return 'BRONZE';
  }

  /**
   * Enhanced ROI calculation with better methodology
   * @param {number} investment - Amount invested
   * @param {object} metrics - Performance metrics
   * @returns {number} ROI percentage
   */
  calculateROI(investment, metrics) {
    try {
      const investmentAmount = parseFloat(investment) || 0;
      if (investmentAmount === 0) return 0;

      // More sophisticated ROI calculation
      const conversionValue = (metrics.conversions || 0) * 150; // $150 per conversion (hiring cost savings)
      const engagementValue = (metrics.engagement || 0) * 3; // $3 per engagement
      const impressionValue = (metrics.impressions || 0) * 0.02; // $0.02 per impression
      const reachValue = Math.min(metrics.reach || 0, 100000) * 0.05; // $0.05 per reach, capped
      
      const totalValue = conversionValue + engagementValue + impressionValue + reachValue;
      const roi = ((totalValue - investmentAmount) / investmentAmount) * 100;
      
      // Return ROI clamped between -100% and 1000%
      return Math.max(-100, Math.min(1000, Math.round(roi * 100) / 100));
    } catch (error) {
      console.error('ROI calculation error:', error);
      return 0;
    }
  }

  /**
   * Enhanced benefit validation with comprehensive tier checking
   * @param {string} tier - Sponsorship tier
   * @param {object} benefits - Requested benefits
   * @returns {object} Validated benefits
   */
  validateTierBenefits(tier, benefits) {
    const tierLimits = {
      BRONZE: {
        logoPlacement: ['tournament_page'],
        socialMediaMentions: 2,
        bannerAds: false,
        customBranding: false,
        participantSurveys: false,
        hiringBoothAccess: false,
        namingRights: false,
        customProblems: false,
        executiveAccess: false,
        exclusiveEvents: false
      },
      SILVER: {
        logoPlacement: ['tournament_page', 'live_stream'],
        socialMediaMentions: 5,
        bannerAds: true,
        customBranding: false,
        participantSurveys: true,
        hiringBoothAccess: false,
        namingRights: false,
        customProblems: false,
        executiveAccess: false,
        exclusiveEvents: false
      },
      GOLD: {
        logoPlacement: ['tournament_page', 'live_stream', 'certificates'],
        socialMediaMentions: 10,
        bannerAds: true,
        customBranding: true,
        participantSurveys: true,
        hiringBoothAccess: true,
        namingRights: false,
        customProblems: false,
        executiveAccess: false,
        exclusiveEvents: false
      },
      PLATINUM: {
        logoPlacement: ['all_locations'],
        socialMediaMentions: 20,
        bannerAds: true,
        customBranding: true,
        participantSurveys: true,
        hiringBoothAccess: true,
        namingRights: true,
        customProblems: true,
        executiveAccess: false,
        exclusiveEvents: false
      },
      DIAMOND: {
        logoPlacement: ['all_locations'],
        socialMediaMentions: 50,
        bannerAds: true,
        customBranding: true,
        participantSurveys: true,
        hiringBoothAccess: true,
        namingRights: true,
        customProblems: true,
        executiveAccess: true,
        exclusiveEvents: true
      }
    };

    const limits = tierLimits[tier] || tierLimits.BRONZE;
    
    // Apply tier limits to requested benefits
    return {
      branding: {
        logoPlacement: benefits.branding?.logoPlacement?.filter(loc => 
          limits.logoPlacement.includes(loc) || limits.logoPlacement.includes('all_locations')
        ) || limits.logoPlacement,
        bannerAds: limits.bannerAds ? (benefits.branding?.bannerAds || false) : false,
        customBranding: limits.customBranding ? (benefits.branding?.customBranding || false) : false
      },
      promotion: {
        socialMediaMentions: Math.min(
          benefits.promotion?.socialMediaMentions || limits.socialMediaMentions,
          limits.socialMediaMentions
        ),
        blogPosts: ['PLATINUM', 'DIAMOND'].includes(tier) ? 1 : 0,
        pressRelease: tier === 'DIAMOND',
        newsletterFeature: ['GOLD', 'PLATINUM', 'DIAMOND'].includes(tier)
      },
      engagement: {
        participantSurveys: limits.participantSurveys,
        hiringBoothAccess: limits.hiringBoothAccess,
        exclusiveEvents: limits.exclusiveEvents
      },
      analytics: {
        basicMetrics: true,
        detailedReporting: ['GOLD', 'PLATINUM', 'DIAMOND'].includes(tier),
        realTimeTracking: ['PLATINUM', 'DIAMOND'].includes(tier),
        audienceInsights: ['DIAMOND'].includes(tier)
      },
      special: {
        customProblems: limits.customProblems,
        namingRights: limits.namingRights,
        executiveAccess: limits.executiveAccess
      }
    };
  }

  /**
   * Calculate aggregate metrics with error handling
   * @param {Array} sponsorships - Active sponsorships
   * @param {Array} analytics - Recent analytics data
   * @returns {object} Aggregate metrics
   */
  calculateAggregateMetrics(sponsorships, analytics) {
    try {
      const totals = {
        totalImpressions: 0,
        totalClicks: 0,
        totalEngagement: 0,
        totalConversions: 0,
        totalReach: 0,
        averageROI: 0,
        activeSponsorships: sponsorships.length
      };

      // Aggregate metrics from active sponsorships
      sponsorships.forEach(sponsorship => {
        const metrics = sponsorship.performanceMetrics || {};
        totals.totalImpressions += parseInt(metrics.impressions) || 0;
        totals.totalClicks += parseInt(metrics.clicks) || 0;
        totals.totalEngagement += parseInt(metrics.engagement) || 0;
        totals.totalConversions += parseInt(metrics.conversions) || 0;
        totals.totalReach = Math.max(totals.totalReach, parseInt(metrics.reach) || 0);
      });

      // Calculate average ROI from recent analytics
      if (analytics.length > 0) {
        const validROIs = analytics
          .map(record => parseFloat(record.calculatedROI) || 0)
          .filter(roi => !isNaN(roi));
        
        if (validROIs.length > 0) {
          const roiSum = validROIs.reduce((sum, roi) => sum + roi, 0);
          totals.averageROI = Math.round((roiSum / validROIs.length) * 100) / 100;
        }
      }

      // Calculate click-through rate
      totals.clickThroughRate = totals.totalImpressions > 0 
        ? Math.round((totals.totalClicks / totals.totalImpressions) * 10000) / 100
        : 0;

      // Calculate conversion rate
      totals.conversionRate = totals.totalClicks > 0
        ? Math.round((totals.totalConversions / totals.totalClicks) * 10000) / 100
        : 0;

      return totals;
    } catch (error) {
      console.error('Aggregate metrics calculation error:', error);
      return {
        totalImpressions: 0,
        totalClicks: 0,
        totalEngagement: 0,
        totalConversions: 0,
        totalReach: 0,
        averageROI: 0,
        activeSponsorships: 0,
        clickThroughRate: 0,
        conversionRate: 0
      };
    }
  }

  /**
   * Get available packages for current tier and above
   * @param {string} currentTier - Current sponsor tier
   * @returns {Promise<Array>} Available packages
   */
  async getAvailablePackages(currentTier) {
    try {
      const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
      const currentIndex = tierOrder.indexOf(currentTier);
      const availableTiers = currentIndex >= 0 ? tierOrder.slice(currentIndex) : tierOrder;

      return await this.SponsorshipPackage.findAll({
        where: {
          tier: {
            [Op.in]: availableTiers
          },
          isActive: true
        },
        order: [
          [Sequelize.literal(`CASE tier WHEN 'BRONZE' THEN 1 WHEN 'SILVER' THEN 2 WHEN 'GOLD' THEN 3 WHEN 'PLATINUM' THEN 4 WHEN 'DIAMOND' THEN 5 END`), 'ASC'],
          ['price', 'ASC']
        ]
      });
    } catch (error) {
      console.error('Get available packages error:', error);
      return [];
    }
  }

  /**
   * Get benefits of next tier for upselling
   * @param {string} currentTier - Current tier
   * @returns {object} Next tier benefits
   */
  getNextTierBenefits(currentTier) {
    const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const nextTier = currentIndex >= 0 && currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;

    if (!nextTier) {
      return { 
        message: 'You are already at the highest tier!',
        isMaxTier: true
      };
    }

    const benefits = {
      SILVER: [
        'Banner ads during live streams',
        'Participant surveys access',
        'Up to 5 social media mentions',
        'Live stream logo placement'
      ],
      GOLD: [
        'Logo on winner certificates',
        'Hiring booth access at events',
        'Custom branding options',
        'Up to 10 social media mentions'
      ],
      PLATINUM: [
        'Tournament naming rights',
        'Custom problem sets creation',
        'All locations logo placement',
        'Up to 20 social media mentions'
      ],
      DIAMOND: [
        'Executive access and interviews',
        'Exclusive developer events',
        'White-label tournament options',
        'Up to 50 social media mentions'
      ]
    };

    return {
      nextTier,
      benefits: benefits[nextTier] || [],
      estimatedRequirement: this.getTierRequirement(nextTier),
      currentRequirement: this.getTierRequirement(currentTier),
      isMaxTier: false
    };
  }

  /**
   * Get minimum spending requirement for tier
   * @param {string} tier - Target tier
   * @returns {number} Minimum spending requirement
   */
  getTierRequirement(tier) {
    const requirements = {
      BRONZE: 0,
      SILVER: 15000,
      GOLD: 50000,
      PLATINUM: 100000,
      DIAMOND: 250000
    };
    return requirements[tier] || 0;
  }
}

module.exports = SponsorManagementService;