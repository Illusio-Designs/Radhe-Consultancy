const express = require('express');
const router = express.Router();
const renewalStatusController = require('../controllers/renewalStatusController');
const { auth } = require('../middleware/auth');
const checkUserRole = require('../middleware/checkUserRole');

// Get all renewal status records (Admin, Compliance Manager, and own records)
router.get('/', auth, checkUserRole(['Admin', 'Compliance_manager']), renewalStatusController.getAllRenewalStatus);

// Create renewal status record (Admin, Compliance Manager)
router.post('/', auth, checkUserRole(['Admin', 'Compliance_manager']), renewalStatusController.createRenewalStatus);

// Update renewal status record (Admin, Compliance Manager, or creator)
router.put('/:id', auth, checkUserRole(['Admin', 'Compliance_manager']), renewalStatusController.updateRenewalStatus);

// Delete renewal status record (Admin, Compliance Manager, or creator)
router.delete('/:id', auth, checkUserRole(['Admin', 'Compliance_manager']), renewalStatusController.deleteRenewalStatus);

module.exports = router;
