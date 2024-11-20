// backend/routes/post.js
const express = require('express');
const { createPost, upload } = require('../controllers/postController');
const router = express.Router();

// Route to create a post with image upload
router.post('/', upload.single('image'), createPost);

module.exports = router;
