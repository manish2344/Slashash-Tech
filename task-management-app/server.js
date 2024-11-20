// server.js

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Initialize environment variables
dotenv.config();


const cors = require('cors');

// Create Express app
const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));  // To serve static files like CSS, JS, and images

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Could not connect to the database', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Define routes

// Get all tasks
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// Create a new task
app.post('/tasks', (req, res) => {
    const { title, description, status } = req.body;
    const query = 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)';
    db.query(query, [title, description, status], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ id: result.insertId, title, description, status });
    });
});

// Update task status
app.put('/tasks/:id', (req, res) => {
    const { status } = req.body;
    const taskId = req.params.id;
    const query = 'UPDATE tasks SET status = ? WHERE id = ?';
    db.query(query, [status, taskId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Task status updated successfully' });
    });
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Task deleted successfully' });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
