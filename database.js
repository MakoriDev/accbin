const mysql = require('mysql2/promise');

// Database configuration
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3307
});

module.exports = pool;


/*gywliodk_accountsplace	

MYSQL_PASSWORD	yustohome2023	

MYSQL_PORT	3307	

MYSQL_USER	gywliodk_yusto	

PORT	80	

SERVER	127.0.0.1
*/