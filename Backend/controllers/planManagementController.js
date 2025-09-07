const PlanManagement = require('../models/planManagementModel');
const FactoryQuotation = require('../models/factoryQuotationModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

// Get plan managers (users with Plan_manager role)
const getPlanManagers = async (req, res) => {
  try {
    const planManagers = await User.findAll({
      include: [
        {
          model: Role,
          as: 'roles',
          where: { role_name: 'Plan_manager' },
          attributes: ['role_name'],
          through: { attributes: ['is_primary'] },
          required: true,
        },
      ],
      attributes: ['user_id', 'username', 'email'],
    });

    res.json({
      success: true,
      data: planManagers
    });
  } catch (error) {
    console.error('Error fetching plan managers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all plan management records (Admin can see all, Plan Manager sees only their own)
const getAllPlanManagement = async (req, res) => {
  try {
    const { user } = req;
    const isAdmin = user.roles.includes('Admin');
    const isPlanManager = user.roles.includes('Plan_manager');

    console.log('[PlanManagement] User roles:', user.roles);
    console.log('[PlanManagement] Is Admin:', isAdmin);
    console.log('[PlanManagement] Is Plan Manager:', isPlanManager);

    let whereClause = {};
    
    // If user is plan manager, only show their assigned records
    if (isPlanManager && !isAdmin) {
      whereClause.plan_manager_id = user.user_id;
    }

    const planRecords = await PlanManagement.findAll({
      where: whereClause,
      attributes: ['id', 'factory_quotation_id', 'plan_manager_id', 'status', 'remarks', 'submitted_at', 'reviewed_at', 'reviewed_by', 'created_at', 'updated_at'],
      include: [
        {
          model: FactoryQuotation,
          as: 'factoryQuotation',
          attributes: ['id', 'companyName', 'companyAddress', 'email', 'phone']
        },
        {
          model: User,
          as: 'planManager',
          attributes: ['user_id', 'username', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['user_id', 'username', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    console.log('[PlanManagement] Found records:', planRecords.length);

    res.json({
      success: true,
      data: planRecords
    });
  } catch (error) {
    console.error('Error fetching plan management records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan management records',
      error: error.message
    });
  }
};

// Search plan management records
const searchPlanManagement = async (req, res) => {
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
      const isPlanManager = userRoles.includes('Plan_manager');
      const isAdmin = userRoles.includes('Admin');
      
      if (!isPlanManager && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only Plan Managers and Admins can search plan records.'
        });
      }
      
      // Plan managers can only see their own records
      if (isPlanManager && !isAdmin) {
        whereClause.plan_manager_id = req.user.user_id;
      }
    }

    const planRecords = await PlanManagement.findAll({
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
            '$planManager.username$': {
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
          as: 'planManager',
          attributes: ['user_id', 'username', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: planRecords });
  } catch (error) {
    console.error('Error searching plan management:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search plan management',
      error: error.message
    });
  }
};

// Get plan management by factory quotation ID
const getPlanManagementByQuotationId = async (req, res) => {
  try {
    const { quotationId } = req.params;
    
    const planManagement = await PlanManagement.findOne({
      where: { factory_quotation_id: quotationId },
      include: [
        {
          model: FactoryQuotation,
          as: 'factoryQuotation',
          attributes: ['id', 'companyName', 'companyAddress', 'phone', 'email', 'status']
        },
        {
          model: User,
          as: 'planManager',
          attributes: ['user_id', 'username', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['user_id', 'username', 'email']
        }
      ]
    });

    if (!planManagement) {
      return res.status(404).json({
        success: false,
        message: 'Plan management record not found'
      });
    }

    res.json({
      success: true,
      data: planManagement
    });
  } catch (error) {
    console.error('Error fetching plan management by quotation ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan management record',
      error: error.message
    });
  }
};

// Create new plan management record (assign to plan manager)
const createPlanManagement = async (req, res) => {
  try {
    const { factory_quotation_id, plan_manager_id } = req.body;
    const { user } = req;

    console.log('[PlanManagement] Creating plan management:', { factory_quotation_id, plan_manager_id, userId: user.user_id });

    // Validate required fields
    if (!factory_quotation_id || !plan_manager_id) {
      return res.status(400).json({
        success: false,
        message: 'Factory quotation ID and plan manager ID are required'
      });
    }

    // Check if plan management already exists for this quotation
    const existingPlan = await PlanManagement.findOne({
      where: { factory_quotation_id }
    });

    if (existingPlan) {
      console.log('[PlanManagement] Plan already exists for quotation:', factory_quotation_id);
      return res.status(400).json({
        success: false,
        message: 'Plan management already exists for this quotation',
        data: existingPlan
      });
    }

    // Verify factory quotation exists
    const factoryQuotation = await FactoryQuotation.findByPk(factory_quotation_id);
    if (!factoryQuotation) {
      return res.status(404).json({
        success: false,
        message: 'Factory quotation not found'
      });
    }

    // Verify plan manager exists and has correct role
    const planManager = await User.findOne({
      where: { user_id: plan_manager_id },
      include: [{
        model: Role,
        as: 'roles',
        where: { role_name: 'Plan_manager' },
        required: true
      }]
    });

    if (!planManager) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan manager ID or user does not have plan manager role'
      });
    }

    // Use transaction to ensure data consistency
    const result = await sequelize.transaction(async (t) => {
      // Double-check no plan exists (race condition protection)
      const doubleCheck = await PlanManagement.findOne({
        where: { factory_quotation_id },
        transaction: t
      });

      if (doubleCheck) {
        throw new Error('Plan management already exists for this quotation');
    }

    // Create new plan management record
    const planManagement = await PlanManagement.create({
      factory_quotation_id,
      plan_manager_id,
      status: 'plan'
      }, { transaction: t });

    // Update factory quotation status to 'plan'
    await FactoryQuotation.update(
      { status: 'plan' },
        { 
          where: { id: factory_quotation_id },
          transaction: t
        }
    );

      return planManagement;
    });

    console.log('[PlanManagement] Plan management created successfully:', result.id);

    res.status(201).json({
      success: true,
      message: 'Plan management created successfully',
      data: result
    });
  } catch (error) {
    console.error('[PlanManagement] Error creating plan management:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        success: false,
        message: 'Plan management already exists for this quotation'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create plan management',
      error: error.message
    });
  }
};

// Update plan status (Plan Manager and Admin only)
const updatePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');
    const isAdmin = user.roles.includes('Admin');

    if (!isPlanManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers and admins can update plan status'
      });
    }

    if (!['plan', 'submit', 'Approved', 'Reject'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "plan", "submit", "Approved", or "Reject"'
      });
    }

    // Require remarks for rejection
    if (status === 'Reject' && !remarks) {
      return res.status(400).json({
        success: false,
        message: 'Remarks are required for rejection'
      });
    }

    // Build where clause - admin can update any plan, plan manager only their own
    const whereClause = { id };
    if (isPlanManager && !isAdmin) {
      whereClause.plan_manager_id = user.user_id;
    }

    const planManagement = await PlanManagement.findOne({ where: whereClause });

    if (!planManagement) {
      return res.status(404).json({
        success: false,
        message: 'Plan management record not found'
      });
    }

    // Update plan management
    const updateData = {
      status
    };

    // Set submitted_at when status changes to submit
    if (status === 'submit') {
      updateData.submitted_at = new Date();
    }

    // Set reviewed_at when status changes to Approved or Reject
    if (status === 'Approved' || status === 'Reject') {
      updateData.reviewed_at = new Date();
      updateData.reviewed_by = user.user_id;
    }

    // Add remarks for rejection
    if (status === 'Reject' && remarks) {
      updateData.remarks = remarks;
    }

    await planManagement.update(updateData);

    res.json({
      success: true,
      message: `Plan status updated to ${status} successfully`,
      data: planManagement
    });
  } catch (error) {
    console.error('Error updating plan status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plan status',
      error: error.message
    });
  }
};

