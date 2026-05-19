const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// GET all publications
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const publications = await db.collection('publications').find({}).toArray();
        res.json(publications);
    } catch (error) {
        console.error('Error fetching publications:', error);
        res.status(500).json({ error: 'Failed to fetch publications' });
    }
});

// POST new publication
router.post('/', async (req, res) => {
    try {
        const db = getDB();
        const data = {
            name: req.body.name || '',
            category: req.body.category || '',
            language: req.body.language || '',
            website: req.body.website || '',
            email: req.body.email || '',
            createdAt: new Date().toISOString()
        };

        const result = await db.collection('publications').insertOne(data);
        data._id = result.insertedId;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error saving publication:', error);
        res.status(500).json({ error: 'Failed to save publication' });
    }
});

// PUT update publication
router.put('/:id', async (req, res) => {
    try {
        const db = getDB();
        const update = {
            name: req.body.name || '',
            category: req.body.category || '',
            language: req.body.language || '',
            website: req.body.website || '',
            email: req.body.email || ''
        };

        await db.collection('publications').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: update }
        );
        res.json({ message: 'Publication updated' });
    } catch (error) {
        console.error('Error updating publication:', error);
        res.status(500).json({ error: 'Failed to update publication' });
    }
});

// DELETE publication
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        await db.collection('publications').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Publication deleted' });
    } catch (error) {
        console.error('Error deleting publication:', error);
        res.status(500).json({ error: 'Failed to delete publication' });
    }
});

module.exports = router;
