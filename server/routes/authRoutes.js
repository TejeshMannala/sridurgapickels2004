const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/userModel');

const router = express.Router();
const isLocalhost = (ip = '') =>
  ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';

const loginLimiter = rateLimit({
  // Lock login after 5 failed attempts for 30 minutes
  windowMs: 30 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 200,
  skipSuccessfulRequests: true,
  skip: (req) => process.env.NODE_ENV !== 'production' && isLocalhost(req.ip),
  keyGenerator: (req) => (req.body?.email ? String(req.body.email).toLowerCase() : req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Try again after 30 minutes.'
  }
});

const userLoginRateLimit = async (req, res, next) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  if (!email) {
    return loginLimiter(req, res, next);
  }

  try {
    const user = await User.findOne({ email }).select('role');
    if (user?.role === 'admin') {
      return next();
    }
  } catch (error) {
    // If user lookup fails, continue with limiter for safety
  }

  return loginLimiter(req, res, next);
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', registerUser);

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', userLoginRateLimit, loginUser);

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
router.get('/profile', protect, getProfile);

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
router.put('/profile', protect, updateProfile);

module.exports = router;
