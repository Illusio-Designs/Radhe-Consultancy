const express = require('express');
const router = express.Router();
const labourInspectionController = require('../controllers/labourInspectionController');
const { auth } = require('../middleware/auth');
const checkUserRole = require('../middleware/checkUserRole');

// Apply authentication middleware to all routes
router.use(auth);

// Create new labour inspection
router.post('/', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']), 
  labourInspectionController.createLabourInspection
);

// Get all labour inspections (Admin and Labour Law Manager can see all)
router.get('/', checkUserRole(['Admin', 'Labour_law_manager']), labourInspectionController.getAllLabourInspections);

// Search labour inspections
router.get('/search', checkUserRole(['Admin', 'Labour_law_manager']), labourInspectionController.searchLabourInspections);

// Get labour inspection statistics
router.get('/stats/overview', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']), 
  labourInspectionController.getLabourInspectionStats
);

// Get labour inspections by company ID
router.get('/company/:company_id', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager', 'Company']), 
  labourInspectionController.getLabourInspectionsByCompany
);

// Get labour inspection by ID
router.get('/:id', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager', 'Company']), 
  labourInspectionController.getLabourInspectionById
);

// Update labour inspection
router.put('/:id', 
  checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']), 
  labourInspectionController.updateLabourInspection
);

// Delete labour inspection
router.delete('/:id', 
  checkUserRole(['Admin']), 
  labourInspectionController.deleteLabourInspection
);

module.exports = router;
