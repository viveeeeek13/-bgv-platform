// src/controllers/auth.controller.js
// Authentication logic: register and login

const User = require('../models/User');
const { generateToken } = require('../config/jwt');

/**
 * POST /api/auth/register
 * Create a new user account
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken({ userId: user._id, email: user.email });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Include password for comparison (select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken({ userId: user._id, email: user.email });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Return current authenticated user's profile
 */
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

module.exports = { register, login, getMe };
