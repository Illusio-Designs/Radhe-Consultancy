const nodemailer = require('nodemailer');
const { sendWhatsAppMessage } = require('./whatsapp');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
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