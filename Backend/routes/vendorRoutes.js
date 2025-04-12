const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { authenticateToken } = require('../middleware/auth');
const checkPermission = require('../middleware/checkPermission');

// Company Vendor Routes
// Create new company vendor
router.post('/company', authenticateToken, checkPermission('create_vendor'), vendorController.createCompanyVendor);

// Get all company vendors
router.get('/company', authenticateToken, checkPermission('view_vendor'), vendorController.getAllCompanyVendors);

// Update company vendor
router.put('/company/:vendorId', authenticateToken, checkPermission('edit_vendor'), vendorController.updateVendor);

// Delete company vendor
router.delete('/company/:vendorId', authenticateToken, checkPermission('delete_vendor'), vendorController.deleteVendor);

// Consumer Vendor Routes
// Create new consumer vendor
router.post('/consumers', authenticateToken, checkPermission('create_vendor'), vendorController.createConsumerVendor);

// Get all consumer vendors
router.get('/consumers', authenticateToken, checkPermission('view_vendor'), vendorController.getAllVendors); // Assuming this fetches consumer data

// Update consumer vendor
router.put('/consumers/:vendorId', authenticateToken, checkPermission('edit_vendor'), vendorController.updateVendor);

// Delete consumer vendor
router.delete('/consumers/:vendorId', authenticateToken, checkPermission('delete_vendor'), vendorController.deleteVendor);

module.exports = router;