const express = require('express');
const router = express.Router();

// Admin credentials (same as your current hardcoded values)
const VALID_EMAIL = 'outreachdhdc@gmail.com';
const VALID_PASSWORD = 'outreachdhdc202';

// POST login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        // Set session
        req.session.isAdmin = true;
        req.session.email = email;
        req.session.loginTime = new Date().toISOString();

        res.json({
            success: true,
            message: 'Login successful',
            email: email
        });
    } else {
        res.status(401).json({
            success: false,
            message: email !== VALID_EMAIL ? 'Invalid email address' : 'Incorrect password'
        });
    }
});

// GET check session
router.get('/session', (req, res) => {
    if (req.session && req.session.isAdmin) {
        res.json({
            loggedIn: true,
            email: req.session.email,
            loginTime: req.session.loginTime
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// POST logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;
