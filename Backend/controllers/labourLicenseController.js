const { LabourLicense, Company } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

// Create labour license
const createLabourLicense = async (req, res) => {
  try {
    const {
      company_id,
      license_number,
      type,
      issue_date,
      expiry_date,
      status,
      remarks
    } = req.body;

    // Validate required fields
    if (!company_id || !license_number || !type || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: company_id, license_number, type, expiry_date'
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
    const labourLicense = await LabourLicense.create({
      company_id,
      license_number,
      type,
      issue_date,
      expiry_date,
      status: status || 'Active',
      remarks,
      email_service_active: true,
      created_by: req.user.user_id,
      updated_by: req.user.user_id
    });

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map(file => file.path);
      await labourLicense.update({
        documents: filePaths
      });
    }

    res.status(201).json({
      success: true,
      message: 'Labour license created successfully',
      data: labourLicense
    });
  } catch (error) {
    console.error('Error creating labour license:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating labour license',
      error: error.message
    });
  }
};

// Get all labour licenses
const getAllLabourLicenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, pageSize, search, type, status } = req.query;
    const actualLimit = parseInt(limit) || parseInt(pageSize) || 10;
    const offset = (page - 1) * actualLimit;

    let whereClause = {};

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { license_number: { [Op.like]: `%${search}%` } },
        { '$company.company_name$': { [Op.like]: `%${search}%` } }
      ];
    }

    // Add type filter
    if (type) {
      whereClause.type = type;
    }

    // Add status filter
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await LabourLicense.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_code']
        }
      ],
      limit: actualLimit,
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        currentPage: parseInt(page),
        itemsPerPage: actualLimit,
        totalPages: Math.ceil(count / actualLimit),
        total: count,
        page: parseInt(page),
        limit: actualLimit
      }
    });
  } catch (error) {
    console.error('Error fetching labour licenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching labour licenses',
      error: error.message
    });
  }
};

// Get labour license by ID
const getLabourLicenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const labourLicense = await LabourLicense.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_code']
        }
      ]
    });

    if (!labourLicense) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    res.json({
      success: true,
      data: labourLicense
    });
  } catch (error) {
    console.error('Error fetching labour license:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching labour license',
      error: error.message
    });
  }
};

// Update labour license
const updateLabourLicense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      license_number,
      type,
      issue_date,
      expiry_date,
      status,
      remarks,
      email_service_active
    } = req.body;

    const labourLicense = await LabourLicense.findByPk(id);

    if (!labourLicense) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    // Check if license number already exists (excluding current record)
    if (license_number && license_number !== labourLicense.license_number) {
      const existingLicense = await LabourLicense.findOne({
        where: { 
          license_number,
          id: { [Op.ne]: id }
        }
      });

      if (existingLicense) {
        return res.status(400).json({
          success: false,
          message: 'License number already exists'
        });
      }
    }

    // Update labour license
    await labourLicense.update({
      company_id: company_id || labourLicense.company_id,
      license_number: license_number || labourLicense.license_number,
      type: type || labourLicense.type,
      issue_date: issue_date || labourLicense.issue_date,
      expiry_date: expiry_date || labourLicense.expiry_date,
      status: status || labourLicense.status,
      remarks: remarks !== undefined ? remarks : labourLicense.remarks,
      email_service_active: email_service_active !== undefined ? email_service_active : labourLicense.email_service_active,
      updated_by: req.user.user_id
    });

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      const filePaths = req.files.map(file => file.path);
      await labourLicense.update({
        documents: filePaths
      });
    }

    res.json({
      success: true,
      message: 'Labour license updated successfully',
      data: labourLicense
    });
  } catch (error) {
    console.error('Error updating labour license:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating labour license',
      error: error.message
    });
  }
};

// Delete labour license
const deleteLabourLicense = async (req, res) => {
  try {
    const { id } = req.params;

    const labourLicense = await LabourLicense.findByPk(id);

    if (!labourLicense) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    await labourLicense.destroy();

    res.json({
      success: true,
      message: 'Labour license deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting labour license:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting labour license',
      error: error.message
    });
  }
};

// Upload labour license documents
const uploadLicenseDocuments = async (req, res) => {
  try {
    const { id } = req.params;

    const labourLicense = await LabourLicense.findByPk(id);

    if (!labourLicense) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const filePaths = req.files.map(file => file.path);
    await labourLicense.update({
      documents: filePaths,
      updated_by: req.user.user_id
    });

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      data: { documents: filePaths }
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading documents',
      error: error.message
    });
  }
};

// Send labour license reminder
const sendLabourLicenseReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const labourLicense = await LabourLicense.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_code', 'email']
        }
      ]
    });

    if (!labourLicense) {
      return res.status(404).json({
        success: false,
        message: 'Labour license not found'
      });
    }

    if (!labourLicense.company || !labourLicense.company.email) {
      return res.status(400).json({
        success: false,
        message: 'Company email not found'
      });
    }

    // Calculate days until expiry
    const today = new Date();
    const expiryDate = new Date(labourLicense.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    // Send email reminder
    const emailResult = await emailService.sendLabourLicenseReminder({
      companyName: labourLicense.company.company_name,
      companyEmail: labourLicense.company.email,
      licenseNumber: labourLicense.license_number,
      type: labourLicense.type,
      expiryDate: labourLicense.expiry_date,
      daysUntilExpiry
    });

    res.json({
      success: true,
      message: 'Reminder sent successfully',
      data: {
        emailResult,
        daysUntilExpiry
      }
    });
  } catch (error) {
    console.error('Error sending labour license reminder:', error);
    return {
      success: false,
      message: 'Failed to send reminder',
      error: error.message
    };
  }
};

// Get labour license stats overview
const getLabourLicenseStatsOverview = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysFromNow = new Date(today.getTime() + (60 * 24 * 60 * 60 * 1000));

    const totalCount = await LabourLicense.count();
    const activeCount = await LabourLicense.count({
      where: { 
        status: 'Active',
        expiry_date: { [Op.gte]: today }
      }
    });
    const expiringSoonCount = await LabourLicense.count({
      where: { 
        expiry_date: { [Op.between]: [today, thirtyDaysFromNow] }
      }
    });
    const expiredCount = await LabourLicense.count({
      where: { 
        expiry_date: { [Op.lt]: today }
      }
    });

    res.json({
      success: true,
      data: {
        total: totalCount,
        active: activeCount,
        expiringSoon: expiringSoonCount,
        expired: expiredCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching stats', error: error.message });
  }
};

module.exports = {
  createLabourLicense,
  getAllLabourLicenses,
  getLabourLicenseById,
  updateLabourLicense,
  deleteLabourLicense,
  uploadLicenseDocuments,
  sendLabourLicenseReminder,
  getLabourLicenseStatsOverview
};