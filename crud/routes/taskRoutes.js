const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all tasks
router.get('/', async (req, res) => {
    const [tasks] = await db.query('SELECT * FROM tasks');
    res.render('index', { tasks });
});

// Add a task
router.post('/add', async (req, res) => {
    const { title, description, deadline } = req.body;
    await db.query('INSERT INTO tasks (title, description, deadline) VALUES (?, ?, ?)', [title, description, deadline]);
    res.redirect('/tasks');
});

// Edit a task
router.post('/edit/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, deadline } = req.body;
    await db.query('UPDATE tasks SET title = ?, description = ?, deadline = ? WHERE id = ?', [title, description, deadline, id]);
    res.redirect('/tasks');
});

// Delete a task
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    res.redirect('/tasks');
});

module.exports = router;
