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

// Get all permissions
router.get('/permissions/all', roleController.getAllPermissions);

// Assign role to user
router.post('/assign', 
  auth, 
  checkRole(['admin', 'user_manager']), 
  roleController.assignRole
);

// Remove role from user
router.delete('/users/:user_id/roles/:role_id', 
  auth, 
  checkRole(['admin', 'user_manager']), 
  roleController.removeRole
);

// Get user roles
router.get('/users/:user_id/roles', 
  auth, 
  checkRole(['admin', 'user_manager']), 
  roleController.getUserRoles
);

// Set primary role for user
router.put('/users/primary-role', 
  auth, 
  checkRole(['admin', 'user_manager']), 
  roleController.setPrimaryRole
);

module.exports = router;
