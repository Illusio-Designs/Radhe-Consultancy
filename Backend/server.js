const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/db');
const { corsOptions } = require('./config/cors');
const { initializeDatabase } = require('./scripts/serverSetup');
const helmet = require('helmet');
const morgan = require('morgan');

// Initialize Express app
const app = express();

// Basic configuration
const PORT = process.env.PORT || 4000;
const isDevelopment = process.env.NODE_ENV.toLowerCase() === 'development';

// Trust proxy for LiteSpeed
app.set('trust proxy', true);

console.log('\n=== Server Configuration ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Is Development:', isDevelopment);
console.log('Trust Proxy:', app.get('trust proxy'));
console.log('===========================\n');

// Enable CORS with proper error handling
app.use((req, res, next) => {
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.error('CORS Error:', err);
      res.status(403).json({
        error: 'CORS Error',
        message: err.message
      });
      return;
    }
    next();
  });
});

// Explicit preflight handling for all routes
app.options('*', cors(corsOptions));

// Security middleware with CORS-friendly settings
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.radheconsultancy.co.in"]
    }
  }
}));

// Logging middleware
app.use(morgan('dev'));

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n=== Request Details ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Protocol:', req.protocol);
  console.log('Host:', req.hostname);
  console.log('Headers:', req.headers);
  next();
});

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    console.log('\n=== Response Details ===');
    console.log('Time:', new Date().toISOString());
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.getHeaders());
    console.log('Body:', body);
    return originalSend.call(this, body);
  };
  next();
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add dedicated route for profile images
app.use('/profile-images', express.static(path.join(__dirname, 'uploads/profile_images')));

// Handle favicon.ico with proper CORS headers
app.get('/favicon.ico', (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Return 204 No Content
  res.status(204).end();
});

// Health check endpoint with comprehensive status
app.get(['/api/health', '/health'], async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Check database connection
    let dbStatus = 'UP';
    try {
      await sequelize.authenticate();
    } catch (error) {
      dbStatus = 'DOWN';
      console.error('Database connection error:', error);
    }

    // Get system information
    const healthInfo = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      uptime: process.uptime(),
      services: {
        database: dbStatus,
        api: 'UP'
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      endpoints: {
        api: 'https://api.radheconsultancy.co.in',
        frontend: 'https://radheconsultancy.co.in'
      }
    };

    res.status(200).json(healthInfo);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'DOWN',
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// API Routes with /api prefix
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/consumers', require('./routes/consumerRoutes'));
app.use('/api/admin-dashboard', require('./routes/adminDashboardRoutes'));
app.use('/api/employee-compensation', require('./routes/employeeCompensationRoutes'));
app.use('/api/insurance-companies', require('./routes/insuranceCompanyRoutes'));

// Basic test endpoint
app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    protocol: req.protocol,
    host: req.hostname
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n=== Error Handler ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('Request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  
  // Set CORS headers even for error responses
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('\n=== Starting Server ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Port:', PORT);
    console.log('Database Config:', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      port: process.env.DB_PORT,
      dialect: process.env.DB_DIALECT
    });
    
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established');
    
    await initializeDatabase();
    console.log('Database initialized');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\nServer is running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Server URL:', `http://localhost:${PORT}`);
      console.log('Public URL:', 'https://api.radheconsultancy.co.in');
      console.log('========================\n');
    });
  } catch (error) {
    console.error('\n=== Server Startup Error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('Environment Variables:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PORT: process.env.DB_PORT,
      DB_DIALECT: process.env.DB_DIALECT
    });
    console.error('==========================\n');
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('\n=== Uncaught Exception ===');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  console.error('==========================\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n=== Unhandled Rejection ===');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  console.error('==========================\n');
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };