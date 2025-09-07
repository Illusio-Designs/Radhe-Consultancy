const { LabourInspection, Company, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const EmailService = require('../services/emailService');

const emailService = new EmailService();

// Create new labour inspection
const createLabourInspection = async (req, res) => {
  try {
    const {
      company_id,
      document_upload,
      document_name,
      date_of_notice,
      officer_name,
      remarks
    } = req.body;

    // Validate required fields
    if (!company_id || !date_of_notice || !officer_name) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, date of notice, and officer name are required'
      });
    }

    // Check if company exists
    const company = await Company.findByPk(company_id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Calculate expiry date as fallback (15 days after date of notice)
    const noticeDate = new Date(date_of_notice);
    const expiryDate = new Date(noticeDate);
    expiryDate.setDate(expiryDate.getDate() + 15);

    console.log('[LabourInspection] Creating with dates:', {
      date_of_notice: date_of_notice,
      calculated_expiry_date: expiryDate.toISOString().split('T')[0]
    });

    // Create labour inspection with explicit expiry_date
    const labourInspection = await LabourInspection.create({
      company_id,
      document_upload,
      document_name,
      date_of_notice,
      expiry_date: expiryDate.toISOString().split('T')[0], // Explicitly set expiry_date
      officer_name,
      remarks,
      created_by: req.user.user_id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Labour inspection created successfully',
      data: labourInspection
    });
  } catch (error) {
    console.error('Error creating labour inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all labour inspections with pagination and filters
const getAllLabourInspections = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await LabourInspection.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_code']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching labour inspections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch labour inspections',
      error: error.message
    });
  }
};

// Search labour inspections
const searchLabourInspections = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 3 characters long'
      });
    }

    const searchQuery = query.trim();
    
            const inspections = await LabourInspection.findAll({
          where: {
            [Op.or]: [
              {
                '$company.company_name$': {
                  [Op.like]: `%${searchQuery}%`
                }
              },
              {
                officer_name: {
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
          attributes: ['company_id', 'company_name', 'company_code']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'username']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: inspections
    });
  } catch (error) {
    console.error('Error searching labour inspections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search labour inspections',
      error: error.message
    });
  }
};

// Get labour inspection by ID
const getLabourInspectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const labourInspection = await LabourInspection.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['company_id', 'company_name', 'company_code', 'owner_name', 'company_address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'username']
        },
        {
          model: User,
          as: 'updater',
          attributes: ['user_id', 'username']
        }
      ]
    });

    if (!labourInspection) {
      return res.status(404).json({
        success: false,
        message: 'Labour inspection not found'
      });
    }

    res.json({
      success: true,
      data: labourInspection
    });
  } catch (error) {
    console.error('Error fetching labour inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update labour inspection
const updateLabourInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_id,
      document_upload,
      document_name,
      date_of_notice,
      officer_name,
      remarks,
      status,
      email_service_active
    } = req.body;

    // Find the labour inspection
    const labourInspection = await LabourInspection.findByPk(id);
    if (!labourInspection) {
      return res.status(404).json({
        success: false,
        message: 'Labour inspection not found'
      });
    }

    // Check if email service should be stopped
    let shouldStopEmails = false;
    let stopReason = '';
    
    if (status === 'complete') {
      shouldStopEmails = true;
      stopReason = 'Status marked as complete';
    } else if (labourInspection.expiry_date) {
      const expiryDate = new Date(labourInspection.expiry_date);
      const today = new Date();
      const daysSinceExpiry = Math.ceil((today - expiryDate) / (1000 * 60 * 60 * 24));
      
      if (daysSinceExpiry > 15) {
        shouldStopEmails = true;
        stopReason = `Expired more than 15 days ago (${daysSinceExpiry} days)`;
      }
    }

    // Prepare update data
    const updateData = {
      company_id,
      document_upload,
      document_name,
      date_of_notice,
      officer_name,
      remarks,
      status,
      email_service_active: !shouldStopEmails // Stop email service if conditions are met
    };

    // If date_of_notice is being updated, recalculate expiry_date
    if (date_of_notice && date_of_notice !== labourInspection.date_of_notice) {
      const noticeDate = new Date(date_of_notice);
      const expiryDate = new Date(noticeDate);
      expiryDate.setDate(expiryDate.getDate() + 15);
      updateData.expiry_date = expiryDate.toISOString().split('T')[0];
      
      console.log('[LabourInspection] Updating with new dates:', {
        old_date: labourInspection.date_of_notice,
        new_date: date_of_notice,
        new_expiry_date: updateData.expiry_date
      });
    }

    // Update the labour inspection
    await labourInspection.update(updateData);

    // Log email service status
    if (shouldStopEmails) {
      console.log(`[LabourInspection] Email service stopped for inspection ${id}: ${stopReason}`);
    }

    res.json({
      success: true,
      message: 'Labour inspection updated successfully',
      data: labourInspection,
      emailServiceStopped: shouldStopEmails,
      stopReason: shouldStopEmails ? stopReason : null
    });
  } catch (error) {
    console.error('Error updating labour inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete labour inspection
const deleteLabourInspection = async (req, res) => {
  try {
    const { id } = req.params;

    const labourInspection = await LabourInspection.findByPk(id);
    if (!labourInspection) {
      return res.status(404).json({
        success: false,
        message: 'Labour inspection not found'
      });
    }

    await labourInspection.destroy();

    res.json({
      success: true,
      message: 'Labour inspection deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting labour inspection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get labour inspections by company ID
const getLabourInspectionsByCompany = async (req, res) => {
  try {
    const { company_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // Check if company exists
    const company = await Company.findByPk(company_id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const { count, rows } = await LabourInspection.findAndCountAll({
      where: { company_id },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['user_id', 'username']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_records: count,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching company labour inspections:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get labour inspection statistics
const getLabourInspectionStats = async (req, res) => {
  try {
    const stats = await LabourInspection.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('inspection_id')), 'count']
      ],
      group: ['status']
    });

    const totalCount = await LabourInspection.count();
    const pendingCount = await LabourInspection.count({ where: { status: 'pending' } });
    const runningCount = await LabourInspection.count({ where: { status: 'running' } });
    const completeCount = await LabourInspection.count({ where: { status: 'complete' } });

    res.json({
      success: true,
      data: {
        total: totalCount,
        pending: pendingCount,
        running: runningCount,
        complete: completeCount,
        breakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching labour inspection stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createLabourInspection,
  getAllLabourInspections,
  searchLabourInspections,
  getLabourInspectionById,
  updateLabourInspection,
  deleteLabourInspection,
  getLabourInspectionsByCompany,
  getLabourInspectionStats
};
