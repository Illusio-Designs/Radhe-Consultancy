require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running!');
});
