const { Consumer, User, Role } = require('../models');
const { Op } = require('sequelize');

const consumerController = {
  // Create a new consumer
  async createConsumer(req, res) {
    try {
      const {
        name,
        email,
        phone_number,
        contact_address,
        profile_image
      } = req.body;

      // Create user with consumer role
      const user = await User.create({
        username: name,
        email: email,
        role_id: 6 // consumer role
      });

      // Create consumer
      const consumer = await Consumer.create({
        name,
        email,
        phone_number,
        contact_address,
        profile_image,
        user_id: user.user_id
      });

      res.status(201).json({
        success: true,
        data: { consumer, user }
      });
    } catch (error) {
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

      const { name, email, phone_number, contact_address, profile_image } = req.body;

      // Start a transaction to ensure both updates succeed or fail together
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

        // Fetch the updated consumer with user details
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
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = consumerController; 