const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Role management routes
router.post('/', roleController.createRole);
router.get('/', roleController.getAllRoles);
router.put('/:role_id', roleController.updateRole);
router.delete('/:role_id', roleController.deleteRole);

// Permission routes
router.get('/permissions', roleController.getAllPermissions);

module.exports = router;
