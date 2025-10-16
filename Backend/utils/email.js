require('dotenv').config();
const nodemailer = require('nodemailer');
const { sendWhatsAppMessage } = require('./whatsapp');

// Lazy-loaded transporter to avoid memory issues on server startup
let transporter = null;

// Function to get or create transporter
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Determine which email provider to use
  const useGmail = process.env.USE_GMAIL_SMTP === 'true';

  // Create transporter based on configuration
  transporter = useGmail 
    ? nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // Use STARTTLS
        auth: {
          user: process.env.GMAIL_SMTP_USER,
          pass: process.env.GMAIL_SMTP_PASSWORD
        }
      })
    : nodemailer.createTransport({
        host: process.env.RENEWAL_EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.RENEWAL_EMAIL_PORT ? parseInt(process.env.RENEWAL_EMAIL_PORT) : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587),
        secure: process.env.RENEWAL_EMAIL_PORT === '465' || process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.RENEWAL_EMAIL_USER || process.env.EMAIL_USER,
          pass: process.env.RENEWAL_EMAIL_PASSWORD || process.env.EMAIL_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        },
        authMethod: 'PLAIN'
      });

  return transporter;
}

async function sendEmail(to, subject, text, html = null) {
  try {
    // Get transporter (lazy load)
    const transporter = getTransporter();
    const useGmail = process.env.USE_GMAIL_SMTP === 'true';
    
    const from = useGmail 
      ? process.env.GMAIL_SMTP_FROM 
      : (process.env.RENEWAL_EMAIL_FROM || process.env.EMAIL_FROM || process.env.EMAIL_USER);
    
    // Log email configuration for debugging
    console.log('📧 Email Configuration:');
    console.log(`   Provider: ${useGmail ? 'Gmail SMTP ✓' : 'Domain Email'}`);
    console.log(`   Host: ${transporter.options.host}`);
    console.log(`   Port: ${transporter.options.port}`);
    console.log(`   Secure: ${transporter.options.secure}`);
    console.log(`   User: ${transporter.options.auth.user}`);
    console.log(`   From: "RADHE ADVISORY" <${from}>`);
    
    // Prepare email options with spam prevention headers
    const mailOptions = {
      from: `"RADHE ADVISORY" <${from}>`,
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