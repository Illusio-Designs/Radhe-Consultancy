const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/db');
const helmet = require('helmet');
const morgan = require('morgan');
const { setupRolesAndPermissions, setupAdminUser } = require('./scripts/serverSetup');
const { corsOptions, allowedOrigins, securityHeadersMiddleware } = require('./config/cors');
const { registerRoutes } = require('./routes');
const config = require('./config/config');

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helmet configuration with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "https://accounts.google.com", "http://localhost:4000", "https://radheconsultancy.co.in"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com", "https://cdn.lineicons.com", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      connectSrc: ["'self'", "https://accounts.google.com", "http://localhost:4000", "https://radheconsultancy.co.in", "wss://radheconsultancy.co.in"],
      frameSrc: ["'self'", "https://accounts.google.com", "https://www.google.com"],
      imgSrc: ["'self'", "data:", "https://accounts.google.com", "https://*.google.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://cdn.lineicons.com", "https://cdn.jsdelivr.net"],
      workerSrc: ["'self'", "blob:"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply security headers middleware
app.use(securityHeadersMiddleware);

// CORS configuration
app.use(cors(corsOptions));

// Static files setup
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get(['/api/health', '/health'], async (req, res) => {
  // Set CORS headers explicitly for health check
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const dbStatus = await sequelize.authenticate()
      .then(() => 'UP')
      .catch(() => 'DOWN');

    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      uptime: process.uptime(),
      services: { database: dbStatus, api: 'UP' }
    });
  } catch (error) {
    res.status(500).json({
      status: 'DOWN',
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Handle OPTIONS request for health check
app.options(['/api/health', '/health'], (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.sendStatus(204);
});

// Register routes
registerRoutes(app);

// Root endpoint
app.get('/', (req, res) => {
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
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(config.server.nodeEnv === 'development' && { stack: err.stack })
    }
  });
});

// Start server
const startServer = async () => {
  try {
    const port = config.server.port;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${config.server.nodeEnv}`);
      console.log(`Backend URL: ${config.server.backendUrl}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle process termination
const signals = ['SIGTERM', 'SIGINT'];
signals.forEach(signal => {
  process.on(signal, () => {
    console.log(`Received ${signal}. Starting graceful shutdown...`);
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = { app, startServer };