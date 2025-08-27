const { VehiclePolicy, HealthPolicies, EmployeeCompensationPolicy, FirePolicy, DSC, Company, Consumer, ReminderLog } = require('../models');
const { Op } = require('sequelize');
const RenewalService = require('../services/renewalService');
const EmailService = require('../services/emailService');

class RenewalReminderScript {
  constructor() {
    this.renewalService = new RenewalService();
    this.emailService = new EmailService();
  }

  async sendRenewalReminders() {
    try {
      console.log('🚀 Starting renewal reminder process...');
      
      // Process vehicle insurance renewals
      await this.processVehicleInsuranceRenewals();
      
      // Process health insurance renewals
      await this.processHealthInsuranceRenewals();
      
      // Process ECP renewals
      await this.processECPRenewals();
      
      // Process Fire Policy renewals
      await this.processFirePolicyRenewals();
      
      console.log('✅ Renewal reminders completed successfully!');
    } catch (error) {
      console.error('❌ Error in renewal reminder process:', error);
    }
  }

  async processVehicleInsuranceRenewals() {
    try {
      console.log('🚗 Processing vehicle insurance renewals...');
      
      // Get policies that need reminders
      const policies = await this.getPoliciesNeedingReminders();
      console.log(`📋 Found ${policies.length} policies needing reminders`);
      
      for (const policy of policies) {
        await this.processSinglePolicy(policy);
      }
    } catch (error) {
      console.error('❌ Error processing vehicle insurance renewals:', error);
    }
  }

  async processHealthInsuranceRenewals() {
    try {
      console.log('🏥 Processing health insurance renewals...');
      
      // Get health policies that need reminders
      const policies = await this.getHealthPoliciesNeedingReminders();
      console.log(`📋 Found ${policies.length} health policies needing reminders`);
      
      for (const policy of policies) {
        await this.processSingleHealthPolicy(policy);
      }
    } catch (error) {
      console.error('❌ Error processing health insurance renewals:', error);
    }
  }

  async processECPRenewals() {
    try {
      console.log('🏢 Processing ECP renewals...');
      
      // Get ECP policies that need reminders
      const policies = await this.getECPPoliciesNeedingReminders();
      console.log(`📋 Found ${policies.length} ECP policies needing reminders`);
      
      for (const policy of policies) {
        await this.processSingleECPPolicy(policy);
      }
    } catch (error) {
      console.error('❌ Error processing ECP renewals:', error);
    }
  }

  async processFirePolicyRenewals() {
    try {
      console.log('🔥 Processing Fire Policy renewals...');
      
      // Get Fire Policy policies that need reminders
      const policies = await this.getFirePoliciesNeedingReminders();
      console.log(`📋 Found ${policies.length} Fire Policy policies needing reminders`);
      
      for (const policy of policies) {
        await this.processSingleFirePolicy(policy);
      }
    } catch (error) {
      console.error('❌ Error processing Fire Policy renewals:', error);
    }
  }

