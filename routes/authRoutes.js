const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
  validate
} = require('../utils/validation');
const { protect } = require('../middleware/authMiddleware');

/**
 * Auth Routes
 * All routes are public except /me and /logout
 */

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', registerValidation, validate, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, validate, login);

// @route   POST /api/auth/logout
// @desc    Logout user (clear cookie)
// @access  Private
router.post('/logout', protect, logout);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;

