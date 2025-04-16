const express = require('express');
const roleController = require('../controllers/roleController');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Create role
router.post('/', roleController.createRole);

// Get all roles (admin and user manager only)
router.get('/', 
  auth, 
  checkRole(['admin', 'user_manager']), 
  roleController.getAllRoles
);

// Get role by ID (admin and user manager only)
router.get('/:id', 
  auth, 
  checkRole(['admin', 'user_manager']), 
  roleController.getRoleById
);

// Get role permissions (admin and user manager only)
router.get('/:id/permissions', 
  auth, 
  checkRole(['admin', 'user_manager']), 
  roleController.getRolePermissions
);

// Update role
router.put('/:role_id', roleController.updateRole);

// Delete role
router.delete('/:role_id', roleController.deleteRole);

module.exports = router;
