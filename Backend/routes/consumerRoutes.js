const express = require('express');
const router = express.Router();
const consumerController = require('../controllers/consumerController');
const { auth, checkRole } = require('../middleware/auth');
const { uploadConsumerData } = require('../config/multerConfig');

// Create a new consumer (admin and vendor manager only)
router.post('/', 
  auth, 
  checkRole(['admin', 'vendor_manager']),
  uploadConsumerData,
  consumerController.createConsumer
);

// Get all consumers (admin, vendor manager, and user manager)
router.get('/', 
  auth, 
  checkRole(['admin', 'vendor_manager', 'user_manager']), 
  consumerController.getAllConsumers
);

// Get consumer statistics (admin, vendor manager, and user manager)
router.get('/statistics', 
  auth, 
  checkRole(['admin', 'vendor_manager', 'user_manager']), 
  consumerController.getConsumerStatistics
);

// Search consumers (must be before /:id route)
router.get('/search', auth, consumerController.searchConsumers);

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