// controllers/userController.js
const User = require('../models/user');

const UserController = {
  register: async (req, res) => {
    try {
      const newUser = new User(req.body);
      await newUser.save();
      req.session.userId = newUser._id;


      res.redirect('/user/profile');
      //res.status(200).send('User registered successfully!');
    } catch (error) {
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map((error) => error.message);
        res.status(400).json({ error: 'Validation Error', message: validationErrors });
      } else {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    }
  },

  getProfile: async (req, res) => {
    try {
      // Check if userId is present in the session
      if (!req.session || !req.session.userId) {
        return res.status(401).send('Unauthorized');
      }

      const userId = req.session.userId;

      // Fetch user details from the database
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).send('User not found');
      }

      // Render the profile page with user details
      res.render('profile', { user });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = UserController;
