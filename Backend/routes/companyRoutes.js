const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { auth } = require('../middleware/auth');
const { uploadCompanyDocuments } = require('../config/multerConfig');
const { check } = require('express-validator');

// Create a new company
router.post('/', 
    auth, 
    uploadCompanyDocuments,
    [
        check('company_name').notEmpty().withMessage('Company name is required'),
        check('owner_name').notEmpty().withMessage('Owner name is required'),
        check('company_address').notEmpty().withMessage('Company address is required'),
        check('contact_number').notEmpty().withMessage('Contact number is required'),
        check('company_email').isEmail().withMessage('Valid email is required'),
        check('gst_number').notEmpty().withMessage('GST number is required'),
        check('pan_number').notEmpty().withMessage('PAN number is required'),
        check('firm_type').notEmpty().withMessage('Firm type is required'),
        check('nature_of_work').notEmpty().withMessage('Nature of work is required'),
        check('type_of_company').notEmpty().withMessage('Type of company is required')
    ],
    companyController.createCompany
);

// Get all companies
router.get('/', auth, companyController.getAllCompanies);

// Get all company vendors
router.get('/vendors', auth, companyController.getAllCompanyVendors);

// Get company by ID
router.get('/:id', auth, companyController.getCompanyById);

// Update company
router.put('/:id', 
    auth, 
    uploadCompanyDocuments,
    [
        check('company_name').notEmpty().withMessage('Company name is required'),
        check('owner_name').notEmpty().withMessage('Owner name is required'),
        check('company_address').notEmpty().withMessage('Company address is required'),
        check('contact_number').notEmpty().withMessage('Contact number is required'),
        check('company_email').isEmail().withMessage('Valid email is required'),
        check('gst_number').notEmpty().withMessage('GST number is required'),
        check('pan_number').notEmpty().withMessage('PAN number is required'),
        check('firm_type').notEmpty().withMessage('Firm type is required'),
        check('nature_of_work').notEmpty().withMessage('Nature of work is required'),
        check('type_of_company').notEmpty().withMessage('Type of company is required')
    ],
    (req, res, next) => {
        console.log('[CompanyRoutes] Update request received:', {
            body: req.body,
            files: req.files
        });
        next();
    },
    companyController.updateCompany
);

// Delete company
router.delete('/:id', auth, companyController.deleteCompany);

// Search companies
router.get('/search', auth, (req, res, next) => {
  console.log('[DEBUG] /companies/search route hit. User:', req.user);
  next();
}, companyController.searchCompanies);

module.exports = router; 