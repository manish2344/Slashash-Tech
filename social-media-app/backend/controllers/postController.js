// backend/controllers/postController.js
const Post = require('../models/Post');
const cloudinary = require('../config/cloudinaryConfig');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: { folder: 'social_media_app' },
});

const upload = multer({ storage });

exports.upload = upload;


// backend/controllers/postController.js

exports.createPost = async (req, res) => {
  try {
    // Check if req.user is defined
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated. No user ID found." });
    }

    // Create a new post with userId from req.user._id
    const post = new Post({
      userId: req.user._id,
      description: req.body.description,
      imageUrl: req.file.path, // Assuming multer is handling the file upload
    });

    // Save the post to the database
    await post.save();
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// exports.createPost = async (req, res) => {
//   try {
//     const { description } = req.body;
//     const newPost = new Post({
//       userId: req.userId,
//       description,
//       imageUrl: req.file.path,
//     });
//     await newPost.save();
//     res.status(201).json(newPost);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
