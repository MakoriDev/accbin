const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const secretKey = crypto.randomBytes(32).toString('hex');

// Load environment variables from .env file
require('dotenv').config();

console.log('Starting application...');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Connecting to MongoDB...');
console.log(`Connection string: ${process.env.MONGODB_URI}`);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('strictQuery', false);

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => console.log('Connected to MongoDB'));

// Session middleware setup
app.use(session({
  secret: secretKey, // Use the secretKey variable instead of a hardcoded string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // set to true if using HTTPS
}));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const listingRoutes = require('./routes/listingRoutes');

app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/listing', listingRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
