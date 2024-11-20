// Required dependencies
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
app.use(express.json());

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/social_media_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { 
        publicId: String,
        url: { type: String, default: '' }
    },
    bio: { type: String, default: '' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

// Post Model
const PostSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    image: {
        publicId: String,
        url: String
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'social_media_app',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

const upload = multer({ storage: storage });

// Helper function to delete image from Cloudinary
const deleteImageFromCloudinary = async (publicId) => {
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('Error deleting image from Cloudinary:', error);
        }
    }
};

// Authentication Middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            throw new Error();
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            throw new Error('Invalid login credentials');
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            throw new Error('Invalid login credentials');
        }
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User Routes
app.get('/api/users/profile', auth, async (req, res) => {
    res.json(req.user);
});

app.put('/api/users/profile', auth, upload.single('profilePic'), async (req, res) => {
    try {
        const updates = req.body;
        
        // Handle profile picture update
        if (req.file) {
            // Delete old profile picture if it exists
            if (req.user.profilePic.publicId) {
                await deleteImageFromCloudinary(req.user.profilePic.publicId);
            }
            
            updates.profilePic = {
                publicId: req.file.filename,
                url: req.file.path
            };
        }
        
        Object.keys(updates).forEach(update => {
            req.user[update] = updates[update];
        });
        
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/users/follow/:id', auth, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        if (!userToFollow) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (!req.user.following.includes(req.params.id)) {
            req.user.following.push(req.params.id);
            userToFollow.followers.push(req.user._id);
            
            await req.user.save();
            await userToFollow.save();
        }
        
        res.json({ message: 'Successfully followed user' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Post Routes
app.post('/api/posts', auth, upload.single('image'), async (req, res) => {
    try {
        const postData = {
            userId: req.user._id,
            content: req.body.content
        };

        if (req.file) {
            postData.image = {
                publicId: req.file.filename,
                url: req.file.path
            };
        }

        const post = new Post(postData);
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/posts/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Delete image from Cloudinary if it exists
        if (post.image && post.image.publicId) {
            await deleteImageFromCloudinary(post.image.publicId);
        }

        await post.remove();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find({
            userId: { $in: [...req.user.following, req.user._id] }
        })
        .sort({ createdAt: -1 })
        .populate('userId', 'username profilePic');
        
        res.json(posts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/posts/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        if (!post.likes.includes(req.user._id)) {
            post.likes.push(req.user._id);
            await post.save();
        }
        
        res.json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/posts/:id/comment', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        post.comments.push({
            userId: req.user._id,
            text: req.body.text
        });
        
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Server startup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});