/**
 * Configuration Loader
 * This file handles loading the correct configuration based on the current environment
 */

require('dotenv').config();

// Determine environment
const isProduction = process.env.CURRENT_ENV === 'production';

// Helper function to get environment variable with fallback
const getEnvVar = (devKey, prodKey) => {
  const value = isProduction ? process.env[prodKey] : process.env[devKey];
  if (value === undefined) {
    console.warn(`Warning: Environment variable ${isProduction ? prodKey : devKey} is not set`);
  }
  return value;
};

const config = {
  // Server Configuration
  server: {
    port: getEnvVar('PORT', 'PROD_PORT') || 4000,
    nodeEnv: getEnvVar('NODE_ENV', 'PROD_NODE_ENV') || 'development',
    backendUrl: getEnvVar('BACKEND_URL', 'PROD_BACKEND_URL') || 'http://localhost:4000'
  },

  // Database Configuration
  database: {
    host: getEnvVar('DB_HOST', 'PROD_DB_HOST') || 'localhost',
    user: getEnvVar('DB_USER', 'PROD_DB_USER') || 'root',
    password: getEnvVar('DB_PASSWORD', 'PROD_DB_PASSWORD') || '',
    name: getEnvVar('DB_NAME', 'PROD_DB_NAME') || 'radhe_consultancy_crm',
    port: getEnvVar('DB_PORT', 'PROD_DB_PORT') || 3306,
    dialect: getEnvVar('DB_DIALECT', 'PROD_DB_DIALECT') || 'mysql'
  },

  // JWT Configuration
  jwt: {
    secret: getEnvVar('JWT_SECRET', 'PROD_JWT_SECRET') || 'default-secret-key',
    expiresIn: getEnvVar('JWT_EXPIRES_IN', 'PROD_JWT_EXPIRES_IN') || '24h'
  },

  // Google OAuth Configuration
  google: {
    clientId: getEnvVar('GOOGLE_CLIENT_ID', 'PROD_GOOGLE_CLIENT_ID'),
    clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET', 'PROD_GOOGLE_CLIENT_SECRET')
  },

  // File Upload Configuration
  upload: {
    path: getEnvVar('UPLOAD_PATH', 'PROD_UPLOAD_PATH') || 'uploads/profile-images',
    maxFileSize: getEnvVar('MAX_FILE_SIZE', 'PROD_MAX_FILE_SIZE') || 5242880
  },

  // Email Configuration
  email: {
    user: getEnvVar('EMAIL_USER', 'PROD_EMAIL_USER'),
    password: getEnvVar('EMAIL_PASSWORD', 'PROD_EMAIL_PASSWORD'),
    frontendUrl: getEnvVar('FRONTEND_URL', 'PROD_FRONTEND_URL') || 'http://localhost:3000'
  },

  // Admin Configuration
  admin: {
    email: getEnvVar('ADMIN_EMAIL', 'PROD_ADMIN_EMAIL') || 'Admin@radheconsultancy.co.in',
    password: getEnvVar('ADMIN_PASSWORD', 'PROD_ADMIN_PASSWORD') || 'Admin@123'
  }
};

// Validate required configuration
const validateConfig = () => {
  const requiredFields = [
    'server.port',
    'server.nodeEnv',
    'server.backendUrl',
    'database.host',
    'database.user',
    'database.name',
    'database.dialect',
    'jwt.secret',
    'jwt.expiresIn',
    'google.clientId',
    'google.clientSecret',
    'upload.path',
    'upload.maxFileSize',
    'email.user',
    'email.password',
    'email.frontendUrl',
    'admin.email',
    'admin.password'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], config);
    return value === undefined || value === null || value === '';
  });

  if (missingFields.length > 0) {
    console.warn(`Warning: Missing configuration fields: ${missingFields.join(', ')}`);
  }
};

// Validate configuration on load
validateConfig();

module.exports = config; 