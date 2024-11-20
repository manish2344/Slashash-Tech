// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/nodejs-ejs-mongodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Use body-parser middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (e.g., CSS)
app.use(express.static('public'));

// Home route (Form to add user)
app.get('/', (req, res) => {
  res.render('index');
});

// Route to view all users
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.render('users', { users });
});

// Route to add a new user
app.post('/add-user', async (req, res) => {
  const { name, email } = req.body;

  const newUser = new User({ name, email });
  await newUser.save();

  res.redirect('/users');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
