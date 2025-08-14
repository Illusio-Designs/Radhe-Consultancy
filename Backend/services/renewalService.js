const RenewalConfig = require('../models/renewalConfigModel');
const VehiclePolicy = require('../models/vehiclePolicyModel');
const Company = require('../models/companyModel');
const Consumer = require('../models/consumerModel');
const ReminderLog = require('../models/reminderLogModel');
const EmailService = require('./emailService');
const { Op } = require('sequelize');

class RenewalService {
  constructor() {
    this.emailService = new EmailService();
  }

  // Process all vehicle insurance renewals that need reminders
  async processVehicleInsuranceRenewals() {
    try {
      console.log('🔄 Starting vehicle insurance renewal processing...');
      
      // Get renewal configuration for vehicle insurance
      const config = await RenewalConfig.getConfigByService('vehicle');
      if (!config) {
        console.log('⚠️ No renewal configuration found for vehicle insurance');
        return { success: false, message: 'No renewal configuration found' };
      }

      // Get policies that need reminders
      const policies = await this.getVehiclePoliciesNeedingReminders();
      console.log(`📋 Found ${policies.length} policies needing reminders`);

      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      for (const policy of policies) {
        try {
          const result = await this.processSingleVehiclePolicy(policy, config);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
          processedCount++;
        } catch (error) {
          console.error(`❌ Error processing policy ${policy.id}:`, error);
          errorCount++;
        }
      }

      console.log(`✅ Vehicle insurance renewal processing completed:`);
      console.log(`   - Total processed: ${processedCount}`);
      console.log(`   - Successful: ${successCount}`);
      console.log(`   - Errors: ${errorCount}`);

      return {
        success: true,
        processed: processedCount,
        successful: successCount,
        errors: errorCount
      };
    } catch (error) {
      console.error('❌ Error in vehicle insurance renewal processing:', error);
      throw error;
    }
  }

