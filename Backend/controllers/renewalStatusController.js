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
    const { factory_quotation_id, upload_option, expiry_date } = req.body;
    const { user } = req;

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

    const renewalStatus = await RenewalStatus.create({
      factory_quotation_id,
      upload_option: upload_option ? JSON.stringify(upload_option) : null,
      expiry_date,
      created_by: user.user_id
    });

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

    const updateData = {};
    
    if (upload_option !== undefined) {
      updateData.upload_option = upload_option ? JSON.stringify(upload_option) : null;
    }
    
    if (expiry_date !== undefined) {
      updateData.expiry_date = expiry_date;
    }

    await renewalStatus.update(updateData);

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
