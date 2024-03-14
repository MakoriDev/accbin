const bcrypt = require('bcrypt');
const User = require('../models/user');
const pool = require('../database.js');


const userModel = new User(pool);

const UserController = {
    // login 
    


    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const [users] = await userModel.pool.execute('SELECT * FROM users WHERE email = ?', [email]);

            if (users.length === 0) {
                return res.status(401).render('login', {
                    error: 'Invalid email or password',
                    formData: req.body
                });
            }

            const user = users[0];
            const passwordIsValid = await bcrypt.compare(password, user.password);

            if (!passwordIsValid) {
                return res.status(401).render('login', {
                    error: 'Invalid email or password',
                    formData: req.body
                });
            }

            req.session.userId = user.id;
            console.log("User ID set in session:", req.session.userId);
            res.redirect('/user/profile');
        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).send('Internal Server Error');
        }
    },

    // register 

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