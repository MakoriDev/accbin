const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

// Middleware for Parsing URL-Encoded Bodies
router.use(express.urlencoded({ extended: true }));

// Initialize Listing Model with MySQL database configuration
const listingModel = new Listing();

// Middleware to check if the user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login page if not logged in
    }
    next(); // User is logged in, proceed to the next middleware
};

// GET Request Handling - Fetch all listings and render index page
router.get('/', async (req, res) => {
    try {
        const listings = await listingModel.getAllListings();
        res.render('index', { 
            listings,
            isLoggedIn: !!req.session.userId  // Pass login status to view
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/register', (req, res) => {
    res.render('register'); // Render register.ejs
});

router.get('/accountmanager', isAuthenticated, (req, res) => {
    res.render('accountmanager'); // Render accountmanager.ejs, protected by login
});

router.get('/zoom', (req, res) => {
    res.render('zoom'); // Render zoom.ejs
});

router.get('/login', (req, res) => {
    res.render('login'); // Render login.ejs
});

// GET Request Handling - Fetch a single listing by ID and render add page
router.get('/add/:id', isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id; 
        const listing = await listingModel.getListingById(id); 

        if (!listing) {
            return res.status(404).send('Listing not found');
        }
        res.render('add', { listing }); // Pass the listing to the template
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching listing');
    }
});

module.exports = router;
