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
          include: [Role]
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
          include: [Role]
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
      const consumer = await Consumer.findByPk(req.params.id);

      if (!consumer) {
        return res.status(404).json({
          success: false,
          error: 'Consumer not found'
        });
      }

      await consumer.update(req.body);

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

  // Delete consumer
  async deleteConsumer(req, res) {
    try {
      const consumer = await Consumer.findByPk(req.params.id);

      if (!consumer) {
        return res.status(404).json({
          success: false,
          error: 'Consumer not found'
        });
      }

      await consumer.destroy();

      res.status(200).json({
        success: true,
        message: 'Consumer deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = consumerController; 