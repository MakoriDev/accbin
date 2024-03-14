const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv'); // Import dotenv for environment variable loading

// Load environment variables from .env file
dotenv.config();

console.log('Starting application...');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Connecting to MySQL...');

// MySQL database connection
const pool = require('./database'); 

// Generate a secret key for the session
const secretKey = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'); // Use the environment variable or generate a random key

// Configure MySQL session store
const sessionStore = new MySQLStore({
    clearExpired: true, // Clear expired sessions automatically
    checkExpirationInterval: 900000, // How frequently expired sessions will be cleared (milliseconds)
    expiration: 86400000, // Session expiration in milliseconds (24 hours)
}, pool);

// Session middleware setup with MySQL store
app.use(session({
    key: 'secure-session',
    secret: secretKey,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Set to true as the application is served over HTTPS
        httpOnly: true, // Recommended to set httpOnly to true for added security
        maxAge: 24 * 60 * 60 * 1000, // Session expiration time (24 hours)
    },
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware for parsing request body and serving static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');

app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/listing', listingRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
