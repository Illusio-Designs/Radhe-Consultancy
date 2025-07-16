const express = require('express');
const router = express.Router();
const dscLogController = require('../controllers/dscLogController');
const { auth, checkRole } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Apply role check middleware to all routes
router.use(checkRole(['Admin', 'DSC_manager']));

// Get DSC logs
router.get('/logs', dscLogController.getDSCLogs);

module.exports = router; 