const express = require('express');
const router = express.Router();
const renewalStatusController = require('../controllers/renewalStatusController');
const { auth } = require('../middleware/auth');
const checkUserRole = require('../middleware/checkUserRole');
const { uploadRenewalFiles } = require('../config/multerConfig');

// Create renewal status record
router.post('/', auth, checkUserRole(['Admin', 'Compliance_manager']), uploadRenewalFiles, renewalStatusController.createRenewalStatus);

// Get all renewal status records
router.get('/', auth, renewalStatusController.getAllRenewalStatus);

// Get renewal status record by ID
router.get('/:id', auth, renewalStatusController.getRenewalStatusById);

// Update renewal status record
router.put('/:id', auth, checkUserRole(['Admin', 'Compliance_manager']), uploadRenewalFiles, renewalStatusController.updateRenewalStatus);

// Delete renewal status record
router.delete('/:id', auth, checkUserRole(['Admin']), renewalStatusController.deleteRenewalStatus);

// Upload renewal documents (for existing records)
router.post('/:id/upload', auth, checkUserRole(['Admin', 'Compliance_manager']), uploadRenewalFiles, renewalStatusController.uploadRenewalDocuments);

module.exports = router;
