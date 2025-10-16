const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const renewalConfigController = require('../controllers/renewalConfigController');

// Renewal Configuration Routes
router.get('/configs', auth, renewalConfigController.getAllConfigs);
router.get('/configs/:serviceType', auth, renewalConfigController.getConfigByService);
router.post('/configs', auth, renewalConfigController.createConfig);
router.put('/configs/:id', auth, renewalConfigController.updateConfig);
router.delete('/configs/:id', auth, renewalConfigController.deleteConfig);

// Get default service types for easy configuration
router.get('/service-types', auth, renewalConfigController.getDefaultServiceTypes);

// Get renewal logs
router.get('/logs', auth, renewalConfigController.getLogs);

// Get renewal counts
router.get('/counts', auth, renewalConfigController.getCounts);

// Get live renewal data for dashboard
router.get('/live-data', auth, renewalConfigController.getLiveRenewalData);

// Get renewal list by type and period
router.get('/list', auth, renewalConfigController.getListByTypeAndPeriod);

// Search renewals
router.get('/search', auth, renewalConfigController.searchRenewals);

// Trigger renewal processing manually
router.post('/trigger', auth, async (req, res) => {
  try {
    const RenewalService = require('../services/renewalService');
    const renewalService = new RenewalService();
    
    console.log('🚀 Manual renewal trigger initiated');
    
    // Process only active policy types (DSC, Labour License, Stability Management)
    const results = {
      dsc: await renewalService.processDSCRenewals(),
      labourLicense: await renewalService.processLabourLicenseReminders(),
      stabilityManagement: await renewalService.processStabilityManagementReminders()
    };
    
    console.log('✅ Renewal processing completed');
    
    res.json({
      success: true,
      message: 'Renewal reminders processed successfully',
      results
    });
  } catch (error) {
    console.error('❌ Error triggering renewals:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 