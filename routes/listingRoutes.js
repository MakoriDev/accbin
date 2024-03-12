const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');

const listingModel = new Listing();

// Middleware to check if the user is logged in
const isAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to the login page if not logged in
    }
    next(); // Proceed if the user is authenticated
};

// Handle GET request to display form for creating a new listing
router.get('/', isAuthenticated, async (req, res) => {
    res.render('listing'); // Render the form for creating a new listing
});

// Handle POST request to create a new listing
router.post('/', isAuthenticated, async (req, res) => {
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

        res.redirect('/'); // Redirect back to the index page after adding the listing
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route for displaying a specific listing by ID
router.get('/add/:id', isAuthenticated, async (req, res) => {
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

// ... [previous code]

// Route for handling search
router.get('/search', isAuthenticated, async (req, res) => {
    try {
        const searchTerm = req.query.q;
        console.log('Search Term:', searchTerm);  // Log the search term

        if (!searchTerm) {
            res.json([]); // Return an empty array if no search term is provided
            return;
        }

        const listings = await Listing.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ]
        });

        console.log('Search Results:', listings);  // Log the search results

        res.json(listings); // Send the search results as JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ... [remaining code]



module.exports = router;
