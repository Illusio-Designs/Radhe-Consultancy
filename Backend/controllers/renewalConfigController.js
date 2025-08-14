const { RenewalConfig } = require('../models');

// Get all renewal configurations
const getAllConfigs = async (req, res) => {
  try {
    const configs = await RenewalConfig.findAll({
      order: [['serviceType', 'ASC']]
    });
    
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Error fetching renewal configs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal configurations'
    });
  }
};

// Get configuration by service type
const getConfigByService = async (req, res) => {
  try {
    const { serviceType } = req.params;
    const config = await RenewalConfig.findOne({
      where: { serviceType }
    });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found for this service type'
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching renewal config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal configuration'
    });
  }
};

// Create new renewal configuration
const createConfig = async (req, res) => {
  try {
    const { serviceType, serviceName, reminderTimes, reminderDays } = req.body;
    
    // Validate required fields
    if (!serviceType || !serviceName || !reminderTimes || !reminderDays) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: serviceType, serviceName, reminderTimes, reminderDays'
      });
    }
    
    // Check if config already exists for this service type
    const existingConfig = await RenewalConfig.findOne({
      where: { serviceType }
    });
    
    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'Configuration already exists for this service type'
      });
    }
    
    // Create new configuration
    const newConfig = await RenewalConfig.create({
      serviceType,
      serviceName,
      reminderTimes: parseInt(reminderTimes),
      reminderDays: parseInt(reminderDays),
      createdBy: req.user.user_id,
      isActive: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Renewal configuration created successfully',
      data: newConfig
    });
  } catch (error) {
    console.error('Error creating renewal config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create renewal configuration'
    });
  }
};

// Update renewal configuration
const updateConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { reminderTimes, reminderDays, isActive } = req.body;
    
    const config = await RenewalConfig.findByPk(id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    // Update fields
    if (reminderTimes !== undefined) config.reminderTimes = parseInt(reminderTimes);
    if (reminderDays !== undefined) config.reminderDays = parseInt(reminderDays);
    if (isActive !== undefined) config.isActive = isActive;
    
    config.updatedBy = req.user.user_id;
    await config.save();
    
    res.json({
      success: true,
      message: 'Renewal configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating renewal config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update renewal configuration'
    });
  }
};

// Delete renewal configuration
const deleteConfig = async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await RenewalConfig.findByPk(id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }
    
    await config.destroy();
    
    res.json({
      success: true,
      message: 'Renewal configuration deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting renewal config:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete renewal configuration'
    });
  }
};

// Get default service types for easy configuration
const getDefaultServiceTypes = async (req, res) => {
  try {
    const defaultServices = [
      { serviceType: 'vehicle', serviceName: 'Vehicle Insurance' },
      { serviceType: 'ecp', serviceName: 'Employee Compensation Policy' },
      { serviceType: 'health', serviceName: 'Health Insurance' },
      { serviceType: 'fire', serviceName: 'Fire Insurance' },
      { serviceType: 'dsc', serviceName: 'Digital Signature Certificate' },
      { serviceType: 'factory', serviceName: 'Factory License' }
    ];
    
    res.json({
      success: true,
      data: defaultServices
    });
  } catch (error) {
    console.error('Error fetching default service types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default service types'
    });
  }
};

module.exports = {
  getAllConfigs,
  getConfigByService,
  createConfig,
  updateConfig,
  deleteConfig,
  getDefaultServiceTypes
};
