const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const employeeCompensationController = require('../controllers/employeeCompensationController');
const { auth } = require('../middleware/auth');
const { uploadEmployeePolicyDocument } = require('../config/multerConfig');

// Add request logging middleware
const logRequest = (req, res, next) => {
  console.log('=== Request Details ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Files:', req.files);
  console.log('=== End Request Details ===');
  next();
};

// Validation middleware
const validatePolicy = [
  (req, res, next) => {
    console.log('=== Validation Middleware ===');
    console.log('Request Body:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('=== End Validation Middleware ===');
    next();
  }
];

// Middleware to check if file was uploaded
const checkFileUpload = (req, res, next) => {
  console.log('=== Checking File Upload ===');
  console.log('File object:', req.file);
  if (!req.file) {
    console.log('No file found in request');
    return res.status(400).json({ message: 'Policy document is required' });
  }
  console.log('File found:', req.file.originalname);
  next();
};

// Middleware to validate file type
const validateFileType = (req, res, next) => {
  console.log('=== Validating File Type ===');
  if (req.file) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    console.log('File type:', req.file.mimetype);
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.log('Invalid file type');
      return res.status(400).json({ message: 'Only PDF and Word documents are allowed' });
    }
    console.log('File type validated');
  }
  next();
};

// Routes
router.get('/companies', auth, employeeCompensationController.getActiveCompanies);
router.get('/', auth, employeeCompensationController.getAllPolicies);
router.get('/search', auth, employeeCompensationController.searchPolicies);
router.get('/:id', auth, employeeCompensationController.getPolicy);

// Create policy with file upload
router.post('/', 
  auth,
  logRequest,
  uploadEmployeePolicyDocument,
  employeeCompensationController.logFormData,
  checkFileUpload,
  validateFileType,
  [
    check('business_type').isIn(['Fresh/New', 'Renewal/Rollover', 'Endorsement']).withMessage('Invalid business type'),
    check('customer_type').isIn(['Organisation', 'Individual']).withMessage('Invalid customer type'),
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('company_id').notEmpty().withMessage('Company is required'),
    check('policy_number').notEmpty().withMessage('Policy number is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('mobile_number').matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid mobile number'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('policy_end_date').isISO8601().withMessage('Please provide a valid end date'),
    check('medical_cover').isIn(['25k', '50k', '1 lac', '2 lac', '3 lac', '5 lac', 'actual']).withMessage('Invalid medical cover amount'),
    check('net_premium').isFloat({ min: 0 }).withMessage('Net premium must be a positive number'),
    check('gst_number').optional(),
    check('pan_number').optional(),
    check('remarks').optional()
  ],
  validatePolicy,
  employeeCompensationController.createPolicy
);

// Update policy with file upload
router.put('/:id',
  auth,
  logRequest,
  uploadEmployeePolicyDocument,
  employeeCompensationController.logFormData,
  [
    check('business_type').isIn(['Fresh/New', 'Renewal/Rollover', 'Endorsement']).withMessage('Invalid business type'),
    check('customer_type').isIn(['Organisation', 'Individual']).withMessage('Invalid customer type'),
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('company_id').notEmpty().withMessage('Company is required'),
    check('policy_number').notEmpty().withMessage('Policy number is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('mobile_number').matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid mobile number'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('policy_end_date').isISO8601().withMessage('Please provide a valid end date'),
    check('medical_cover').isIn(['25k', '50k', '1 lac', '2 lac', '3 lac', '5 lac', 'actual']).withMessage('Invalid medical cover amount'),
    check('net_premium').isFloat({ min: 0 }).withMessage('Net premium must be a positive number'),
    check('gst_number').optional(),
    check('pan_number').optional(),
    check('remarks').optional()
  ],
  validatePolicy,
  employeeCompensationController.updatePolicy
);

router.delete('/:id', auth, employeeCompensationController.deletePolicy);

module.exports = router; 