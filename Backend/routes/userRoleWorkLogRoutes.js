const express = require('express');
const userRoleWorkLogController = require('../controllers/userRoleWorkLogController');
const router = express.Router();

// Create a new log
router.post('/', userRoleWorkLogController.createLog);

// Get all logs (optionally filter by user_id, role_id)
router.get('/', userRoleWorkLogController.getAllLogs);

module.exports = router; 