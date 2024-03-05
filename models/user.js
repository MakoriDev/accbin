const mysql = require('mysql2/promise');

class User {
    constructor(pool) {
        this.pool = pool;
    }

    async createUser(userData) {
        const [result] = await this.pool.execute(
            'INSERT INTO users (name, email, phone, username, password) VALUES (?, ?, ?, ?, ?)',
            [userData.name, userData.email, userData.phone, userData.username, userData.password]
        );
        return result.insertId;
    }

    async findUserById(userId) {
        const [users] = await this.pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        return users[0];
    }

    // Additional methods for other operations (e.g., update, delete, findByUsername, etc.)
    // Implement these methods similar to the ones above, using the connection pool for database operations.
}

module.exports = User;
