const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Import the User model

// Assuming you have set up your database configuration
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

const userModel = new User(dbConfig);

// Route to handle the profile page
router.get('/profile', async (req, res) => {
    try {
        if (!req.session || !req.session.userId) {
            return res.status(401).send('Unauthorized');
        }

        // Retrieve the user data from the database based on the current user's ID
        const user = await userModel.findUserById(req.session.userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render the profiles.ejs template and pass the user data to it
        res.render('profiles', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
