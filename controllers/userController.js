const User = require('../models/user');
const pool = require('../app.js');

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
            const userId = await userModel.createUser(req.body);
            req.session.userId = userId;

            res.redirect('/user/profile');
        } catch (error) {
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
