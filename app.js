const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env file
require('dotenv').config();

console.log('Starting application...');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Connecting to MySQL...');

// Dummy database connection (Replace with your own database logic)
const pool = require('./database'); 

const secretKey = crypto.randomBytes(32).toString('hex');

// Session middleware setup
app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if using HTTPS
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware for parsing request body and serving static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');

app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/listing', listingRoutes);

// Example route to demonstrate error handling
app.get('/demo-error', (req, res) => {
    const errorMessage = "This is a demo error message!";
    res.render('your-ejs-file', { error: errorMessage });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
