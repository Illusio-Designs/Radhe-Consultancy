const express = require('express');
const cors = require('cors');
const path = require('path');
const initializeDatabase = require('./scripts/dbInit');
require('dotenv').config();

const app = express();

// Serve static files from the public directory
app.use(express.static('public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    }
  }
}));

// Middleware
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'], // Add your allowed origins here
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Temporarily remove COOP for testing
app.use((req, res, next) => {
  // res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); // Commented out for testing
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve uploaded files
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

// Start server
initializeDatabase()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });