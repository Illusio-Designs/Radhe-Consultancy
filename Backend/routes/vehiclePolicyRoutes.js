const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const vehiclePolicyController = require('../controllers/vehiclePolicyController');
const { auth } = require('../middleware/auth');

const validatePolicy = [
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.get('/companies', auth, vehiclePolicyController.getActiveCompanies);
router.get('/', auth, vehiclePolicyController.getAllPolicies);
router.get('/search', auth, vehiclePolicyController.searchPolicies);
router.get('/:id', auth, vehiclePolicyController.getPolicy);

router.post('/',
  auth,
  vehiclePolicyController.upload,
  vehiclePolicyController.logFormData,
  [
    check('business_type').isIn(['Fresh/New', 'Renewal/Rollover', 'Endorsement']).withMessage('Invalid business type'),
    check('customer_type').isIn(['Organisation', 'Individual']).withMessage('Invalid customer type'),
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('policy_number').notEmpty().withMessage('Policy number is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('mobile_number').matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid mobile number'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('policy_end_date').isISO8601().withMessage('Please provide a valid end date'),
    check('sub_product').isIn(['Two Wheeler', 'Private car', 'Passanger Vehicle', 'Goods Vehicle', 'Misc - D Vehicle', 'Standalone CPA']).withMessage('Invalid sub product'),
    check('vehicle_number').notEmpty().withMessage('Vehicle number is required'),
    check('segment').isIn(['Comprehensive', 'TP Only', 'SAOD']).withMessage('Invalid segment'),
    check('manufacturing_company').notEmpty().withMessage('Manufacturing company is required'),
    check('model').notEmpty().withMessage('Model is required'),
    check('manufacturing_year').notEmpty().withMessage('Manufacturing year is required'),
    check('idv').isFloat({ min: 0 }).withMessage('IDV must be a positive number'),
    check('net_premium').isFloat({ min: 0 }).withMessage('Net premium must be a positive number'),
    check('remarks').optional()
  ],
  validatePolicy,
  vehiclePolicyController.createPolicy
);

router.put('/:id',
  auth,
  vehiclePolicyController.upload,
  vehiclePolicyController.logFormData,
  [
    check('business_type').isIn(['Fresh/New', 'Renewal/Rollover', 'Endorsement']).withMessage('Invalid business type'),
    check('customer_type').isIn(['Organisation', 'Individual']).withMessage('Invalid customer type'),
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('policy_number').notEmpty().withMessage('Policy number is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('mobile_number').matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid mobile number'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('policy_end_date').isISO8601().withMessage('Please provide a valid end date'),
    check('sub_product').isIn(['Two Wheeler', 'Private car', 'Passanger Vehicle', 'Goods Vehicle', 'Misc - D Vehicle', 'Standalone CPA']).withMessage('Invalid sub product'),
    check('vehicle_number').notEmpty().withMessage('Vehicle number is required'),
    check('segment').isIn(['Comprehensive', 'TP Only', 'SAOD']).withMessage('Invalid segment'),
    check('manufacturing_company').notEmpty().withMessage('Manufacturing company is required'),
    check('model').notEmpty().withMessage('Model is required'),
    check('manufacturing_year').notEmpty().withMessage('Manufacturing year is required'),
    check('idv').isFloat({ min: 0 }).withMessage('IDV must be a positive number'),
    check('net_premium').isFloat({ min: 0 }).withMessage('Net premium must be a positive number'),
    check('remarks').optional()
  ],
  validatePolicy,
  vehiclePolicyController.updatePolicy
);

router.delete('/:id', auth, vehiclePolicyController.deletePolicy);

module.exports = router; 