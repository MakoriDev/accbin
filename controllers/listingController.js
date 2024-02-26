const Listing = require('../models/listing');

// Controller function to handle displaying the form for creating a new listing
exports.displayListingForm = (req, res) => {
    res.render('listing-form'); // Render the form for creating a new listing
};

// Controller function to handle creating a new listing
exports.createListing = async (req, res) => {
    try {
        // Create a new listing using the form data
        const newListing = new Listing({
            category: req.body.category,
            title: req.body.title,
            description: req.body.description,
            currency: req.body.currency,
            price: req.body.price,
            type: req.body.type
        });

        // Save the new listing to the database
        await newListing.save();

        // Redirect back to the index page after adding the listing
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
