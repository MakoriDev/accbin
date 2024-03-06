const User = require('../models/user');
const pool = require('../database.js');

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

const userModel = new User(pool);

const UserController = {
    register: async (req, res) => {
        try {
            const userExists = await userModel.userExists(req.body.username, req.body.email);

            if (userExists) {
                // User exists, send back an error message
                return res.status(400).render('register', { 
                    error: 'Username or Email already exists', 
                    formData: req.body // Optional: include already filled form data
                });
            }

            // If the username and email don't exist, create the user
            const userId = await userModel.createUser(req.body);
            req.session.userId = userId;
            res.redirect('/user/profile');
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                // Extract the field name from the error message
                const field = error.sqlMessage.match(/key 'users\.(.+)_UNIQUE'/)[1];
                return res.status(400).render('register', {
                    error: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
                    formData: req.body
                });
            }

            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    getProfile: async (req, res) => {
        try {
            if (!req.session || !req.session.userId) {
                return res.status(401).send('Unauthorized');
            }

            const user = await userModel.findUserById(req.session.userId);

            if (!user) {
                return res.status(404).send('User not found');
            }

            res.render('profile', { user });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
};

module.exports = UserController;
