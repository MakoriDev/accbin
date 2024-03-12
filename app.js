const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env file
require('dotenv').config();

console.log('Starting application...');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Connecting to MySQL...');

// MySQL database connection
const pool = require('./database'); 

// Generate a secret key for the session
const secretKey = crypto.randomBytes(32).toString('hex');



// Configure MySQL session store
const sessionStore = new MySQLStore({}, pool);

// Session middleware setup with MySQL store
// Session middleware setup with MySQL store
app.use(session({
  key: 'secure session',
  secret: process.env.SESSION_SECRET || 'default_secret_key', // Use the environment variable
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // Set to true as the application is served over HTTPS
    httpOnly: true // Recommended to set httpOnly to true for added security
  }
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

// Example route for error handling demonstration
app.get('/demo-error', (req, res) => {
  const errorMessage = "This is a demo error message!";
  res.render('your-ejs-file', { error: errorMessage });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
