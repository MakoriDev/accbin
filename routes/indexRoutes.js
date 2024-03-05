const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

// Middleware for Parsing URL-Encoded Bodies
router.use(express.urlencoded({ extended: true }));

// Initialize Listing Model with MySQL database configuration
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};
const listingModel = new Listing(dbConfig);

// GET Request Handling - Fetch all listings and render index page
router.get('/', async (req, res) => {
    try {
        // Fetch all listings from the database
        const listings = await listingModel.getAllListings();

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

// GET Request Handling - Fetch a single listing by ID and render add page
router.get('/add/:id', async (req, res) => {
    try {
        const id = req.params.id; // Extract id from the request
        const listing = await listingModel.getListingById(id); // Fetch listing with matching id

        // Check if listing is present
        if (!listing) {
            return res.status(404).send('Listing not found');
        }
        res.render('add', { listing }); // Pass the listing to the template
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
