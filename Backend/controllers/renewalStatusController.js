const RenewalStatus = require('../models/renewalStatusModel');
const FactoryQuotation = require('../models/factoryQuotationModel');
const User = require('../models/userModel');
const { Op } = require('sequelize');

// Get all renewal status records
exports.getAllRenewalStatus = async (req, res) => {
  try {
    const { user } = req;
    const isAdmin = user.roles.includes('Admin');
    const isComplianceManager = user.roles.includes('Compliance_manager');

    let whereClause = {};
    
    if (!isAdmin && !isComplianceManager) {
      whereClause.created_by = user.user_id;
    }

    const renewalRecords = await RenewalStatus.findAll({
      where: whereClause,
      include: [
        {
          model: FactoryQuotation,
          as: 'factoryQuotation',
          attributes: ['id', 'companyName', 'companyAddress', 'email', 'phone', 'status']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: renewalRecords
    });
  } catch (error) {
    console.error('Error fetching renewal status records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal status records',
      error: error.message
    });
  }
};

// Create renewal status record
exports.createRenewalStatus = async (req, res) => {
  try {
    const { factory_quotation_id, expiry_date } = req.body;
    const { user } = req;
    const { files } = req;

    if (!factory_quotation_id) {
      return res.status(400).json({
        success: false,
        message: 'Factory quotation ID is required'
      });
    }

    const factoryQuotation = await FactoryQuotation.findByPk(factory_quotation_id);
    if (!factoryQuotation) {
      return res.status(404).json({
        success: false,
        message: 'Factory quotation not found'
      });
    }

    const existingRecord = await RenewalStatus.findOne({
      where: { factory_quotation_id }
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: 'Renewal status already exists for this factory quotation'
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

    // Create renewal status record
    const renewalStatus = await RenewalStatus.create({
      factory_quotation_id,
      upload_option: uploadOption ? JSON.stringify(uploadOption) : null,
      expiry_date,
      created_by: user.user_id
    });

    console.log('Renewal status created with upload option:', uploadOption);

    res.status(201).json({
      success: true,
      message: 'Renewal status created successfully',
      data: renewalStatus
    });
  } catch (error) {
    console.error('Error creating renewal status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create renewal status',
      error: error.message
    });
  }
};

// Update renewal status record
exports.updateRenewalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { upload_option, expiry_date } = req.body;
    const { user } = req;
    const { files } = req;

    const renewalStatus = await RenewalStatus.findByPk(id);
    if (!renewalStatus) {
      return res.status(404).json({
        success: false,
        message: 'Renewal status record not found'
      });
    }

    const isAdmin = user.roles.includes('Admin');
    const isCreator = renewalStatus.created_by === user.user_id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this renewal status record'
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

    // Update the renewal status record
    const updateData = {};
    if (expiry_date) updateData.expiry_date = expiry_date;
    if (uploadOption) updateData.upload_option = JSON.stringify(uploadOption);

    await renewalStatus.update(updateData);

    console.log('Renewal status updated with upload option:', uploadOption);

    res.json({
      success: true,
      message: 'Renewal status updated successfully',
      data: renewalStatus
    });
  } catch (error) {
    console.error('Error updating renewal status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update renewal status',
      error: error.message
    });
  }
};

// Delete renewal status record
exports.deleteRenewalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const renewalStatus = await RenewalStatus.findByPk(id);
    if (!renewalStatus) {
      return res.status(404).json({
        success: false,
        message: 'Renewal status record not found'
      });
    }

    const isAdmin = user.roles.includes('Admin');
    const isCreator = renewalStatus.created_by === user.user_id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this renewal status record'
      });
    }

    await renewalStatus.destroy();

    res.json({
      success: true,
      message: 'Renewal status deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting renewal status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete renewal status',
      error: error.message
    });
  }
};

// Upload renewal documents
exports.uploadRenewalDocuments = async (req, res) => {
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

    const renewalStatus = await RenewalStatus.findByPk(id);
    if (!renewalStatus) {
      return res.status(404).json({
        success: false,
        message: 'Renewal status record not found'
      });
    }

    const isAdmin = user.roles.includes('Admin');
    const isCreator = renewalStatus.created_by === user.user_id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to upload documents for this renewal status record'
      });
    }

    // Log uploaded files
    console.log('Renewal documents uploaded:', files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      path: file.path
    })));

    res.json({
      success: true,
      message: 'Renewal documents uploaded successfully',
      data: {
        files: files.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          size: file.size
        }))
      }
    });
  } catch (error) {
    console.error('Error uploading renewal documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload renewal documents',
      error: error.message
    });
  }
};

// Get renewal status record by ID
exports.getRenewalStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    const renewalStatus = await RenewalStatus.findByPk(id, {
      include: [
        {
          model: FactoryQuotation,
          as: 'factoryQuotation',
          attributes: ['id', 'companyName', 'companyAddress', 'email', 'phone', 'status']
        }
      ]
    });

    if (!renewalStatus) {
      return res.status(404).json({
        success: false,
        message: 'Renewal status record not found'
      });
    }

    // Check if user has access to this record
    const isAdmin = user.roles.includes('Admin');
    const isComplianceManager = user.roles.includes('Compliance_manager');
    const isCreator = renewalStatus.created_by === user.user_id;

    if (!isAdmin && !isComplianceManager && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this renewal status record'
      });
    }

    res.json({
      success: true,
      data: renewalStatus
    });
  } catch (error) {
    console.error('Error fetching renewal status record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch renewal status record',
      error: error.message
    });
  }
};
