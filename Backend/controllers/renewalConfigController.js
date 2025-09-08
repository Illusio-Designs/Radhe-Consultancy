const { RenewalConfig, LabourInspection, LabourLicense, VehiclePolicy, EmployeeCompensationPolicy, HealthPolicies, FirePolicy, DSC } = require('../models');
const { Op } = require('sequelize');
const FactoryQuotation = require('../models/factoryQuotationModel');

// Get all renewal configurations
const getAllConfigs = async (req, res) => {
  try {
    const configs = await RenewalConfig.findAll({
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('Error fetching renewal configs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching renewal configurations',
      error: error.message
    });
  }
};

// Get renewal config by service type
const getConfigByService = async (req, res) => {
  try {
    const { serviceType } = req.params;

    const config = await RenewalConfig.findOne({
      where: { serviceType }
    });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Renewal configuration not found'
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
      message: 'Error fetching renewal configuration',
      error: error.message
    });
  }
};

// Create renewal configuration
const createConfig = async (req, res) => {
  try {
    const {
      serviceType,
      serviceName,
      reminderTimes,
      reminderDays,
      reminderIntervals,
      isActive
    } = req.body;
    
    // Validate required fields
    if (!serviceType || !serviceName || !reminderTimes || !reminderDays) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: serviceType, serviceName, reminderTimes, reminderDays'
      });
    }
    
    // Check if service type already exists
    const existingConfig = await RenewalConfig.findOne({
      where: { serviceType }
    });
    
    if (existingConfig) {
      return res.status(400).json({
        success: false,
        message: 'Service type already exists'
      });
    }
    
    const config = await RenewalConfig.create({
      serviceType,
      serviceName,
      reminderTimes,
      reminderDays,
      reminderIntervals: reminderIntervals || (serviceType === 'labour_inspection' ? [15, 10, 7, 3, 1] : [30, 21, 14, 7, 1]),
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.user_id,
      updatedBy: req.user.user_id
    });
    
    res.status(201).json({
      success: true,
      message: 'Renewal configuration created successfully',
      data: config
    });
  } catch (error) {
    console.error('Error creating renewal config:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating renewal configuration',
      error: error.message
    });
  }
};

// Update renewal configuration
const updateConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      serviceType,
      serviceName,
      reminderTimes,
      reminderDays,
      reminderIntervals,
      isActive
    } = req.body;
    
    const config = await RenewalConfig.findByPk(id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Renewal configuration not found'
      });
    }

    // Check if service type already exists (excluding current record)
    if (serviceType && serviceType !== config.serviceType) {
      const existingConfig = await RenewalConfig.findOne({
        where: { 
          serviceType,
          id: { [Op.ne]: id }
        }
      });

      if (existingConfig) {
        return res.status(400).json({
          success: false,
          message: 'Service type already exists'
        });
      }
    }

    await config.update({
      serviceType: serviceType || config.serviceType,
      serviceName: serviceName || config.serviceName,
      reminderTimes: reminderTimes !== undefined ? reminderTimes : config.reminderTimes,
      reminderDays: reminderDays !== undefined ? reminderDays : config.reminderDays,
      reminderIntervals: reminderIntervals !== undefined ? reminderIntervals : config.reminderIntervals,
      isActive: isActive !== undefined ? isActive : config.isActive,
      updatedBy: req.user.user_id
    });
    
    res.json({
      success: true,
      message: 'Renewal configuration updated successfully',
      data: config
    });
  } catch (error) {
    console.error('Error updating renewal config:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating renewal configuration',
      error: error.message
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
        message: 'Renewal configuration not found'
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
      message: 'Error deleting renewal configuration',
      error: error.message
    });
  }
};

