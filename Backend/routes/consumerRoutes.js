const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');
const { auth, checkRole } = require('../middleware/auth');

// Create a new consumer (admin and vendor manager only)
router.post('/', 
  auth, 
  checkRole(['admin', 'vendor_manager']), 
  consumerController.createConsumer
);

// Get all consumers (admin, vendor manager, and user manager)
router.get('/', 
  auth, 
  checkRole(['admin', 'vendor_manager', 'user_manager']), 
  consumerController.getAllConsumers
);

// Get consumer by ID (admin, vendor manager, user manager, and consumer users)
router.get('/:id', 
  auth, 
  checkRole(['admin', 'vendor_manager', 'user_manager', 'consumer']), 
  consumerController.getConsumerById
);

// Update consumer (admin, vendor manager, and consumer users)
router.put('/:id', 
  auth, 
  checkRole(['admin', 'vendor_manager', 'consumer']), 
  consumerController.updateConsumer
);

module.exports = router; 