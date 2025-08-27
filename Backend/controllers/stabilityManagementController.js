const StabilityManagement = require('../models/stabilityManagementModel');
const FactoryQuotation = require('../models/factoryQuotationModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const UserRole = require('../models/userRoleModel');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Get stability managers (users with Stability_manager role)
const getStabilityManagers = async (req, res) => {
  try {
    const stabilityManagerRole = await Role.findOne({
      where: { role_name: 'Stability_manager' }
    });

    if (!stabilityManagerRole) {
      return res.status(404).json({
        success: false,
        message: 'Stability_manager role not found'
      });
    }

    const stabilityManagers = await User.findAll({
      include: [{
        model: Role,
        as: 'roles',
        through: UserRole,
        where: { role_name: 'Stability_manager' }
      }],
      attributes: ['user_id', 'username', 'email']
    });

    res.json({
      success: true,
      data: stabilityManagers
    });
  } catch (error) {
    console.error('Error fetching stability managers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stability managers',
      error: error.message
    });
  }
};

// Get all stability management records (Admin can see all, Stability Manager sees only their own)
const getAllStabilityManagement = async (req, res) => {
  try {
    const { user } = req;
    const isAdmin = user.roles.includes('Admin');
    const isStabilityManager = user.roles.includes('Stability_manager');

    let whereClause = {};
    
    // If user is stability manager, only show their assigned records
    if (isStabilityManager && !isAdmin) {
      whereClause.stability_manager_id = user.user_id;
    }

    const stabilityRecords = await StabilityManagement.findAll({
      where: whereClause,
      attributes: ['id', 'factory_quotation_id', 'stability_manager_id', 'status', 'load_type', 'stability_date', 'renewal_date', 'remarks', 'files', 'submitted_at', 'reviewed_at', 'reviewed_by', 'created_at', 'updated_at'],
      include: [
        {
          model: FactoryQuotation,
          as: 'factoryQuotation',
          attributes: ['id', 'companyName', 'companyAddress', 'email', 'phone']
        },
        {
          model: User,
          as: 'stabilityManager',
          attributes: ['user_id', 'username', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['user_id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Stability records found:', stabilityRecords.length);
    if (stabilityRecords.length > 0) {
      console.log('First record created_at:', stabilityRecords[0].created_at);
      console.log('First record createdAt:', stabilityRecords[0].createdAt);
    }

    res.json({
      success: true,
      data: stabilityRecords
    });
  } catch (error) {
    console.error('Error fetching stability management records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stability management records',
      error: error.message
    });
  }
};

// Search stability management records
const searchStabilityManagement = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 3 characters long'
      });
    }

    const searchQuery = query.trim();
    let whereClause = {};
    
    // Role-based filtering
    if (req.user.roles) {
      const userRoles = req.user.roles.map(role => role.role_name);
      const isStabilityManager = userRoles.includes('Stability_manager');
      const isAdmin = userRoles.includes('Admin');
      
      if (!isStabilityManager && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only Stability Managers and Admins can search stability records.'
        });
      }
      
      // Stability managers can only see their own records
      if (isStabilityManager && !isAdmin) {
        whereClause.stability_manager_id = req.user.user_id;
      }
    }

    const stabilityRecords = await StabilityManagement.findAll({
      where: {
        ...whereClause,
        [Op.or]: [
          {
            '$factoryQuotation.companyName$': {
              [Op.like]: `%${searchQuery}%`
            }
          },
          {
            status: {
              [Op.like]: `%${searchQuery}%`
            }
          },
          {
            '$stabilityManager.username$': {
              [Op.like]: `%${searchQuery}%`
            }
          }
        ]
      },
      include: [
        {
          model: FactoryQuotation,
          as: 'factoryQuotation',
          attributes: ['id', 'companyName', 'status']
        },
        {
          model: User,
          as: 'stabilityManager',
          attributes: ['user_id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: stabilityRecords });
  } catch (error) {
    console.error('Error searching stability management:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search stability management',
      error: error.message
    });
  }
};

// Get stability management by factory quotation ID
const getStabilityManagementByQuotationId = async (req, res) => {
  try {
    const { quotationId } = req.params;

    const stabilityRecord = await StabilityManagement.findOne({
      where: { factory_quotation_id: quotationId },
      include: [
        {
          model: FactoryQuotation,
          as: 'factoryQuotation'
        },
        {
          model: User,
          as: 'stabilityManager',
          attributes: ['user_id', 'username', 'email']
        }
      ]
    });

    if (!stabilityRecord) {
      return res.status(404).json({
        success: false,
        message: 'Stability management record not found'
      });
    }

    res.json({
      success: true,
      data: stabilityRecord
    });
  } catch (error) {
    console.error('Error fetching stability management record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stability management record',
      error: error.message
    });
  }
};

// Create stability management (assign to stability manager) - Admin and Compliance Manager only
const createStabilityManagement = async (req, res) => {
  try {
    const { factory_quotation_id, stability_manager_id, load_type } = req.body;
    const { user } = req;

    // Validate required fields
    if (!factory_quotation_id || !stability_manager_id || !load_type) {
      return res.status(400).json({
        success: false,
        message: 'Factory quotation ID, stability manager ID, and load type are required'
      });
    }

    // Validate load type
    if (!['with_load', 'without_load'].includes(load_type)) {
      return res.status(400).json({
        success: false,
        message: 'Load type must be either "with_load" or "without_load"'
      });
    }

    // Check if factory quotation exists
    const factoryQuotation = await FactoryQuotation.findByPk(factory_quotation_id);
    if (!factoryQuotation) {
      return res.status(404).json({
        success: false,
        message: 'Factory quotation not found'
      });
    }

    // Check if stability manager exists and has the correct role
    const stabilityManager = await User.findOne({
      where: { user_id: stability_manager_id },
      include: [{
        model: Role,
        as: 'roles',
        through: UserRole,
        where: { role_name: 'Stability_manager' }
      }]
    });

    if (!stabilityManager) {
      return res.status(404).json({
        success: false,
        message: 'Stability manager not found or does not have the correct role'
      });
    }

    // Check if stability management already exists for this quotation
    const existingRecord = await StabilityManagement.findOne({
      where: { factory_quotation_id }
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Stability management already exists for this factory quotation'
      });
    }

    // Create stability management record
    const stabilityManagement = await StabilityManagement.create({
      factory_quotation_id,
      stability_manager_id,
      load_type,
      status: 'stability'
    });

    // Update factory quotation status to 'stability'
    await factoryQuotation.update({ status: 'stability' });

    res.status(201).json({
      success: true,
      message: 'Stability management created successfully',
      data: stabilityManagement
    });
  } catch (error) {
    console.error('Error creating stability management:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create stability management',
      error: error.message
    });
  }
};

// Update stability status (Stability Manager only)
const updateStabilityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, stability_date } = req.body;
    const { user } = req;

    // Validate status
    if (!['stability', 'submit', 'Approved', 'Reject'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "stability", "submit", "Approved", or "Reject"'
      });
    }

    // Find the stability management record
    const stabilityManagement = await StabilityManagement.findByPk(id);
    if (!stabilityManagement) {
      return res.status(404).json({
        success: false,
        message: 'Stability management record not found'
      });
    }

    // Check if user is the assigned stability manager or admin
    const isAdmin = user.roles.includes('Admin');
    const isAssignedManager = stabilityManagement.stability_manager_id === user.user_id;

    if (!isAdmin && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this stability management record'
      });
    }

    // Update the record
    const updateData = { status };
    
    if (status === 'submit') {
      updateData.submitted_at = new Date();
    } else if (['Approved', 'Reject'].includes(status)) {
      updateData.reviewed_at = new Date();
      updateData.reviewed_by = user.user_id;
    }

    if (remarks) {
      updateData.remarks = remarks;
    }

    // Handle stability date when status is Approved
    if (status === 'Approved' && stability_date) {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(stability_date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      // Calculate renewal date (5 years after stability date)
      const stabilityDate = new Date(stability_date);
      const renewalDate = new Date(stabilityDate);
      renewalDate.setFullYear(renewalDate.getFullYear() + 5);

      updateData.stability_date = stability_date;
      updateData.renewal_date = renewalDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    await stabilityManagement.update(updateData);

    res.json({
      success: true,
      message: 'Stability status updated successfully',
      data: stabilityManagement
    });
  } catch (error) {
    console.error('Error updating stability status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stability status',
      error: error.message
    });
  }
};

// Update stability dates (Stability Manager only)
const updateStabilityDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { stability_date } = req.body;
    const { user } = req;

    // Validate stability date
    if (!stability_date) {
      return res.status(400).json({
        success: false,
        message: 'Stability date is required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(stability_date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Find the stability management record
    const stabilityManagement = await StabilityManagement.findByPk(id);
    if (!stabilityManagement) {
      return res.status(404).json({
        success: false,
        message: 'Stability management record not found'
      });
    }

    // Check if user is the assigned stability manager or admin
    const isAdmin = user.roles.includes('Admin');
    const isAssignedManager = stabilityManagement.stability_manager_id === user.user_id;

    if (!isAdmin && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this stability management record'
      });
    }

    // Calculate renewal date (5 years after stability date)
    const stabilityDate = new Date(stability_date);
    const renewalDate = new Date(stabilityDate);
    renewalDate.setFullYear(renewalDate.getFullYear() + 5);

    // Update the record
    await stabilityManagement.update({
      stability_date: stability_date,
      renewal_date: renewalDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
    });

    res.json({
      success: true,
      message: 'Stability dates updated successfully',
      data: {
        ...stabilityManagement.toJSON(),
        renewal_date: renewalDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error updating stability dates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stability dates',
      error: error.message
    });
  }
};

