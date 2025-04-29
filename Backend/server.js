const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/db');
const { initializeDatabase } = require('./scripts/serverSetup');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');

// Initialize Express app
const app = express();

// Basic configuration
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://radheconsultancy.co.in',
  'https://www.radheconsultancy.co.in',
  'https://api.radheconsultancy.co.in'
];

console.log('\n=== Server Configuration ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);
console.log('Allowed Origins:', allowedOrigins);
console.log('===========================\n');

// Handle broken pipe errors
process.on('uncaughtException', (err) => {
  console.error('\n=== Uncaught Exception ===');
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  console.error('========================\n');
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('\n=== CORS Origin Check ===');
    console.log('Request Origin:', origin);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Is Allowed Origin:', allowedOrigins.includes(origin));
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Decision: No origin, allowing request');
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      console.log('Decision: Development environment, allowing request');
      return callback(null, true);
    }

    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('Decision: Origin allowed in production');
      return callback(null, true);
    }

    console.log('Decision: Origin not allowed');
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Add CSP headers middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "img-src 'self' data: https: http: http://localhost:4000; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "connect-src 'self' https: http:;"
  );
  next();
});

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Debug logging middleware with error handling
app.use((req, res, next) => {
  try {
    console.log('\n=== Request Debug Log ===');
    console.log('Request Details:');
    console.log('- Method:', req.method);
    console.log('- Path:', req.path);
    console.log('- Origin:', req.headers.origin);
    console.log('- Headers:', JSON.stringify(req.headers, null, 2));
    console.log('- Query:', req.query);
    console.log('- Body:', req.body);
    console.log('- Environment:', process.env.NODE_ENV);
    
    // Set CORS headers for all responses
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      console.log('Setting CORS headers for origin:', origin);
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      console.log('Handling preflight request');
      res.status(204).end();
      return;
    }
    
    next();
  } catch (error) {
    console.error('\n=== Middleware Error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('======================\n');
    next(error);
  }
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
app.use('/api/admin-dashboard', adminDashboardRoutes);

// Non-prefixed routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/roles', require('./routes/roleRoutes'));
app.use('/companies', require('./routes/companyRoutes'));
app.use('/consumers', require('./routes/consumerRoutes'));

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
  console.error('==================\n');
  
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
      console.log('Allowed Origins:', allowedOrigins);
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