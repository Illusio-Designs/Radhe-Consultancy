const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust the path as necessary

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists in the database
        let user = await User.findOne({ where: { email: profile.emails[0].value } });
        
        if (!user) {
            // If not, create a new user
            user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                password: null, // No password for Google login
                imageUrl: profile.photos[0].value, // Store the Google profile image URL
                googleId: profile.id, // Store the Google ID
                role: 'consumer', // Default role for Google users
            });
        } else {
            // If the user exists, update the Google ID if it's not already set
            if (!user.googleId) {
                user.googleId = profile.id;
                await user.save();
            }
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findByPk(id);
    done(null, user);
});
