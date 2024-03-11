const Listing = require('../models/listing');
const { pool } = require('../app.js');


// Initialize Listing Model with MySQL database configuration
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
};
const listingModel = new Listing();

// Controller function to handle displaying the form for creating a new listing
exports.displayListingForm = (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login page
    }
    res.render('listing-form');
};


// Controller function to handle creating a new listing
exports.createListing = async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).send('Unauthorized - Please login to create a listing');
        }
        // Create a new listing using the form data
        const listingData = {
            userId: req.session.userId,
            category: req.body.category,
            title: req.body.title,
            description: req.body.description,
            currency: req.body.currency,
            price: req.body.price,
            type: req.body.type
        };

        // Save the new listing to the database
        const listingId = await listingModel.createListing(listingData);

        console.log(`New listing created with ID: ${listingId}`);

        // Redirect back to the index page after adding the listing
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
