const express = require('express');
const router = express.Router();
const renewalController = require('../controllers/renewalController');

// Specific routes first
router.get('/counts', renewalController.getRenewalCounts);
router.get('/list/:type', renewalController.getRenewalList);
router.post('/remind', renewalController.sendRenewalReminder);
router.get('/log', renewalController.getRenewalLog);
router.get('/list/:type/:period', renewalController.getRenewalListByTypeAndPeriod);

// Parameterized route last
router.get('/:period', renewalController.getRenewals); // period: week, month, year

module.exports = router; 