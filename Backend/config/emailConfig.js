module.exports = {
  // Email Configuration for RADHE CONSULTANCY
  email: {
    host: process.env.RENEWAL_EMAIL_HOST || process.env.SMTP_HOST || 'mail.radheconsultancy.co.in',
    port: process.env.RENEWAL_EMAIL_PORT ? parseInt(process.env.RENEWAL_EMAIL_PORT) : (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465),
    secure: process.env.RENEWAL_EMAIL_PORT === '465' || process.env.SMTP_PORT === '465', // Use SSL/TLS for port 465
    auth: {
      user: process.env.RENEWAL_EMAIL_USER || process.env.EMAIL_USER || 'radhe@radheconsultancy.co.in',
      pass: process.env.RENEWAL_EMAIL_PASSWORD || process.env.EMAIL_PASSWORD
    },
    // Additional options for cPanel email servers
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    },
    // Try different authentication methods
    authMethod: 'PLAIN' // or 'LOGIN', 'CRAM-MD5'
  },
  
  // Email Templates
  templates: {
    from: process.env.RENEWAL_EMAIL_FROM || process.env.EMAIL_FROM || 'RADHE ADVISORY <radhe@radheconsultancy.co.in>',
    replyTo: process.env.RENEWAL_EMAIL_REPLY_TO || 'radhe@radheconsultancy.co.in',
    subjectPrefix: process.env.RENEWAL_EMAIL_SUBJECT_PREFIX || '[RADHE ADVISORY] '
  },
  
  // Renewal Reminder Templates
  renewalReminders: {
    vehicleInsurance: {
      subject: 'Vehicle Insurance Renewal Reminder',
      template: 'vehicleInsuranceRenewal'
    }
  }
};
