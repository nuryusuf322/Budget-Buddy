const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('./auth.model');
const { v4: uuidv4 } = require('uuid');
const { generateOTP, sendOTPEmail, storeOTP, verifyOTP } = require('../../shared/utils/otpService');
const { generateToken } = require('../../shared/utils/jwt');
const { authenticate, authorize } = require('../../shared/middlewares/auth');
const router = express.Router();

// Protected route - requires authentication
router.get('/users', authenticate, async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// Protected route - requires authentication
router.get('/users/:id', authenticate, async (req, res) => {
    try {
        const user = await User.findOne({ user_id: req.params.id }, { password: 0 });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

router.post('/register', [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['user', 'admin', 'manager']).withMessage('Invalid role'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const existingUser = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }

        const userData = {
          ...req.body,
          user_id: uuidv4(),
          role: req.body.role || 'user' // Default to 'user' role
        };

        const user = new User(userData);
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ success: true, data: userResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// Login - Step 1: Validate credentials and send OTP
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').exists().withMessage('Password is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Generate and send OTP
        const otp = generateOTP();
        
        // Check if email configuration exists
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('⚠️  EMAIL_USER or EMAIL_PASS not set in .env file');
            return res.status(500).json({ 
                success: false, 
                message: 'Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env file.' 
            });
        }
        
        const emailSent = await sendOTPEmail(email, otp);
        
        if (!emailSent) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send OTP email. Please check your email configuration and backend console for details.' 
            });
        }

        // Store OTP
        await storeOTP(email, otp);

        res.json({ 
            success: true, 
            message: 'OTP sent to your email. Please verify to complete login.',
            email: email // Return email for OTP verification
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// Login - Step 2: Verify OTP and return JWT token
router.post('/verify-otp', [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, otp } = req.body;

        // Verify OTP
        const otpResult = await verifyOTP(email, otp);
        if (!otpResult.valid) {
            return res.status(400).json({ 
                success: false, 
                message: otpResult.message 
            });
        }

        // Get user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Generate JWT token
        const token = generateToken({
            user_id: user.user_id,
            email: user.email,
            role: user.role
        });

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            success: true,
            message: 'OTP verified successfully',
            token,
            data: userResponse
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

// Protected route - requires authentication, users can update themselves or admin/manager can update anyone
router.put('/users/:id', authenticate, async (req, res) => {
    try {
        // Users can only update themselves unless they're admin/manager
        if (req.user.user_id !== req.params.id && !['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only update your own profile.' 
            });
        }

        const user = await User.findOneAndUpdate(
            { user_id: req.params.id },
            req.body,
            { new: true, fields: { password: 0 } }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, message: 'User updated successfully', data: user });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
    }
});

// Protected route - requires admin or manager role
router.delete('/users/:id', authenticate, authorize('admin', 'manager'), async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ user_id: req.params.id }); 
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
    }
});

module.exports = router;
