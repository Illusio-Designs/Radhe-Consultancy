const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/db');
const helmet = require('helmet');
const morgan = require('morgan');
const { User, Role, Permission, RolePermission } = require('./models');
const bcrypt = require('bcryptjs');

// Initialize Express app
const app = express();

// Basic configuration
const PORT = process.env.PORT || 4000;
const isDevelopment = process.env.NODE_ENV.toLowerCase() === 'development';

// Role setup configuration
const roles = [
  { role_name: 'Admin', description: 'Full system access' },
  { role_name: 'User', description: 'Basic user access' },
  { role_name: 'Vendor_manager', description: 'Vendor management access' },
  { role_name: 'User_manager', description: 'User management access' },
  { role_name: 'Company', description: 'Company access' },
  { role_name: 'Consumer', description: 'Consumer access' },
  { role_name: 'Insurance_manager', description: 'Insurance management access' },
  { role_name: 'Compliance_manager', description: 'Compliance management access' },
  { role_name: 'DSC_manager', description: 'Digital Signature Certificate management access' }
];

const permissions = [
  // User Management
  { permission_name: 'view_users' },
  { permission_name: 'create_user' },
  { permission_name: 'edit_user' },
  { permission_name: 'delete_user' },
  // Company Management
  { permission_name: 'view_companies' },
  { permission_name: 'create_company' },
  { permission_name: 'edit_company' },
  { permission_name: 'delete_company' },
  { permission_name: 'upload_company_documents' },
  // Consumer Management
  { permission_name: 'view_consumers' },
  { permission_name: 'create_consumer' },
  { permission_name: 'edit_consumer' },
  { permission_name: 'delete_consumer' },
  // Role Management
  { permission_name: 'view_roles' },
  { permission_name: 'assign_roles' },
  // System Access
  { permission_name: 'access_dashboard' },
  { permission_name: 'access_reports' },
  { permission_name: 'access_settings' },
  // Insurance Management
  { permission_name: 'view_insurance_companies' },
  { permission_name: 'create_insurance_company' },
  { permission_name: 'edit_insurance_company' },
  { permission_name: 'delete_insurance_company' },
  { permission_name: 'view_policies' },
  { permission_name: 'create_policy' },
  { permission_name: 'edit_policy' },
  { permission_name: 'delete_policy' }
];

const rolePermissions = {
  'Admin': permissions.map(p => p.permission_name),
  'User': [ 'access_dashboard' ],
  'Vendor_manager': [
    'view_companies', 'create_company', 'edit_company', 'delete_company',
    'view_consumers', 'create_consumer', 'edit_consumer', 'delete_consumer',
    'access_dashboard', 'access_reports', 'upload_company_documents'
  ],
  'User_manager': [
    'view_users', 'create_user', 'edit_user', 'delete_user',
    'view_roles', 'assign_roles', 'access_dashboard'
  ],
  'Company': [
    'access_dashboard',
    'view_companies', 'edit_company',
    'upload_company_documents'
  ],
  'Consumer': [
    'access_dashboard',
    'view_consumers', 'edit_consumer'
  ],
  'Insurance_manager': [
    'access_dashboard',
    'view_insurance_companies',
    'create_insurance_company',
    'edit_insurance_company',
    'delete_insurance_company',
    'view_policies',
    'create_policy',
    'edit_policy',
    'delete_policy',
    'access_reports'
  ],
  'Compliance_manager': [
    'access_dashboard',
    'view_companies',
    'view_consumers',
    'view_insurance_companies',
    'view_policies',
    'access_reports'
  ],
  'DSC_manager': [
    'access_dashboard',
    'view_users',
    'edit_user',
    'access_reports'
  ]
};

// Role setup function
async function setupRolesAndPermissions() {
  try {
    console.log('Setting up roles and permissions...');
    
    // Update existing roles to capitalized format
    const existingRoles = await Role.findAll();
    for (const role of existingRoles) {
      const capitalizedRole = role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1);
      if (capitalizedRole !== role.role_name) {
        await role.update({ role_name: capitalizedRole });
        console.log(`Updated role name from ${role.role_name} to ${capitalizedRole}`);
      }
    }
    
    // Create roles
    for (const role of roles) {
      await Role.findOrCreate({ where: { role_name: role.role_name }, defaults: role });
    }
    console.log('Roles setup completed');

    // Create permissions
    for (const permission of permissions) {
      await Permission.findOrCreate({ 
        where: { permission_name: permission.permission_name }, 
        defaults: permission 
      });
    }
    console.log('Permissions setup completed');

    // Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
      const role = await Role.findOne({ where: { role_name: roleName } });
      const perms = await Permission.findAll({ where: { permission_name: permissionNames } });
      
      for (const perm of perms) {
        await RolePermission.findOrCreate({ 
          where: { role_id: role.id, permission_id: perm.id } 
        });
      }
    }
    console.log('Role-permission assignments completed');

    // Setup admin user
    const adminRole = await Role.findOne({ where: { role_name: 'Admin' } });
    if (adminRole) {
      const [adminUser, created] = await User.findOrCreate({
        where: { email: 'Admin@radheconsultancy.co.in' },
        defaults: {
          username: 'Admin',
          password: 'Admin@123',
          role_id: adminRole.id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      if (!created) {
        await adminUser.update({
          password: 'Admin@123',
          role_id: adminRole.id,
          updated_at: new Date()
        });
      }
      console.log('Admin user setup completed');
    }
  } catch (error) {
    console.error('Error setting up roles and permissions:', error);
  }
}

// Enable CORS for your frontend
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Optional: Add manual CORS headers (for custom setups)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// Trust proxy for LiteSpeed
app.set('trust proxy', true);

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
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync database models
    console.log('Syncing database models...');
    try {
      await sequelize.sync({ alter: true });
      console.log('Database models synced successfully');
    } catch (syncError) {
      console.error('Error syncing database models:', syncError);
      throw syncError;
    }

    // Setup roles and permissions
    try {
      await setupRolesAndPermissions();
      console.log('Roles and permissions setup completed');
    } catch (setupError) {
      console.error('Error setting up roles and permissions:', setupError);
      throw setupError;
    }
    
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