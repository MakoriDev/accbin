// models/listing.js
const mongoose = require('mongoose');


const listingSchema = new mongoose.Schema({

    category: String,
    title: String,
    description: String,
    currency: String,
    price: Number,
    type: String
}, { timestamps: true});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
