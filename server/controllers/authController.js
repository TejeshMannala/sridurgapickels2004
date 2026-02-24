const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      avatar: req.body.avatar
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      user.loginCount = (user.loginCount || 0) + 1;
      user.lastLoginAt = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
};
