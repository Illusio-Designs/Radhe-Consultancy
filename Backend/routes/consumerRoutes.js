const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');
const { authenticateToken, checkRole } = require('../middleware/auth');

// Create a new consumer (admin and user manager only)
router.post('/', 
  authenticateToken, 
  checkRole(['admin', 'user_manager']), 
  consumerController.createConsumer
);

// Get all consumers (admin and user manager)
router.get('/', 
  authenticateToken, 
  checkRole(['admin', 'user_manager']), 
  consumerController.getAllConsumers
);

// Get consumer by ID (admin, user manager, and consumer users)
router.get('/:id', 
  authenticateToken, 
  checkRole(['admin', 'user_manager', 'consumer']), 
  consumerController.getConsumerById
);

// Update consumer (admin, user manager, and consumer users)
router.put('/:id', 
  authenticateToken, 
  checkRole(['admin', 'user_manager', 'consumer']), 
  consumerController.updateConsumer
);

// Delete consumer (admin and user manager only)
router.delete('/:id', 
  authenticateToken, 
  checkRole(['admin', 'user_manager']), 
  consumerController.deleteConsumer
);

module.exports = router; 