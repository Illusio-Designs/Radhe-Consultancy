const EmployeeCompensationPolicy = require('../models/employeeCompensationPolicyModel');
const Company = require('../models/companyModel');
const InsuranceCompany = require('../models/insuranceCompanyModel');
const { validationResult } = require('express-validator');
const { uploadEmployeePolicyDocument } = require('../config/multerConfig');
const path = require('path');
const fs = require('fs');

// Use the configured multer instance for employee policy documents
exports.upload = uploadEmployeePolicyDocument.single('policyDocument');

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
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

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
      file: req.file
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Validate file upload
    if (!req.file) {
      console.error('[EmployeeCompensation] No file uploaded');
      return res.status(400).json({ message: 'Policy document is required' });
    }

    // Store filename in database
    const filename = req.file.filename;
    console.log('[EmployeeCompensation] Storing filename:', filename);

    // Create policy with document filename
    const policyData = {
      ...req.body,
      policy_document_path: filename
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

    console.log('[EmployeeCompensation] Policy created successfully:', {
      id: createdPolicy.id,
      documentPath: createdPolicy.policy_document_path
    });

    res.status(201).json(createdPolicy);
  } catch (error) {
    console.error('[EmployeeCompensation] Error creating policy:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Policy number must be unique' });
    }
    res.status(500).json({ message: 'Internal server error' });
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

    console.log('[EmployeeCompensation] Policy updated successfully:', {
      id: updatedPolicy.id,
      documentPath: updatedPolicy.policy_document_path,
      updatedAt: updatedPolicy.updated_at
    });

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
    res.json({ message: 'Policy cancelled successfully' });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search policies
exports.searchPolicies = async (req, res) => {
  try {
    const {
      policyNumber,
      companyId,
      insuranceCompanyId,
      startDate,
      endDate,
      status
    } = req.query;

    const where = {};

    if (policyNumber) where.policyNumber = policyNumber;
    if (companyId) where.companyId = companyId;
    if (insuranceCompanyId) where.insuranceCompanyId = insuranceCompanyId;
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.policyStartDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const policies = await EmployeeCompensationPolicy.findAll({
      where,
      include: [
        { model: Company, as: 'policyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(policies);
  } catch (error) {
    console.error('Error searching policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 