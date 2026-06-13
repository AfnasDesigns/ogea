const express = require('express');
const router = express.Router();

const { getDB } = require('../config/db');

// POST login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const db = getDB();
        // Look up user with admin role and matching credentials
        const user = await db.collection('users').findOne({ email: email, role: 'admin' });

        if (user && user.password === password) {
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
                message: !user ? 'Invalid admin email' : 'Incorrect password'
            });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Database error during login' });
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
