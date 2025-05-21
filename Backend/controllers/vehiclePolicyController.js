const VehiclePolicy = require('../models/vehiclePolicyModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const InsuranceCompany = require('../models/insuranceCompanyModel');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

// Configure multer for vehicle policy document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/vehicle_policies');
  },
  filename: (req, file, cb) => {
    cb(null, `vehicle-policy-${Date.now()}${path.extname(file.originalname)}`);
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.file) {
      req.body.policy_document_path = req.file.path;
    }

    const policy = await VehiclePolicy.create(req.body);
    const createdPolicy = await VehiclePolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });
    res.status(201).json(createdPolicy);
  } catch (error) {
    console.error('Error creating vehicle policy:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Policy number must be unique' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updatePolicy = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const policy = await VehiclePolicy.findByPk(req.params.id);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    if (req.file) {
      req.body.policy_document_path = req.file.path;
    }

    await policy.update(req.body);
    const updatedPolicy = await VehiclePolicy.findByPk(policy.id, {
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' },
        { model: InsuranceCompany, as: 'provider' }
      ]
    });
    res.json(updatedPolicy);
  } catch (error) {
    console.error('Error updating vehicle policy:', error);
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