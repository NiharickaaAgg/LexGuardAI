const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const sendTokenResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    res
        .status(statusCode)
        .cookie('lexguard_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({ success: true, token, user });
};

// POST /auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });

        if (await User.findOne({ email }))
            return res.status(409).json({ success: false, message: 'Email already in use.' });

        const user = await User.create({ name, email, password });
        sendTokenResponse(user, 201, res);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Registration failed.' });
    }
});

// POST /auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });

        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });
        sendTokenResponse(user, 200, res);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Login failed.' });
    }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('lexguard_token').json({ success: true, message: 'Logged out.' });
});

// GET /auth/me
router.get('/me', protect, (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;