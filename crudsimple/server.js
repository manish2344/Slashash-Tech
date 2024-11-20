const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL Connection
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'M@ni$hKum4r!2024#',
    database: 'manishkumar',
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Routes
app.use('/api/users', require('./routes/routes.js'));

// Start Server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
