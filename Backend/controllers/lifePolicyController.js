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
const { UserRoleWorkLog } = require('../models');

// Helper function to calculate policy end date based on start date and term
const calculatePolicyEndDate = (policyStartDate, ppt) => {
  if (!policyStartDate || !ppt) return null;
  
  const startDate = new Date(policyStartDate);
  const endDate = new Date(startDate);
  endDate.setFullYear(startDate.getFullYear() + parseInt(ppt));
  
  return endDate;
};

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
    console.log('=== Multer Processed FormData ===');
    console.log('Request Body:', req.body);
    console.log('Request File:', req.file);
    console.log('=== End Multer Processed FormData ===');

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

    // Calculate policy end date based on start date and term
    if (req.body.policy_start_date && req.body.ppt) {
      policyData.policy_end_date = calculatePolicyEndDate(req.body.policy_start_date, req.body.ppt);
    }

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

    console.log('\n[Life] Policy created successfully:', {
      id: createdPolicy.id,
      documentPath: createdPolicy.policy_document_path,
      company_id: createdPolicy.company_id,
      consumer_id: createdPolicy.consumer_id
    });

    // Log the action
    try {
      let companyName = null;
      let targetUserId = null;
      
      if (createdPolicy.company_id) {
        const company = await Company.findByPk(createdPolicy.company_id);
        if (company) {
          companyName = company.company_name;
          targetUserId = company.user_id; // Use the company's user_id instead of company_id
        }
      }
      
      // Only create log if we have a valid target_user_id
      if (targetUserId) {
      await UserRoleWorkLog.create({
        user_id: req.user?.user_id || null,
          target_user_id: targetUserId, // Use the company's user_id
        role_id: null,
        action: 'created_life_policy',
        details: JSON.stringify({
          policy_id: createdPolicy.id,
          policy_number: createdPolicy.policy_number,
          customer_type: createdPolicy.customer_type,
          company_id: createdPolicy.company_id,
          consumer_id: createdPolicy.consumer_id,
          sum_assured: createdPolicy.sum_assured,
          proposer_name: createdPolicy.proposer_name,
          company_name: companyName
        })
      });
      } else {
        console.warn('[Life LOG] Skipping log creation - no valid target_user_id found');
      }
    } catch (logErr) { console.error('Log error:', logErr); }

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

    // Calculate policy end date if start date or term is being updated
    if (req.body.policy_start_date || req.body.ppt) {
      const startDate = req.body.policy_start_date || policy.policy_start_date;
      const ppt = req.body.ppt || policy.ppt;
      updateData.policy_end_date = calculatePolicyEndDate(startDate, ppt);
    }

    await policy.update(updateData);
    
    // Fetch the updated policy with associations
    const updatedPolicy = await LifePolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('\n[Life] Policy updated successfully:', {
      id: updatedPolicy.id,
      documentPath: updatedPolicy.policy_document_path,
      company_id: updatedPolicy.company_id,
      consumer_id: updatedPolicy.consumer_id
    });

    // Log the action
    try {
      let targetUserId = null;
      
      if (updatedPolicy.company_id) {
        const company = await Company.findByPk(updatedPolicy.company_id);
        if (company) {
          targetUserId = company.user_id; // Use the company's user_id instead of company_id
        }
      }
      
      // Only create log if we have a valid target_user_id
      if (targetUserId) {
      await UserRoleWorkLog.create({
        user_id: req.user?.user_id || null,
          target_user_id: targetUserId, // Use the company's user_id
        role_id: null,
        action: 'updated_life_policy',
        details: JSON.stringify({
          policy_id: updatedPolicy.id,
          policy_number: updatedPolicy.policy_number,
          customer_type: updatedPolicy.customer_type,
          company_id: updatedPolicy.company_id,
          consumer_id: updatedPolicy.consumer_id,
          sum_assured: updatedPolicy.sum_assured,
          proposer_name: updatedPolicy.proposer_name,
          changes: req.body
        })
      });
      } else {
        console.warn('[Life LOG] Skipping log creation - no valid target_user_id found');
      }
    } catch (logErr) { console.error('Log error:', logErr); }

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

    await policy.update({ status: 'cancelled' });

    // Log the action
    try {
      let targetUserId = null;
      
      if (policy.company_id) {
        const company = await Company.findByPk(policy.company_id);
        if (company) {
          targetUserId = company.user_id; // Use the company's user_id instead of company_id
        }
      }
      
      // Only create log if we have a valid target_user_id
      if (targetUserId) {
      await UserRoleWorkLog.create({
        user_id: req.user?.user_id || null,
          target_user_id: targetUserId, // Use the company's user_id
        role_id: null,
        action: 'cancelled_life_policy',
        details: JSON.stringify({
          policy_id: policy.id,
          policy_number: policy.policy_number,
          customer_type: policy.customer_type,
          company_id: policy.company_id,
          consumer_id: policy.consumer_id,
          sum_assured: policy.sum_assured,
          proposer_name: policy.proposer_name
        })
      });
      } else {
        console.warn('[Life LOG] Skipping log creation - no valid target_user_id found');
      }
    } catch (logErr) { console.error('Log error:', logErr); }

    res.json({ message: 'Policy cancelled successfully' });
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

exports.getLifeStatistics = async (req, res) => {
  try {
    // Get total policies count
    const totalPolicies = await LifePolicy.count();

    // Get active policies count (policies with end date in future)
    const activePolicies = await LifePolicy.count({
      where: {
        policy_end_date: {
          [Op.gte]: new Date()
        }
      }
    });

    // Get recent policies count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPolicies = await LifePolicy.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    // Get monthly statistics for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await LifePolicy.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%M'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(currentYear, 0, 1),
          [Op.lt]: new Date(currentYear + 1, 0, 1)
        }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%M')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%m'), 'ASC']]
    });

    res.json({
      totalPolicies,
      activePolicies,
      recentPolicies,
      monthlyStats
    });
  } catch (error) {
    console.error('Error fetching life policy statistics:', error);
    res.status(500).json({ 
      message: 'Failed to get life policy statistics',
      error: error.message 
    });
  }
}; 