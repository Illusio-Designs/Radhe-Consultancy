require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const db = require('./config/database');
const userRoutes = require('./routes/userRoutes'); // Adjust the path as necessary
require('./config/passport'); // Adjust the path as necessary

const app = express(); // Create the Express app instance

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Google Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect home or to a dashboard
        res.redirect('/dashboard');
    }
);

// User routes
app.use('/api/users', userRoutes); // Adjust the path as necessary

// Sync database
db.sync()
    .then(() => {
        console.log('Database & tables created!');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });

// Basic route
app.get('/', (req, res) => {
    res.send('Server is running!');
});
