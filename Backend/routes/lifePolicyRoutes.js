const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const lifePolicyController = require('../controllers/lifePolicyController');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/life_policies');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'life-policy-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG files are allowed.'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: 'Only PDF and Word documents are allowed' });
    }
  }
  next();
};

// Middleware to log request details
const logRequest = (req, res, next) => {
  console.log('[Life] Request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    file: req.file
  });
  next();
};

router.get('/companies', auth, lifePolicyController.getActiveCompanies);
router.get('/consumers', auth, lifePolicyController.getActiveConsumers);
router.get('/', auth, lifePolicyController.getAllPolicies);
router.get('/search', auth, lifePolicyController.searchPolicies);
router.get('/:id', auth, lifePolicyController.getPolicy);

router.post('/',
  auth,
  logRequest,
  upload.single('policy_document'),
  lifePolicyController.logFormData,
  checkFileUpload,
  validateFileType,
  [
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('date_of_birth').isISO8601().withMessage('Please provide a valid date of birth'),
    check('plan_name').notEmpty().withMessage('Plan name is required'),
    check('sub_product').notEmpty().withMessage('Sub product is required'),
    check('pt').isFloat({ min: 0 }).withMessage('PT must be a positive number'),
    check('ppt').isInt({ min: 1 }).withMessage('PPT must be a positive integer'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('issue_date').isISO8601().withMessage('Please provide a valid issue date'),
    check('current_policy_number').notEmpty().withMessage('Current policy number is required'),
    check('remarks').optional().isString().withMessage('Remarks must be a string')
  ],
  validatePolicy,
  lifePolicyController.createPolicy
);

router.put('/:id',
  auth,
  logRequest,
  upload.single('policy_document'),
  lifePolicyController.logFormData,
  validateFileType,
  [
    check('insurance_company_id').notEmpty().withMessage('Insurance company is required'),
    check('date_of_birth').isISO8601().withMessage('Please provide a valid date of birth'),
    check('plan_name').notEmpty().withMessage('Plan name is required'),
    check('sub_product').notEmpty().withMessage('Sub product is required'),
    check('pt').isFloat({ min: 0 }).withMessage('PT must be a positive number'),
    check('ppt').isInt({ min: 1 }).withMessage('PPT must be a positive integer'),
    check('policy_start_date').isISO8601().withMessage('Please provide a valid start date'),
    check('issue_date').isISO8601().withMessage('Please provide a valid issue date'),
    check('current_policy_number').notEmpty().withMessage('Current policy number is required'),
    check('remarks').optional().isString().withMessage('Remarks must be a string')
  ],
  validatePolicy,
  lifePolicyController.updatePolicy
);

router.delete('/:id', auth, lifePolicyController.deletePolicy);

module.exports = router; 