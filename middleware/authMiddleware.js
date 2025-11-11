const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication Middleware
 * Verifies JWT token from cookies or Authorization header
 * Attaches authenticated user to req.user
 * 
 * Security benefits of httpOnly cookies:
 * - Not accessible via JavaScript (prevents XSS attacks)
 * - Automatically sent with requests to same domain
 * - Can be marked as secure (HTTPS only) in production
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for token in cookies (primary method)
    if (req.cookies.token) {
      token = req.cookies.token;
    }
    // Fallback: Check Authorization header (for API clients like Postman)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // No token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database (excluding password)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    // Generic error
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route.'
    });
  }
};

module.exports = { protect };

