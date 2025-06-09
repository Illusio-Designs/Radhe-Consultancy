const axios = require('axios');

async function sendWhatsAppMessage(to, message) {
  try {
    // Format the phone number to include country code if not present
    const formattedNumber = to.startsWith('+') ? to.slice(1) : to;
    
    const response = await axios.post('https://api.msg91.com/api/v5/whatsapp', {
      template_id: process.env.MSG91_TEMPLATE_ID,
      short_url: "1",
      recipients: [{
        mobiles: formattedNumber,
        var1: message
      }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'authkey': process.env.MSG91_AUTH_KEY
      }
    });

    console.log(`WhatsApp message sent to ${formattedNumber}: ${response.data.message}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${to}:`, error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendWhatsAppMessage }; 