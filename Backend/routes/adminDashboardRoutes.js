const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { auth, checkRole } = require('../middleware/auth');

// Get company statistics (includes compliance management stats)
router.get(
  '/statistics',
  auth,
  checkRole(['admin', 'vendor_manager', 'user_manager', 'insurance_manager', 'dsc_manager', 'compliance_manager']),
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

// Plan Manager dashboard statistics
router.get(
  '/statistics/plan-manager',
  auth,
  checkRole(['plan_manager']),
  adminDashboardController.getPlanManagerStats
);

// Stability Manager dashboard statistics
router.get(
  '/statistics/stability-manager',
  auth,
  checkRole(['stability_manager']),
  adminDashboardController.getStabilityManagerStats
);

module.exports = router; 