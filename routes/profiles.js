// Assuming you have defined your routes in Express
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Import the User model

// Route to handle the profile page
router.get('/profile', async (req, res) => {
  try {
    // Retrieve the user data from the database based on the current user's ID
    const user = await User.findById(req.user._id);
    // Render the profiles.ejs template and pass the user data to it
    res.render('profiles', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
