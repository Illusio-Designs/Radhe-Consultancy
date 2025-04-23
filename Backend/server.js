const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/db');
const { initializeDatabase } = require('./scripts/serverSetup');

// Handle broken pipe errors gracefully
process.on('EPIPE', (err) => {
  console.error('EPIPE error (broken pipe):', err.message);
});

process.on('uncaughtException', (err) => {
  if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
    console.error('Caught connection error:', err.message);
    return;
  }
  console.error('Uncaught exception:', err);
  process.exit(1);
});

const app = express();

// Define allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://radheconsultancy.co.in',
  'https://www.radheconsultancy.co.in',
  'https://api.radheconsultancy.co.in',
  'http://localhost:5000'  // Add local backend port
];

// CRITICAL: Apply CORS before ANY other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('\n=== CORS Debug Log ===');
  console.log('Request Details:');
  console.log('- Origin:', origin);
  console.log('- Method:', req.method);
  console.log('- Path:', req.path);
  console.log('- Headers:', JSON.stringify(req.headers, null, 2));
  console.log('- Allowed Origins:', allowedOrigins);
  console.log('- Environment:', process.env.NODE_ENV);
  
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) {
    console.log('CORS Decision: No origin header, allowing request');
    return next();
  }
  
  // In development, allow all origins
  if (process.env.NODE_ENV !== 'production') {
    console.log('CORS Decision: Development environment, allowing all origins');
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('CORS Decision: Origin allowed in production:', origin);
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      console.log('CORS Decision: Origin not allowed in production:', origin);
      res.setHeader('Access-Control-Allow-Origin', 'https://radheconsultancy.co.in');
    }
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  console.log('Set CORS Headers:');
  console.log('- Access-Control-Allow-Origin:', res.getHeader('Access-Control-Allow-Origin'));
  console.log('- Access-Control-Allow-Methods:', res.getHeader('Access-Control-Allow-Methods'));
  console.log('- Access-Control-Allow-Headers:', res.getHeader('Access-Control-Allow-Headers'));
  console.log('- Access-Control-Allow-Credentials:', res.getHeader('Access-Control-Allow-Credentials'));
  
  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    console.log('CORS Decision: Handling preflight request');
    console.log('=== End CORS Debug Log ===\n');
    return res.status(200).end();
  }
  
  console.log('=== End CORS Debug Log ===\n');
  next();
});

// Other middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - no need to set CORS headers again as they're already set correctly
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/consumers', require('./routes/consumerRoutes'));

// Also set up non-prefixed routes
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));
app.use('/roles', require('./routes/roleRoutes'));
app.use('/companies', require('./routes/companyRoutes'));
app.use('/consumers', require('./routes/consumerRoutes'));

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  console.log('Health check requested1');
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled for specific origins'
  });
});

// Add error handling middleware for CORS errors
app.use((err, req, res, next) => {
  if (err.name === 'CORS') {
    console.error('\n=== CORS Error Debug Log ===');
    console.error('CORS Error:', err.message);
    console.error('Request Origin:', req.headers.origin);
    console.error('Request Method:', req.method);
    console.error('Request Headers:', req.headers);
    console.error('Environment:', process.env.NODE_ENV);
    console.log('=== End CORS Error Debug Log ===\n');
    
    return res.status(403).json({
      success: false,
      error: 'CORS Error: ' + err.message,
      environment: process.env.NODE_ENV,
      origin: req.headers.origin
    });
  }
  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  // No need to set CORS headers again here as they're already set by the CORS middleware
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (res.headersSent) {
    console.error('Headers already sent, cannot send error response');
    return next(err);
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Something went wrong!',
    stack: isDevelopment ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
});

// Start the server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate({ 
      retry: {
        max: 5,
        timeout: 10000
      }
    });
    console.log('Database connection has been established successfully.');
    
    const initialized = await initializeDatabase();
    if (!initialized) {
      throw new Error('Failed to initialize database');
    }
        
    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`CORS is enabled for specific origins: ${allowedOrigins.join(', ')}`);
    });
    
    server.on('error', (err) => {
      console.error('Server error:', err);
    });
    
    server.timeout = 120000;
    server.keepAliveTimeout = 60000;
    
    return server;
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  try {
    await sequelize.close();
    console.log('Database connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  try {
    await sequelize.close();
    console.log('Database connections closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };