const LifePolicy = require('../models/lifePolicyModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const InsuranceCompany = require('../models/insuranceCompanyModel');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

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

    const policies = await LifePolicy.findAndCountAll({
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
    console.error('Error fetching life policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const policy = await LifePolicy.findByPk(req.params.id, {
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
    console.error('Error fetching life policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    console.log('[Life] Creating new policy with data:', {
      body: req.body,
      file: req.file
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate file upload
    if (!req.file) {
      console.error('[Life] No file uploaded');
      return res.status(400).json({ message: 'Policy document is required' });
    }

    // Store filename in database
    const filename = req.file.filename;
    console.log('[Life] Storing filename:', filename);

    // Create policy with document filename and remarks
    const policyData = {
      ...req.body,
      policy_document_path: filename,
      remarks: req.body.remarks || null
    };

    // Convert string 'null' or '' or undefined to actual null for company_id and consumer_id
    if (policyData.company_id === '' || policyData.company_id === 'null' || policyData.company_id === undefined) policyData.company_id = null;
    if (policyData.consumer_id === '' || policyData.consumer_id === 'null' || policyData.consumer_id === undefined) policyData.consumer_id = null;

    console.log('[Life] Creating policy with data:', policyData);

    const policy = await LifePolicy.create(policyData);
    
    // Fetch the created policy with associations
    const createdPolicy = await LifePolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('[Life] Policy created successfully:', {
      id: createdPolicy.id,
      documentPath: createdPolicy.policy_document_path
    });

    res.status(201).json(createdPolicy);
  } catch (error) {
    console.error('[LifePolicyController] Error:', error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors ? error.errors.map(e => e.path).join(', ') : 'unknown';
      return res.status(400).json({ message: `Duplicate entry: ${fields} must be unique.` });
    } else if (error.name === 'SequelizeValidationError') {
      const details = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
      return res.status(400).json({ message: `Validation error: ${details}` });
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Invalid company or consumer ID', details: error.message });
    } else {
      return res.status(500).json({ message: `Life policy operation failed: ${error.message}` });
    }
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    console.log('[Life] Updating policy:', {
      id: req.params.id,
      body: req.body,
      file: req.file
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const policy = await LifePolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Handle file upload
    if (req.file) {
      console.log('[Life] New file uploaded:', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      // Delete old file if exists
      if (policy.policy_document_path) {
        try {
          const oldFilePath = path.join(__dirname, '../uploads/life_policies', policy.policy_document_path);
          await fs.access(oldFilePath);
          await fs.unlink(oldFilePath);
          console.log('[Life] Old file deleted:', oldFilePath);
        } catch (error) {
          console.warn('[Life] Could not delete old file:', error);
        }
      }

      // Store new filename in database
      req.body.policy_document_path = req.file.filename;
      console.log('[Life] Storing new filename:', req.file.filename);
    }

    // Update policy with remarks
    const updateData = {
      ...req.body,
      remarks: req.body.remarks || policy.remarks
    };

    await policy.update(updateData);
    
    // Fetch the updated policy with associations
    const updatedPolicy = await LifePolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('[Life] Policy updated successfully:', {
      id: updatedPolicy.id,
      documentPath: updatedPolicy.policy_document_path
    });

    res.json(updatedPolicy);
  } catch (error) {
    console.error('[Life] Error updating policy:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Policy number must be unique' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await LifePolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    // Delete policy document if exists
    if (policy.policy_document_path) {
      try {
        const filePath = path.join(__dirname, '../uploads/life_policies', policy.policy_document_path);
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log('[Life] Policy document deleted:', filePath);
      } catch (error) {
        console.warn('[Life] Could not delete policy document:', error);
      }
    }

    await policy.destroy();
    res.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting life policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.searchPolicies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    console.log(`[LifePolicyController] Searching policies with query: "${q}"`);

    // Search in main policy fields
    const policies = await LifePolicy.findAll({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('LifePolicy.current_policy_number')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('LifePolicy.organisation_or_holder_name')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('LifePolicy.email')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('LifePolicy.mobile_number')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('LifePolicy.plan_name')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('LifePolicy.sum_assured')), 'LIKE', `%${q.toLowerCase()}%`)
        ]
      },
      include: [
        {
          model: Company,
          as: 'companyPolicyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        },
        {
          model: Consumer,
          as: 'consumerPolicyHolder',
          attributes: ['consumer_id', 'name', 'email', 'phone_number']
        },
        {
          model: InsuranceCompany,
          as: 'provider',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Search for policies where company name matches
    const policiesByCompany = await LifePolicy.findAll({
      include: [
        {
          model: Company,
          as: 'companyPolicyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number'],
          required: true,
          where: sequelize.where(sequelize.fn('LOWER', sequelize.col('companyPolicyHolder.company_name')), 'LIKE', `%${q.toLowerCase()}%`)
        },
        {
          model: Consumer,
          as: 'consumerPolicyHolder',
          attributes: ['consumer_id', 'name', 'email', 'phone_number']
        },
        {
          model: InsuranceCompany,
          as: 'provider',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Search for policies where consumer name matches
    const policiesByConsumer = await LifePolicy.findAll({
      include: [
        {
          model: Company,
          as: 'companyPolicyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        },
        {
          model: Consumer,
          as: 'consumerPolicyHolder',
          attributes: ['consumer_id', 'name', 'email', 'phone_number'],
          required: true,
          where: sequelize.where(sequelize.fn('LOWER', sequelize.col('consumerPolicyHolder.name')), 'LIKE', `%${q.toLowerCase()}%`)
        },
        {
          model: InsuranceCompany,
          as: 'provider',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Search for policies where insurance company name matches
    const policiesByInsuranceCompany = await LifePolicy.findAll({
      include: [
        {
          model: Company,
          as: 'companyPolicyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        },
        {
          model: Consumer,
          as: 'consumerPolicyHolder',
          attributes: ['consumer_id', 'name', 'email', 'phone_number']
        },
        {
          model: InsuranceCompany,
          as: 'provider',
          attributes: ['id', 'name'],
          required: true,
          where: sequelize.where(sequelize.fn('LOWER', sequelize.col('provider.name')), 'LIKE', `%${q.toLowerCase()}%`)
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Combine all results and remove duplicates
    const allPolicies = [...policies, ...policiesByCompany, ...policiesByConsumer, ...policiesByInsuranceCompany];
    const uniquePolicies = allPolicies.filter((policy, index, self) => 
      index === self.findIndex(p => p.id === policy.id)
    );

    console.log(`[LifePolicyController] Found ${uniquePolicies.length} policies for query: "${q}"`);

    res.json({ success: true, policies: uniquePolicies });
  } catch (error) {
    console.error('Error searching life policies:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}; 