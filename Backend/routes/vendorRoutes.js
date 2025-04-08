const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Create new vendor (either company or consumer)
router.post('/', checkPermission('create_vendor'), vendorController.createVendor); // This should handle both types

// Get vendor by ID
router.get('/:vendorId', checkPermission('view_vendor'), vendorController.getVendorById);

// Get all vendors
router.get('/', vendorController.getAllVendors);

// Update vendor
router.put('/:vendorId', checkPermission('edit_vendor'), vendorController.updateVendor);

// Delete vendor
router.delete('/:vendorId', checkPermission('delete_vendor'), vendorController.deleteVendor);

// Google login for vendors
router.post('/google-login', vendorController.googleLogin);

// Create new company vendor
router.post('/company-vendors', vendorController.createCompanyVendor);

module.exports = router; 