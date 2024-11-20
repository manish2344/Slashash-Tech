const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(session({
    secret: 'crud_secret',
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// MySQL Connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'crud_app'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database.');
});

// Routes
app.get('/', (req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) throw err;
        res.render('index', { users: results, message: req.flash('message') });
    });
});

app.post('/add', (req, res) => {
    const { name, email, phone } = req.body;
    connection.query('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone], (err) => {
        if (err) throw err;
        req.flash('message', 'User added successfully.');
        res.redirect('/');
    });
});

app.put('/edit/:id', (req, res) => {
    const { name, email, phone } = req.body;
    const { id } = req.params;
    connection.query('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', [name, email, phone, id], (err) => {
        if (err) throw err;
        req.flash('message', 'User updated successfully.');
        res.redirect('/');
    });
});

app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM users WHERE id = ?', [id], (err) => {
        if (err) throw err;
        req.flash('message', 'User deleted successfully.');
        res.redirect('/');
    });
});

// Start server
app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});
