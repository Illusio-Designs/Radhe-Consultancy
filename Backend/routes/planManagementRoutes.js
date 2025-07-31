const express = require('express');
const router = express.Router();
const planManagementController = require('../controllers/planManagementController');
const { auth } = require('../middleware/auth');
const checkUserRole = require('../middleware/checkUserRole');
const { uploadPlanFiles } = require('../config/multerConfig');

// Apply authentication middleware
router.use(auth);

// Get plan managers (users with Plan_manager role)
router.get('/managers', planManagementController.getPlanManagers);

// Get all plan management records (Admin can see all, Plan Manager sees only their own)
router.get('/', planManagementController.getAllPlanManagement);

// Get plan management by factory quotation ID
router.get('/quotation/:quotationId', planManagementController.getPlanManagementByQuotationId);

// Create plan management (assign to plan manager) - Admin and Compliance Manager only
router.post('/', checkUserRole(['Admin', 'Compliance_manager']), planManagementController.createPlanManagement);

// Submit plan - Plan Manager only
router.put('/:id/submit', checkUserRole(['Plan_manager']), planManagementController.submitPlan);

// Update plan status - Plan Manager only
router.put('/:id/status', checkUserRole(['Plan_manager']), planManagementController.updatePlanStatus);

// Review plan (approve/reject) - Admin only
router.put('/:id/review', checkUserRole(['Admin']), planManagementController.reviewPlan);

// Upload files for plan - Plan Manager only
router.put('/:id/upload-files', checkUserRole(['Plan_manager']), uploadPlanFiles, planManagementController.uploadPlanFiles);

// Get plan files - Plan Manager only
router.get('/:id/files', checkUserRole(['Plan_manager']), planManagementController.getPlanFiles);

// Delete plan file - Plan Manager only
router.delete('/:id/files/:filename', checkUserRole(['Plan_manager']), planManagementController.deletePlanFile);

module.exports = router; 