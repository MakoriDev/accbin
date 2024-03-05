const mysql = require('mysql2/promise');
const pool = require('../database');

class Listing {
    constructor() {
        this.pool = pool;
    }

    async createListing(listingData) {
        const [rows] = await this.pool.execute(
            'INSERT INTO listings (category, title, description, currency, price, type) VALUES (?, ?, ?, ?, ?, ?)',
            [listingData.category, listingData.title, listingData.description, listingData.currency, listingData.price, listingData.type]
        );
        return rows.insertId;
    }

    async getAllListings() {
        const [listings] = await this.pool.execute('SELECT * FROM listings');
        return listings;
    }

    async getListingById(id) {
        const [listings] = await this.pool.execute('SELECT * FROM listings WHERE id = ?', [id]);
        return listings[0];
    }

    async updateListing(id, updatedData) {
        const [result] = await this.pool.execute(
            'UPDATE listings SET category = ?, title = ?, description = ?, currency = ?, price = ?, type = ? WHERE id = ?',
            [updatedData.category, updatedData.title, updatedData.description, updatedData.currency, updatedData.price, updatedData.type, id]
        );
        return result;
    }

    async deleteListing(id) {
        const [result] = await this.pool.execute('DELETE FROM listings WHERE id = ?', [id]);
        return result;
    }
}

module.exports = Listing;
