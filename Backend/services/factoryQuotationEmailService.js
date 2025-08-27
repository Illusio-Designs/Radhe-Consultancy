const EmailService = require('./emailService');

class FactoryQuotationEmailService {
  constructor() {
    this.emailService = new EmailService();
  }

  // Send status update email for Factory Quotation
  async sendStatusUpdateEmail(quotationData) {
    try {
      console.log('📧 Sending Factory Quotation status update email...');
      
      const result = await this.emailService.sendFactoryQuotationStatusUpdate(quotationData);
      
      if (result.success) {
        console.log(`✅ Status update email sent successfully to ${quotationData.companyName} (${quotationData.email})`);
        return result;
      } else {
        console.error(`❌ Failed to send status update email:`, result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Error in Factory Quotation email service:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send status update email when status changes to 'approved'
  async sendApprovalEmail(quotationData) {
    try {
      console.log('✅ Sending Factory Quotation approval email...');
      
      const result = await this.emailService.sendFactoryQuotationStatusUpdate(quotationData);
      
      if (result.success) {
        console.log(`✅ Approval email sent successfully to ${quotationData.companyName}`);
        return result;
      } else {
        console.error(`❌ Failed to send approval email:`, result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Error sending approval email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send status update email when status changes to 'plan'
  async sendPlanStatusEmail(quotationData) {
    try {
      console.log('📋 Sending Factory Quotation plan status email...');
      
      const result = await this.emailService.sendFactoryQuotationStatusUpdate(quotationData);
      
      if (result.success) {
        console.log(`✅ Plan status email sent successfully to ${quotationData.companyName}`);
        return result;
      } else {
        console.error(`❌ Failed to send plan status email:`, result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Error sending plan status email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send status update email when status changes to 'stability'
  async sendStabilityStatusEmail(quotationData) {
    try {
      console.log('🏗️ Sending Factory Quotation stability status email...');
      
      const result = await this.emailService.sendFactoryQuotationStatusUpdate(quotationData);
      
      if (result.success) {
        console.log(`✅ Stability status email sent successfully to ${quotationData.companyName}`);
        return result;
      } else {
        console.error(`❌ Failed to send stability status email:`, result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Error sending stability status email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send status update email when status changes to 'application'
  async sendApplicationStatusEmail(quotationData) {
    try {
      console.log('📄 Sending Factory Quotation application status email...');
      
      const result = await this.emailService.sendFactoryQuotationStatusUpdate(quotationData);
      
      if (result.success) {
        console.log(`✅ Application status email sent successfully to ${quotationData.companyName}`);
        return result;
      } else {
        console.error(`❌ Failed to send application status email:`, result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Error sending application status email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send status update email when status changes to 'renewal'
  async sendRenewalStatusEmail(quotationData) {
    try {
      console.log('🔄 Sending Factory Quotation renewal status email...');
      
      const result = await this.emailService.sendFactoryQuotationStatusUpdate(quotationData);
      
      if (result.success) {
        console.log(`✅ Renewal status email sent successfully to ${quotationData.companyName}`);
        return result;
      } else {
        console.error(`❌ Failed to send renewal status email:`, result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Error sending renewal status email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send status update email for any status change
  async sendStatusChangeEmail(quotationData, previousStatus, newStatus) {
    try {
      console.log(`🔄 Sending Factory Quotation status change email: ${previousStatus} → ${newStatus}`);
      
      // Add status change information to quotation data
      const enhancedData = {
        ...quotationData,
        previousStatus,
        newStatus,
        statusChange: `${previousStatus} → ${newStatus}`
      };
      
      const result = await this.emailService.sendFactoryQuotationStatusUpdate(enhancedData);
      
      if (result.success) {
        console.log(`✅ Status change email sent successfully to ${quotationData.companyName}`);
        return result;
      } else {
        console.error(`❌ Failed to send status change email:`, result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Error sending status change email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Test the email service
  async testEmailService() {
    try {
      console.log('🧪 Testing Factory Quotation email service...');
      
      const testQuotationData = {
        companyName: 'Test Company',
        email: 'test@example.com',
        status: 'approved',
        quotationId: 'TEST001',
        totalAmount: 25000,
        assignedToRole: 'Admin',
        companyAddress: 'Test Address',
        phone: '1234567890',
        noOfWorkers: '50',
        horsePower: '100',
        year: 2025
      };
      
      const result = await this.sendStatusUpdateEmail(testQuotationData);
      
      if (result.success) {
        console.log('✅ Factory Quotation email service test PASSED');
        return { success: true, message: 'Email service test passed' };
      } else {
        console.log('❌ Factory Quotation email service test FAILED');
        return { success: false, message: 'Email service test failed', error: result.error };
      }
    } catch (error) {
      console.error('❌ Factory Quotation email service test error:', error);
      return { success: false, message: 'Email service test error', error: error.message };
    }
  }
}

module.exports = FactoryQuotationEmailService;
