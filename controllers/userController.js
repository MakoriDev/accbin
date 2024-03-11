const User = require('../models/user');
const pool = require('../database.js');

const userModel = new User(pool);

const UserController = {
    register: async (req, res) => {
        try {
            const userExists = await userModel.userExists(req.body.username, req.body.email);

            if (userExists) {
                return res.status(400).render('register', { 
                    error: 'Username or Email already exists', 
                    formData: req.body
                });
            }

            const userId = await userModel.createUser(req.body);
            if (userId) {
                req.session.userId = userId;
                console.log("User ID set in session:", req.session.userId);
                return res.redirect('/user/profile');
            } else {
                throw new Error('User registration failed.');
            }
        } catch (error) {
            console.error("Register Error:", error);
            return res.status(500).send('Internal Server Error');
        }
    },

    getProfile: async (req, res) => {
        try {
            console.log("Session data in getProfile:", req.session);
            if (!req.session || !req.session.userId) {
                return res.status(401).send('Unauthorized');
            }

            const user = await userModel.findUserById(req.session.userId);
            console.log("Retrieved user data:", user);

            if (!user) {
                return res.status(404).send('User not found');
            }

            res.render('profile', { user });
        } catch (error) {
            console.error("Error in getProfile method:", error);
            res.status(500).send('Internal Server Error');
        }
    },
};

module.exports = UserController;
