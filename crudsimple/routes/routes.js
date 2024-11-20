const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'M@ni$hKum4r!2024#',
    database: 'manishkumar',
});


router.get('/', (req, res) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send(result);
    });
});

// Get all users
// router.get('/', (req, res) => {
//     db.query('SELECT * FROM users', (err, result) => {

//         if(err) return res.status(500).send(err);
//         res.send(result)
//     });
// });

// router.get('/', async (req, res) => {
//     try {
//         const results = await db.query('SELECT * FROM users');
//         res.json(results);
//     } catch (err) {
//         res.status(500).send(err);
//     }
// });


// Get a single user
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

// Add a new user
router.post('/', (req, res) => {
    const { name, email, phone } = req.body;
    db.query('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, name, email, phone });
    });
});

// Update a user
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    db.query('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ id, name, email, phone });
    });
});

// Delete a user
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'User deleted successfully!' });
    });
});

module.exports = router;
