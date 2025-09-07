const { LabourLicense, Company } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService'); // Added import for emailService

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
      expiry_date, 
      status,
      type,
      remarks 
    } = req.body;
    const { user } = req;
    const { files } = req;

    if (!company_id || !license_number || !expiry_date || !type) {
      return res.status(400).json({
        success: false,
        message: 'Company, license number, expiry date, and license type are required'
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

    // Prepare upload option with file information
    let uploadOption = null;
    if (files && files.length > 0) {
      uploadOption = {
        files: files.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          path: file.path
        })),
        uploadedAt: new Date().toISOString()
      };
    }

    const labourLicense = await LabourLicense.create({
      company_id,
      license_number,
      expiry_date,
      status: status || 'Active',
      type: type || 'State',
      remarks,
      upload_option: uploadOption ? JSON.stringify(uploadOption) : null,
      created_by: user.user_id
    });

    console.log('Labour license created with upload option:', uploadOption);

    res.status(201).json({
      success: true,
      message: 'Labour license created successfully',
      data: labourLicense
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
      status,
      type,
      remarks 
    } = req.body;
    const { user } = req;
    const { files } = req;

    const labourLicense = await LabourLicense.findByPk(id);
    if (!labourLicense) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    const isAdmin = user.roles.includes('Admin');
    const isCreator = labourLicense.created_by === user.user_id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this labour license'
      });
    }

    // Prepare upload option with file information if files are provided
    let uploadOption = null;
    if (files && files.length > 0) {
      uploadOption = {
        files: files.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          path: file.path
        })),
        uploadedAt: new Date().toISOString()
      };
    }

    // Update the labour license
    const updateData = {};
    if (company_id) updateData.company_id = company_id;
    if (license_number) updateData.license_number = license_number;
    if (expiry_date) updateData.expiry_date = expiry_date;
    if (status) updateData.status = status;
    if (type) updateData.type = type;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (uploadOption) updateData.upload_option = JSON.stringify(uploadOption);

    await labourLicense.update(updateData);

    console.log('Labour license updated with upload option:', uploadOption);

    res.json({
      success: true,
      message: 'Labour license updated successfully',
      data: labourLicense
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

// Upload labour license documents
exports.uploadLicenseDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { files } = req;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const labourLicense = await LabourLicense.findByPk(id);
    if (!labourLicense) {
      return res.status(404).json({
        success: false,
        message: 'Labour license record not found'
      });
    }

    const isAdmin = user.roles.includes('Admin');
    const isCreator = labourLicense.created_by === user.user_id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to upload documents for this labour license record'
      });
    }

    // Prepare upload option with file information
    let uploadOption = {
      files: files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        path: file.path
      })),
      uploadedAt: new Date().toISOString()
    };

    // Update the labour license with new upload option
    await labourLicense.update({
      upload_option: JSON.stringify(uploadOption)
    });

    console.log('Labour license documents uploaded:', uploadOption);

    res.json({
      success: true,
      message: 'Labour license documents uploaded successfully',
      data: {
        files: uploadOption.files
      }
    });
  } catch (error) {
    console.error('Error uploading labour license documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload labour license documents',
      error: error.message
    });
  }
};

// Check and manage email service status for labour license
exports.checkEmailServiceStatus = async (license) => {
  try {
    const today = new Date();
    const expiryDate = new Date(license.expiry_date);
    const daysSinceExpiry = Math.ceil((today - expiryDate) / (1000 * 60 * 60 * 24));
    
    let shouldStopEmails = false;
    let stopReason = '';
    let emailServiceActive = true;
    
    // Stop emails if status is expired
    if (license.status === 'expired') {
      shouldStopEmails = true;
      stopReason = 'Status marked as expired';
      emailServiceActive = false;
    }
    // Stop emails if expired more than 15 days ago
    else if (daysSinceExpiry > 15) {
      shouldStopEmails = true;
      stopReason = `Expired more than 15 days ago (${daysSinceExpiry} days)`;
      emailServiceActive = false;
    }
    
    // Update email service status if needed
    if (shouldStopEmails && license.email_service_active !== false) {
      await license.update({ 
        email_service_active: false,
        email_service_stopped_at: new Date(),
        email_service_stop_reason: stopReason
      });
      
      console.log(`[LabourLicense] Email service stopped for license ${license.license_id}: ${stopReason}`);
    }
    
    return {
      shouldStopEmails,
      stopReason,
      emailServiceActive,
      daysSinceExpiry
    };
  } catch (error) {
    console.error('Error checking email service status:', error);
    return {
      shouldStopEmails: false,
      stopReason: 'Error checking status',
      emailServiceActive: true,
      daysSinceExpiry: 0
    };
  }
};

// Send labour license reminder email
exports.sendLabourLicenseReminder = async (license) => {
  try {
    // Check if email service is active
    const emailStatus = await exports.checkEmailServiceStatus(license);
    
    if (!emailStatus.emailServiceActive) {
      console.log(`[LabourLicense] Email service inactive for license ${license.license_id}: ${emailStatus.stopReason}`);
      return {
        success: false,
        message: 'Email service inactive',
        reason: emailStatus.stopReason
      };
    }
    
    // Check if within reminder window (30 days before expiry)
    const today = new Date();
    const expiryDate = new Date(license.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry > 30 || daysUntilExpiry < 0) {
      return {
        success: false,
        message: 'Not within reminder window',
        daysUntilExpiry
      };
    }
    
    // Send reminder email
    const reminderData = {
      daysUntilExpiry,
      expiryDate: expiryDate.toISOString().split('T')[0],
      reminderNumber: Math.min(Math.ceil((30 - daysUntilExpiry) / 7) + 1, 3) // 1-3 reminders
    };
    
    const emailResult = await emailService.sendLabourLicenseReminder(license, reminderData);
    
    return {
      success: true,
      message: 'Reminder email sent successfully',
      emailResult,
      daysUntilExpiry
    };
    
  } catch (error) {
    console.error('Error sending labour license reminder:', error);
    return {
      success: false,
      message: 'Failed to send reminder',
      error: error.message
    };
  }
};
