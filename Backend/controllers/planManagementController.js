const PlanManagement = require('../models/planManagementModel');
const FactoryQuotation = require('../models/factoryQuotationModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const { Op } = require('sequelize');

// Get plan managers (users with Plan_manager role)
const getPlanManagers = async (req, res) => {
  try {
    const planManagers = await User.findAll({
      include: [
        {
          model: Role,
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

// Get all plan management records
const getAllPlanManagement = async (req, res) => {
  try {
    const { user } = req;
    const isAdmin = user.roles.includes('Admin');
    const isPlanManager = user.roles.includes('Plan_manager');

    let whereClause = {};
    
    // Plan managers can only see their own records
    if (isPlanManager && !isAdmin) {
      whereClause.plan_manager_id = user.user_id;
    }

    const planManagement = await PlanManagement.findAll({
      where: whereClause,
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
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: planManagement
    });
  } catch (error) {
    console.error('Error fetching plan management:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan management records',
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

    // Check if plan management already exists for this quotation
    const existingPlan = await PlanManagement.findOne({
      where: { factory_quotation_id }
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: 'Plan management already exists for this quotation'
      });
    }

    // Create new plan management record
    const planManagement = await PlanManagement.create({
      factory_quotation_id,
      plan_manager_id,
      status: 'plan'
    });

    // Update factory quotation status to 'plan'
    await FactoryQuotation.update(
      { status: 'plan' },
      { where: { id: factory_quotation_id } }
    );

    res.status(201).json({
      success: true,
      message: 'Plan management created successfully',
      data: planManagement
    });
  } catch (error) {
    console.error('Error creating plan management:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create plan management',
      error: error.message
    });
  }
};

// Update plan status (Plan Manager only)
const updatePlanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');

    if (!isPlanManager) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers can update plan status'
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

    const planManagement = await PlanManagement.findOne({
      where: { 
        id,
        plan_manager_id: user.user_id
      }
    });

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

// Submit plan (Plan Manager only) - for backward compatibility
const submitPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');

    if (!isPlanManager) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers can submit plans'
      });
    }

    const planManagement = await PlanManagement.findOne({
      where: { 
        id,
        plan_manager_id: user.user_id,
        status: 'plan'
      }
    });

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

// Upload files for plan (Plan Manager only)
const uploadPlanFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');

    if (!isPlanManager) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers can upload files'
      });
    }

    const planManagement = await PlanManagement.findOne({
      where: { 
        id,
        plan_manager_id: user.user_id
      }
    });

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

// Get plan files (Plan Manager only)
const getPlanFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');

    if (!isPlanManager) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers can view files'
      });
    }

    const planManagement = await PlanManagement.findOne({
      where: { 
        id,
        plan_manager_id: user.user_id
      }
    });

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

// Delete plan file (Plan Manager only)
const deletePlanFile = async (req, res) => {
  try {
    const { id, filename } = req.params;
    const { user } = req;
    const isPlanManager = user.roles.includes('Plan_manager');

    if (!isPlanManager) {
      return res.status(403).json({
        success: false,
        message: 'Only plan managers can delete files'
      });
    }

    const planManagement = await PlanManagement.findOne({
      where: { 
        id,
        plan_manager_id: user.user_id
      }
    });

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