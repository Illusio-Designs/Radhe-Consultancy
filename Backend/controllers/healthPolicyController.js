const HealthPolicy = require('../models/healthPolicyModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const InsuranceCompany = require('../models/insuranceCompanyModel');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;
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

    const policies = await HealthPolicy.findAndCountAll({
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
    console.error('Error fetching health policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getPolicy = async (req, res) => {
  try {
    const policy = await HealthPolicy.findByPk(req.params.id, {
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
    console.error('Error fetching health policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createPolicy = async (req, res) => {
  try {
    console.log('\n=== [Health] Create Policy Request ===');
    console.log('Raw Request Body:', JSON.stringify(req.body, null, 2));
    console.log('File Details:', req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      console.error('[Health] No file uploaded');
      return res.status(400).json({ message: 'Policy document is required' });
    }

    const filename = req.file.filename;
    console.log('[Health] Storing filename:', filename);

    const policyData = {
      ...req.body,
      policy_document_path: filename
    };

    // Log initial values
    console.log('\n[Health] Initial Values:');
    console.log('company_id:', policyData.company_id, 'type:', typeof policyData.company_id);
    console.log('consumer_id:', policyData.consumer_id, 'type:', typeof policyData.consumer_id);
    console.log('customer_type:', policyData.customer_type);

    // Convert string 'null' or '' or undefined to actual null for company_id and consumer_id
    if (policyData.company_id === '' || policyData.company_id === 'null' || policyData.company_id === undefined) policyData.company_id = null;
    if (policyData.consumer_id === '' || policyData.consumer_id === 'null' || policyData.consumer_id === undefined) policyData.consumer_id = null;
    
    // Validate customer type and IDs
    if (policyData.customer_type === 'Organisation') {
      if (!policyData.company_id) {
        console.error('[Health] Organisation selected but no company_id provided');
        return res.status(400).json({ message: 'Company ID is required for Organisation type' });
      }
      policyData.consumer_id = null;
    } else if (policyData.customer_type === 'Individual') {
      if (!policyData.consumer_id) {
        console.error('[Health] Individual selected but no consumer_id provided');
        return res.status(400).json({ message: 'Consumer ID is required for Individual type' });
      }
      policyData.company_id = null;
    } else {
      console.error('[Health] Invalid customer_type:', policyData.customer_type);
      return res.status(400).json({ message: 'Invalid customer type' });
    }

    // Log final values before save
    console.log('\n[Health] Final Values Before Save:');
    console.log('company_id:', policyData.company_id, 'type:', typeof policyData.company_id);
    console.log('consumer_id:', policyData.consumer_id, 'type:', typeof policyData.consumer_id);
    console.log('customer_type:', policyData.customer_type);
    console.log('proposer_name:', policyData.proposer_name);

    console.log('\n[Health] Creating policy with data:', policyData);

    const policy = await HealthPolicy.create(policyData);
    const createdPolicy = await HealthPolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('\n[Health] Policy created successfully:', {
      id: createdPolicy.id,
      documentPath: createdPolicy.policy_document_path,
      company_id: createdPolicy.company_id,
      consumer_id: createdPolicy.consumer_id
    });
    console.log('=== End Create Policy Request ===\n');

    res.status(201).json(createdPolicy);
  } catch (error) {
    console.error('\n[Health] Error creating policy:', error);
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
    console.log('\n=== [Health] Update Policy Request ===');
    console.log('Policy ID:', req.params.id);
    console.log('Raw Request Body:', JSON.stringify(req.body, null, 2));
    console.log('File Details:', req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const policy = await HealthPolicy.findByPk(req.params.id);
    if (!policy) {
      console.error('[Health] Policy not found:', req.params.id);
      return res.status(404).json({ message: 'Policy not found' });
    }

    if (req.file) {
      if (policy.policy_document_path) {
        try {
          const oldFilePath = path.join(__dirname, '../uploads/health_policies', policy.policy_document_path);
          await fs.access(oldFilePath);
          await fs.unlink(oldFilePath);
          console.log('[Health] Old file deleted:', policy.policy_document_path);
        } catch (error) {
          console.warn('[Health] Could not delete old file:', error);
        }
      }
      req.body.policy_document_path = req.file.filename;
    }

    // Log initial values
    console.log('\n[Health] Initial Values:');
    console.log('company_id:', req.body.company_id, 'type:', typeof req.body.company_id);
    console.log('consumer_id:', req.body.consumer_id, 'type:', typeof req.body.consumer_id);
    console.log('customer_type:', req.body.customer_type);

    // Convert string 'null' or '' or undefined to actual null for company_id and consumer_id
    if (req.body.company_id === '' || req.body.company_id === 'null' || req.body.company_id === undefined) req.body.company_id = null;
    if (req.body.consumer_id === '' || req.body.consumer_id === 'null' || req.body.consumer_id === undefined) req.body.consumer_id = null;
    
    // Validate customer type and IDs
    if (req.body.customer_type === 'Organisation') {
      if (!req.body.company_id) {
        console.error('[Health] Organisation selected but no company_id provided');
        return res.status(400).json({ message: 'Company ID is required for Organisation type' });
      }
      req.body.consumer_id = null;
    } else if (req.body.customer_type === 'Individual') {
      if (!req.body.consumer_id) {
        console.error('[Health] Individual selected but no consumer_id provided');
        return res.status(400).json({ message: 'Consumer ID is required for Individual type' });
      }
      req.body.company_id = null;
    } else {
      console.error('[Health] Invalid customer_type:', req.body.customer_type);
      return res.status(400).json({ message: 'Invalid customer type' });
    }

    // Log final values before update
    console.log('\n[Health] Final Values Before Update:');
    console.log('company_id:', req.body.company_id, 'type:', typeof req.body.company_id);
    console.log('consumer_id:', req.body.consumer_id, 'type:', typeof req.body.consumer_id);
    console.log('customer_type:', req.body.customer_type);
    console.log('proposer_name:', req.body.proposer_name);

    await policy.update(req.body);
    const updatedPolicy = await HealthPolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('\n[Health] Policy updated successfully:', {
      id: updatedPolicy.id,
      documentPath: updatedPolicy.policy_document_path,
      company_id: updatedPolicy.company_id,
      consumer_id: updatedPolicy.consumer_id
    });
    console.log('=== End Update Policy Request ===\n');

    res.json(updatedPolicy);
  } catch (error) {
    console.error('\n[Health] Error updating policy:', error);
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

exports.deletePolicy = async (req, res) => {
  try {
    const policy = await HealthPolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    await policy.update({ status: 'cancelled' });
    res.json({ message: 'Policy cancelled successfully' });
  } catch (error) {
    console.error('Error deleting health policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.searchPolicies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    console.log(`[HealthPolicyController] Searching policies with query: "${q}"`);

    const policies = await HealthPolicy.findAll({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('policy_number')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('proposer_name')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('mobile_number')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('plan_name')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('medical_cover')), 'LIKE', `%${q.toLowerCase()}%`)
        ]
      },
      include: [
        {
          model: Company,
          as: 'companyPolicyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number'],
          required: false,
          where: sequelize.where(sequelize.fn('LOWER', sequelize.col('companyPolicyHolder.company_name')), 'LIKE', `%${q.toLowerCase()}%`)
        },
        {
          model: Consumer,
          as: 'consumerPolicyHolder',
          attributes: ['consumer_id', 'name', 'email', 'phone_number'],
          required: false,
          where: sequelize.where(sequelize.fn('LOWER', sequelize.col('consumerPolicyHolder.name')), 'LIKE', `%${q.toLowerCase()}%`)
        },
        {
          model: InsuranceCompany,
          as: 'provider',
          attributes: ['id', 'name'],
          required: false,
          where: sequelize.where(sequelize.fn('LOWER', sequelize.col('provider.name')), 'LIKE', `%${q.toLowerCase()}%`)
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Also search for policies where the company or consumer name matches, even if other fields don't
    const policiesByCompany = await HealthPolicy.findAll({
      include: [
        {
          model: Company,
          as: 'companyPolicyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number'],
          required: true,
          where: sequelize.where(sequelize.fn('LOWER', sequelize.col('companyPolicyHolder.company_name')), 'LIKE', `%${q.toLowerCase()}%`)
        },
        {
          model: InsuranceCompany,
          as: 'provider',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const policiesByConsumer = await HealthPolicy.findAll({
      include: [
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

    const policiesByInsuranceCompany = await HealthPolicy.findAll({
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

    console.log(`[HealthPolicyController] Found ${uniquePolicies.length} policies for query: "${q}"`);

    res.json({ success: true, policies: uniquePolicies });
  } catch (error) {
    console.error('Error searching health policies:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}; 