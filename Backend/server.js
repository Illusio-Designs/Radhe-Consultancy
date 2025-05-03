const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/db');
const { corsOptions } = require('./config/cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Initialize Express app
const app = express();

// Basic configuration
const PORT = process.env.PORT || 4000;
const isDevelopment = process.env.NODE_ENV.toLowerCase() === 'development';

// Trust proxy for LiteSpeed
app.set('trust proxy', true);

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
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(204).end();
});

// Health check endpoint
app.get(['/api/health', '/health'], async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    let dbStatus = 'UP';
    try {
      await sequelize.authenticate();
    } catch (error) {
      dbStatus = 'DOWN';
      console.error('Database connection error:', error);
    }

    const healthInfo = {
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      uptime: process.uptime(),
      services: {
        database: dbStatus,
        api: 'UP'
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
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
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
    console.log('Starting server...');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Port: ${PORT}`);
    
    await sequelize.authenticate();
    console.log('Database connection established');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };