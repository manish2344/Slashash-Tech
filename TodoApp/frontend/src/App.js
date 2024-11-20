// First install required dependencies:
// npm install react-router-dom axios @heroicons/react tailwindcss @headlessui/react formik yup react-toastify

// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
};

export const posts = {
    create: (postData) => api.post('/api/posts', postData),
    getFeed: () => api.get('/api/posts'),
    like: (postId) => api.post(`/api/posts/${postId}/like`),
    comment: (postId, comment) => api.post(`/api/posts/${postId}/comment`, comment),
    delete: (postId) => api.delete(`/api/posts/${postId}`),
};

export const users = {
    getProfile: () => api.get('/api/users/profile'),
    updateProfile: (userData) => api.put('/api/users/profile', userData),
    follow: (userId) => api.post(`/api/users/follow/${userId}`),
};

// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            users.getProfile()
                .then(response => setUser(response.data))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const { data } = await auth.login(credentials);
        localStorage.setItem('token', data.token);
        setUser(data.user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// src/components/Navbar.js
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className="text-xl font-bold">Social App</Link>
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <Link to="/create" className="btn-primary">Create Post</Link>
                            <Link to="/profile" className="flex items-center">
                                <img 
                                    src={user.profilePic.url || '/default-avatar.png'} 
                                    alt="Profile" 
                                    className="w-8 h-8 rounded-full"
                                />
                            </Link>
                            <button onClick={logout} className="btn-secondary">Logout</button>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="btn-primary">Login</Link>
                            <Link to="/register" className="btn-secondary">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

// src/components/PostCard.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartIcon, ChatIcon, TrashIcon } from '@heroicons/react/outline';

export const PostCard = ({ post, onDelete }) => {
    const { user } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');

    const handleLike = async () => {
        try {
            await posts.like(post._id);
            // Trigger refresh of posts
        } catch (error) {
            toast.error('Failed to like post');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            await posts.comment(post._id, { text: comment });
            setComment('');
            // Trigger refresh of posts
        } catch (error) {
            toast.error('Failed to add comment');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex items-center mb-4">
                <img 
                    src={post.userId.profilePic.url || '/default-avatar.png'} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                    <h3 className="font-semibold">{post.userId.username}</h3>
                    <p className="text-gray-500 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                </div>
                {user._id === post.userId._id && (
                    <button 
                        onClick={() => onDelete(post._id)}
                        className="ml-auto text-red-500"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
            
            <p className="mb-4">{post.content}</p>
            
            {post.image && (
                <img 
                    src={post.image.url} 
                    alt="Post" 
                    className="rounded-lg mb-4 w-full"
                />
            )}
            
            <div className="flex items-center space-x-4">
                <button 
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${
                        post.likes.includes(user._id) ? 'text-red-500' : 'text-gray-500'
                    }`}
                >
                    <HeartIcon className="w-5 h-5" />
                    <span>{post.likes.length}</span>
                </button>
                
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-1 text-gray-500"
                >
                    <ChatIcon className="w-5 h-5" />
                    <span>{post.comments.length}</span>
                </button>
            </div>

            {showComments && (
                <div className="mt-4">
                    <form onSubmit={handleComment} className="mb-4">
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-2 border rounded-lg"
                        />
                    </form>
                    
                    <div className="space-y-2">
                        {post.comments.map((comment) => (
                            <div key={comment._id} className="flex items-start space-x-2">
                                <img 
                                    src={comment.userId.profilePic.url || '/default-avatar.png'}
                                    alt="Profile" 
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="bg-gray-100 p-2 rounded-lg flex-1">
                                    <p className="font-semibold">{comment.userId.username}</p>
                                    <p>{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// src/pages/Feed.js
import { useState, useEffect } from 'react';
import { PostCard } from '../components/PostCard';
import { posts } from '../services/api';

export const Feed = () => {
    const [feedPosts, setFeedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data } = await posts.getFeed();
            setFeedPosts(data);
        } catch (error) {
            toast.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId) => {
        try {
            await posts.delete(postId);
            setFeedPosts(feedPosts.filter(post => post._id !== postId));
            toast.success('Post deleted successfully');
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {feedPosts.map(post => (
                <PostCard 
                    key={post._id} 
                    post={post} 
                    onDelete={handleDelete}
                />
            ))}
        </div>
    );
};

// src/pages/CreatePost.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { posts } from '../services/api';

export const CreatePost = () => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('content', content);
            if (image) {
                formData.append('image', image);
            }

            await posts.create(formData);
            toast.success('Post created successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to create post');
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Create Post</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-4 border rounded-lg"
                    rows="4"
                />
                
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                    />
                    <label 
                        htmlFor="image-upload"
                        className="btn-secondary block w-full text-center"
                    >
                        Add Image
                    </label>
                </div>

                {preview && (
                    <div className="relative">
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className="rounded-lg w-full"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setImage(null);
                                setPreview('');
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                        >
                            ×
                        </button>
                    </div>
                )}

                <button 
                    type="submit" 
                    className="btn-primary w-full"
                    disabled={!content.trim()}
                >
                    Create Post
                </button>
            </form>
        </div>
    );
};