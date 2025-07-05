const { Consumer, User, Role, sequelize } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const consumerController = {
  // Create a new consumer
  async createConsumer(req, res) {
    try {
      console.log('[ConsumerController] Creating consumer:', {
        body: req.body,
        file: req.file
      });

      const formData = req.body;

      // Validate required fields
      const requiredFields = [
        'name',
        'email',
        'phone_number',
        'contact_address'
      ];
      const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
      if (missingFields.length > 0) {
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
        user = await User.create({
          username: formData.name,
          email: formData.email,
          password: randomPassword,
          role_id: 6 // consumer role
        });
      }

      // Handle profile image upload
      let profile_image = null;
      if (req.file) {
        profile_image = req.file.filename;
        console.log('[ConsumerController] Profile image saved:', profile_image);
      }

      // Create consumer
      const consumer = await Consumer.create({
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        contact_address: formData.contact_address,
        profile_image,
        user_id: user.user_id
      });

      res.status(201).json({
        success: true,
        data: {
          consumer,
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            role_id: user.role_id
          }
        }
      });
    } catch (error) {
      console.error('[ConsumerController] Error creating consumer:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all consumers
  async getAllConsumers(req, res) {
    try {
      const consumers = await Consumer.findAll({
        include: [{
          model: User,
          include: [{
            model: Role,
            attributes: ['role_name']
          }]
        }]
      });
      res.status(200).json({
        success: true,
        data: consumers
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
          include: [{
            model: Role,
            attributes: ['role_name']
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
        body: req.body,
        file: req.file
      });

      const consumer = await Consumer.findByPk(req.params.id, {
        include: [{
          model: User,
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
        if (consumer.User) {
          await consumer.User.update({
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