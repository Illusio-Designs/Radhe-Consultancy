const express = require('express');
const cors = require('cors');
const path = require('path');
const initializeDatabase = require('./scripts/dbInitSync'); // Ensure this path is correct
require('dotenv').config();
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabase(); // Initialize the database
});