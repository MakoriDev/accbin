const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

// Middleware for Parsing URL-Encoded Bodies
router.use(express.urlencoded({ extended: true }));

// GET Request Handling - Fetch all listings and render index page
router.get('/', async (req, res) => {
  try {
    // Fetch all listings from the database
    const listings = await Listing.find();

    // Render index.ejs with the listings data
    res.render('index', { listings });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Additional Routes
router.get('/register', (req, res) => {
  console.log('Handling /register route');
  res.render('register'); // Render register.ejs
});

router.get('/accountmanager', (req, res) => {
  res.render('accountmanager'); // Render accountmanager.ejs
});

router.get('/zoom', (req, res) => {
  res.render('zoom'); // Render zoom.ejs
});

router.get('/login', (req, res) => {
  res.render('login'); // Render login.ejs
});

router.get('/add/:id', async (req, res) => {
  try {


      const id = req.params.id; // extract id from the request
      const listing = await Listing.findById(id); // Fetch listing with matching id

      // check if listing is present
      if (!listing) {
        return res.status(404).send('Listing not found');
      }
      res.render('add', { listing }); // Pass the listings to the template
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});




module.exports = router;