// Helper function for Labour Inspection live data
const getLabourInspectionLiveData = async (config, today) => {
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(endOfWeek.getDate() + 1);
  
  const endOfNextWeek = new Date(startOfNextWeek);
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [upcomingCount, expiringThisWeek, expiringNextWeek, expiringThisMonth] = await Promise.all([
    // Upcoming renewals (within reminder window)
    LabourInspection.count({
      where: {
        expiry_date: {
          [Op.gte]: today,
          [Op.lte]: new Date(today.getTime() + (config.reminderDays * 24 * 60 * 60 * 1000))
        }
      }
    }),
    
    // Expiring this week
    LabourInspection.count({
      where: {
        expiry_date: {
          [Op.between]: [startOfWeek, endOfWeek]
        }
      }
    }),
    
    // Expiring next week
    LabourInspection.count({
      where: {
        expiry_date: {
          [Op.between]: [startOfNextWeek, endOfNextWeek]
        }
      }
    }),
    
    // Expiring this month
    LabourInspection.count({
      where: {
        expiry_date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    })
  ]);

  return {
    upcomingCount,
    expiringThisWeek,
    expiringNextWeek,
    expiringThisMonth
  };
};

// Helper function for Labour License live data
const getLabourLicenseLiveData = async (config, today) => {
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(endOfWeek.getDate() + 1);
  
  const endOfNextWeek = new Date(startOfNextWeek);
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [upcomingCount, expiringThisWeek, expiringNextWeek, expiringThisMonth] = await Promise.all([
    // Upcoming renewals (within reminder window)
    LabourLicense.count({
      where: {
        expiry_date: {
          [Op.gte]: today,
          [Op.lte]: new Date(today.getTime() + (config.reminderDays * 24 * 60 * 60 * 1000))
        }
      }
    }),
    
    // Expiring this week
    LabourLicense.count({
      where: {
        expiry_date: {
          [Op.between]: [startOfWeek, endOfWeek]
        }
      }
    }),
    
    // Expiring next week
    LabourLicense.count({
      where: {
        expiry_date: {
          [Op.between]: [startOfNextWeek, endOfNextWeek]
        }
      }
    }),
    
    // Expiring this month
    LabourLicense.count({
      where: {
        expiry_date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    })
  ]);

  return {
    upcomingCount,
    expiringThisWeek,
    expiringNextWeek,
    expiringThisMonth
  };
};

// Helper function for Vehicle Policy live data
const getVehiclePolicyLiveData = async (config, today) => {
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const startOfNextWeek = new Date(endOfWeek);
  startOfNextWeek.setDate(endOfWeek.getDate() + 1);
  
  const endOfNextWeek = new Date(startOfNextWeek);
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [upcomingCount, expiringThisWeek, expiringNextWeek, expiringThisMonth] = await Promise.all([
    // Upcoming renewals (within reminder window)
    VehiclePolicy.count({
      where: {
        policy_end_date: {
          [Op.gte]: today,
          [Op.lte]: new Date(today.getTime() + (config.reminderDays * 24 * 60 * 60 * 1000))
        }
      }
    }),
    
    // Expiring this week
    VehiclePolicy.count({
      where: {
        policy_end_date: {
          [Op.between]: [startOfWeek, endOfWeek]
        }
      }
    }),
    
    // Expiring next week
    VehiclePolicy.count({
      where: {
        policy_end_date: {
          [Op.between]: [startOfNextWeek, endOfNextWeek]
        }
      }
    }),
    
    // Expiring this month
    VehiclePolicy.count({
      where: {
        policy_end_date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      }
    })
  ]);

  return {
    upcomingCount,
    expiringThisWeek,
    expiringNextWeek,
    expiringThisMonth
  };
};

// Helper function to get policy counts for different service types
const getPolicyCount = async (config, today, dateField, days = null) => {
  let Model;
  
  // Map service types to models
  switch (config.serviceType) {
    case 'ecp':
      Model = EmployeeCompensationPolicy;
      break;
    case 'health':
      Model = HealthPolicies;
      break;
    case 'fire':
      Model = FirePolicy;
      break;
    case 'dsc':
      Model = DSC;
      break;
    case 'factory':
      Model = FactoryQuotation;
      break;
    default:
      return 0;
  }

  if (days) {
    const endDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
    return await Model.count({
      where: {
        [dateField]: {
          [Op.between]: [today, endDate]
        }
      }
    });
  } else {
    return await Model.count({
      where: {
        [dateField]: {
          [Op.gte]: today,
          [Op.lte]: new Date(today.getTime() + (config.reminderDays * 24 * 60 * 60 * 1000))
        }
      }
    });
  }
};

// Get live renewal counts and upcoming renewals for dashboard
const getLiveRenewalData = async (req, res) => {
  try {
    const today = new Date();
    
    // Get all active renewal configs (exclude reminderIntervals if column doesn't exist)
    const configs = await RenewalConfig.findAll({
      where: { isActive: true },
      attributes: {
        exclude: ['reminderIntervals'] // Temporarily exclude this field
      }
    });

    const liveData = {};

    for (const config of configs) {
      try {
        let upcomingCount = 0;
        let expiringThisWeek = 0;
        let expiringNextWeek = 0;
        let expiringThisMonth = 0;

        switch (config.serviceType) {
          case 'labour_inspection':
            const inspectionData = await getLabourInspectionLiveData(config, today);
            upcomingCount = inspectionData.upcomingCount;
            expiringThisWeek = inspectionData.expiringThisWeek;
            expiringNextWeek = inspectionData.expiringNextWeek;
            expiringThisMonth = inspectionData.expiringThisMonth;
            break;

          case 'labour_license':
            const licenseData = await getLabourLicenseLiveData(config, today);
            upcomingCount = licenseData.upcomingCount;
            expiringThisWeek = licenseData.expiringThisWeek;
            expiringNextWeek = licenseData.expiringNextWeek;
            expiringThisMonth = licenseData.expiringThisMonth;
            break;

          case 'vehicle':
            const vehicleData = await getVehiclePolicyLiveData(config, today);
            upcomingCount = vehicleData.upcomingCount;
            expiringThisWeek = vehicleData.expiringThisWeek;
            expiringNextWeek = vehicleData.expiringNextWeek;
            expiringThisMonth = vehicleData.expiringThisMonth;
            break;

          case 'ecp':
          case 'health':
          case 'fire':
            // These use policy_end_date
            upcomingCount = await getPolicyCount(config, today, 'policy_end_date');
            expiringThisWeek = await getPolicyCount(config, today, 'policy_end_date', 7);
            expiringNextWeek = await getPolicyCount(config, today, 'policy_end_date', 14);
            expiringThisMonth = await getPolicyCount(config, today, 'policy_end_date', 30);
            break;

          case 'dsc':
            // DSC uses expiry_date
            upcomingCount = await getPolicyCount(config, today, 'expiry_date');
            expiringThisWeek = await getPolicyCount(config, today, 'expiry_date', 7);
            expiringNextWeek = await getPolicyCount(config, today, 'expiry_date', 14);
            expiringThisMonth = await getPolicyCount(config, today, 'expiry_date', 30);
            break;

          case 'factory':
            // Factory uses renewal_date
            upcomingCount = await getPolicyCount(config, today, 'renewal_date');
            expiringThisWeek = await getPolicyCount(config, today, 'renewal_date', 7);
            expiringNextWeek = await getPolicyCount(config, today, 'renewal_date', 14);
            expiringThisMonth = await getPolicyCount(config, today, 'renewal_date', 30);
            break;
        }

        liveData[config.serviceType] = {
          serviceName: config.serviceName,
          upcomingCount,
          expiringThisWeek,
          expiringNextWeek,
          expiringThisMonth,
          reminderDays: config.reminderDays,
          reminderTimes: config.reminderTimes,
          reminderIntervals: config.reminderIntervals || (config.serviceType === 'labour_inspection' ? [15, 10, 7, 3, 1] : [30, 21, 14, 7, 1])
        };

      } catch (error) {
        console.error(`Error getting live data for ${config.serviceType}:`, error);
        liveData[config.serviceType] = {
          serviceName: config.serviceName,
          upcomingCount: 0,
          expiringThisWeek: 0,
          expiringNextWeek: 0,
          expiringThisMonth: 0,
          error: error.message
        };
      }
    }

    res.json({
      success: true,
      data: liveData
    });
  } catch (error) {
    console.error('Error fetching live renewal data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching live renewal data',
      error: error.message
    });
  }
};

// Get default service types
const getDefaultServiceTypes = async (req, res) => {
  try {
    const serviceTypes = [
      { value: 'vehicle', label: 'Vehicle Insurance' },
      { value: 'ecp', label: 'Employee Compensation Policy' },
      { value: 'health', label: 'Health Insurance' },
      { value: 'fire', label: 'Fire Insurance' },
      { value: 'dsc', label: 'Digital Signature Certificate' },
      { value: 'factory', label: 'Factory Quotation' },
      { value: 'labour_inspection', label: 'Labour Inspection' },
      { value: 'labour_license', label: 'Labour License' }
    ];
    
    res.json({
      success: true,
      data: serviceTypes
    });
  } catch (error) {
    console.error('Error fetching service types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service types',
      error: error.message
    });
  }
};

