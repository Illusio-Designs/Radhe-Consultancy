const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { auth, checkRole } = require('../middleware/auth');
const { uploadCompanyDocuments } = require('../config/multerConfig');

// Create a new company (admin and vendor manager only)
router.post('/', 
  auth, 
  checkRole(['admin', 'vendor_manager']),
  uploadCompanyDocuments,
  companyController.createCompany
);

// Get all companies (admin, vendor manager, and user manager)
router.get('/', 
  auth, 
  checkRole(['admin', 'vendor_manager', 'user_manager']), 
  companyController.getAllCompanies
);

// Get company by ID (admin, vendor manager, user manager, and company users)
router.get('/:id', 
  auth, 
  checkRole(['admin', 'vendor_manager', 'user_manager', 'company']), 
  companyController.getCompanyById
);

// Update company (admin, vendor manager, and company users)
router.put('/:id', 
  auth, 
  checkRole(['admin', 'vendor_manager', 'company']),
  uploadCompanyDocuments,
  companyController.updateCompany
);

module.exports = router; 