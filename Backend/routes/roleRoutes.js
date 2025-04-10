const express = require('express');
const roleController = require('../controllers/roleController');

const router = express.Router();

router.post('/assign-role', roleController.assignRole);
router.get('/', roleController.getAllRoles);
router.put('/:role_id', roleController.updateRole);
router.delete('/:role_id', roleController.deleteRole);

// Permission routes
router.get('/permissions', roleController.getAllPermissions);

module.exports = router;
