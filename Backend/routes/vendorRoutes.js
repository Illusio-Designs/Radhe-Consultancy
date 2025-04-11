const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const checkPermission = require('../middleware/checkPermission');

// Company Vendor Routes
// Create new company vendor
router.post('/companies', checkPermission('create_vendor'), vendorController.createCompanyVendor);

// Get all company vendors
router.get('/companies', checkPermission('view_vendor'), vendorController.getAllCompanyVendors);

// Update company vendor
router.put('/companies/:vendorId', checkPermission('edit_vendor'), vendorController.updateVendor);

// Delete company vendor
router.delete('/companies/:vendorId', checkPermission('delete_vendor'), vendorController.deleteVendor);

// Consumer Vendor Routes
// Create new consumer vendor
router.post('/consumers', checkPermission('create_vendor'), vendorController.createConsumerVendor);

// Get all consumer vendors
router.get('/consumers', checkPermission('view_vendor'), vendorController.getAllVendors); // Assuming this fetches consumer data

// Update consumer vendor
router.put('/consumers/:vendorId', checkPermission('edit_vendor'), vendorController.updateVendor);

// Delete consumer vendor
router.delete('/consumers/:vendorId', checkPermission('delete_vendor'), vendorController.deleteVendor);

module.exports = router;