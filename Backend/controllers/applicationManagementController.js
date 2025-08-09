const ApplicationManagement = require('../models/applicationManagementModel');
const User = require('../models/userModel');
const Role = require('../models/roleModel');
const UserRole = require('../models/userRoleModel');
const FactoryQuotation = require('../models/factoryQuotationModel');
const path = require('path');
const fs = require('fs');

// Get all compliance managers
exports.getComplianceManagers = async (req, res) => {
  try {
    const complianceManagers = await User.findAll({
      include: [
        {
          model: Role,
          through: UserRole,
          where: { role_name: 'Compliance_manager' }
        }
      ],
      attributes: ['user_id', 'username', 'email']
    });

    res.json({
      success: true,
      data: complianceManagers
    });
  } catch (error) {
    console.error('Error fetching compliance managers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all application management records
exports.getAllApplicationManagement = async (req, res) => {
  try {
    const applications = await ApplicationManagement.findAll({
      include: [
        {
          model: FactoryQuotation,
          as: 'factoryQuotation',
          attributes: ['id', 'companyName', 'companyAddress', 'phone', 'email']
        },
        {
          model: User,
          as: 'complianceManager',
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

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching application management records:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get application management by quotation ID
exports.getApplicationManagementByQuotationId = async (req, res) => {
  try {
    const { quotationId } = req.params;
    
    const application = await ApplicationManagement.findOne({
      where: { factory_quotation_id: quotationId },
      include: [
        {
          model: User,
          as: 'complianceManager',
          attributes: ['user_id', 'username', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['user_id', 'username', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application management by quotation ID:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create application management record
exports.createApplicationManagement = async (req, res) => {
  try {
    const { factory_quotation_id, compliance_manager_id } = req.body;

    // Check if application already exists for this quotation
    const existingApplication = await ApplicationManagement.findOne({
      where: { factory_quotation_id }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Application management record already exists for this quotation'
      });
    }

    const application = await ApplicationManagement.create({
      factory_quotation_id,
      compliance_manager_id,
      status: 'application'
    });

    const createdApplication = await ApplicationManagement.findByPk(application.id, {
      include: [
        {
          model: User,
          as: 'complianceManager',
          attributes: ['user_id', 'username', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdApplication
    });
  } catch (error) {
    console.error('Error creating application management record:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, application_date, expiry_date, remarks } = req.body;

    const updateData = { status };
    
    if (application_date) {
      updateData.application_date = application_date;
    }
    
    if (expiry_date) {
      updateData.expiry_date = expiry_date;
    }
    
    if (remarks) {
      updateData.remarks = remarks;
    }

    // Update timestamps based on status
    if (status === 'submit') {
      updateData.submitted_at = new Date();
    } else if (status === 'Approved' || status === 'Reject') {
      updateData.reviewed_at = new Date();
      updateData.reviewed_by = req.user.user_id;
    }

    const [updated] = await ApplicationManagement.update(updateData, {
      where: { id }
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Application management record not found'
      });
    }

    const updatedApplication = await ApplicationManagement.findByPk(id, {
      include: [
        {
          model: User,
          as: 'complianceManager',
          attributes: ['user_id', 'username', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['user_id', 'username', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Upload application files
exports.uploadApplicationFiles = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await ApplicationManagement.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application management record not found'
      });
    }

    // Get existing files
    const existingFiles = application.files ? JSON.parse(application.files) : [];
    
    // Add new files if any were uploaded
    let allFiles = [...existingFiles];
    if (req.files && req.files.length > 0) {
      const newFiles = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        path: file.path,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }));
      allFiles = [...existingFiles, ...newFiles];
    }

    // Update application with files and status
    await ApplicationManagement.update({
      files: JSON.stringify(allFiles),
      status: 'Approved',
      reviewed_at: new Date(),
      reviewed_by: req.user.user_id
    }, {
      where: { id }
    });

    const updatedApplication = await ApplicationManagement.findByPk(id, {
      include: [
        {
          model: User,
          as: 'complianceManager',
          attributes: ['user_id', 'username', 'email']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['user_id', 'username', 'email']
        }
      ]
    });

    res.json({
      success: true,
      message: req.files && req.files.length > 0 ? 'Files uploaded and application approved successfully' : 'Application approved successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error uploading application files:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get application files
exports.getApplicationFiles = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await ApplicationManagement.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application management record not found'
      });
    }

    const files = application.files ? JSON.parse(application.files) : [];
    
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    console.error('Error fetching application files:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download application file
exports.downloadApplicationFile = async (req, res) => {
  try {
    const { id, filename } = req.params;
    
    const application = await ApplicationManagement.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application management record not found'
      });
    }

    const files = application.files ? JSON.parse(application.files) : [];
    const file = files.find(f => f.filename === filename);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const filePath = path.join(__dirname, '..', file.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, file.originalname);
  } catch (error) {
    console.error('Error downloading application file:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 