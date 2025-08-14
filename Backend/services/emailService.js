const { sendEmail } = require('../utils/email');
const emailConfig = require('../config/emailConfig');

class EmailService {
  // Send vehicle insurance renewal reminder
  async sendVehicleInsuranceReminder(clientData, reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, vehicleDetails, policyInfo } = reminderData;
      
      const emailContent = this.generateVehicleInsuranceEmail(clientData, reminderData);
      const subject = `${emailConfig.templates.subjectPrefix}${emailConfig.renewalReminders.vehicleInsurance.subject} - ${daysUntilExpiry} Days Remaining`;
      
      // Create plain text version for fallback
      const plainText = `Vehicle Insurance Renewal Reminder: Your policy expires in ${daysUntilExpiry} days. Please contact RADHE ADVISORY for renewal assistance.`;
      const result = await sendEmail(clientData.email, subject, plainText, emailContent);
      console.log('✅ Vehicle Insurance renewal reminder sent successfully to:', clientData.email);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: clientData.email
      };
    } catch (error) {
      console.error('❌ Error sending vehicle insurance renewal reminder:', error);
      throw error;
    }
  }

  // Send test email to specified addresses
  async sendTestEmails() {
    try {
      const testEmails = [
        'info@illusiodesigns.agency',
        'radheconsultancy17@yahoo.com',
        'illusiodesigns@gmail.com'
      ];
      
      const testSubject = `${emailConfig.templates.subjectPrefix}Test Email - Renewal Management System`;
      const testContent = this.generateTestEmailContent();
      
      const results = [];
      
      for (const email of testEmails) {
        try {
          // Create plain text version for fallback
          const plainText = 'RADHE ADVISORY - Renewal Management System Test Email. Please check your email client settings to view HTML content.';
          const result = await sendEmail(email, testSubject, plainText, testContent);
          results.push({
            email,
            success: true,
            messageId: result.messageId
          });
          console.log(`✅ Test email sent successfully to: ${email}`);
        } catch (error) {
          results.push({
            email,
            success: false,
            error: error.message
          });
          console.error(`❌ Failed to send test email to ${email}:`, error.message);
        }
      }
      
      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('❌ Error sending test emails:', error);
      throw error;
    }
  }

  // Generate professional HTML email content for vehicle insurance renewal
  generateVehicleInsuranceEmail(clientData, reminderData) {
    const { daysUntilExpiry, expiryDate, vehicleDetails, policyInfo } = reminderData;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vehicle Insurance Renewal Reminder - RADHE ADVISORY</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">🚗 Vehicle Insurance Renewal</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9;">Important Reminder - Action Required</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 20px; color: #e74c3c; margin: 0 0 20px 0; text-align: center; font-weight: 600;">⚠️ URGENT: Insurance Expiring Soon!</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Your vehicle insurance policy expires in <strong>${daysUntilExpiry} days</strong>.
            </p>
            
            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">🚨 EXPIRY ALERT</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">Expiry Date: <strong>${new Date(expiryDate).toLocaleDateString('en-IN')}</strong></p>
            </div>
            
            <!-- Client Information -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 16px;">👤 Client Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Client Name:</span>
                  <span style="color: #6c757d;">${clientData.name || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <div style="font-weight: 600; color: #2c3e50;">Contact Number:</div>
                  <span style="color: #6c757d;">${clientData.phone || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Email Address:</span>
                  <span style="color: #6c757d;">${clientData.email || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Current Policy Information -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 16px;">📋 Current Policy Details</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Policy Number:</span>
                  <span style="color: #6c757d;">${policyInfo?.policyNumber || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Insurance Company:</span>
                  <span style="color: #6c757d;">${policyInfo?.insuranceCompany || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Start Date:</span>
                  <span style="color: #6c757d;">${policyInfo?.startDate ? new Date(policyInfo.startDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Premium Amount:</span>
                  <span style="color: #6c757d;">₹${policyInfo?.premiumAmount?.toLocaleString('en-IN') || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Vehicle Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 16px;">🚗 Vehicle Details</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Vehicle Number:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.vehicleNumber || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Manufacturer:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.manufacturingCompany || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Model:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.model || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Sub Product:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.subProduct || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li style="margin: 6px 0;">Contact RADHE ADVISORY for renewal assistance</li>
                <li style="margin: 6px 0;">Submit required documents</li>
                <li style="margin: 6px 0;">Complete payment for new policy</li>
                <li style="margin: 6px 0;">Avoid any lapse in coverage</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:radhe@radheconsultancy.co.in" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Contact Us Now
              </a>
            </div>
            
            <!-- Divider -->
            <div style="height: 1px; background: #e9ecef; margin: 30px 0;"></div>
            
            <p style="text-align: center; font-size: 14px; color: #6c757d; margin: 0;">
              <strong>Reminder Sent:</strong> ${new Date().toLocaleDateString('en-IN')} | 
              <strong>Days Until Expiry:</strong> ${daysUntilExpiry}
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              © 2025 RADHE ADVISORY. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate professional HTML email content for test emails
  generateTestEmailContent() {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RADHE ADVISORY - Renewal Management System</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">RADHE ADVISORY</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9;">Renewal Management System</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 20px; color: #1e3c72; margin: 0 0 20px 0; text-align: center; font-weight: 600;">✅ System Verification Complete</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Your renewal management system is fully operational and ready for production use.
            </p>
            
            <!-- Success Badge -->
            <div style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 8px 0;">🎉 Ready for Production</h3>
              <p style="margin: 0; font-size: 14px;">All services operational</p>
            </div>
            
            <!-- Features List -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 16px;">🚀 System Capabilities</h3>
              <ul style="margin: 0; padding-left: 20px; color: #2c3e50;">
                <li style="margin: 8px 0;">Professional email service</li>
                <li style="margin: 8px 0;">Automated renewal reminders</li>
                <li style="margin: 8px 0;">Admin-configurable settings</li>
                <li style="margin: 8px 0;">Comprehensive logging system</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:radhe@radheconsultancy.co.in" style="display: inline-block; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Contact Us
              </a>
            </div>
            
            <!-- Divider -->
            <div style="height: 1px; background: #e9ecef; margin: 30px 0;"></div>
            
            <p style="text-align: center; font-size: 14px; color: #6c757d; margin: 0;">
              <strong>Status:</strong> All services operational | 
              <strong>Test:</strong> ${new Date().toLocaleDateString('en-IN')}
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              © 2025 RADHE ADVISORY. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate professional vehicle insurance renewal email
  generateVehicleInsuranceRenewalEmail(policyData) {
    const expiryDate = new Date(policyData.expiry_date).toLocaleDateString('en-IN');
    const daysUntilExpiry = Math.ceil((new Date(policyData.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vehicle Insurance Renewal - RADHE ADVISORY</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">🚗 Vehicle Insurance Renewal</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9;">Important Reminder - Action Required</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 20px; color: #e74c3c; margin: 0 0 20px 0; text-align: center; font-weight: 600;">⚠️ URGENT: Insurance Expiring Soon!</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Your vehicle insurance expires in <strong>${daysUntilExpiry} days</strong>.
            </p>
            
            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">🚨 EXPIRY ALERT</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">Expiry Date: <strong>${expiryDate}</strong></p>
            </div>
            
            <!-- Policy Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 16px;">📋 Policy Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Policy Number:</span>
                  <span style="color: #6c757d;">${policyData.policy_number || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Vehicle Number:</span>
                  <span style="color: #6c757d;">${policyData.vehicle_number || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Insurance Company:</span>
                  <span style="color: #6c757d;">${policyData.insurance_company || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Premium Amount:</span>
                  <span style="color: #6c757d;">₹${policyData.premium_amount || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li style="margin: 6px 0;">Contact RADHE ADVISORY for renewal assistance</li>
                <li style="margin: 6px 0;">Submit required documents</li>
                <li style="margin: 6px 0;">Complete payment for new policy</li>
                <li style="margin: 6px 0;">Avoid any lapse in coverage</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:radhe@radheconsultancy.co.in" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Contact Us Now
              </a>
            </div>
            
            <!-- Divider -->
            <div style="height: 1px; background: #e9ecef; margin: 30px 0;"></div>
            
            <p style="text-align: center; font-size: 14px; color: #6c757d; margin: 0;">
              <strong>Reminder Sent:</strong> ${new Date().toLocaleDateString('en-IN')} | 
              <strong>Days Until Expiry:</strong> ${daysUntilExpiry}
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              © 2025 RADHE ADVISORY. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Test email connection
  async testConnection() {
    try {
      // Send a test email to verify connection
      const testResult = await this.sendTestEmails();
      return testResult.success;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = EmailService;
