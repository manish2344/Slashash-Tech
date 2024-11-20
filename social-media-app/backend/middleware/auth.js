// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Retrieve token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.error("No token provided in Authorization header");
      return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    // Verify the token and attach user info to req.user
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Assuming `verified` contains user ID and other info

    next(); // Proceed to next middleware or controller
  } catch (err) {
    console.error("Token verification failed:", err.message);
    res.status(400).json({ error: "Invalid Token" });
  }
};

module.exports = auth;
