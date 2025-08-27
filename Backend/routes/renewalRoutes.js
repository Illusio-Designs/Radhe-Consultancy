const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const renewalConfigController = require('../controllers/renewalConfigController');

// Renewal Configuration Routes
router.get('/configs', auth, renewalConfigController.getAllConfigs);
router.get('/configs/:serviceType', auth, renewalConfigController.getConfigByService);
router.post('/configs', auth, renewalConfigController.createConfig);
router.put('/configs/:id', auth, renewalConfigController.updateConfig);
router.delete('/configs/:id', auth, renewalConfigController.deleteConfig);

// Get default service types for easy configuration
router.get('/service-types', auth, renewalConfigController.getDefaultServiceTypes);

// Get renewal logs
router.get('/logs', auth, renewalConfigController.getLogs);

// Get renewal counts
router.get('/counts', auth, renewalConfigController.getCounts);

// Get renewals by type and period
router.get('/list', auth, renewalConfigController.getListByTypeAndPeriod);

// Search renewals
router.get('/search', auth, renewalConfigController.searchRenewals);

module.exports = router; 