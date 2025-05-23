const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const firePolicyController = require('../controllers/firePolicyController');
const { auth } = require('../middleware/auth');
const { uploadFirePolicyDocument } = require('../config/multerConfig');

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

// Dropdown endpoints
router.get('/companies', auth, firePolicyController.getActiveCompanies);
router.get('/consumers', auth, firePolicyController.getActiveConsumers);
router.get('/insurance-companies', auth, firePolicyController.getActiveInsuranceCompanies);

// CRUD endpoints
router.get('/', auth, firePolicyController.getAllPolicies);
router.get('/:id', auth, firePolicyController.getPolicy);

router.post('/',
  auth,
  uploadFirePolicyDocument.single('policyDocument'),
  firePolicyController.logFormData,
  checkFileUpload,
  [
    check('business_type').isIn(['Fresh/New', 'Renewal/Rollover', 'Endorsement']).withMessage('Invalid business type'),
    check('customer_type').isIn(['Organisation', 'Individual']).withMessage('Invalid customer type'),
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('policy_number').notEmpty().withMessage('Policy number is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('mobile_number').matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid mobile number'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('policy_end_date').isISO8601().withMessage('Please provide a valid end date'),
    check('total_sum_insured').isFloat({ min: 0 }).withMessage('Total sum insured must be a positive number'),
    check('net_premium').isFloat({ min: 0 }).withMessage('Net premium must be a positive number'),
    check('remarks').optional()
  ],
  validatePolicy,
  firePolicyController.createPolicy
);

router.put('/:id',
  auth,
  uploadFirePolicyDocument.single('policyDocument'),
  firePolicyController.logFormData,
  [
    check('business_type').isIn(['Fresh/New', 'Renewal/Rollover', 'Endorsement']).withMessage('Invalid business type'),
    check('customer_type').isIn(['Organisation', 'Individual']).withMessage('Invalid customer type'),
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('policy_number').notEmpty().withMessage('Policy number is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('mobile_number').matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid mobile number'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('policy_end_date').isISO8601().withMessage('Please provide a valid end date'),
    check('total_sum_insured').isFloat({ min: 0 }).withMessage('Total sum insured must be a positive number'),
    check('net_premium').isFloat({ min: 0 }).withMessage('Net premium must be a positive number'),
    check('remarks').optional()
  ],
  validatePolicy,
  firePolicyController.updatePolicy
);

router.delete('/:id', auth, firePolicyController.deletePolicy);

// Search endpoint
router.get('/search', auth, firePolicyController.searchPolicies);

module.exports = router; 