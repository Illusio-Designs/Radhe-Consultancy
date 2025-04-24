const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/db');
const { initializeDatabase } = require('./scripts/serverSetup');

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

// Debug logging middleware
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

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
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

// Server startup
const startServer = async () => {
  try {
    console.log('Starting server initialization...', {
      port: PORT,
      environment: process.env.NODE_ENV,
      allowedOrigins
    });

    // Initialize database
    console.log('Connecting to database...', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER
    });

    let retries = 3;
    while (retries > 0) {
      try {
        await sequelize.authenticate();
        await initializeDatabase();
        console.log('Database connected successfully');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`Database connection failed, retrying... (${retries} attempts left)`, {
          error: error.message,
          stack: error.stack
        });
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
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