// Upload files for stability (Stability Manager and Admin only)
const uploadStabilityFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const isStabilityManager = user.roles.includes('Stability_manager');
    const isAdmin = user.roles.includes('Admin');

    if (!isStabilityManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only stability managers and admins can upload files'
      });
    }

    // Build where clause - admin can upload files for any stability record, stability manager only their own
    const whereClause = { id };
    if (isStabilityManager && !isAdmin) {
      whereClause.stability_manager_id = user.user_id;
    }

    const stabilityManagement = await StabilityManagement.findOne({ where: whereClause });

    if (!stabilityManagement) {
      return res.status(404).json({
        success: false,
        message: 'Stability management record not found'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    // Process uploaded files
    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));

    // Get existing files or initialize empty array
    const existingFiles = stabilityManagement.files ? JSON.parse(stabilityManagement.files) : [];
    const updatedFiles = [...existingFiles, ...uploadedFiles];

    // Update stability management with new files and status
    await stabilityManagement.update({
      files: JSON.stringify(updatedFiles),
      status: 'Approved', // Update status to Approved when files are uploaded
      reviewed_at: new Date(),
      reviewed_by: user.user_id
    });

    res.json({
      success: true,
      message: 'Files uploaded and stability approved successfully',
      data: {
        uploadedFiles,
        totalFiles: updatedFiles.length,
        status: 'Approved'
      }
    });
  } catch (error) {
    console.error('Error uploading stability files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
};

// Get stability files (Stability Manager and Admin only)
const getStabilityFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const isStabilityManager = user.roles.includes('Stability_manager');
    const isAdmin = user.roles.includes('Admin');

    if (!isStabilityManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only stability managers and admins can view files'
      });
    }

    // Build where clause - admin can view files for any stability record, stability manager only their own
    const whereClause = { id };
    if (isStabilityManager && !isAdmin) {
      whereClause.stability_manager_id = user.user_id;
    }

    const stabilityManagement = await StabilityManagement.findOne({ where: whereClause });

    if (!stabilityManagement) {
      return res.status(404).json({
        success: false,
        message: 'Stability management record not found'
      });
    }

    const files = stabilityManagement.files ? JSON.parse(stabilityManagement.files) : [];

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error fetching stability files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stability files',
      error: error.message
    });
  }
};

// Get stability management statistics
const getStatistics = async (req, res) => {
  try {
    // Get total stability records count
    const total = await StabilityManagement.count();

    // Get count by status
    const stability = await StabilityManagement.count({
      where: { status: 'stability' }
    });

    const submit = await StabilityManagement.count({
      where: { status: 'submit' }
    });

    const approved = await StabilityManagement.count({
      where: { status: 'Approved' }
    });

    const rejected = await StabilityManagement.count({
      where: { status: 'Reject' }
    });

    // Get count by load type
    const withLoad = await StabilityManagement.count({
      where: { load_type: 'with_load' }
    });

    const withoutLoad = await StabilityManagement.count({
      where: { load_type: 'without_load' }
    });

    // Get recent records count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent = await StabilityManagement.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        total,
        stability,
        submit,
        approved,
        rejected,
        withLoad,
        withoutLoad,
        recent
      }
    });
  } catch (error) {
    console.error('Error fetching stability management statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get stability management statistics',
      error: error.message
    });
  }
};

// Delete stability file (Stability Manager and Admin only)
const deleteStabilityFile = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const { user } = req;
    const isStabilityManager = user.roles.includes('Stability_manager');
    const isAdmin = user.roles.includes('Admin');

    if (!isStabilityManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only stability managers and admins can delete files'
      });
    }

    // Build where clause - admin can delete files for any stability record, stability manager only their own
    const whereClause = { id };
    if (isStabilityManager && !isAdmin) {
      whereClause.stability_manager_id = user.user_id;
    }

    const stabilityManagement = await StabilityManagement.findOne({ where: whereClause });

    if (!stabilityManagement) {
      return res.status(404).json({
        success: false,
        message: 'Stability management record not found'
      });
    }

    const files = stabilityManagement.files ? JSON.parse(stabilityManagement.files) : [];
    const fileIndex = files.findIndex(file => file.filename === filename);

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const fileToDelete = files[fileIndex];
    const filePath = fileToDelete.path;

    // Remove file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove file from database
    files.splice(fileIndex, 1);
    await stabilityManagement.update({
      files: JSON.stringify(files)
    });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stability file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

module.exports = {
  getStabilityManagers,
  getAllStabilityManagement,
  searchStabilityManagement,
  getStabilityManagementByQuotationId,
  createStabilityManagement,
  updateStabilityStatus,
  updateStabilityDates,
  uploadStabilityFiles,
  getStabilityFiles,
  deleteStabilityFile,
  getStatistics
}; 