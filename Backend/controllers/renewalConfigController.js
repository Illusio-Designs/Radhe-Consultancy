const { RenewalConfig, ReminderLog } = require('../models');
const { Op } = require('sequelize');

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
    const defaultTypes = [
      { serviceType: 'vehicle', serviceName: 'Vehicle Insurance', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'ecp', serviceName: 'Employee Compensation Policy', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'health', serviceName: 'Health Insurance', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'fire', serviceName: 'Fire Insurance', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'dsc', serviceName: 'Digital Signature Certificate', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'factory', serviceName: 'Factory Quotation', reminderTimes: 3, reminderDays: 30 },
      { serviceType: 'labour_inspection', serviceName: 'Labour Inspection', reminderTimes: 5, reminderDays: 15 },
      { serviceType: 'labour_license', serviceName: 'Labour License', reminderTimes: 3, reminderDays: 30 }
    ];
    
    res.json({
      success: true,
      data: defaultTypes
    });
  } catch (error) {
    console.error('Error getting default service types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get default service types'
    });
  }
};

// Get renewal logs
const getLogs = async (req, res) => {
  try {
    const logs = await ReminderLog.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching renewal logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal logs'
    });
  }
};

// Search renewal configurations and logs
const searchRenewals = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 3 characters long'
      });
    }

    const searchQuery = query.trim();
    
    // Search in configurations
    const configs = await RenewalConfig.findAll({
      where: {
        [Op.or]: [
          {
            serviceType: {
              [Op.like]: `%${searchQuery}%`
            }
          },
          {
            serviceName: {
              [Op.like]: `%${searchQuery}%`
            }
          }
        ]
      }
    });

    // Search in logs
    const logs = await ReminderLog.findAll({
      where: {
        [Op.or]: [
          {
            policy_type: {
              [Op.like]: `%${searchQuery}%`
            }
          },
          {
            client_name: {
              [Op.like]: `%${searchQuery}%`
            }
          },
          {
            status: {
              [Op.like]: `%${searchQuery}%`
            }
          }
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        configurations: configs,
        logs: logs
      }
    });
  } catch (error) {
    console.error('Error searching renewals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search renewals'
    });
  }
};

// Get renewal counts for different periods
const getCounts = async (req, res) => {
  try {
    // This is a placeholder implementation
    // You can enhance this to actually count renewals from your database
    const counts = {
      week: {
        vehicles: 0,  // Changed from vehicle to vehicles
        ecp: 0,
        health: 0,
        fire: 0,
        dsc: 0,
        factory_act: 0,  // Changed from factory to factory_act
        labour_inspection: 0,
        labour_license: 0
      },
      month: {
        vehicles: 0,  // Changed from vehicle to vehicles
        ecp: 0,
        health: 0,
        fire: 0,
        dsc: 0,
        factory_act: 0,  // Changed from factory to factory_act
        labour_inspection: 0,
        labour_license: 0
      },
      year: {
        vehicles: 0,  // Changed from vehicle to vehicles
        ecp: 0,
        health: 0,
        fire: 0,
        dsc: 0,
        factory_act: 0,  // Changed from factory to factory_act
        labour_inspection: 0,
        labour_license: 0
      }
    };
    
    res.json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Error fetching renewal counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal counts'
    });
  }
};

// Get renewals by type and period
const getListByTypeAndPeriod = async (req, res) => {
  try {
    const { type, period } = req.query;
    
    if (!type || !period) {
      return res.status(400).json({
        success: false,
        message: 'Type and period are required'
      });
    }

    // This is a placeholder implementation
    // You can enhance this to actually fetch renewals from your database
    // For now, return sample data to test the frontend
    let sampleRenewals = [];
    
    if (type === 'all') {
      // Return multiple types when 'all' is selected
      sampleRenewals = [
        {
          id: 1,
          type: 'ecp',
          holderName: 'Sample Company Ltd',
          email: 'sample@company.com',
          policy_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          company_id: 1,
          consumer_id: null,
          status: 'active'
        },
        {
          id: 2,
          type: 'health',
          holderName: 'Test Corporation',
          email: 'test@corp.com',
          policy_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
          company_id: 2,
          consumer_id: null,
          status: 'active'
        },
        {
          id: 3,
          type: 'vehicles',
          holderName: 'Auto Company',
          email: 'auto@company.com',
          policy_end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
          company_id: 3,
          consumer_id: null,
          status: 'active'
        },
        {
          id: 4,
          type: 'fire',
          holderName: 'Safety Corp',
          email: 'safety@corp.com',
          policy_end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
          company_id: 4,
          consumer_id: null,
          status: 'active'
        }
      ];
    } else {
      // Return specific type data
      sampleRenewals = [
        {
          id: 1,
          type: type,
          holderName: `${type.toUpperCase()} Company`,
          email: `${type}@company.com`,
          policy_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          company_id: 1,
          consumer_id: null,
          status: 'active'
        }
      ];
    }
    
    res.json({
      success: true,
      data: sampleRenewals
    });
  } catch (error) {
    console.error('Error fetching renewals by type and period:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewals by type and period'
    });
  }
};

module.exports = {
  getAllConfigs,
  getConfigByService,
  createConfig,
  updateConfig,
  deleteConfig,
  getDefaultServiceTypes,
  getLogs,
  searchRenewals,
  getCounts,
  getListByTypeAndPeriod
};
