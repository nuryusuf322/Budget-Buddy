const express = require('express');
const { validationResult } = require('express-validator');

// Import model functions
const {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUserProfile
} = require('./auth.model');

// Import validation rules
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  userIdValidation
} = require('./auth.Validation');

const router = express.Router();

// GET /api/auth/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    
    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
});

// GET /api/auth/profile/:id - Get user profile
router.get('/profile/:id', userIdValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const user = await getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
});

// POST /api/auth/register - Register new user
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const newUser = await registerUser(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to register user'
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;
    const user = await loginUser(email, password);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: user
    });
  } catch (error) {
    console.error('Error logging in:', error);
    
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to login'
    });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth module is working!'
  });
});

module.exports = router;