// Submit plan (Plan Manager and Admin only) - for backward compatibility
const submitPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');
    const isAdmin = user.roles.includes('Admin');

    if (!isPlanManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers and admins can submit plans'
      });
    }

    // Build where clause - admin can submit any plan, plan manager only their own
    const whereClause = { 
        id,
        status: 'plan'
    };
    if (isPlanManager && !isAdmin) {
      whereClause.plan_manager_id = user.user_id;
      }

    const planManagement = await PlanManagement.findOne({ where: whereClause });

    if (!planManagement) {
      return res.status(404).json({
        success: false,
        message: 'Plan management record not found or not eligible for submission'
      });
    }

    // Update status to submit
    await planManagement.update({
      status: 'submit',
      submitted_at: new Date()
    });

    res.json({
      success: true,
      message: 'Plan submitted successfully',
      data: planManagement
    });
  } catch (error) {
    console.error('Error submitting plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit plan',
      error: error.message
    });
  }
};

// Review plan (approve/reject) - Admin only
const reviewPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, files } = req.body;
    const { user } = req;
    const isAdmin = user.roles.includes('Admin');

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can review plans'
      });
    }

    if (!['Approved', 'Reject'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "Approved" or "Reject"'
      });
    }

    // Require remarks for rejection
    if (status === 'Reject' && !remarks) {
      return res.status(400).json({
        success: false,
        message: 'Remarks are required for rejection'
      });
    }

    const planManagement = await PlanManagement.findOne({
      where: { 
        id,
        status: 'submit'
      }
    });

    if (!planManagement) {
      return res.status(404).json({
        success: false,
        message: 'Plan management record not found or not eligible for review'
      });
    }

    // Update plan management
    const updateData = {
      status,
      remarks,
      reviewed_at: new Date(),
      reviewed_by: user.user_id
    };

    // Add files for approval
    if (status === 'Approved' && files) {
      updateData.files = files;
    }

    await planManagement.update(updateData);

    res.json({
      success: true,
      message: `Plan ${status.toLowerCase()} successfully`,
      data: planManagement
    });
  } catch (error) {
    console.error('Error reviewing plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review plan',
      error: error.message
    });
  }
};

