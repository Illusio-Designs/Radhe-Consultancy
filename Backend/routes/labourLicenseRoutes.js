const express = require('express');
const router = express.Router();
const labourLicenseController = require('../controllers/labourLicenseController');
const { auth } = require('../middleware/auth');
const checkUserRole = require('../middleware/checkUserRole');
const { uploadLicenseFiles } = require('../config/multerConfig');

// Create labour license
router.post('/', auth, checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']), uploadLicenseFiles, labourLicenseController.createLabourLicense);

// Get all labour licenses
router.get('/', auth, labourLicenseController.getAllLabourLicenses);

// Get labour license by ID
router.get('/:id', auth, labourLicenseController.getLabourLicenseById);

// Update labour license
router.put('/:id', auth, checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']), uploadLicenseFiles, labourLicenseController.updateLabourLicense);

// Delete labour license
router.delete('/:id', auth, checkUserRole(['Admin']), labourLicenseController.deleteLabourLicense);

// Upload labour license documents (for existing records)
router.post('/:id/upload', auth, checkUserRole(['Admin', 'Compliance_manager', 'Labour_law_manager']), uploadLicenseFiles, labourLicenseController.uploadLicenseDocuments);

module.exports = router;
