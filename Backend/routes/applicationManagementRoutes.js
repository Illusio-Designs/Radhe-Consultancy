const express = require('express');
const router = express.Router();
const applicationManagementController = require('../controllers/applicationManagementController');
const { auth } = require('../middleware/auth');
const checkUserRole = require('../middleware/checkUserRole');
const { uploadApplicationFiles } = require('../config/multerConfig');

// Apply authentication middleware
router.use(auth);

// Get compliance managers (users with Compliance_manager role)
router.get('/managers', applicationManagementController.getComplianceManagers);

// Get all application management records (Admin can see all, Compliance Manager sees only their own)
router.get('/', applicationManagementController.getAllApplicationManagement);

// Get application management by factory quotation ID
router.get('/quotation/:quotationId', applicationManagementController.getApplicationManagementByQuotationId);

// Create application management (assign to compliance manager) - Admin only
router.post('/', checkUserRole(['Admin']), applicationManagementController.createApplicationManagement);

// Update application status - Admin and Compliance Manager
router.put('/:id/status', checkUserRole(['Admin', 'Compliance_manager']), applicationManagementController.updateApplicationStatus);

// Upload files for application - Admin and Compliance Manager
router.put('/:id/upload-files', checkUserRole(['Admin', 'Compliance_manager']), uploadApplicationFiles, applicationManagementController.uploadApplicationFiles);

// Get application files - Admin and Compliance Manager
router.get('/:id/files', checkUserRole(['Admin', 'Compliance_manager']), applicationManagementController.getApplicationFiles);

// Download application file - Admin and Compliance Manager
router.get('/:id/files/:filename', checkUserRole(['Admin', 'Compliance_manager']), applicationManagementController.downloadApplicationFile);

module.exports = router; 