require('dotenv').config();
const nodemailer = require('nodemailer');
const { sendWhatsAppMessage } = require('./whatsapp');

// Create transporter with renewal email config or fallback to existing config
const transporter = nodemailer.createTransport({
  host: process.env.RENEWAL_EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.RENEWAL_EMAIL_PORT ? parseInt(process.env.RENEWAL_EMAIL_PORT) : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587),
  secure: process.env.RENEWAL_EMAIL_PORT === '465' || process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.RENEWAL_EMAIL_USER || process.env.EMAIL_USER,
    pass: process.env.RENEWAL_EMAIL_PASSWORD || process.env.EMAIL_PASSWORD
  },
  // Additional options for cPanel email servers
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  },
  // Try different authentication methods
  authMethod: 'PLAIN' // or 'LOGIN', 'CRAM-MD5'
});

async function sendEmail(to, subject, text, html = null) {
  try {
    const from = process.env.RENEWAL_EMAIL_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER;
    
    // Log email configuration for debugging
    console.log('📧 Email Configuration:');
    console.log(`   Host: ${transporter.options.host}`);
    console.log(`   Port: ${transporter.options.port}`);
    console.log(`   Secure: ${transporter.options.secure}`);
    console.log(`   User: ${transporter.options.auth.user}`);
    console.log(`   From: ${from}`);
    
    // Prepare email options with spam prevention headers
    const mailOptions = {
      from: {
        name: "RADHE ADVISORY",
        address: from
      },
      to,
      subject,
      text: html ? text : text, // Fallback text if HTML fails
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'RADHE ADVISORY Renewal System',
        'List-Unsubscribe': '<mailto:radhe@radheconsultancy.co.in?subject=unsubscribe>',
        'Precedence': 'bulk',
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      },
      priority: 'high'
    };
    
    // Add HTML if provided
    if (html) {
      mailOptions.html = html;
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    throw error;
  }
}

async function sendNotification(email, phone, subject, message) {
  try {
    // Send email
    if (email) {
      await sendEmail(email, subject, message);
    }

    // Send WhatsApp message
    if (phone) {
      await sendWhatsAppMessage(phone, message);
    }

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}

module.exports = { sendEmail, sendNotification }; 