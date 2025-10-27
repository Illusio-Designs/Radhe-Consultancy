require('dotenv').config();
const RenewalService = require('../services/renewalService');

async function runAutomaticRenewalReminders() {
  try {
    console.log('='.repeat(50));
    console.log('🚀 AUTOMATIC RENEWAL REMINDER PROCESS STARTED');
    console.log('⏰ Time:', new Date().toLocaleString());
    console.log('📌 Active: DSC + Labour License + Stability Management + Factory');
    console.log('='.repeat(50));

    const renewalService = new RenewalService();

    // ⚠️ DSC + Labour License + Stability Management + Factory ACTIVE - Other types commented out
    const results = {
      // vehicle: await renewalService.processVehicleInsuranceRenewals(),
      // health: await renewalService.processHealthInsuranceRenewals(),
      // life: await renewalService.processLifeInsuranceRenewals(),
      // fire: await renewalService.processFirePolicyRenewals(),
      // ecp: await renewalService.processECPRenewals(),
      dsc: await renewalService.processDSCRenewals(),
      labourLicense: await renewalService.processLabourLicenseReminders(),
      stabilityManagement: await renewalService.processStabilityManagementReminders(),
      factoryLicense: await renewalService.processFactoryQuotationRenewals(),
      // labourInspection: await renewalService.processLabourInspectionRenewals()
    };

    console.log('\n' + '='.repeat(50));
    console.log('📊 RENEWAL REMINDER SUMMARY');
    console.log('='.repeat(50));
    // console.log('🚗 Vehicle Insurance:', results.vehicle.sent, 'emails sent');
    // console.log('🏥 Health Insurance:', results.health.sent, 'emails sent');
    // console.log('💼 Life Insurance:', results.life.sent, 'emails sent');
    // console.log('🔥 Fire Policy:', results.fire.sent, 'emails sent');
    // console.log('🏢 ECP:', results.ecp.sent, 'emails sent');
    console.log('🔐 DSC (ACTIVE):', results.dsc.successful || 0, 'emails sent');
    console.log('📋 Labour License (ACTIVE):', results.labourLicense.successful || 0, 'emails sent');
    console.log('🏗️ Stability Management (ACTIVE):', results.stabilityManagement.successful || 0, 'emails sent');
    console.log('🏭 Factory License (ACTIVE):', results.factoryLicense.successful || 0, 'emails sent');
    // console.log('🏭 Labour Inspection:', results.labourInspection.successful, 'emails sent');
    console.log('='.repeat(50));
    
    const totalSent = Object.values(results).reduce((sum, r) => sum + (r.successful || 0), 0);
    console.log('✅ TOTAL EMAILS SENT:', totalSent);
    console.log('='.repeat(50));

    return results;
    } catch (error) {
    console.error('❌ ERROR IN AUTOMATIC RENEWAL REMINDERS:', error);
    throw error;
  }
}

// If run directly from command line
if (require.main === module) {
  runAutomaticRenewalReminders()
    .then(() => {
      console.log('🎯 Script execution completed successfully');
    process.exit(0);
    })
    .catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = runAutomaticRenewalReminders;
