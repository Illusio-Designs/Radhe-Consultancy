const express = require('express');
const roleController = require('../controllers/roleController');

const router = express.Router();

// Create role
router.post('/', roleController.createRole);

// Get all roles
router.get('/', roleController.getAllRoles);

// Update role
router.put('/:role_id', roleController.updateRole);

// Delete role
router.delete('/:role_id', roleController.deleteRole);

// Get all permissions
router.get('/permissions', roleController.getAllPermissions);

module.exports = router;
