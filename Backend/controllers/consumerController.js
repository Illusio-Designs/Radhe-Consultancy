const { Consumer, User, Role, sequelize } = require('../models');
const userService = require('../services/userService');
const { Op } = require('sequelize');

const consumerController = {
  // Get consumer statistics
  async getConsumerStatistics(req, res) {
    try {
      console.log('[ConsumerController] Getting consumer statistics');
      
      // Get total consumers count
      const totalConsumers = await Consumer.count();
      console.log('[ConsumerController] Total consumers:', totalConsumers);

      // Get active consumers count (all consumers are considered active)
      const activeConsumers = totalConsumers;
      
      // Get consumers created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentConsumers = await Consumer.count({
        where: {
          created_at: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });
      console.log('[ConsumerController] Recent consumers:', recentConsumers);

      // Calculate percentages
      const percent = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;
      const activePercentage = percent(activeConsumers, totalConsumers);
      const recentPercentage = percent(recentConsumers, totalConsumers);

      // Get consumers by month for the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthlyStats = await Consumer.findAll({
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
          [sequelize.fn('COUNT', sequelize.col('consumer_id')), 'count']
        ],
        where: {
          created_at: {
            [Op.gte]: sixMonthsAgo
          }
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
        raw: true
      });

      const responseData = {
        total_consumers: totalConsumers,
        active_consumers: activeConsumers,
        recent_consumers: recentConsumers,
        percent_active: activePercentage,
        percent_recent: recentPercentage,
        monthly_stats: monthlyStats
      };

      console.log('[ConsumerController] Consumer statistics:', responseData);
      
      res.status(200).json({
        success: true,
        data: responseData
      });
    } catch (error) {
      console.error('[ConsumerController] Error getting consumer statistics:', error);
      res.status(500).json({
        success: false,
        error: `Failed to get consumer statistics: ${error.message}`
      });
    }
  },

  // Create a new consumer
  async createConsumer(req, res) {
    try {
      console.log('[ConsumerController] Creating consumer:', {
        body: req.body,
        bodyKeys: Object.keys(req.body || {}),
        bodyValues: Object.values(req.body || {})
      });

      const formData = req.body;

      // Validate required fields
      const requiredFields = [
        'name',
        'email',
        'phone_number',
        'contact_address'
      ];
      
      console.log('[ConsumerController] Checking required fields:', requiredFields);
      console.log('[ConsumerController] Form data values:', {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        contact_address: formData.contact_address
      });
      
      const missingFields = requiredFields.filter(field => {
        const value = formData[field];
        const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
        console.log(`[ConsumerController] Field ${field}: value="${value}", isEmpty=${isEmpty}`);
        return isEmpty;
      });
      
      if (missingFields.length > 0) {
        console.log('[ConsumerController] Missing fields:', missingFields);
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      // Check if user with same email exists
      let user = await User.findOne({ where: { email: formData.email } });
      if (!user) {
        // Create new user with consumer role
        const randomPassword = Math.random().toString(36).slice(-8);
        
        // Get consumer role
        const consumerRole = await Role.findOne({ where: { role_name: 'Consumer' } });
        if (!consumerRole) {
          throw new Error('Consumer role not found');
        }

        user = await userService.createUser({
          username: formData.name,
          email: formData.email,
          password: randomPassword,
          role_ids: [consumerRole.id]
        });
      }

      // Create consumer
      const consumer = await Consumer.create({
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        contact_address: formData.contact_address,
        user_id: user.user_id
      });

      res.status(201).json({
        success: true,
        data: {
          consumer,
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email
          }
        }
      });
    } catch (error) {
      console.error('[ConsumerController] Error creating consumer:', error.message);
      if (error.name === 'SequelizeUniqueConstraintError') {
        const fields = error.errors ? error.errors.map(e => e.path).join(', ') : 'unknown';
        return res.status(400).json({
          success: false,
          error: `Duplicate entry: ${fields} must be unique.`
        });
      } else if (error.name === 'SequelizeValidationError') {
        const details = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
        return res.status(400).json({
          success: false,
          error: `Validation error: ${details}`
        });
      } else {
        return res.status(500).json({
          success: false,
          error: `Consumer creation failed: ${error.message}`
        });
      }
    }
  },

  // Get all consumers
  async getAllConsumers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || parseInt(req.query.pageSize) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Consumer.findAndCountAll({
        include: [{
          model: User,
          as: 'user',
          include: [{
            model: Role,
            as: 'roles',
            attributes: ['role_name'],
            through: { attributes: ['is_primary'] }
          }]
        }],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        consumers: rows,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(count / limit),
        totalItems: count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get consumer by ID
  async getConsumerById(req, res) {
    try {
      const consumer = await Consumer.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'user',
          include: [{
            model: Role,
            as: 'roles',
            attributes: ['role_name'],
            through: { attributes: ['is_primary'] }
          }]
        }]
      });
      if (!consumer) {
        return res.status(404).json({
          success: false,
          error: 'Consumer not found'
        });
      }
      res.status(200).json({
        success: true,
        data: consumer
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update consumer
  async updateConsumer(req, res) {
    try {
      console.log('[ConsumerController] Updating consumer:', {
        id: req.params.id,
        body: req.body
      });

      const consumer = await Consumer.findByPk(req.params.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'email']
        }]
      });

      if (!consumer) {
        return res.status(404).json({
          success: false,
          error: 'Consumer not found'
        });
      }

      const { name, email, phone_number, contact_address } = req.body;

      // Handle profile image upload
      let profile_image = consumer.profile_image;
      if (req.file) {
        // Delete old profile image if it exists
        if (consumer.profile_image) {
          const oldImagePath = path.join(__dirname, '../../uploads/profile_images', consumer.profile_image);
          try {
            await fs.unlink(oldImagePath);
            console.log('[ConsumerController] Old profile image deleted:', consumer.profile_image);
          } catch (error) {
            console.error('[ConsumerController] Error deleting old profile image:', error);
          }
        }
        profile_image = req.file.filename;
        console.log('[ConsumerController] New profile image saved:', profile_image);
      }

      // Start a transaction
      const transaction = await Consumer.sequelize.transaction();
      try {
        // Update consumer
        await consumer.update({
          name,
          email,
          phone_number,
          contact_address,
          profile_image
        }, { transaction });

        // Update associated user if it exists
        if (consumer.user) {
          await consumer.user.update({
            username: name,
            email: email
          }, { transaction });
        }

        // Commit the transaction
        await transaction.commit();

        // Fetch the updated consumer
        const updatedConsumer = await Consumer.findByPk(req.params.id, {
          include: [{
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'email']
          }]
        });

        res.status(200).json({
          success: true,
          data: updatedConsumer
        });
      } catch (error) {
        // Rollback the transaction if there's an error
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('[ConsumerController] Error updating consumer:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Search consumers by name, email, or phone_number
  async searchConsumers(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Missing search query' });
      }
      const consumers = await Consumer.findAll({
        where: {
          [Op.or]: [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', `%${q.toLowerCase()}%`),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), 'LIKE', `%${q.toLowerCase()}%`),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('phone_number')), 'LIKE', `%${q.toLowerCase()}%`)
          ]
        }
      });
      res.json(consumers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = consumerController; 