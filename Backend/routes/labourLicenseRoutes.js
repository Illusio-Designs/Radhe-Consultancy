const express = require('express');
const router = express.Router();
const { auth: authenticateToken } = require('../middleware/auth');
const checkUserRole = require('../middleware/checkUserRole');
const labourLicenseController = require('../controllers/labourLicenseController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all labour licenses - Admin, Compliance Manager, and Labour Law Manager only
router.get('/', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']),
  labourLicenseController.getAllLabourLicenses
);

// Get labour license by ID - Admin, Compliance Manager, and Labour Law Manager only
router.get('/:id', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']),
  labourLicenseController.getLabourLicenseById
);

// Get labour licenses by company - Admin, Compliance Manager, and Labour Law Manager only
router.get('/company/:company_id', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']),
  labourLicenseController.getLabourLicensesByCompany
);

// Create new labour license - Admin, Compliance Manager, and Labour Law Manager only
router.post('/', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']),
  labourLicenseController.createLabourLicense
);

// Update labour license - Admin, Compliance Manager, and Labour Law Manager only
router.put('/:id', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']),
  labourLicenseController.updateLabourLicense
);

// Update labour license status - Admin, Compliance Manager, and Labour Law Manager only
router.put('/:id/status', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']),
  labourLicenseController.updateLabourLicenseStatus
);

// Delete labour license - Admin and Compliance Manager only
router.delete('/:id', 
  checkUserRole(['Admin', 'Compliance_manager']),
  labourLicenseController.deleteLabourLicense
);

// Search labour licenses - Admin, Compliance Manager, and Labour Law Manager only
router.get('/search', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']),
  labourLicenseController.searchLabourLicenses
);

// Get labour license statistics - Admin, Compliance Manager, and Labour Law Manager only
router.get('/stats/overview', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']),
  labourLicenseController.getLabourLicenseStats
);

module.exports = router;