// Get renewal logs
const getLogs = async (req, res) => {
  try {
    // This would typically fetch from a logs table
    res.json({
      success: true,
      data: [],
      message: 'Logs functionality not implemented yet'
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching logs',
      error: error.message
    });
  }
};

// Get renewal counts
const getCounts = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    const counts = {
      total: 0,
      upcoming: 0,
      expiringThisWeek: 0,
      expiringThisMonth: 0
    };

    // Get counts from all service types
    const [labourInspectionCount, labourLicenseCount, vehicleCount] = await Promise.all([
      LabourInspection.count(),
      LabourLicense.count(),
      VehiclePolicy.count()
    ]);

    counts.total = labourInspectionCount + labourLicenseCount + vehicleCount;
    
    res.json({
      success: true,
      data: counts
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counts',
      error: error.message
    });
  }
};

// Get renewal list by type and period
const getListByTypeAndPeriod = async (req, res) => {
  try {
    const { type, period } = req.query;
    
    res.json({
      success: true,
      data: [],
      message: 'List functionality not fully implemented yet'
    });
  } catch (error) {
    console.error('Error fetching renewal list:', error);
    res.status(500).json({
        success: false,
      message: 'Error fetching renewal list',
      error: error.message
    });
  }
};

// Search renewals
const searchRenewals = async (req, res) => {
  try {
    const { q } = req.query;

    res.json({
      success: true,
      data: [],
      message: 'Search functionality not fully implemented yet'
    });
  } catch (error) {
    console.error('Error searching renewals:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching renewals',
      error: error.message
    });
  }
};

module.exports = {
  getAllConfigs,
  getConfigByService,
  createConfig,
  updateConfig,
  deleteConfig,
  getLiveRenewalData,
  getDefaultServiceTypes,
  getLogs,
  getCounts,
  getListByTypeAndPeriod,
  searchRenewals,
  getLabourInspectionLiveData,
  getLabourLicenseLiveData,
  getVehiclePolicyLiveData
};