// Upload files for plan (Plan Manager and Admin only)
const uploadPlanFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');
    const isAdmin = user.roles.includes('Admin');

    if (!isPlanManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers and admins can upload files'
      });
    }

    // Build where clause - admin can upload files for any plan, plan manager only their own
    const whereClause = { id };
    if (isPlanManager && !isAdmin) {
      whereClause.plan_manager_id = user.user_id;
    }

    const planManagement = await PlanManagement.findOne({ where: whereClause });

    if (!planManagement) {
      return res.status(404).json({
        success: false,
        message: 'Plan management record not found'
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
    const existingFiles = planManagement.files ? JSON.parse(planManagement.files) : [];
    const updatedFiles = [...existingFiles, ...uploadedFiles];

    // Update plan management with new files and status
    await planManagement.update({
      files: JSON.stringify(updatedFiles),
      status: 'Approved', // Update status to Approved when files are uploaded
      reviewed_at: new Date(),
      reviewed_by: user.user_id
    });

    res.json({
      success: true,
      message: 'Files uploaded and plan approved successfully',
      data: {
        uploadedFiles,
        totalFiles: updatedFiles.length,
        status: 'Approved'
      }
    });
  } catch (error) {
    console.error('Error uploading plan files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
};

// Get plan files (Plan Manager and Admin only)
const getPlanFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');
    const isAdmin = user.roles.includes('Admin');

    if (!isPlanManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers and admins can view files'
      });
    }

    // Build where clause - admin can view files for any plan, plan manager only their own
    const whereClause = { id };
    if (isPlanManager && !isAdmin) {
      whereClause.plan_manager_id = user.user_id;
    }

    const planManagement = await PlanManagement.findOne({ where: whereClause });

    if (!planManagement) {
      return res.status(404).json({
        success: false,
        message: 'Plan management record not found'
      });
    }

    const files = planManagement.files ? JSON.parse(planManagement.files) : [];

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error getting plan files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get files',
      error: error.message
    });
  }
};

// Get plan management statistics
const getStatistics = async (req, res) => {
  try {
    // Get total plans count
    const total = await PlanManagement.count();

    // Get count by status
    const plan = await PlanManagement.count({
      where: { status: 'plan' }
    });

    const submit = await PlanManagement.count({
      where: { status: 'submit' }
    });

    const approved = await PlanManagement.count({
      where: { status: 'Approved' }
    });

    const rejected = await PlanManagement.count({
      where: { status: 'Reject' }
    });

    // Get recent plans count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent = await PlanManagement.count({
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
        plan,
        submit,
        approved,
        rejected,
        recent
      }
    });
  } catch (error) {
    console.error('Error fetching plan management statistics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get plan management statistics',
      error: error.message 
    });
  }
};

// Delete plan file (Plan Manager and Admin only)
const deletePlanFile = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');
    const isAdmin = user.roles.includes('Admin');

    if (!isPlanManager && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers and admins can delete files'
      });
    }

    // Build where clause - admin can delete files for any plan, plan manager only their own
    const whereClause = { id };
    if (isPlanManager && !isAdmin) {
      whereClause.plan_manager_id = user.user_id;
    }

    const planManagement = await PlanManagement.findOne({ where: whereClause });

    if (!planManagement) {
      return res.status(404).json({
        success: false,
        message: 'Plan management record not found'
      });
    }

    const files = planManagement.files ? JSON.parse(planManagement.files) : [];
    const fileIndex = files.findIndex(file => file.filename === filename);

    if (fileIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Remove file from array
    const deletedFile = files.splice(fileIndex, 1)[0];

    // Update plan management
    await planManagement.update({
      files: JSON.stringify(files)
    });

    // Delete physical file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads/plan', `plan_${id}`, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: deletedFile
    });
  } catch (error) {
    console.error('Error deleting plan file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error.message
    });
  }
};

module.exports = {
  getPlanManagers,
  getAllPlanManagement,
  searchPlanManagement,
  getPlanManagementByQuotationId,
  createPlanManagement,
  submitPlan,
  updatePlanStatus,
  reviewPlan,
  uploadPlanFiles,
  getPlanFiles,
  deletePlanFile,
  getStatistics
}; 