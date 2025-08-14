# 🔄 Renewal Management System

## Overview
The Renewal Management System automates the process of sending renewal reminders for various insurance policies and services. It provides admin-configurable reminder timelines, professional email templates, and comprehensive logging.

## 🚀 Quick Start

### 1. Setup Database Structure
```bash
npm run setup:renewal
```

### 2. Test the System
```bash
npm run test:renewal
```

### 3. Send Renewal Reminders
```bash
npm run send:reminders
```

## 📋 Features

### ✅ **Admin-Configurable Settings**
- **Reminder Timelines**: Configurable days before expiry (30, 15, 7, 3, 1 days)
- **Reminder Types**: Email, SMS, WhatsApp support
- **Auto-Renewal**: Enable/disable for each service type
- **Service Types**: Vehicle, Health, Fire, ECP, DSC, Factory License

### ✅ **Professional Email System**
- HTML email templates with inline CSS
- Professional branding (RADHE ADVISORY)
- Spam prevention headers
- Delivery status tracking

### ✅ **Comprehensive Logging**
- Client information tracking
- Reminder delivery status
- Error handling and reporting
- Performance analytics

## 🏗️ System Architecture

### **Models**
- `RenewalConfig`: Configuration for each service type
- `ReminderLog`: Comprehensive reminder history
- `VehiclePolicy`: Vehicle insurance policies

### **Services**
- `RenewalService`: Core renewal logic
- `EmailService`: Email sending and templates

### **Controllers**
- `renewalConfigController`: CRUD operations for configurations
- API endpoints for system management

## 📧 Email Configuration

### **Environment Variables**
```env
RENEWAL_EMAIL_HOST=mail.radheconsultancy.co.in
RENEWAL_EMAIL_PORT=465
RENEWAL_EMAIL_USER=radhe@radheconsultancy.co.in
RENEWAL_EMAIL_PASSWORD=your_password
RENEWAL_EMAIL_FROM=RADHE ADVISORY <radhe@radheconsultancy.co.in>
RENEWAL_EMAIL_REPLY_TO=radhe@radheconsultancy.co.in
RENEWAL_EMAIL_SUBJECT_PREFIX=[RADHE ADVISORY]
```

### **Test Email Addresses**
- `info@illusiodesigns.agency`
- `radheconsultancy17@yahoo.com`
- `illusiodesigns@gmail.com`

## 🔧 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Setup Renewal** | `npm run setup:renewal` | Setup database structure for renewal system |
| **Test System** | `npm run test:renewal` | Quick test of renewal system components |
| **Send Reminders** | `npm run send:reminders` | Process and send renewal reminders |
| **Full Setup** | `npm run setup` | Complete server setup including renewal system |

## 📊 Database Schema

### **ReminderLogs Table**
```sql
CREATE TABLE ReminderLogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  policy_id INT NOT NULL,
  policy_type VARCHAR(50) NOT NULL,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  reminder_type ENUM('email', 'sms', 'whatsapp') DEFAULT 'email',
  reminder_day INT NOT NULL DEFAULT 0,
  expiry_date DATETIME,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('sent', 'delivered', 'failed', 'opened', 'clicked') DEFAULT 'sent',
  email_subject VARCHAR(500),
  response_data JSON,
  error_message TEXT,
  days_until_expiry INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_policy (policy_id, policy_type),
  INDEX idx_sent_at (sent_at),
  INDEX idx_status (status),
  INDEX idx_reminder_type (reminder_type)
);
```

## 🎯 Usage Examples

### **Send Test Emails**
```javascript
const EmailService = require('./services/emailService');
const emailService = new EmailService();

// Send test emails to configured addresses
const result = await emailService.sendTestEmails();
```

### **Process Vehicle Insurance Renewals**
```javascript
const RenewalService = require('./services/renewalService');
const renewalService = new RenewalService();

// Process all vehicle insurance renewals
const result = await renewalService.processVehicleInsuranceRenewals();
```

### **Get Renewal Dashboard**
```javascript
const dashboard = await renewalService.getRenewalDashboard();
console.log('Total Policies:', dashboard.data.totalPolicies);
console.log('Expiring Soon:', dashboard.data.expiringSoon);
```

## 🔍 Monitoring & Logs

### **Log Locations**
- **Console**: Real-time system logs
- **Database**: ReminderLogs table for history
- **Email**: Delivery confirmations and errors

### **Key Metrics**
- Total policies in system
- Policies expiring soon
- Recent reminders sent
- Email delivery success rate

## 🚨 Troubleshooting

### **Common Issues**

1. **Email Not Sending**
   - Check environment variables
   - Verify SMTP credentials
   - Check firewall/port settings

2. **Database Connection Issues**
   - Verify database credentials
   - Check network connectivity
   - Ensure database is running

3. **Reminder Not Logging**
   - Check ReminderLogs table structure
   - Verify model associations
   - Check for JavaScript errors

### **Debug Commands**
```bash
# Test email connection
npm run test:renewal

# Check database structure
npm run setup:renewal

# View system logs
npm run send:reminders
```

## 🔄 Future Enhancements

- **SMS Integration**: Twilio/MessageBird integration
- **WhatsApp Business API**: Direct WhatsApp messaging
- **Advanced Analytics**: Detailed reporting dashboard
- **Bulk Operations**: Mass reminder processing
- **Template Management**: Dynamic email template editor

## 📞 Support

For technical support or questions about the Renewal Management System, contact the development team or refer to the system logs for detailed error information.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
