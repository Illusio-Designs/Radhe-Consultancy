// Lazy load axios to avoid memory issues on server startup
let axios = null;
const crypto = require('crypto');

function getAxios() {
  if (!axios) {
    axios = require('axios');
  }
  return axios;
}

// Store OTPs in memory (in production, use Redis or similar)
const otpStore = new Map();

// Generate a 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP with expiry (5 minutes)
function storeOTP(phone, otp) {
  const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStore.set(phone, { otp, expiry });
}

// Verify OTP
function verifyOTP(phone, otp) {
  const stored = otpStore.get(phone);
  if (!stored) return false;
  
  if (Date.now() > stored.expiry) {
    otpStore.delete(phone);
    return false;
  }
  
  if (stored.otp === otp) {
    otpStore.delete(phone);
    return true;
  }
  
  return false;
}

// Send OTP via WhatsApp
async function sendWhatsAppOTP(phone) {
  try {
    const otp = generateOTP();
    const formattedNumber = phone.startsWith('+') ? phone.slice(1) : phone;
    
    // Store OTP
    storeOTP(formattedNumber, otp);

    // Send OTP via MSG91
    const axios = getAxios();
    const response = await axios.post('https://api.msg91.com/api/v5/whatsapp', {
      template_id: process.env.MSG91_OTP_TEMPLATE_ID,
      short_url: "1",
      recipients: [{
        mobiles: formattedNumber,
        var1: otp
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': process.env.MSG91_AUTH_KEY
      }
    });

    console.log(`OTP sent to ${formattedNumber}: ${response.data.message}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error(`Failed to send OTP to ${phone}:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendWhatsAppOTP,
  verifyOTP,
  generateOTP
}; 