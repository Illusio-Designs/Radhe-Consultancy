const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new vendor (either company or consumer)
router.post('/', vendorController.createVendor); // This should handle both types

// Get vendor by ID
router.get('/:vendorId', vendorController.getVendorById);

// Get all vendors
router.get('/', vendorController.getAllVendors);

// Update vendor
router.put('/:vendorId', vendorController.updateVendor);

// Delete vendor
router.delete('/:vendorId', vendorController.deleteVendor);

// Google login for vendors
router.post('/google-login', vendorController.googleLogin);

// Create new company vendor
router.post('/company-vendors', vendorController.createCompanyVendor);

module.exports = router; 