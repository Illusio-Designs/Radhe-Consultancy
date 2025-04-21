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
  'https://www.radheconsultancy.co.in'
];

// CRITICAL: Apply CORS before ANY other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('CORS Middleware: Request origin:', origin);
  console.log('CORS Middleware: Request method:', req.method);
  console.log('CORS Middleware: Request headers:', req.headers);
  
  // Allow requests with no origin (like mobile apps or curl requests)
  if (!origin) {
    console.log('CORS Middleware: No origin header, allowing request');
    return next();
  }
  
  // Check if the origin is allowed
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
    console.log('CORS Middleware: Origin allowed:', origin);
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    console.log('CORS Middleware: Origin not allowed:', origin);
    res.setHeader('Access-Control-Allow-Origin', 'https://radheconsultancy.co.in');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    console.log('CORS Middleware: Handling preflight request');
    return res.status(200).end();
  }
  next();
});

// Standard CORS middleware as backup
app.use(cors({
  origin: function(origin, callback) {
    console.log('CORS Backup Middleware: Checking origin:', origin);
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('CORS Backup Middleware: No origin, allowing request');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      console.log('CORS Backup Middleware: Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('CORS Backup Middleware: Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

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