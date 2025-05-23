const FirePolicy = require('../models/firePolicyModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const InsuranceCompany = require('../models/insuranceCompanyModel');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

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

exports.getActiveInsuranceCompanies = async (req, res) => {
  try {
    const companies = await InsuranceCompany.findAll({
      attributes: ['id', 'name']
    });
    res.json(companies);
  } catch (error) {
    console.error('Error fetching insurance companies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllPolicies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const policies = await FirePolicy.findAndCountAll({
      include: [
        { model: Company, as: 'companyPolicyHolder', attributes: ['company_id', 'company_name', 'company_email', 'contact_number', 'gst_number', 'pan_number'] },
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
    console.error('Error fetching fire policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const policy = await FirePolicy.findByPk(req.params.id, {
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
    console.error('Error fetching fire policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    console.log('[Fire] Creating new policy with data:', {
      body: req.body,
      file: req.file
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      console.error('[Fire] No file uploaded');
      return res.status(400).json({ message: 'Policy document is required' });
    }

    const filename = req.file.filename;
    console.log('[Fire] Storing filename:', filename);

    const policyData = {
      ...req.body,
      policy_document_path: filename
    };

    // Convert string 'null' or '' or undefined to actual null for company_id and consumer_id
    if (policyData.company_id === '' || policyData.company_id === 'null' || policyData.company_id === undefined) policyData.company_id = null;
    if (policyData.consumer_id === '' || policyData.consumer_id === 'null' || policyData.consumer_id === undefined) policyData.consumer_id = null;
    // Validate customer type and IDs
    if (policyData.customer_type === 'Organisation') {
      if (!policyData.company_id) {
        console.error('[Fire] Organisation selected but no company_id provided');
        return res.status(400).json({ message: 'Company ID is required for Organisation type' });
      }
      policyData.consumer_id = null;
    } else if (policyData.customer_type === 'Individual') {
      if (!policyData.consumer_id) {
        console.error('[Fire] Individual selected but no consumer_id provided');
        return res.status(400).json({ message: 'Consumer ID is required for Individual type' });
      }
      policyData.company_id = null;
    } else {
      console.error('[Fire] Invalid customer_type:', policyData.customer_type);
      return res.status(400).json({ message: 'Invalid customer type' });
    }
    console.log('[Fire] Final company_id:', policyData.company_id, 'Final consumer_id:', policyData.consumer_id);
    console.log('[Fire] Creating policy with data:', policyData);

    const policy = await FirePolicy.create(policyData);
    const createdPolicy = await FirePolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('[Fire] Policy created successfully:', {
      id: createdPolicy.id,
      documentPath: createdPolicy.policy_document_path
    });

    res.status(201).json(createdPolicy);
  } catch (error) {
    console.error('[Fire] Error creating policy:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Policy number must be unique' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    console.log('[Fire] Updating policy:', {
      id: req.params.id,
      body: req.body,
      file: req.file
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const policy = await FirePolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    if (req.file) {
      if (policy.policy_document_path) {
        try {
          const oldFilePath = path.join(__dirname, '../uploads/fire_policies', policy.policy_document_path);
          await fs.access(oldFilePath);
          await fs.unlink(oldFilePath);
        } catch (error) {
          console.warn('[Fire] Could not delete old file:', error);
        }
      }
      req.body.policy_document_path = req.file.filename;
    }

    // Convert string 'null' or '' or undefined to actual null for company_id and consumer_id
    if (req.body.company_id === '' || req.body.company_id === 'null' || req.body.company_id === undefined) req.body.company_id = null;
    if (req.body.consumer_id === '' || req.body.consumer_id === 'null' || req.body.consumer_id === undefined) req.body.consumer_id = null;
    // Validate customer type and IDs
    if (req.body.customer_type === 'Organisation') {
      if (!req.body.company_id) {
        console.error('[Fire] Organisation selected but no company_id provided');
        return res.status(400).json({ message: 'Company ID is required for Organisation type' });
      }
      req.body.consumer_id = null;
    } else if (req.body.customer_type === 'Individual') {
      if (!req.body.consumer_id) {
        console.error('[Fire] Individual selected but no consumer_id provided');
        return res.status(400).json({ message: 'Consumer ID is required for Individual type' });
      }
      req.body.company_id = null;
    } else {
      console.error('[Fire] Invalid customer_type:', req.body.customer_type);
      return res.status(400).json({ message: 'Invalid customer type' });
    }
    console.log('[Fire] (Update) Final company_id:', req.body.company_id, 'Final consumer_id:', req.body.consumer_id);

    await policy.update(req.body);
    const updatedPolicy = await FirePolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('[Fire] Policy updated successfully:', {
      id: updatedPolicy.id,
      documentPath: updatedPolicy.policy_document_path
    });

    res.json(updatedPolicy);
  } catch (error) {
    console.error('[Fire] Error updating policy:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Policy number must be unique' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await FirePolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    await policy.update({ status: 'cancelled' });
    res.json({ message: 'Policy cancelled successfully' });
  } catch (error) {
    console.error('Error deleting fire policy:', error);
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

    const policies = await FirePolicy.findAll({
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
    console.error('Error searching fire policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 