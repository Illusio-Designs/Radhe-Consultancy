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

module.exports = router; 