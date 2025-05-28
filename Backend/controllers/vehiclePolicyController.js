const VehiclePolicy = require('../models/vehiclePolicyModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const InsuranceCompany = require('../models/insuranceCompanyModel');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

exports.logFormData = (req, res, next) => {
  console.log('=== Multer Processed FormData ===');
  console.log('Request Body:', req.body);
  console.log('Request File:', req.file);
  console.log('=== End Multer Processed FormData ===');
  next();
};

exports.getActiveCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { status: 'Active' },
      attributes: [
        'company_id',
        'company_name',
        'company_email',
        'contact_number',
        'gst_number',
        'pan_number'
      ]
    });
    res.json(companies);
  } catch (error) {
    console.error('Error fetching active companies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getActiveConsumers = async (req, res) => {
  try {
    const consumers = await Consumer.findAll({
      where: { status: 'Active' },
      attributes: [
        'consumer_id',
        'name',
        'email',
        'phone_number',
        'contact_address'
      ]
    });
    res.json(consumers);
  } catch (error) {
    console.error('Error fetching active consumers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllPolicies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const policies = await VehiclePolicy.findAndCountAll({
      include: [
        { model: Company, as: 'companyPolicyHolder', attributes: ['company_id', 'company_name', 'company_email', 'contact_number'] },
        { model: Consumer, as: 'consumerPolicyHolder', attributes: ['consumer_id', 'name', 'email', 'phone_number'] },
        { model: InsuranceCompany, as: 'provider' }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      policies: policies.rows,
      totalPages: Math.ceil(policies.count / limit),
      currentPage: page,
      totalItems: policies.count
    });
  } catch (error) {
    console.error('Error fetching vehicle policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const policy = await VehiclePolicy.findByPk(req.params.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json(policy);
  } catch (error) {
    console.error('Error fetching vehicle policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    console.log('[Vehicle] Creating new policy with data:', {
      body: req.body,
      file: req.file
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate file upload
    if (!req.file) {
      console.error('[Vehicle] No file uploaded');
      return res.status(400).json({ message: 'Policy document is required' });
    }

    // Store filename in database
    const filename = req.file.filename;
    console.log('[Vehicle] Storing filename:', filename);

    // Create policy with document filename
    const policyData = {
      ...req.body,
      policy_document_path: filename
    };

    // Convert string 'null' or '' or undefined to actual null for company_id and consumer_id
    if (policyData.company_id === '' || policyData.company_id === 'null' || policyData.company_id === undefined) policyData.company_id = null;
    if (policyData.consumer_id === '' || policyData.consumer_id === 'null' || policyData.consumer_id === undefined) policyData.consumer_id = null;

    // Handle consumer_id and company_id based on customer_type
    if (policyData.customer_type === 'Organisation') {
      if (!policyData.company_id) {
        console.error('[Vehicle] Organisation selected but no company_id provided');
        return res.status(400).json({ message: 'Company ID is required for Organisation type' });
      }
      policyData.consumer_id = null;
    } else if (policyData.customer_type === 'Individual') {
      if (!policyData.consumer_id) {
        console.error('[Vehicle] Individual selected but no consumer_id provided');
        return res.status(400).json({ message: 'Consumer ID is required for Individual type' });
      }
      policyData.company_id = null;
    } else {
      console.error('[Vehicle] Invalid customer_type:', policyData.customer_type);
      return res.status(400).json({ message: 'Invalid customer type' });
    }

    console.log('[Vehicle] Creating policy with data:', policyData);

    const policy = await VehiclePolicy.create(policyData);
    
    // Fetch the created policy with associations
    const createdPolicy = await VehiclePolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('[Vehicle] Policy created successfully:', {
      id: createdPolicy.id,
      documentPath: createdPolicy.policy_document_path
    });

    res.status(201).json(createdPolicy);
  } catch (error) {
    console.error('[Vehicle] Error creating policy:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Policy number must be unique' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ 
        message: 'Invalid company or consumer ID',
        details: error.message
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    console.log('[Vehicle] Updating policy:', {
      id: req.params.id,
      body: req.body,
      file: req.file
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const policy = await VehiclePolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Handle file upload
    if (req.file) {
      console.log('[Vehicle] New file uploaded:', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      // Delete old file if exists
      if (policy.policy_document_path) {
        try {
          const oldFilePath = path.join(__dirname, '../uploads/vehicle_policies', policy.policy_document_path);
          await fs.access(oldFilePath);
          await fs.unlink(oldFilePath);
          console.log('[Vehicle] Old file deleted:', oldFilePath);
        } catch (error) {
          console.warn('[Vehicle] Could not delete old file:', error);
        }
      }

      // Store new filename in database
      req.body.policy_document_path = req.file.filename;
      console.log('[Vehicle] Storing new filename:', req.file.filename);
    }

    // Update policy
    await policy.update(req.body);
    
    // Fetch the updated policy with associations
    const updatedPolicy = await VehiclePolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('[Vehicle] Policy updated successfully:', {
      id: updatedPolicy.id,
      documentPath: updatedPolicy.policy_document_path
    });

    res.json(updatedPolicy);
  } catch (error) {
    console.error('[Vehicle] Error updating policy:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Policy number must be unique' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await VehiclePolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    await policy.update({ status: 'cancelled' });
    res.json({ message: 'Policy cancelled successfully' });
  } catch (error) {
    console.error('Error deleting vehicle policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.searchPolicies = async (req, res) => {
  try {
    const {
      policyNumber,
      companyId,
      consumerId,
      insuranceCompanyId,
      startDate,
      endDate,
      status
    } = req.query;

    const where = {};
    if (policyNumber) where.policy_number = policyNumber;
    if (companyId) where.company_id = companyId;
    if (consumerId) where.consumer_id = consumerId;
    if (insuranceCompanyId) where.insurance_company_id = insuranceCompanyId;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.policy_start_date = {
        $between: [new Date(startDate), new Date(endDate)]
      };
    }

    const policies = await VehiclePolicy.findAll({
      where,
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(policies);
  } catch (error) {
    console.error('Error searching vehicle policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 