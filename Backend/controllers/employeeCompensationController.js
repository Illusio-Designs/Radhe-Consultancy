const EmployeeCompensationPolicy = require('../models/EmployeeCompensationPolicy');
const Company = require('../models/companyModel');
const InsuranceCompany = require('../models/InsuranceCompany');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for policy document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/policies');
  },
  filename: (req, file, cb) => {
    cb(null, `policy-${Date.now()}${path.extname(file.originalname)}`);
  }
});

exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF and Word documents are allowed'));
  }
}).single('policyDocument');

// Get all policies with pagination
exports.getAllPolicies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const policies = await EmployeeCompensationPolicy.findAndCountAll({
      include: [
        { model: Company, as: 'company' },
        { model: InsuranceCompany, as: 'insuranceCompany' }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
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
        { model: Company, as: 'company' },
        { model: InsuranceCompany, as: 'insuranceCompany' }
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.file) {
      req.body.policyDocumentPath = req.file.path;
    }

    const policy = await EmployeeCompensationPolicy.create(req.body);
    
    // Fetch the created policy with associations
    const createdPolicy = await EmployeeCompensationPolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'company' },
        { model: InsuranceCompany, as: 'insuranceCompany' }
      ]
    });

    res.status(201).json(createdPolicy);
  } catch (error) {
    console.error('Error creating policy:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Policy number must be unique' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update policy
exports.updatePolicy = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const policy = await EmployeeCompensationPolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    if (req.file) {
      req.body.policyDocumentPath = req.file.path;
    }

    await policy.update(req.body);

    // Fetch the updated policy with associations
    const updatedPolicy = await EmployeeCompensationPolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'company' },
        { model: InsuranceCompany, as: 'insuranceCompany' }
      ]
    });

    res.json(updatedPolicy);
  } catch (error) {
    console.error('Error updating policy:', error);
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
        { model: Company, as: 'company' },
        { model: InsuranceCompany, as: 'insuranceCompany' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(policies);
  } catch (error) {
    console.error('Error searching policies:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 