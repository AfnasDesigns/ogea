const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET all users
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection('users').find({}).toArray();
        // Don't send passwords to the frontend
        const safeUsers = users.map(u => ({ ...u, password: undefined }));
        res.json(safeUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST new user
router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const data = {
            name: req.body.name || '',
            admission: req.body.admission || '',
            class: req.body.class || '',
            email: req.body.email || '',
            role: req.body.role || 'student',
            credits: parseInt(req.body.credits) || 0,
            badge: req.body.badge || 'none',
            createdAt: new Date().toISOString()
        };

        const result = await db.collection('users').insertOne(data);
        data._id = result.insertedId;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ error: 'Failed to save user' });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
