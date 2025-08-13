const express = require('express');
const router = express.Router();
const stabilityManagementController = require('../controllers/stabilityManagementController');
const { auth } = require('../middleware/auth');
const checkUserRole = require('../middleware/checkUserRole');
const { uploadStabilityFiles } = require('../config/multerConfig');

// Apply authentication middleware
router.use(auth);

// Get stability managers (users with Stability_manager role)
router.get('/managers', stabilityManagementController.getStabilityManagers);

// Get all stability management records (Admin can see all, Stability Manager sees only their own)
router.get('/', stabilityManagementController.getAllStabilityManagement);

// Get stability management by factory quotation ID
router.get('/quotation/:quotationId', stabilityManagementController.getStabilityManagementByQuotationId);

// Create stability management (assign to stability manager) - Admin and Compliance Manager only
router.post('/', checkUserRole(['Admin', 'Compliance_manager']), stabilityManagementController.createStabilityManagement);

// Update stability status - Stability Manager only
router.put('/:id/status', checkUserRole(['Stability_manager']), stabilityManagementController.updateStabilityStatus);

// Update stability dates - Stability Manager only
router.put('/:id/dates', checkUserRole(['Stability_manager']), stabilityManagementController.updateStabilityDates);

// Upload files for stability - Stability Manager only
router.put('/:id/upload-files', checkUserRole(['Stability_manager']), uploadStabilityFiles, stabilityManagementController.uploadStabilityFiles);

// Get stability files - Stability Manager only
router.get('/:id/files', checkUserRole(['Stability_manager']), stabilityManagementController.getStabilityFiles);

// Delete stability file - Stability Manager only
router.delete('/:id/files/:filename', checkUserRole(['Stability_manager']), stabilityManagementController.deleteStabilityFile);

// Get statistics
router.get('/statistics', auth, stabilityManagementController.getStatistics);

module.exports = router; 