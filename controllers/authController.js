const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Generate JWT Token
 * @param {number} id - User ID
 * @returns {string} JWT token with 7 day expiry
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * Send token in httpOnly cookie
 * Security benefits:
 * - httpOnly: true -> Prevents XSS attacks (not accessible via JavaScript)
 * - secure: true -> Only sent over HTTPS in production
 * - sameSite: 'strict' -> Prevents CSRF attacks
 * 
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 */
const sendTokenResponse = (res, token, statusCode, user) => {
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Cookie not accessible via JavaScript
    sameSite: 'strict', // Strict same-site policy
    secure: process.env.NODE_ENV === 'production' // HTTPS only in production
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message: statusCode === 201 ? 'Registration successful' : 'Login successful',
    token, // Also send in response for API clients
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login instead.'
      });
    }

    // Create user (password will be hashed automatically by Sequelize hook)
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token and send response
    const token = generateToken(user.id);
    sendTokenResponse(res, token, 201, user);

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.'
      });
    }

    // Compare passwords using bcrypt
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.'
      });
    }

    // Generate token and send response
    const token = generateToken(user.id);
    sendTokenResponse(res, token, 200, user);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (clear cookie)
 * @access  Private
 */
const logout = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not fetch user data.'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};

