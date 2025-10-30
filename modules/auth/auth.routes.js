const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('./auth.model');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

router.get('/users/:id', async (req, res) => {
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
          user_id: uuidv4()
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
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({ success: true, message: 'Login successful', data: userResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
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
router.delete('/users/:id', async (req, res) => {
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
