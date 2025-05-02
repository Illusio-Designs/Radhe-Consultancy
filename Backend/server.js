const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/db');
const { initializeDatabase } = require('./scripts/serverSetup');
const helmet = require('helmet');
const morgan = require('morgan');

// Initialize Express app
const app = express();

// Basic configuration
const PORT = process.env.PORT || 4000;
const isDevelopment = process.env.NODE_ENV !== 'production';

console.log('\n=== Server Configuration ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);
console.log('Is Development:', isDevelopment);
console.log('===========================\n');

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:5173',
  'https://radheconsultancy.co.in',
  'https://www.radheconsultancy.co.in',
  'https://api.radheconsultancy.co.in'
];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('\n=== CORS Origin Check ===');
    console.log('Request Origin:', origin);
    console.log('Is Development:', isDevelopment);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin - allowing request');
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (isDevelopment) {
      console.log('Development mode - allowing all origins');
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('Origin allowed:', origin);
      return callback(null, true);
    }
    
    console.log('Origin not allowed:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Enable CORS
app.use(cors(corsOptions));

// Explicit preflight handling for all routes
app.options('*', cors(corsOptions));

// Security middleware with CORS-friendly settings
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false
}));

// Logging middleware
app.use(morgan('dev'));

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n=== Request Details ===');
  console.log('Time:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
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

// Handle favicon.ico
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// API Routes with /api prefix
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/consumers', require('./routes/consumerRoutes'));
app.use('/api/admin-dashboard', require('./routes/adminDashboardRoutes'));

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled for specific origins'
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
    console.log('Connecting to database...');
    
    await sequelize.authenticate();
    console.log('Database connection established');
    
    await initializeDatabase();
    console.log('Database initialized');
    
    app.listen(PORT, () => {
      console.log(`\nServer is running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
      console.log('Allowed Origins:', corsOptions.origin);
      console.log('========================\n');
    });
  } catch (error) {
    console.error('\n=== Server Startup Error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('==========================\n');
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');
  try {
    await sequelize.close();
    console.log('Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error.message);
    process.exit(1);
  }
});

// Start the server if this file is run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };