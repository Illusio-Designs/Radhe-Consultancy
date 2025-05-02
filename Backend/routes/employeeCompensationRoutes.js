const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const employeeCompensationController = require('../controllers/employeeCompensationController');
const { auth } = require('../middleware/auth');

// Validation middleware
const validatePolicy = [
  check('businessType')
    .isIn(['Fresh/New', 'Renewal/Rollover', 'Endorsement'])
    .withMessage('Invalid business type'),
  check('customerType')
    .isIn(['Organisation', 'Individual'])
    .withMessage('Invalid customer type'),
  check('insuranceCompanyId')
    .notEmpty()
    .withMessage('Insurance company is required'),
  check('companyId')
    .notEmpty()
    .withMessage('Company is required'),
  check('policyNumber')
    .notEmpty()
    .withMessage('Policy number is required'),
  check('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  check('mobileNumber')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid mobile number'),
  check('policyStartDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  check('policyEndDate')
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  check('medicalCover')
    .isIn(['25k', '50k', '1 lac', '2 lac', '3 lac', '5 lac', 'actual'])
    .withMessage('Invalid medical cover amount'),
  check('netPremium')
    .isFloat({ min: 0 })
    .withMessage('Net premium must be a positive number'),
  check('gstNumber')
    .optional()
    .matches(/^[0-9A-Z]{15}$/)
    .withMessage('Please provide a valid GST number'),
  check('panNumber')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Please provide a valid PAN number'),
];

// Routes
router.get('/', auth, employeeCompensationController.getAllPolicies);
router.get('/search', auth, employeeCompensationController.searchPolicies);
router.get('/:id', auth, employeeCompensationController.getPolicy);

// Create policy with file upload
router.post('/', 
  auth,
  employeeCompensationController.upload,
  validatePolicy,
  employeeCompensationController.createPolicy
);

// Update policy with file upload
router.put('/:id',
  auth,
  employeeCompensationController.upload,
  validatePolicy,
  employeeCompensationController.updatePolicy
);

router.delete('/:id', auth, employeeCompensationController.deletePolicy);

module.exports = router; 