  // Get vehicle policies that need reminders
  async getVehiclePoliciesNeedingReminders() {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      // Get active policies expiring within 30 days
      const policies = await VehiclePolicy.findAll({
        where: {
          status: 'active',
          policy_end_date: {
            [Op.lte]: thirtyDaysFromNow
          }
        },
        include: [
          {
            model: Company,
            as: 'companyPolicyHolder',
            attributes: ['company_id', 'companyName', 'email', 'phone']
          },
          {
            model: Consumer,
            as: 'consumerPolicyHolder',
            attributes: ['consumer_id', 'name', 'email', 'phone']
          }
        ],
        order: [['policy_end_date', 'ASC']]
      });

      // Filter policies that need reminders today
      const policiesNeedingReminders = [];
      for (const policy of policies) {
        const daysUntilExpiry = this.getDaysUntilExpiry(policy.policy_end_date);
        
        // Check if we should send a reminder today
        if (daysUntilExpiry >= 0 && daysUntilExpiry <= 30) {
          // Check if reminder was already sent today
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          
          const recentReminder = await ReminderLog.findOne({
            where: {
              policy_id: policy.id,
              policy_type: 'vehicle',
              sent_at: {
                [Op.gte]: todayStart
              }
            }
          });

          if (!recentReminder) {
            policiesNeedingReminders.push(policy);
          }
        }
      }

      return policiesNeedingReminders;
    } catch (error) {
      console.error('❌ Error getting vehicle policies needing reminders:', error);
      throw error;
    }
  }

  // Process a single vehicle policy for renewal reminders
  async processSingleVehiclePolicy(policy, config) {
    try {
      const daysUntilExpiry = this.getDaysUntilExpiry(policy.policy_end_date);
      
      // Check if we should send a reminder today
      if (!config.shouldSendReminder(daysUntilExpiry)) {
        console.log(`⏭️ Policy ${policy.id}: No reminder needed today (${daysUntilExpiry} days until expiry)`);
        return { success: true, skipped: true, reason: 'No reminder scheduled for today' };
      }

      // Get client data
      const clientData = this.extractClientData(policy);
      if (!clientData) {
        console.log(`⚠️ Policy ${policy.id}: Client data not found`);
        return { success: false, reason: 'Client data not found' };
      }

      // Prepare reminder data
      const reminderData = {
        daysUntilExpiry: daysUntilExpiry,
        expiryDate: policy.policy_end_date,
        vehicleDetails: {
          vehicleNumber: policy.vehicle_number,
          vehicleType: policy.sub_product,
          vehicleMake: policy.manufacturing_company,
          vehicleModel: policy.model,
          insuranceCompany: policy.insurance_company_id // You might want to join with InsuranceCompany model
        },
        renewalAmount: policy.gross_premium
      };

      // Send email reminder
      const emailResult = await this.emailService.sendVehicleInsuranceReminder(clientData, reminderData);
      
      if (emailResult.success) {
        // Log the reminder
        await this.logReminder(policy, reminderData, emailResult);
        
        console.log(`✅ Policy ${policy.id}: Reminder sent successfully for ${daysUntilExpiry} days until expiry`);
        return { success: true, reminderSent: true, daysUntilExpiry };
      } else {
        console.log(`❌ Policy ${policy.id}: Failed to send reminder`);
        return { success: false, reason: 'Email sending failed' };
      }
    } catch (error) {
      console.error(`❌ Error processing policy ${policy.id}:`, error);
      return { success: false, reason: error.message };
    }
  }

  // Extract client data from policy
  extractClientData(policy) {
    try {
      if (policy.companyPolicyHolder) {
        return {
          id: policy.companyPolicyHolder.company_id,
          companyName: policy.companyPolicyHolder.companyName,
          name: policy.companyPolicyHolder.companyName,
          email: policy.companyPolicyHolder.email || policy.email,
          phone: policy.companyPolicyHolder.phone || policy.mobile_number
        };
      } else if (policy.consumerPolicyHolder) {
        return {
          id: policy.consumerPolicyHolder.consumer_id,
          companyName: policy.organisation_or_holder_name,
          name: policy.consumerPolicyHolder.name,
          email: policy.consumerPolicyHolder.email || policy.email,
          phone: policy.consumerPolicyHolder.phone || policy.mobile_number
        };
      } else {
        // Fallback to policy data
        return {
          id: policy.id,
          companyName: policy.organisation_or_holder_name,
          name: policy.organisation_or_holder_name,
          email: policy.email,
          phone: policy.mobile_number
        };
      }
    } catch (error) {
      console.error('❌ Error extracting client data:', error);
      return null;
    }
  }

  // Log reminder to ReminderLog table
  async logReminder(policy, reminderData, emailResult) {
    try {
      const logData = {
        policy_id: policy.id,
        policy_type: 'vehicle',
        client_name: reminderData.clientName || 'Unknown',
        client_email: reminderData.clientEmail || 'Unknown',
        reminder_type: 'email',
        reminder_day: reminderData.daysUntilExpiry,
        expiry_date: policy.policy_end_date,
        sent_at: new Date(),
        status: emailResult.success ? 'sent' : 'failed',
        email_subject: `Vehicle Insurance Renewal Reminder - ${reminderData.daysUntilExpiry} days remaining`,
        response_data: emailResult.success ? { messageId: emailResult.messageId || 'unknown' } : null,
        error_message: emailResult.success ? null : emailResult.error || 'Unknown error',
        days_until_expiry: reminderData.daysUntilExpiry
      };

      await ReminderLog.create(logData);
      console.log(`Renewal reminder logged for policy ${policy.id}`);
    } catch (error) {
      console.error('Error logging renewal reminder:', error);
    }
  }

  // Get days until expiry
  getDaysUntilExpiry(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  // Get renewal dashboard data
  async getRenewalDashboard() {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const expiringSoon = await VehiclePolicy.findAll({
        where: {
          status: 'active',
          policy_end_date: {
            [Op.lte]: thirtyDaysFromNow
          }
        },
        order: [['policy_end_date', 'ASC']]
      });

      const totalActive = await VehiclePolicy.count({ where: { status: 'active' } });
      const totalExpired = await VehiclePolicy.count({ where: { status: 'expired' } });

      return {
        success: true,
        data: {
          expiringSoon: expiringSoon.length,
          totalActive,
          totalExpired,
          expiringPolicies: expiringSoon.map(policy => ({
            id: policy.id,
            policyNumber: policy.policy_number,
            vehicleNumber: policy.vehicle_number,
            vehicleType: policy.sub_product,
            expiryDate: policy.policy_end_date,
            daysUntilExpiry: this.getDaysUntilExpiry(policy.policy_end_date),
            status: policy.status,
            clientName: policy.organisation_or_holder_name
          }))
        }
      };
    } catch (error) {
      console.error('❌ Error getting renewal dashboard:', error);
      throw error;
    }
  }

  // Test the renewal system
  async testRenewalSystem() {
    try {
      console.log('🧪 Testing renewal system...');
      
      // Test email connection
      const emailTest = await this.emailService.testConnection();
      console.log('📧 Email service test:', emailTest ? '✅ PASSED' : '❌ FAILED');
      
      // Test renewal configuration
      const config = await RenewalConfig.getConfigByService('vehicle');
      console.log('⚙️ Renewal config test:', config ? '✅ PASSED' : '❌ FAILED');
      
      // Test dashboard
      const dashboard = await this.getRenewalDashboard();
      console.log('📊 Dashboard test:', dashboard.success ? '✅ PASSED' : '❌ FAILED');
      
      return {
        success: true,
        emailService: emailTest,
        renewalConfig: !!config,
        dashboard: dashboard.success
      };
    } catch (error) {
      console.error('❌ Renewal system test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = RenewalService;
