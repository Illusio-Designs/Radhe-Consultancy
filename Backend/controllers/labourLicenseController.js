const { LabourLicense, Company } = require('../models');
const { Op } = require('sequelize');

// Get all labour licenses with pagination and filters
exports.getAllLabourLicenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, company_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    // Apply filters
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (company_id) {
      whereClause.company_id = company_id;
    }

    const { count, rows: licenses } = await LabourLicense.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: licenses,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching labour licenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch labour licenses',
      error: error.message
    });
  }
};

// Get labour license by ID
exports.getLabourLicenseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const license = await LabourLicense.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        }
      ]
    });

    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    res.json({
      success: true,
      data: license
    });
  } catch (error) {
    console.error('Error fetching labour license:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch labour license',
      error: error.message
    });
  }
};

// Get labour licenses by company
exports.getLabourLicensesByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    
    const licenses = await LabourLicense.findAll({
      where: { company_id },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: licenses
    });
  } catch (error) {
    console.error('Error fetching company labour licenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company labour licenses',
      error: error.message
    });
  }
};

// Create new labour license
exports.createLabourLicense = async (req, res) => {
  try {
    const {
      company_id,
      license_number,
      expiry_date
    } = req.body;

    // Validate required fields
    if (!company_id || !license_number || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, license number, and expiry date are required'
      });
    }

    // Check if license number already exists
    const existingLicense = await LabourLicense.findOne({
      where: { license_number }
    });

    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'License number already exists'
      });
    }

    // Create labour license
    const license = await LabourLicense.create({
      company_id,
      license_number,
      expiry_date,
      status: 'active'
    });

    // Fetch the created license with company details
    const createdLicense = await LabourLicense.findByPk(license.license_id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Labour license created successfully',
      data: createdLicense
    });
  } catch (error) {
    console.error('Error creating labour license:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create labour license',
      error: error.message
    });
  }
};

// Update labour license
exports.updateLabourLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      license_number,
      expiry_date,
      status
    } = req.body;

    const license = await LabourLicense.findByPk(id);
    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    // Check if license number already exists (if changed)
    if (license_number && license_number !== license.license_number) {
      const existingLicense = await LabourLicense.findOne({
        where: { 
          license_number,
          license_id: { [Op.ne]: id }
        }
      });

      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: 'License number already exists'
        });
      }
    }

    // Update license
    await license.update({
      company_id: company_id || license.company_id,
      license_number: license_number || license.license_number,
      expiry_date: expiry_date || license.expiry_date,
      status: status || license.status
    });

    // Fetch updated license with company details
    const updatedLicense = await LabourLicense.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Labour license updated successfully',
      data: updatedLicense
    });
  } catch (error) {
    console.error('Error updating labour license:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update labour license',
      error: error.message
    });
  }
};

// Update labour license status
exports.updateLabourLicenseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const license = await LabourLicense.findByPk(id);
    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    await license.update({
      status
    });

    res.json({
      success: true,
      message: 'Labour license status updated successfully',
      data: { license_id: id, status }
    });
  } catch (error) {
    console.error('Error updating labour license status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update labour license status',
      error: error.message
    });
  }
};

// Delete labour license
exports.deleteLabourLicense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const license = await LabourLicense.findByPk(id);
    if (!license) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    await license.destroy();

    res.json({
      success: true,
      message: 'Labour license deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting labour license:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete labour license',
      error: error.message
    });
  }
};

// Search labour licenses
exports.searchLabourLicenses = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 3 characters long'
      });
    }

    const searchQuery = query.trim();
    
    const licenses = await LabourLicense.findAll({
      where: {
        [Op.or]: [
          {
            '$company.company_name$': {
              [Op.like]: `%${searchQuery}%`
            }
          },
          {
            license_number: {
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
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: licenses
    });
  } catch (error) {
    console.error('Error searching labour licenses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search labour licenses',
      error: error.message
    });
  }
};

// Get labour license statistics
exports.getLabourLicenseStats = async (req, res) => {
  try {
    const totalLicenses = await LabourLicense.count();
    
    const statusStats = await LabourLicense.findAll({
      attributes: [
        'status',
        [LabourLicense.sequelize.fn('COUNT', LabourLicense.sequelize.col('license_id')), 'count']
      ],
      group: ['status']
    });

    const expiringSoon = await LabourLicense.count({
      where: {
        expiry_date: {
          [Op.between]: [
            new Date(),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          ]
        },
        status: 'active'
      }
    });

    const expiredCount = await LabourLicense.count({
      where: {
        status: 'expired'
      }
    });

    const stats = {
      total: totalLicenses,
      expiringSoon,
      expired: expiredCount,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.dataValues.count);
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching labour license statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch labour license statistics',
      error: error.message
    });
  }
};
