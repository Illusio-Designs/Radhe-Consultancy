const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const healthPolicyController = require('../controllers/healthPolicyController');
const { auth } = require('../middleware/auth');
const { uploadHealthPolicyDocument } = require('../config/multerConfig');

const validatePolicy = [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Middleware to check if file was uploaded
const checkFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Policy document is required' });
  }
  next();
};

// Middleware to validate file type
const validateFileType = (req, res, next) => {
  if (req.file) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only PDF, Word documents, and images are allowed' });
    }
  }
  next();
};

// Middleware to log request details
const logRequest = (req, res, next) => {
  console.log('[Health] Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    file: req.file
  });
  next();
};

router.get('/companies', auth, healthPolicyController.getActiveCompanies);
router.get('/consumers', auth, healthPolicyController.getActiveConsumers);
router.get('/insurance-companies', auth, healthPolicyController.getActiveInsuranceCompanies);
router.get('/', auth, healthPolicyController.getAllPolicies);

// Statistics endpoint
router.get('/statistics', auth, healthPolicyController.getHealthStatistics);

// Grouped policies endpoint
router.get('/all-grouped', auth, healthPolicyController.getAllPoliciesGrouped);

router.get('/search', auth, healthPolicyController.searchPolicies);
router.get('/:id', auth, healthPolicyController.getPolicy);

router.post('/',
  auth,
  logRequest,
  uploadHealthPolicyDocument.single('policyDocument'),
  healthPolicyController.logFormData,
  checkFileUpload,
  validateFileType,
  [
    check('business_type').isIn(['Fresh/New', 'Renewal/Rollover', 'Endorsement']).withMessage('Invalid business type'),
    check('customer_type').isIn(['Organisation', 'Individual']).withMessage('Invalid customer type'),
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('policy_number').notEmpty().withMessage('Policy number is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('mobile_number').matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid mobile number'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('policy_end_date').isISO8601().withMessage('Please provide a valid end date'),
    check('plan_name').notEmpty().withMessage('Plan name is required'),
    check('medical_cover').isIn(['5', '7', '10', '15', '20', '25']).withMessage('Invalid medical cover'),
    check('net_premium').isFloat({ min: 0 }).withMessage('Net premium must be a positive number'),
    check('remarks').optional()
  ],
  validatePolicy,
  healthPolicyController.createPolicy
);

router.put('/:id',
  auth,
  logRequest,
  uploadHealthPolicyDocument.single('policyDocument'),
  healthPolicyController.logFormData,
  validateFileType,
  [
    check('business_type').isIn(['Fresh/New', 'Renewal/Rollover', 'Endorsement']).withMessage('Invalid business type'),
    check('customer_type').isIn(['Organisation', 'Individual']).withMessage('Invalid customer type'),
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('policy_number').notEmpty().withMessage('Policy number is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('mobile_number').matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid mobile number'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('policy_end_date').isISO8601().withMessage('Please provide a valid end date'),
    check('plan_name').notEmpty().withMessage('Plan name is required'),
    check('medical_cover').isIn(['5', '7', '10', '15', '20', '25']).withMessage('Invalid medical cover'),
    check('net_premium').isFloat({ min: 0 }).withMessage('Net premium must be a positive number'),
    check('remarks').optional()
  ],
  validatePolicy,
  healthPolicyController.updatePolicy
);

router.delete('/:id', auth, healthPolicyController.deletePolicy);

// Renewal routes
router.post('/:id/renew',
  auth,
  logRequest,
  uploadHealthPolicyDocument.single('policyDocument'),
  healthPolicyController.logFormData,
  validateFileType,
  [
    check('business_type').equals('Renewal/Rollover').withMessage('Business type must be Renewal/Rollover for renewal'),
    check('customer_type').isIn(['Organisation', 'Individual']).withMessage('Invalid customer type'),
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('policy_number').notEmpty().withMessage('Policy number is required'),
    check('proposer_name').notEmpty().withMessage('Proposer name is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('mobile_number').matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid mobile number'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('policy_end_date').isISO8601().withMessage('Please provide a valid end date'),
    check('plan_name').notEmpty().withMessage('Plan name is required'),
    check('medical_cover').isIn(['1 lac', '2 lac', '3 lac', '5 lac', '10 lac', '15 lac', '20 lac', '25 lac', '30 lac', '50 lac', '1 crore', '2 crore', '5 crore']).withMessage('Invalid medical cover'),
    check('net_premium').isFloat({ min: 0 }).withMessage('Net premium must be a positive number'),
    check('gst').isFloat({ min: 0 }).withMessage('GST must be a positive number'),
    check('gross_premium').isFloat({ min: 0 }).withMessage('Gross premium must be a positive number'),
    check('remarks').optional()
  ],
  validatePolicy,
  checkFileUpload,
  healthPolicyController.renewPolicy
);

// Previous policies routes
router.get('/previous', auth, healthPolicyController.getPreviousPolicies);
router.get('/previous/:id', auth, healthPolicyController.getPreviousPolicyById);

module.exports = router; 