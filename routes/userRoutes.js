// routes/user.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');


// Handle registration form submission
router.post('/register', UserController.register);

// User profile route
router.get('/profile', UserController.getProfile);



module.exports = router;