  async getPoliciesNeedingReminders() {
  const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return await VehiclePolicy.findAll({
    where: {
        policy_end_date: {
        [Op.gte]: now,
          [Op.lte]: thirtyDaysFromNow
        }
      },
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' }
      ]
    });
  }

  async getHealthPoliciesNeedingReminders() {
  const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return await HealthPolicies.findAll({
    where: {
        policy_end_date: {
        [Op.gte]: now,
          [Op.lte]: thirtyDaysFromNow
        }
      },
      include: [
        { model: Company, as: 'companyPolicyHolder' },
        { model: Consumer, as: 'consumerPolicyHolder' }
      ]
    });
  }

  async getECPPoliciesNeedingReminders() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return await EmployeeCompensationPolicy.findAll({
      where: {
        policy_end_date: {
          [Op.gte]: now,
          [Op.lte]: thirtyDaysFromNow
        }
      },
      include: [
        { model: Company, as: 'company' }
      ]
    });
  }

  async getFirePoliciesNeedingReminders() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return await FirePolicy.findAll({
      where: {
        policy_end_date: {
          [Op.gte]: now,
          [Op.lte]: thirtyDaysFromNow
        }
      },
      include: [
        { model: Company, as: 'company' },
        { model: Consumer, as: 'consumer' }
      ]
    });
  }

  async processSinglePolicy(policy) {
    try {
      const daysUntilExpiry = this.getDaysUntilExpiry(policy.policy_end_date);
      
      // Check if reminder already sent for this day
      const existingReminder = await this.checkExistingReminder(policy.id, daysUntilExpiry);
      if (existingReminder) {
        console.log(`⏭️ Reminder already sent for policy ${policy.id} (${daysUntilExpiry} days)`);
        return;
      }

      // Extract client data
      const clientData = this.extractClientData(policy);
      if (!clientData.email) {
        console.log(`⚠️ No email found for policy ${policy.id}`);
        return;
      }

      // Prepare reminder data
      const reminderData = {
        daysUntilExpiry,
        expiryDate: policy.policy_end_date,
        clientName: clientData.name,
        clientEmail: clientData.email,
        vehicleDetails: {
          vehicleNumber: policy.vehicle_number,
          vehicleType: policy.sub_product,
          vehicleMake: policy.manufacturing_company,
          vehicleModel: policy.model
        },
        policyInfo: {
          policyNumber: policy.policy_number,
          startDate: policy.policy_start_date,
          premiumAmount: policy.gross_premium
        }
      };

      // Send email reminder
      const emailResult = await this.emailService.sendVehicleInsuranceReminder(clientData, reminderData);
      
      if (emailResult.success) {
        // Log the reminder
        await this.logReminder(policy, reminderData, emailResult);
        console.log(`✅ Reminder sent for policy ${policy.id} (${daysUntilExpiry} days until expiry)`);
      } else {
        console.error(`❌ Failed to send reminder for policy ${policy.id}:`, emailResult.error);
      }
    } catch (error) {
      console.error(`❌ Error processing policy ${policy.id}:`, error);
    }
  }

  async processSingleHealthPolicy(policy) {
    try {
      const daysUntilExpiry = this.getDaysUntilExpiry(policy.policy_end_date);
      
      // Check if reminder already sent for this day
      const existingReminder = await this.checkExistingHealthReminder(policy.id, daysUntilExpiry);
      if (existingReminder) {
        console.log(`⏭️ Health reminder already sent for policy ${policy.id} (${daysUntilExpiry} days)`);
        return;
      }

      // Extract client data
      const clientData = this.extractClientData(policy);
      if (!clientData.email) {
        console.log(`⚠️ No email found for health policy ${policy.id}`);
        return;
      }

      // Prepare reminder data
      const reminderData = {
        daysUntilExpiry,
        expiryDate: policy.policy_end_date,
        clientName: clientData.name,
        clientEmail: clientData.email,
        policyDetails: {
          policyNumber: policy.policy_number,
          sumInsured: policy.sum_insured,
          premiumAmount: policy.premium_amount,
          policyStartDate: policy.policy_start_date,
          policyEndDate: policy.policy_end_date,
          insuranceCompany: policy.insurance_company,
          productType: policy.product_type
        }
      };

      // Send email reminder
      const emailResult = await this.emailService.sendHealthInsuranceReminder(reminderData);
      
      if (emailResult.success) {
        // Log the reminder
        await this.logHealthReminder(policy, reminderData, emailResult);
        console.log(`✅ Health reminder sent for policy ${policy.id} (${daysUntilExpiry} days until expiry)`);
      } else {
        console.error(`❌ Failed to send health reminder for policy ${policy.id}:`, emailResult.error);
      }
    } catch (error) {
      console.error(`❌ Error processing health policy ${policy.id}:`, error);
    }
  }

  async processSingleECPPolicy(policy) {
    try {
      const daysUntilExpiry = this.getDaysUntilExpiry(policy.policy_end_date);
      
      // Check if reminder already sent for this day
      const existingReminder = await this.checkExistingECPReminder(policy.id, daysUntilExpiry);
      if (existingReminder) {
        console.log(`⏭️ ECP reminder already sent for policy ${policy.id} (${daysUntilExpiry} days)`);
        return;
      }

      // Extract client data
      const clientData = this.extractECPClientData(policy);
      if (!clientData.email) {
        console.log(`⚠️ No email found for ECP policy ${policy.id}`);
        return;
      }

      // Prepare reminder data
      const reminderData = {
        daysUntilExpiry,
        expiryDate: policy.policy_end_date,
        clientName: clientData.name,
        clientEmail: clientData.email,
        policyDetails: {
          policyNumber: policy.policy_number,
          businessType: policy.business_type,
          medicalCover: policy.medical_cover,
          policyStartDate: policy.policy_start_date,
          policyEndDate: policy.policy_end_date,
          insuranceCompany: policy.insurance_company_id,
          grossPremium: policy.gross_premium
        }
      };

      // Send email reminder
      const emailResult = await this.emailService.sendECPRenewalReminder(reminderData);
      
      if (emailResult.success) {
        // Log the reminder
        await this.logECPReminder(policy, reminderData, emailResult);
        console.log(`✅ ECP reminder sent for policy ${policy.id} (${daysUntilExpiry} days until expiry)`);
      } else {
        console.error(`❌ Failed to send ECP reminder for policy ${policy.id}:`, emailResult.error);
      }
    } catch (error) {
      console.error(`❌ Error processing ECP policy ${policy.id}:`, error);
    }
  }

  async processSingleFirePolicy(policy) {
    try {
      const daysUntilExpiry = this.getDaysUntilExpiry(policy.policy_end_date);
      
      // Check if reminder already sent for this day
      const existingReminder = await this.checkExistingFirePolicyReminder(policy.id, daysUntilExpiry);
      if (existingReminder) {
        console.log(`⏭️ Fire Policy reminder already sent for policy ${policy.id} (${daysUntilExpiry} days)`);
        return;
      }

      // Extract client data
      const clientData = this.extractFirePolicyClientData(policy);
      if (!clientData.email) {
        console.log(`⚠️ No email found for Fire Policy ${policy.id}`);
        return;
      }

      // Prepare reminder data
      const reminderData = {
        daysUntilExpiry,
        expiryDate: policy.policy_end_date,
        clientName: clientData.name,
        clientEmail: clientData.email,
        policyDetails: {
          policyNumber: policy.policy_number,
          businessType: policy.business_type,
          totalSumInsured: policy.total_sum_insured,
          policyStartDate: policy.policy_start_date,
          policyEndDate: policy.policy_end_date,
          insuranceCompany: policy.insurance_company_id,
          grossPremium: policy.gross_premium
        }
      };

      // Send email reminder
      const emailResult = await this.emailService.sendFirePolicyRenewalReminder(reminderData);
      
      if (emailResult.success) {
        // Log the reminder
        await this.logFirePolicyReminder(policy, reminderData, emailResult);
        console.log(`✅ Fire Policy reminder sent for policy ${policy.id} (${daysUntilExpiry} days until expiry)`);
      } else {
        console.error(`❌ Failed to send Fire Policy reminder for policy ${policy.id}:`, emailResult.error);
      }
    } catch (error) {
      console.error(`❌ Error processing Fire Policy ${policy.id}:`, error);
    }
  }

  extractClientData(policy) {
    if (policy.companyPolicyHolder) {
      return {
        name: policy.companyPolicyHolder.companyName || 'Company Client',
        email: policy.companyPolicyHolder.email,
        phone: policy.companyPolicyHolder.phone
      };
    } else if (policy.consumerPolicyHolder) {
      return {
        name: policy.consumerPolicyHolder.name || 'Consumer Client',
        email: policy.consumerPolicyHolder.email,
        phone: policy.consumerPolicyHolder.phone
      };
    }
    return { name: 'Unknown Client', email: null, phone: null };
  }

  extractECPClientData(policy) {
    if (policy.company) {
      return {
        name: policy.company.companyName || 'Company Client',
        email: policy.company.email,
        phone: policy.company.phone
      };
    }
    return { name: 'Unknown Client', email: null, phone: null };
  }

  extractFirePolicyClientData(policy) {
    if (policy.company) {
      return {
        name: policy.company.companyName || 'Company Client',
        email: policy.company.email,
        phone: policy.company.phone
      };
    } else if (policy.consumer) {
      return {
        name: policy.consumer.name || 'Consumer Client',
        email: policy.consumer.email,
        phone: policy.consumer.phone
      };
    }
    return { name: 'Unknown Client', email: null, phone: null };
  }

  getDaysUntilExpiry(expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async checkExistingReminder(policyId, daysUntilExpiry) {
    const reminder = await ReminderLog.findOne({
      where: {
        policy_id: policyId,
        policy_type: 'vehicle',
        reminder_day: daysUntilExpiry,
        sent_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    return reminder;
  }

  async checkExistingHealthReminder(policyId, daysUntilExpiry) {
    const reminder = await ReminderLog.findOne({
      where: {
        policy_id: policyId,
        policy_type: 'health',
        reminder_day: daysUntilExpiry,
        sent_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    return reminder;
  }

  async checkExistingECPReminder(policyId, daysUntilExpiry) {
    const reminder = await ReminderLog.findOne({
      where: {
        policy_id: policyId,
        policy_type: 'ecp',
        reminder_day: daysUntilExpiry,
        sent_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    return reminder;
  }

  async checkExistingFirePolicyReminder(policyId, daysUntilExpiry) {
    const reminder = await ReminderLog.findOne({
      where: {
        policy_id: policyId,
        policy_type: 'fire',
        reminder_day: daysUntilExpiry,
        sent_at: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    return reminder;
  }

  async logReminder(policy, reminderData, emailResult) {
    try {
      const logData = {
        policy_id: policy.id,
        policy_type: 'vehicle',
        client_name: reminderData.clientName,
        client_email: reminderData.clientEmail,
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
    } catch (error) {
      console.error('❌ Error logging reminder:', error);
    }
  }

  async logHealthReminder(policy, reminderData, emailResult) {
    try {
      const logData = {
        policy_id: policy.id,
        policy_type: 'health',
        client_name: reminderData.clientName,
        client_email: reminderData.clientEmail,
        reminder_type: 'email',
        reminder_day: reminderData.daysUntilExpiry,
        expiry_date: policy.policy_end_date,
        sent_at: new Date(),
        status: emailResult.success ? 'sent' : 'failed',
        email_subject: `Health Insurance Renewal Reminder - ${reminderData.daysUntilExpiry} days remaining`,
        response_data: emailResult.success ? { messageId: emailResult.messageId || 'unknown' } : null,
        error_message: emailResult.success ? null : emailResult.error || 'Unknown error',
        days_until_expiry: reminderData.daysUntilExpiry
      };

      await ReminderLog.create(logData);
    } catch (error) {
      console.error('❌ Error logging health reminder:', error);
    }
  }

  async logECPReminder(policy, reminderData, emailResult) {
    try {
      const logData = {
        policy_id: policy.id,
        policy_type: 'ecp',
        client_name: reminderData.clientName,
        client_email: reminderData.clientEmail,
        reminder_type: 'email',
        reminder_day: reminderData.daysUntilExpiry,
        expiry_date: policy.policy_end_date,
        sent_at: new Date(),
        status: emailResult.success ? 'sent' : 'failed',
        email_subject: `ECP Renewal Reminder - ${reminderData.daysUntilExpiry} days remaining`,
        response_data: emailResult.success ? { messageId: emailResult.messageId || 'unknown' } : null,
        error_message: emailResult.success ? null : emailResult.error || 'Unknown error',
        days_until_expiry: reminderData.daysUntilExpiry
      };

      await ReminderLog.create(logData);
    } catch (error) {
      console.error('❌ Error logging ECP reminder:', error);
    }
  }

  async logFirePolicyReminder(policy, reminderData, emailResult) {
    try {
      const logData = {
        policy_id: policy.id,
        policy_type: 'fire',
        client_name: reminderData.clientName,
        client_email: reminderData.clientEmail,
        reminder_type: 'email',
        reminder_day: reminderData.daysUntilExpiry,
        expiry_date: policy.policy_end_date,
        sent_at: new Date(),
        status: emailResult.success ? 'sent' : 'failed',
        email_subject: `Fire Policy Renewal Reminder - ${reminderData.daysUntilExpiry} days remaining`,
        response_data: emailResult.success ? { messageId: emailResult.messageId || 'unknown' } : null,
        error_message: emailResult.success ? null : emailResult.error || 'Unknown error',
        days_until_expiry: reminderData.daysUntilExpiry
      };

      await ReminderLog.create(logData);
    } catch (error) {
      console.error('❌ Error logging Fire Policy reminder:', error);
    }
  }
}

// If run directly
if (require.main === module) {
  const script = new RenewalReminderScript();
  script.sendRenewalReminders().then(() => {
    console.log('🎯 Script execution completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = RenewalReminderScript; 