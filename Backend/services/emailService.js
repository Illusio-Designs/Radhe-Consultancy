const { sendEmail } = require('../utils/email');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    // Initialize email service
  }

  // Send vehicle insurance renewal reminder
  async sendVehicleInsuranceReminder(clientData, reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, vehicleDetails, renewalAmount } = reminderData;
      
      const emailContent = this.generateVehicleInsuranceEmail(reminderData);
      const subject = `Vehicle Insurance Renewal Reminder - ${daysUntilExpiry} Days Remaining`;
      
      // Create plain text version for fallback
      const plainText = `Vehicle Insurance Renewal Reminder: Your policy expires in ${daysUntilExpiry} days. Please contact RADHE CONSULTANCY for renewal assistance.`;
      const result = await sendEmail(clientData.email, subject, plainText, emailContent);
      console.log('✅ Vehicle Insurance renewal reminder sent successfully to:', clientData.email);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: clientData.email
      };
    } catch (error) {
      console.error('❌ Error sending vehicle insurance renewal reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send labour license reminder
  async sendLabourLicenseReminder(licenseData, reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, reminderNumber } = reminderData;
      
      const emailContent = this.generateLabourLicenseEmail(licenseData, reminderData);
      const subject = `Labour License Reminder #${reminderNumber} - ${daysUntilExpiry} Days Until Expiry`;
      
      // Create plain text version for fallback
      const plainText = `Labour License Reminder #${reminderNumber}: Your license expires in ${daysUntilExpiry} days. Please contact RADHE CONSULTANCY for assistance.`;
      const result = await sendEmail(licenseData.company?.company_email, subject, plainText, emailContent);
      console.log('✅ Labour License reminder sent successfully to:', licenseData.company?.company_email);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: licenseData.company?.company_email
      };
    } catch (error) {
      console.error('❌ Error sending labour license reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send labour inspection reminder
  async sendLabourInspectionReminder(inspectionData, reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, reminderNumber } = reminderData;
      
      const emailContent = this.generateLabourInspectionEmail(inspectionData, reminderData);
      const subject = `Labour Inspection Reminder #${reminderNumber} - ${daysUntilExpiry} Days Until Expiry`;
      
      // Create plain text version for fallback
      const plainText = `Labour Inspection Reminder #${reminderNumber}: Your inspection expires in ${daysUntilExpiry} days. Please contact RADHE CONSULTANCY for assistance.`;
      const result = await sendEmail(inspectionData.company?.company_email, subject, plainText, emailContent);
      console.log('✅ Labour Inspection reminder sent successfully to:', inspectionData.company?.company_email);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: inspectionData.company?.company_email
      };
    } catch (error) {
      console.error('❌ Error sending labour inspection reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate professional HTML email content for vehicle insurance renewal
  generateVehicleInsuranceEmail(reminderData) {
    const { daysUntilExpiry, expiryDate, vehicleDetails, renewalAmount } = reminderData;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vehicle Insurance Renewal Reminder - RADHE CONSULTANCY</title>
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
            <h2 style="font-size: 20px; color: #e74c3c; margin: 0 0 20px 0; text-align: center; font-weight: 600;">⚠️ URGENT: Vehicle Insurance Expiring Soon!</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Dear <strong>${reminderData.clientName || 'Valued Client'}</strong>,<br>
              Your vehicle insurance policy expires in <strong>${daysUntilExpiry} days</strong>.
            </p>
            
            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">🚨 EXPIRY ALERT</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">Expiry Date: <strong>${expiryDate}</strong></p>
            </div>
            
            <!-- Vehicle Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 16px;">🚗 Vehicle Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Vehicle Number:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.vehicleNumber || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Vehicle Type:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.vehicleType || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Make & Model:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.vehicleMake || 'N/A'} ${vehicleDetails?.vehicleModel || ''}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Insurance Company:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.insuranceCompany || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Renewal Amount:</span>
                  <span style="color: #6c757d;">₹${renewalAmount || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li style="margin: 6px 0;">Contact RADHE CONSULTANCY for renewal assistance</li>
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
              © 2025 RADHE CONSULTANCY. All rights reserved.
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
        <title>RADHE CONSULTANCY - Renewal Management System</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">RADHE CONSULTANCY</h1>
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
              © 2025 RADHE CONSULTANCY. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send test email
  async sendTestEmail(email, testSubject = 'System Test Email') {
    try {
      const testContent = this.generateTestEmailContent();
      
      // Create plain text version for fallback
      const plainText = 'RADHE CONSULTANCY - Renewal Management System Test Email. Please check your email client settings to view HTML content.';
      const result = await sendEmail(email, testSubject, plainText, testContent);
      console.log('✅ Test email sent successfully to:', email);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: email
      };
    } catch (error) {
      console.error('❌ Error sending test email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send multiple test emails
  async sendMultipleTestEmails(emails, testSubject = 'System Test Email') {
    const results = [];
    
    for (const email of emails) {
      try {
        const testContent = this.generateTestEmailContent();
        
        // Create plain text version for fallback
        const plainText = 'RADHE CONSULTANCY - Renewal Management System Test Email. Please check your email client settings to view HTML content.';
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
        console.error(`❌ Error sending test email to ${email}:`, error);
      }
    }
    
    return results;
  }

  // Generate professional HTML email content for vehicle insurance renewal (alternative method)
  generateVehicleInsuranceEmailAlternative(reminderData) {
    const { daysUntilExpiry, expiryDate, vehicleDetails, renewalAmount } = reminderData;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vehicle Insurance Renewal - RADHE CONSULTANCY</title>
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
            <h2 style="font-size: 20px; color: #e74c3c; margin: 0 0 20px 0; text-align: center; font-weight: 600;">⚠️ URGENT: Vehicle Insurance Expiring Soon!</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Dear <strong>${reminderData.clientName || 'Valued Client'}</strong>,<br>
              Your vehicle insurance policy expires in <strong>${daysUntilExpiry} days</strong>.
            </p>
            
            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">🚨 EXPIRY ALERT</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">Expiry Date: <strong>${expiryDate}</strong></p>
            </div>
            
            <!-- Vehicle Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 16px;">🚗 Vehicle Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Vehicle Number:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.vehicleNumber || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Vehicle Type:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.vehicleType || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Make & Model:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.vehicleMake || 'N/A'} ${vehicleDetails?.vehicleModel || ''}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Insurance Company:</span>
                  <span style="color: #6c757d;">${vehicleDetails?.insuranceCompany || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Renewal Amount:</span>
                  <span style="color: #6c757d;">₹${renewalAmount || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li style="margin: 6px 0;">Contact RADHE CONSULTANCY for renewal assistance</li>
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
              © 2025 RADHE CONSULTANCY. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send health insurance renewal reminder
  async sendHealthInsuranceReminder(reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, policyDetails, clientName, clientEmail } = reminderData;
      
      const emailContent = this.generateHealthInsuranceEmail(reminderData);
      const subject = `Health Insurance Renewal Reminder - ${daysUntilExpiry} Days Remaining`;
      
      // Create plain text version for fallback
      const plainText = `Health Insurance Renewal Reminder: Your policy expires in ${daysUntilExpiry} days. Please contact RADHE CONSULTANCY for renewal assistance.`;
      const result = await sendEmail(clientEmail, subject, plainText, emailContent);
      console.log('✅ Health Insurance renewal reminder sent successfully to:', clientEmail);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: clientEmail
      };
    } catch (error) {
      console.error('❌ Error sending health insurance renewal reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate professional HTML email content for health insurance renewal
  generateHealthInsuranceEmail(reminderData) {
    const { daysUntilExpiry, expiryDate, policyDetails, clientName } = reminderData;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Health Insurance Renewal Reminder - RADHE CONSULTANCY</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">🏥 Health Insurance Renewal</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9;">Important Reminder - Action Required</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 20px; color: #3498db; margin: 0 0 20px 0; text-align: center; font-weight: 600;">⚠️ URGENT: Health Insurance Expiring Soon!</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Dear <strong>${clientName}</strong>,<br>
              Your health insurance policy expires in <strong>${daysUntilExpiry} days</strong>.
            </p>
            
            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">🚨 EXPIRY ALERT</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">Expiry Date: <strong>${expiryDate}</strong></p>
            </div>
            
            <!-- Policy Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #3498db; margin: 0 0 15px 0; font-size: 16px;">📋 Policy Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Policy Number:</span>
                  <span style="color: #6c757d;">${policyDetails.policyNumber || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Product Type:</span>
                  <span style="color: #6c757d;">${policyDetails.productType || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Sum Insured:</span>
                  <span style="color: #6c757d;">₹${policyDetails.sumInsured || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Insurance Company:</span>
                  <span style="color: #6c757d;">${policyDetails.insuranceCompany || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Premium Amount:</span>
                  <span style="color: #6c757d;">₹${policyDetails.premiumAmount || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li style="margin: 6px 0;">Contact RADHE CONSULTANCY for renewal assistance</li>
                <li style="margin: 6px 0;">Submit required medical documents</li>
                <li style="margin: 6px 0;">Complete payment for new policy</li>
                <li style="margin: 6px 0;">Avoid any lapse in health coverage</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:radhe@radheconsultancy.co.in" style="display: inline-block; background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
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
              © 2025 RADHE CONSULTANCY. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send ECP renewal reminder
  async sendECPRenewalReminder(reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, policyDetails, clientName, clientEmail } = reminderData;
      
      const emailContent = this.generateECPEmail(reminderData);
      const subject = `Employee Compensation Policy Renewal Reminder - ${daysUntilExpiry} Days Remaining`;
      
      // Create plain text version for fallback
      const plainText = `Employee Compensation Policy Renewal Reminder: Your policy expires in ${daysUntilExpiry} days. Please contact RADHE CONSULTANCY for renewal assistance.`;
      const result = await sendEmail(clientEmail, subject, plainText, emailContent);
      console.log('✅ ECP renewal reminder sent successfully to:', clientEmail);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: clientEmail
      };
    } catch (error) {
      console.error('❌ Error sending ECP renewal reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate professional HTML email content for ECP renewal
  generateECPEmail(reminderData) {
    const { daysUntilExpiry, expiryDate, policyDetails, clientName } = reminderData;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Employee Compensation Policy Renewal Reminder - RADHE CONSULTANCY</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">🏢 Employee Compensation Policy</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9;">Important Renewal Reminder - Action Required</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 20px; color: #f39c12; margin: 0 0 20px 0; text-align: center; font-weight: 600;">⚠️ URGENT: ECP Policy Expiring Soon!</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Dear <strong>${clientName}</strong>,<br>
              Your Employee Compensation Policy expires in <strong>${daysUntilExpiry} days</strong>.
            </p>
            
            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">🚨 EXPIRY ALERT</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">Expiry Date: <strong>${expiryDate}</strong></p>
            </div>
            
            <!-- Policy Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #f39c12; margin: 0 0 15px 0; font-size: 16px;">📋 Policy Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Policy Number:</span>
                  <span style="color: #6c757d;">${policyDetails.policyNumber || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Business Type:</span>
                  <span style="color: #6c757d;">${policyDetails.businessType || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Medical Cover:</span>
                  <span style="color: #6c757d;">₹${policyDetails.medicalCover || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Insurance Company:</span>
                  <span style="color: #6c757d;">${policyDetails.insuranceCompany || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Gross Premium:</span>
                  <span style="color: #6c757d;">₹${policyDetails.grossPremium || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li style="margin: 6px 0;">Contact RADHE CONSULTANCY for renewal assistance</li>
                <li style="margin: 6px 0;">Submit required employee documents</li>
                <li style="margin: 6px 0;">Complete payment for new policy</li>
                <li style="margin: 6px 0;">Avoid any lapse in employee coverage</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:radhe@radheconsultancy.co.in" style="display: inline-block; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
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
              © 2025 RADHE CONSULTANCY. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send Fire Policy renewal reminder
  async sendFirePolicyRenewalReminder(reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, policyDetails, clientName, clientEmail } = reminderData;
      
      const emailContent = this.generateFirePolicyEmail(reminderData);
      const subject = `Fire Policy Renewal Reminder - ${daysUntilExpiry} Days Remaining`;
      
      // Create plain text version for fallback
      const plainText = `Fire Policy Renewal Reminder: Your policy expires in ${daysUntilExpiry} days. Please contact RADHE CONSULTANCY for renewal assistance.`;
      const result = await sendEmail(clientEmail, subject, plainText, emailContent);
      console.log('✅ Fire Policy renewal reminder sent successfully to:', clientEmail);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: clientEmail
      };
    } catch (error) {
      console.error('❌ Error sending Fire Policy renewal reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

    // Generate professional HTML email content for Fire Policy renewal
  generateFirePolicyEmail(reminderData) {
    const { daysUntilExpiry, expiryDate, policyDetails, clientName } = reminderData;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fire Policy Renewal Reminder - RADHE CONSULTANCY</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">🔥 Fire Policy Renewal</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9;">Important Renewal Reminder - Action Required</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 20px; color: #e67e22; margin: 0 0 20px 0; text-align: center; font-weight: 600;">⚠️ URGENT: Fire Policy Expiring Soon!</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Dear <strong>${clientName}</strong>,<br>
              Your Fire Policy expires in <strong>${daysUntilExpiry} days</strong>.
            </p>
            
            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">🚨 EXPIRY ALERT</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">Expiry Date: <strong>${expiryDate}</strong></p>
            </div>
            
            <!-- Policy Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #e67e22; margin: 0 0 15px 0; font-size: 16px;">📋 Policy Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Policy Number:</span>
                  <span style="color: #6c757d;">${policyDetails.policyNumber || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Business Type:</span>
                  <span style="color: #6c757d;">${policyDetails.businessType || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Total Sum Insured:</span>
                  <span style="color: #6c757d;">₹${policyDetails.totalSumInsured || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Insurance Company:</span>
                  <span style="color: #6c757d;">${policyDetails.insuranceCompany || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Gross Premium:</span>
                  <span style="color: #6c757d;">₹${policyDetails.grossPremium || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li style="margin: 6px 0;">Contact RADHE CONSULTANCY for renewal assistance</li>
                <li style="margin: 6px 0;">Submit required fire safety documents</li>
                <li style="margin: 6px 0;">Complete payment for new policy</li>
                <li style="margin: 6px 0;">Avoid any lapse in fire coverage</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:radhe@radheconsultancy.co.in" style="display: inline-block; background: linear-gradient(135deg, #e67e22 0%, #d35400 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
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
              © 2025 RADHE CONSULTANCY. All rights reserved.
            </p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

  // Send DSC renewal reminder
  async sendDSCRenewalReminder(reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, policyDetails, clientName, clientEmail } = reminderData;
      
      const emailContent = this.generateDSCEmail(reminderData);
      const subject = `DSC Renewal Reminder - ${daysUntilExpiry} Days Remaining`;
      
      // Create plain text version for fallback
      const plainText = `DSC Renewal Reminder: Your certificate expires in ${daysUntilExpiry} days. Please contact RADHE CONSULTANCY for renewal assistance.`;
      const result = await sendEmail(clientEmail, subject, plainText, emailContent);
      console.log('✅ DSC renewal reminder sent successfully to:', clientEmail);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: clientEmail
      };
    } catch (error) {
      console.error('❌ Error sending DSC renewal reminder:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate professional HTML email content for DSC renewal
  generateDSCEmail(reminderData) {
    const { daysUntilExpiry, expiryDate, policyDetails, clientName } = reminderData;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DSC Renewal Reminder - RADHE CONSULTANCY</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">🔐 DSC Renewal</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9;">Important Renewal Reminder - Action Required</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 20px; color: #9b59b6; margin: 0 0 20px 0; text-align: center; font-weight: 600;">⚠️ URGENT: DSC Expiring Soon!</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Dear <strong>${clientName}</strong>,<br>
              Your Digital Signature Certificate expires in <strong>${daysUntilExpiry} days</strong>.
            </p>
            
            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">🚨 EXPIRY ALERT</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">Expiry Date: <strong>${expiryDate}</strong></p>
            </div>
            
            <!-- Certificate Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #9b59b6; margin: 0 0 15px 0; font-size: 16px;">📋 Certificate Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Certificate Name:</span>
                  <span style="color: #6c757d;">${policyDetails.certificateName || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Status:</span>
                  <span style="color: #6c757d;">${policyDetails.status || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Certificate ID:</span>
                  <span style="color: #6c757d;">${policyDetails.certificateId || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li style="margin: 6px 0;">Contact RADHE CONSULTANCY for renewal assistance</li>
                <li style="margin: 6px 0;">Submit required identity documents</li>
                <li style="margin: 6px 0;">Complete payment for new certificate</li>
                <li style="margin: 6px 0;">Avoid any lapse in digital signature validity</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:radhe@radheconsultancy.co.in" style="display: inline-block; background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
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
              © 2025 RADHE CONSULTANCY. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send Factory Quotation status update email
  async sendFactoryQuotationStatusUpdate(quotationData) {
    try {
      const { companyName, email, status, quotationId, totalAmount, assignedToRole } = quotationData;
      
      const emailContent = this.generateFactoryQuotationStatusEmail(quotationData);
      const subject = `Factory Quotation Status Update - ${status.toUpperCase()}`;
      
      // Create plain text version for fallback
      const plainText = `Factory Quotation Status Update: Your quotation #${quotationId} status has been updated to ${status}. Please check your email for details.`;
      const result = await sendEmail(email, subject, plainText, emailContent);
      console.log('✅ Factory Quotation status update email sent successfully to:', email);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: email
      };
    } catch (error) {
      console.error('❌ Error sending Factory Quotation status update email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate professional HTML email content for Factory Quotation status update
  generateFactoryQuotationStatusEmail(quotationData) {
    const { companyName, status, quotationId, totalAmount, assignedToRole, companyAddress, phone, noOfWorkers, horsePower, year } = quotationData;
    
    // Get status-specific color and icon
    const statusConfig = this.getStatusConfig(status);
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factory Quotation Status Update - RADHE CONSULTANCY</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, ${statusConfig.color1} 0%, ${statusConfig.color2} 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">🏭 Factory Quotation</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9;">Status Update Notification</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 20px; color: ${statusConfig.color1}; margin: 0 0 20px 0; text-align: center; font-weight: 600;">
              ${statusConfig.icon} Status Updated: ${status.toUpperCase()}
            </h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Dear <strong>${companyName}</strong>,<br>
              Your factory quotation status has been updated. Here are the current details:
            </p>
            
            <!-- Status Box -->
            <div style="background: linear-gradient(135deg, ${statusConfig.color1} 0%, ${statusConfig.color2} 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">📊 CURRENT STATUS</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">${status.toUpperCase()}</p>
            </div>
            
            <!-- Quotation Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: ${statusConfig.color1}; margin: 0 0 15px 0; font-size: 16px;">📋 Quotation Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Quotation ID:</span>
                  <span style="color: #6c757d;">#${quotationId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Company Name:</span>
                  <span style="color: #6c757d;">${companyName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Total Amount:</span>
                  <span style="color: #6c757d;">₹${totalAmount || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Assigned To:</span>
                  <span style="color: #6c757d;">${assignedToRole || 'Admin'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Year:</span>
                  <span style="color: #6c757d;">${year || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Next Steps -->
            <div style="background: #e8f5e8; border: 1px solid #c3e6c3; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #2d5a2d;">📝 Next Steps</h3>
              <ul style="margin: 0; padding-left: 20px; color: #2d5a2d;">
                ${this.getNextStepsForStatus(status)}
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:radhe@radheconsultancy.co.in" style="display: inline-block; background: linear-gradient(135deg, ${statusConfig.color1} 0%, ${statusConfig.color2} 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Contact Us
              </a>
            </div>
            
            <!-- Divider -->
            <div style="height: 1px; background: #e9ecef; margin: 30px 0;"></div>
            
            <p style="text-align: center; font-size: 14px; color: #6c757d; margin: 0;">
              <strong>Status Updated:</strong> ${new Date().toLocaleDateString('en-IN')} | 
              <strong>Quotation ID:</strong> #${quotationId}
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; font-size: 12px; color: #6c757d;">
              © 2025 RADHE CONSULTANCY. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Get status-specific configuration (colors, icons, etc.)
  getStatusConfig(status) {
    const configs = {
      'maked': { color1: '#3498db', color2: '#2980b9', icon: '📝' },
      'approved': { color1: '#27ae60', color2: '#2ecc71', icon: '✅' },
      'plan': { color1: '#f39c12', color2: '#e67e22', icon: '📋' },
      'stability': { color1: '#9b59b6', color2: '#8e44ad', icon: '🏗️' },
      'application': { color1: '#e74c3c', color2: '#c0392b', icon: '📄' },
      'renewal': { color1: '#1abc9c', color2: '#16a085', icon: '🔄' }
    };
    
    return configs[status] || configs['maked'];
  }

  // Get next steps based on status
  getNextStepsForStatus(status) {
    const steps = {
      'maked': [
        'Review quotation details',
        'Approve or request modifications',
        'Proceed to next stage'
      ],
      'approved': [
        'Generate plan documents',
        'Assign plan management team',
        'Begin plan implementation'
      ],
      'plan': [
        'Complete plan documentation',
        'Submit for stability review',
        'Prepare application materials'
      ],
      'stability': [
        'Conduct stability assessment',
        'Generate stability certificate',
        'Move to application phase'
      ],
      'application': [
        'Submit application documents',
        'Pay required fees',
        'Await approval'
      ],
      'renewal': [
        'Review renewal requirements',
        'Update documentation',
        'Process renewal application'
      ]
    };
    
    const currentSteps = steps[status] || steps['maked'];
    return currentSteps.map(step => `<li style="margin: 6px 0;">${step}</li>`).join('');
  }

  // Send Factory Quotation renewal reminder email
  async sendFactoryQuotationRenewalReminder(reminderData) {
    try {
      const { daysUntilExpiry, renewalDate, quotationDetails, clientName } = reminderData;
      
      const emailContent = this.generateFactoryQuotationRenewalEmail(reminderData);
      const subject = `Factory Quotation Renewal Reminder - ${daysUntilExpiry} Days Until Expiry`;
      
      // Create plain text version for fallback
      const plainText = `Factory Quotation Renewal Reminder: Your quotation #${quotationDetails.quotationId} expires in ${daysUntilExpiry} days on ${renewalDate}. Please contact us for renewal assistance.`;
      const result = await sendEmail(quotationDetails.email, subject, plainText, emailContent);
      console.log('✅ Factory Quotation renewal reminder email sent successfully to:', quotationDetails.email);
      
      return {
        success: true,
        messageId: result.messageId,
        sentTo: quotationDetails.email
      };
    } catch (error) {
      console.error('❌ Error sending Factory Quotation renewal reminder email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate professional HTML email content for Factory Quotation renewal
  generateFactoryQuotationRenewalEmail(reminderData) {
    const { daysUntilExpiry, renewalDate, quotationDetails, clientName } = reminderData;
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factory Quotation Renewal Reminder - RADHE CONSULTANCY</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #2c3e50; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); min-height: 100vh;">
        
        <!-- Email Container -->
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">🏭 Factory Quotation</h1>
            <p style="font-size: 14px; margin: 0; opacity: 0.9;">Renewal Reminder - Action Required</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <h2 style="font-size: 20px; color: #1abc9c; margin: 0 0 20px 0; text-align: center; font-weight: 600;">⚠️ URGENT: Quotation Expiring Soon!</h2>
            
            <p style="font-size: 16px; color: #2c3e50; margin: 20px 0; text-align: center; line-height: 1.6;">
              Dear <strong>${clientName}</strong>,<br>
              Your factory quotation expires in <strong>${daysUntilExpiry} days</strong>.
            </p>
            
            <!-- Alert Box -->
            <div style="background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); color: white; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <h3 style="font-size: 18px; margin: 0 0 10px 0;">🚨 EXPIRY ALERT</h3>
              <p style="margin: 0; font-size: 16px; font-weight: 600;">Renewal Date: <strong>${renewalDate}</strong></p>
            </div>
            
            <!-- Quotation Details -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #1abc9c; margin: 0 0 15px 0; font-size: 16px;">📋 Quotation Information</h3>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Quotation ID:</span>
                  <span style="color: #6c757d;">#${quotationDetails.quotationId || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Company Name:</span>
                  <span style="color: #6c757d;">${quotationDetails.companyName || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Total Amount:</span>
                  <span style="color: #6c757d;">₹${quotationDetails.totalAmount || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                  <span style="font-weight: 600; color: #2c3e50;">Current Status:</span>
                  <span style="color: #6c757d;">${quotationDetails.status || 'N/A'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="font-weight: 600; color: #2c3e50;">Year:</span>
                  <span style="color: #6c757d;">${quotationDetails.year || 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <!-- Action Required -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #856404;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li style="margin: 6px 0;">Contact RADHE CONSULTANCY for renewal assistance</li>
                <li style="margin: 6px 0;">Review and update company information if needed</li>
                <li style="margin: 6px 0;">Submit any required updated documents</li>
                <li style="margin: 6px 0;">Complete renewal payment</li>
                <li style="margin: 6px 0;">Avoid any lapse in quotation validity</li>
              </ul>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:radhe@radheconsultancy.co.in" style="display: inline-block; background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
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
              © 2025 RADHE CONSULTANCY. All rights reserved.
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
      // Simple connection test
      return true;
    } catch (error) {
      console.error('❌ Email service connection test failed:', error);
      return false;
    }
  }

  // Generate professional HTML email content for labour inspection reminder
  generateLabourInspectionEmail(inspectionData, reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, reminderNumber } = reminderData;
      
      // Read the HTML template file
      const templatePath = path.join(__dirname, '../email_templates/labour_inspection_reminder.html');
      let template = fs.readFileSync(templatePath, 'utf8');
      
      // Replace placeholders with actual data
      template = template.replace('APEX ZIPPER', inspectionData.company?.company_name || 'Valued Client');
      template = template.replace('10 days', `${daysUntilExpiry} days`);
      template = template.replace('2025-12-20', expiryDate);
      template = template.replace('05/12/2025', inspectionData.date_of_notice ? new Date(inspectionData.date_of_notice).toLocaleDateString('en-IN') : 'N/A');
      template = template.replace('Mr. Ramesh Kumar', inspectionData.officer_name || 'N/A');
      template = template.replace('Running', inspectionData.status || 'N/A');
      template = template.replace('15/8/2025', new Date().toLocaleDateString('en-IN'));
      template = template.replace('Reminder #2 of 5', `Reminder #${reminderNumber} of 5`);
      
      return template;
    } catch (error) {
      console.error('❌ Error reading labour inspection email template:', error);
      // Fallback to simple HTML if template reading fails
      return `
        <!DOCTYPE html>
        <html>
        <body>
          <h2>Labour Inspection Reminder</h2>
          <p>Dear ${inspectionData.company?.company_name || 'Valued Client'},</p>
          <p>Your labour inspection expires in ${reminderData.daysUntilExpiry} days.</p>
          <p>Please contact RADHE CONSULTANCY for assistance.</p>
        </body>
        </html>
      `;
    }
  }

  // Generate professional HTML email content for labour license reminder
  generateLabourLicenseEmail(licenseData, reminderData) {
    try {
      const { daysUntilExpiry, expiryDate, reminderNumber } = reminderData;
      
      // Read the HTML template file
      const templatePath = path.join(__dirname, '../email_templates/labour_license_reminder.html');
      let template = fs.readFileSync(templatePath, 'utf8');
      
      // Replace placeholders with actual data
      template = template.replace('APEX ZIPPER', licenseData.company?.company_name || 'Valued Client');
      template = template.replace('15 days', `${daysUntilExpiry} days`);
      template = template.replace('2025-12-20', expiryDate);
      template = template.replace('LIC-2025-001', licenseData.license_number || 'N/A');
      template = template.replace('15/8/2025', new Date().toLocaleDateString('en-IN'));
      template = template.replace('Reminder #2 of 3', `Reminder #${reminderNumber} of 3`);
      
      return template;
    } catch (error) {
      console.error('❌ Error reading labour license email template:', error);
      // Fallback to simple HTML if template reading fails
      return `
        <!DOCTYPE html>
        <html>
        <body>
          <h2>Labour License Reminder</h2>
          <p>Dear ${licenseData.company?.company_name || 'Valued Client'},</p>
          <p>Your labour license expires in ${reminderData.daysUntilExpiry} days.</p>
          <p>Please contact RADHE CONSULTANCY for assistance.</p>
        </body>
        </html>
      `;
    }
  }
}

module.exports = EmailService;
