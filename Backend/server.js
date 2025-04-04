const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const { Role } = require('./models');
require('dotenv').config();

const app = express();

// Middleware
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Add your allowed origins here
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3000;

const defaultRoles = [
  { role_name: 'Admin' },
  { role_name: 'User' },
  { role_name: 'Vendor Manager' },
  { role_name: 'Insurance Manager' }
];

const seedRoles = async () => {
  try {
    console.log('Starting to seed roles...');
    
    // Create roles one by one
    for (const role of defaultRoles) {
      try {
        const [createdRole, created] = await Role.findOrCreate({
          where: { role_name: role.role_name },
          defaults: role
        });
        
        if (created) {
          console.log(`Created role: ${role.role_name}`);
        } else {
          console.log(`Role already exists: ${role.role_name}`);
        }
      } catch (error) {
        console.error(`Error creating role ${role.role_name}:`, error);
        throw error;
      }
    }

    // Verify roles were created
    const roles = await Role.findAll();
    console.log('Current roles in database:', roles.map(r => r.role_name));
    
    console.log('Default roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
};

const startServer = async () => {
  try {
    // Sync database
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');

    // Seed roles
    await seedRoles();

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer(); 