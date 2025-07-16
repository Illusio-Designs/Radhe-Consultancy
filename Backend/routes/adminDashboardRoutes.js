const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { auth, checkRole } = require('../middleware/auth');

// Get company statistics
router.get(
  '/statistics',
  auth,
  checkRole(['admin', 'vendor_manager', 'user_manager', 'insurance_manager', 'dsc_manager']),
  adminDashboardController.getCompanyStatistics
);

// Company-specific stats
router.get(
  '/statistics/company/:companyId',
  auth,
  adminDashboardController.getCompanyStats
);
// Consumer-specific stats
router.get(
  '/statistics/consumer/:consumerId',
  auth,
  adminDashboardController.getConsumerStats
);

module.exports = router; 