const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',          // Replace with your MySQL username
    password: 'M@ni$hKum4r!2024#', // Replace with your MySQL password
    database: 'manishkumar',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = pool.promise();
