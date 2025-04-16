const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { auth, checkRole } = require('../middleware/auth');

// Create a new company (admin and vendor manager only)
router.post('/', 
  auth, 
  checkRole(['admin', 'vendor_manager']), 
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
  companyController.updateCompany
);

// Delete company (admin and vendor manager only)
router.delete('/:id', 
  auth, 
  checkRole(['admin', 'vendor_manager']), 
  companyController.deleteCompany
);

module.exports = router; 