const EmployeeCompensationPolicy = require('../models/employeeCompensationPolicyModel');
const Company = require('../models/companyModel');
const InsuranceCompany = require('../models/insuranceCompanyModel');
const { validationResult } = require('express-validator');
const { uploadEmployeePolicyDocument } = require('../config/multerConfig');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { UserRoleWorkLog } = require('../models');


// Use the configured multer instance for employee policy documents
exports.upload = uploadEmployeePolicyDocument;

// Add middleware to log the request body after multer processing
exports.logFormData = (req, res, next) => {
  console.log('=== Multer Processed FormData ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Request File:', req.file ? {
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    encoding: req.file.encoding,
    mimetype: req.file.mimetype,
    destination: req.file.destination,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size
  } : 'No file uploaded');
  console.log('=== End Multer Processed FormData ===');
  next();
};

// Get active companies
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

// Get all policies with pagination
exports.getAllPolicies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * limit;

    // Debug log: pagination parameters
    console.log('[getAllPolicies] Pagination parameters:', {
      page,
      limit,
      pageSize: req.query.pageSize,
      limitParam: req.query.limit,
      offset,
      query: req.query
    });

    // Debug log: who is requesting and what roles
    if (req.user) {
      console.log('[getAllPolicies] Requested by user:', req.user.user_id, 'roles:', req.user.roles || req.user.role_name);
    } else {
      console.log('[getAllPolicies] Requested by unknown user');
    }

    const policies = await EmployeeCompensationPolicy.findAndCountAll({
      include: [
        { 
          model: Company, 
          as: 'policyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
        },
        { model: InsuranceCompany, as: 'provider' }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // Debug log: how many policies found
    console.log('[getAllPolicies] Found policies:', policies.count);

    res.json({
      policies: policies.rows,
      totalPages: Math.ceil(policies.count / limit),
      currentPage: page,
      totalItems: policies.count
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single policy
exports.getPolicy = async (req, res) => {
  try {
    const policy = await EmployeeCompensationPolicy.findByPk(req.params.id, {
      include: [
        { model: Company, as: 'policyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.json(policy);
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create policy
exports.createPolicy = async (req, res) => {
  try {
    console.log('[EmployeeCompensation] Creating new policy with data:', {
      body: req.body,
      file: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        destination: req.file.destination,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      } : 'No file uploaded',
      files: req.files
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[EmployeeCompensation] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate file upload
    if (!req.file) {
      console.error('[EmployeeCompensation] No file uploaded');
      console.log('[EmployeeCompensation] Request body:', req.body);
      console.log('[EmployeeCompensation] Request file:', req.file);
      console.log('[EmployeeCompensation] Request files:', req.files);
      return res.status(400).json({ message: 'Policy document is required' });
    }

    // Store filename in database
    const filename = req.file.filename;
    console.log('[EmployeeCompensation] Storing filename:', filename);

    // Create policy with document filename
    const policyData = {
      ...req.body,
      policy_document_path: filename,
      status: 'active' // Set default status
    };

    console.log('[EmployeeCompensation] Creating policy with data:', policyData);

    const policy = await EmployeeCompensationPolicy.create(policyData);
    
    // Fetch the created policy with associations
    const createdPolicy = await EmployeeCompensationPolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'policyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('\n[ECP] Policy created successfully:', {
      id: createdPolicy.id,
      documentPath: createdPolicy.policy_document_path,
      company_id: createdPolicy.company_id,
      consumer_id: createdPolicy.consumer_id
    });

    // Log the action
    try {
      let companyName = null;
      
      if (createdPolicy.company_id) {
        const company = await Company.findByPk(createdPolicy.company_id);
        if (company) {
          companyName = company.company_name;
        }
      }
      
      const logDetails = {
        policy_id: createdPolicy.id,
        policy_number: createdPolicy.policy_number,
        customer_type: createdPolicy.customer_type,
        company_id: createdPolicy.company_id,
        consumer_id: createdPolicy.consumer_id,
        total_employees: createdPolicy.total_employees,
        total_wages: createdPolicy.total_wages,
        proposer_name: createdPolicy.proposer_name,
        company_name: companyName
      };
      
      console.log('[ECP LOG DEBUG]', {
        company_id: createdPolicy.company_id,
        companyName,
        logDetails
      });
      
      // Log the action
      try {
        let targetUserId = null;
        
        if (createdPolicy.company_id) {
          const company = await Company.findByPk(createdPolicy.company_id);
          if (company) {
            targetUserId = company.user_id; // Use the company's user_id instead of company_id
          }
        }
        
        if (targetUserId) {
      await UserRoleWorkLog.create({
        user_id: req.user?.user_id || null,
            target_user_id: targetUserId,
        role_id: null,
        action: 'created_ecp_policy',
        details: JSON.stringify(logDetails)
      });
        }
      } catch (logErr) { 
        console.error('Log error:', logErr); 
        // Don't fail the main operation if logging fails
      }
      
    } catch (logErr) { 
      console.error('Log error:', logErr); 
      // Don't fail the main operation if logging fails
    }

    res.status(201).json(createdPolicy);
  } catch (error) {
    console.error('[EmployeeCompensationController] Error:', error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = error.errors ? error.errors.map(e => e.path).join(', ') : 'unknown';
      return res.status(400).json({ message: `Duplicate entry: ${fields} must be unique.` });
    } else if (error.name === 'SequelizeValidationError') {
      const details = error.errors ? error.errors.map(e => e.message).join('; ') : error.message;
      return res.status(400).json({ message: `Validation error: ${details}` });
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Invalid company or consumer ID', details: error.message });
    } else {
      return res.status(500).json({ message: `Employee compensation policy operation failed: ${error.message}` });
    }
  }
};

// Update policy
exports.updatePolicy = async (req, res) => {
  try {
    console.log('[EmployeeCompensation] Starting policy update process');
    console.log('[EmployeeCompensation] Request details:', {
      id: req.params.id,
      body: JSON.stringify(req.body, null, 2),
      file: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        destination: req.file.destination,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      } : 'No file uploaded'
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('[EmployeeCompensation] Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const policy = await EmployeeCompensationPolicy.findByPk(req.params.id);
    if (!policy) {
      console.log('[EmployeeCompensation] Policy not found:', req.params.id);
      return res.status(404).json({ message: 'Policy not found' });
    }

    console.log('[EmployeeCompensation] Found existing policy:', {
      id: policy.id,
      currentDocumentPath: policy.policy_document_path
    });

    // Handle file upload
    if (req.file) {
      console.log('[EmployeeCompensation] Processing new file upload:', {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      });

      // Delete old file if exists
      if (policy.policy_document_path) {
        try {
          const oldFilePath = path.join(__dirname, '..', 'uploads', 'employee_policies', policy.policy_document_path);
          console.log('[EmployeeCompensation] Attempting to delete old file:', oldFilePath);
          
          // Check if file exists before trying to delete
          if (fs.existsSync(oldFilePath)) {
            await fs.promises.unlink(oldFilePath);
            console.log('[EmployeeCompensation] Old file deleted successfully');
          } else {
            console.log('[EmployeeCompensation] Old file does not exist, skipping deletion');
          }
        } catch (error) {
          console.warn('[EmployeeCompensation] Could not delete old file:', error);
        }
      }

      // Store new filename in database
      req.body.policy_document_path = req.file.filename;
      console.log('[EmployeeCompensation] Storing new filename in database:', req.file.filename);
    } else {
      console.log('[EmployeeCompensation] No new file uploaded, keeping existing document');
      // Remove policy_document_path from req.body to prevent overwriting existing file
      delete req.body.policy_document_path;
    }

    // Update policy
    console.log('[EmployeeCompensation] Updating policy with data:', JSON.stringify(req.body, null, 2));
    await policy.update(req.body);
    
    // Fetch the updated policy with associations
    const updatedPolicy = await EmployeeCompensationPolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'policyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });

    console.log('\n[ECP] Policy updated successfully:', {
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
        action: 'updated_ecp_policy',
        details: JSON.stringify({
          policy_id: updatedPolicy.id,
          policy_number: updatedPolicy.policy_number,
          customer_type: updatedPolicy.customer_type,
          company_id: updatedPolicy.company_id,
          consumer_id: updatedPolicy.consumer_id,
          total_employees: updatedPolicy.total_employees,
          total_wages: updatedPolicy.total_wages,
          proposer_name: updatedPolicy.proposer_name,
          changes: req.body
        })
      });
      } else {
        console.warn('[ECP LOG] Skipping log creation - no valid target_user_id found');
      }
    } catch (logErr) { console.error('Log error:', logErr); }

    res.json(updatedPolicy);
  } catch (error) {
    console.error('[EmployeeCompensation] Error updating policy:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Policy number must be unique' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete policy
exports.deletePolicy = async (req, res) => {
  try {
    const policy = await EmployeeCompensationPolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
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
        action: 'cancelled_ecp_policy',
        details: JSON.stringify({
          policy_id: policy.id,
          policy_number: policy.policy_number,
          customer_type: policy.customer_type,
          company_id: policy.company_id,
          consumer_id: policy.consumer_id,
          total_employees: policy.total_employees,
          total_wages: policy.total_wages,
          proposer_name: policy.proposer_name
        })
      });
      } else {
        console.warn('[ECP LOG] Skipping log creation - no valid target_user_id found');
      }
    } catch (logErr) { console.error('Log error:', logErr); }

    res.json({ message: 'Policy cancelled successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get ECP statistics
exports.getECPStatistics = async (req, res) => {
  try {
    console.log('[EmployeeCompensationController] Getting ECP statistics');
    
    // Get total policies count
    const totalPolicies = await EmployeeCompensationPolicy.count();
    console.log('[EmployeeCompensationController] Total policies:', totalPolicies);

    // Get active policies count (all policies are considered active)
    const activePolicies = totalPolicies;
    
    // Get policies created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPolicies = await EmployeeCompensationPolicy.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    console.log('[EmployeeCompensationController] Recent policies:', recentPolicies);

    // Calculate percentages
    const percent = (val, total) => total > 0 ? Math.round((val / total) * 100) : 0;
    const activePercentage = percent(activePolicies, totalPolicies);
    const recentPercentage = percent(recentPolicies, totalPolicies);

    // Get policies by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await EmployeeCompensationPolicy.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.gte]: sixMonthsAgo
        }
      },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
      order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
      raw: true
    });

    const responseData = {
      total_policies: totalPolicies,
      active_policies: activePolicies,
      recent_policies: recentPolicies,
      percent_active: activePercentage,
      percent_recent: recentPercentage,
      monthly_stats: monthlyStats
    };

    console.log('[EmployeeCompensationController] ECP statistics:', responseData);
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('[EmployeeCompensationController] Error getting ECP statistics:', error);
    res.status(500).json({
      success: false,
      error: `Failed to get ECP statistics: ${error.message}`
    });
  }
};

// Search policies
exports.searchPolicies = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Missing search query' });
    }

    console.log(`[EmployeeCompensationController] Searching policies with query: "${q}"`);

    // Search in main policy fields
    const policies = await EmployeeCompensationPolicy.findAll({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('EmployeeCompensationPolicy.policy_number')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('EmployeeCompensationPolicy.email')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('EmployeeCompensationPolicy.mobile_number')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('EmployeeCompensationPolicy.medical_cover')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('EmployeeCompensationPolicy.gst_number')), 'LIKE', `%${q.toLowerCase()}%`),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('EmployeeCompensationPolicy.pan_number')), 'LIKE', `%${q.toLowerCase()}%`)
        ]
      },
      include: [
        {
          model: Company,
          as: 'policyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
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
    const policiesByCompany = await EmployeeCompensationPolicy.findAll({
      include: [
        {
          model: Company,
          as: 'policyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number'],
          required: true,
          where: sequelize.where(sequelize.fn('LOWER', sequelize.col('policyHolder.company_name')), 'LIKE', `%${q.toLowerCase()}%`)
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
    const policiesByInsuranceCompany = await EmployeeCompensationPolicy.findAll({
      include: [
        {
          model: Company,
          as: 'policyHolder',
          attributes: ['company_id', 'company_name', 'company_email', 'contact_number']
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
    const allPolicies = [...policies, ...policiesByCompany, ...policiesByInsuranceCompany];
    const uniquePolicies = allPolicies.filter((policy, index, self) => 
      index === self.findIndex(p => p.id === policy.id)
    );

    console.log(`[EmployeeCompensationController] Found ${uniquePolicies.length} policies for query: "${q}"`);

    res.json({ success: true, policies: uniquePolicies });
  } catch (error) {
    console.error('Error searching employee compensation policies:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}; 