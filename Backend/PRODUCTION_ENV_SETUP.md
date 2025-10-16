# 🚀 Production Environment Setup Guide

## 📧 Gmail SMTP Configuration for Production

### Issue
Production server shows: `Error: Invalid login: 535-5.7.8 Username and Password not accepted`

### Solution
You need to update your **production `.env` file** on the server with the correct Gmail credentials.

---

## ✅ Production `.env` Configuration

### **Step 1: SSH into Production Server**
```bash
ssh your-username@your-production-server
cd /path/to/Backend1
```

### **Step 2: Edit Production `.env` File**
```bash
nano .env
# or
vim .env
```

### **Step 3: Add/Update These Variables**

```env
# ============================================
# GMAIL SMTP CONFIGURATION (PRODUCTION)
# ============================================
USE_GMAIL_SMTP=true
GMAIL_SMTP_HOST=smtp.gmail.com
GMAIL_SMTP_PORT=587
GMAIL_SMTP_USER=illusiodesigns@gmail.com
GMAIL_SMTP_PASSWORD=jqvzuolsbggbtemv
GMAIL_SMTP_FROM=illusiodesigns@gmail.com

# ============================================
# RENEWAL SYSTEM CONFIGURATION
# ============================================
RENEWAL_EMAIL_SUBJECT_PREFIX=[RADHE ADVISORY]
RENEWAL_CRON_SCHEDULE=0 9 * * *

# ============================================
# DATABASE CONFIGURATION (YOUR PRODUCTION DB)
# ============================================
DB_HOST=localhost
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=your_production_db_name
DB_PORT=3306
DB_DIALECT=mysql
```

---

## 🔐 Gmail App Password Setup

If the current password doesn't work, you may need to create a new **App Password**:

### **1. Enable 2-Step Verification**
- Go to: https://myaccount.google.com/security
- Enable 2-Step Verification

### **2. Generate App Password**
- Go to: https://myaccount.google.com/apppasswords
- Select "Mail" and "Other (Custom name)"
- Enter name: "Radhe Consultancy Production"
- Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
- Use this as `GMAIL_SMTP_PASSWORD` (without spaces)

---

## 🧪 Testing Production Email

### **Method 1: Via API (Postman)**
```
POST https://your-domain.com/api/renewals/trigger
Authorization: Bearer YOUR_TOKEN
```

### **Method 2: Via Server Command**
```bash
ssh your-username@your-production-server
cd /path/to/Backend1
node scripts/sendRenewalReminders.js
```

### **Method 3: Check Cron Logs**
```bash
# View renewal logs
tail -f /var/log/renewal-reminders.log

# Or check PM2 logs if using PM2
pm2 logs
```

---

## ✅ Verification Checklist

- [ ] `.env` file has correct Gmail credentials
- [ ] `USE_GMAIL_SMTP=true` is set
- [ ] Gmail App Password is valid (no spaces)
- [ ] Production server can reach `smtp.gmail.com:587`
- [ ] Firewall allows outbound SMTP connections
- [ ] Test email sent successfully

---

## 🔥 Quick Test Command

After updating `.env`, restart your server and run:

```bash
# Restart server (if using PM2)
pm2 restart all

# Test email sending
node scripts/sendRenewalReminders.js
```

---

## 📌 Important Notes

1. **Never commit `.env` to Git** - It contains sensitive credentials
2. **Use the same Gmail account** for both local and production
3. **Check spam folder** if test emails don't arrive
4. **Verify database connection** before testing emails

---

## 🆘 Troubleshooting

### Error: "Connection timeout"
- Check firewall: `telnet smtp.gmail.com 587`
- Verify server can make outbound connections

### Error: "Username and Password not accepted"
- Regenerate Gmail App Password
- Remove all spaces from password in `.env`
- Ensure 2-Step Verification is enabled

### Error: "Database connection refused"
- Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Check MySQL service: `systemctl status mysql`

---

## 📞 Contact

If issues persist, check:
1. Gmail account security settings
2. Server firewall rules
3. MySQL database accessibility

