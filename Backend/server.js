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
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
  next();
});

// Middleware setup
const setupMiddleware = () => {
  // Enhanced CORS configuration
  app.use(cors({
    origin: function(origin, callback) {
      console.log('CORS check:', {
        origin,
        allowedOrigins,
        isAllowed: !origin || allowedOrigins.includes(origin)
      });

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        const error = new Error('Not allowed by CORS');
        console.error('CORS error:', {
          origin,
          allowedOrigins,
          error: error.message
        });
        callback(error);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));

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
};

// Route setup
const setupRoutes = () => {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/roles', require('./routes/roleRoutes'));
  app.use('/api/companies', require('./routes/companyRoutes'));
  app.use('/api/consumers', require('./routes/consumerRoutes'));

  // Enhanced health check endpoint
  app.get('/api/health', async (req, res) => {
    const startTime = Date.now();
    console.log('Health check request received:', {
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    try {
      // Check database connection
      console.log('Checking database connection...');
      await sequelize.authenticate();
      console.log('Database connection successful');

      // Check if database is initialized
      console.log('Checking database initialization...');
      const dbInitialized = await sequelize.query("SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' LIMIT 1");
      console.log('Database initialization check complete');

      const response = {
        status: 'UP',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          connected: true,
          initialized: dbInitialized[0].length > 0
        },
        responseTime: `${Date.now() - startTime}ms`
      };

      console.log('Health check successful:', response);
      res.json(response);
    } catch (error) {
      console.error('Health check failed:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        databaseConfig: {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          username: process.env.DB_USER
        }
      });

      res.status(503).json({
        status: 'DOWN',
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          type: error.name
        },
        database: {
          connected: false,
          error: error.message
        }
      });
    }
  });
};

// Error handling
const setupErrorHandling = () => {
  app.use((err, req, res, next) => {
    console.error('Server error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    // Handle CORS errors specifically
    if (err.message === 'Not allowed by CORS') {
      res.status(403).json({
        error: 'CORS Error',
        message: 'Request not allowed from this origin',
        allowedOrigins
      });
      return;
    }

    res.status(err.status || 500).json({
      error: err.message || 'Internal Server Error'
    });
  });
};

// Server startup
const startServer = async () => {
  try {
    console.log('Starting server initialization...', {
      port: PORT,
      environment: process.env.NODE_ENV,
      allowedOrigins
    });
    
    // Setup middleware
    setupMiddleware();
    
    // Setup routes
    setupRoutes();
    
    // Setup error handling
    setupErrorHandling();

    // Initialize database with retry logic
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