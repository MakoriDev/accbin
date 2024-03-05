const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

// Assuming you have set up your database configuration
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};

const listingModel = new Listing(dbConfig);

// Handle GET request to display form for creating a new listing
router.get('/', (req, res) => {
  res.render('listing'); // Render the form for creating a new listing
});

// Handle GET request to display form for creating a new listing with data
router.get('/add', async (req, res) => {
  try {
    // Fetch the data from the database
    const listings = await listingModel.getAllListings();

    // Render the add.ejs template and pass the fetched data to it
    res.render('add', { listings });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Handle POST request to create a new listing
router.post('/', async (req, res) => {
  try {
    console.log('Request Body:', req.body);

    if (!req.body.title || !req.body.category || !req.body.currency || !req.body.price || !req.body.type) {
      return res.status(400).send('All required fields must be filled');
    }

    // Create a new listing using the form data
    await listingModel.createListing({
      category: req.body.category,
      title: req.body.title,
      description: req.body.description,
      currency: req.body.currency,
      price: req.body.price,
      type: req.body.type
    });

    // Route for displaying a specific listing by ID
router.get('/add/:id', async (req, res) => {
  try {
      const id = req.params.id; // Get the listing ID from the URL
      const listing = await listingModel.getListingById(id); // Fetch the listing from the database

      if (listing) {
          res.render('add', { listing }); // Render add.ejs with the listing data
      } else {
          res.send('Listing not found'); // Handle case where listing is not found
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching listing');
  }
});

    // Redirect back to the index page after adding the listing
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});




module.exports = router;
