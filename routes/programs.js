const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { uploadProgram, setUploadType } = require('../middleware/upload');

// GET all programs
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const programs = await db.collection('programs').find({}).toArray();
        res.json(programs);
    } catch (error) {
        console.error('Error fetching programs:', error);
        res.status(500).json({ error: 'Failed to fetch programs' });
    }
});

// POST new program (with optional image)
router.post('/', setUploadType('program'), uploadProgram.single('image'), async (req, res) => {
    try {
        const db = getDB();
        const data = {
            title: req.body.title || '',
            description: req.body.description || '',
            status: req.body.status || 'upcoming',
            date: req.body.date || 'TBA',
            image: req.file ? '/uploads/programs/' + req.file.filename : '',
            createdAt: new Date().toISOString()
        };

        const result = await db.collection('programs').insertOne(data);
        data._id = result.insertedId;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error saving program:', error);
        res.status(500).json({ error: 'Failed to save program' });
    }
});

// PUT update program
router.put('/:id', setUploadType('program'), uploadProgram.single('image'), async (req, res) => {
    try {
        const db = getDB();
        const id = req.params.id;
        const update = {
            title: req.body.title || '',
            description: req.body.description || '',
            status: req.body.status || 'upcoming',
            date: req.body.date || 'TBA'
        };

        // Only update image if a new file was uploaded
        if (req.file) {
            update.image = '/uploads/programs/' + req.file.filename;
        }

        await db.collection('programs').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        );

        const updated = await db.collection('programs').findOne({ _id: new ObjectId(id) });
        res.json(updated);
    } catch (error) {
        console.error('Error updating program:', error);
        res.status(500).json({ error: 'Failed to update program' });
    }
});

// DELETE program
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        await db.collection('programs').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Program deleted' });
    } catch (error) {
        console.error('Error deleting program:', error);
        res.status(500).json({ error: 'Failed to delete program' });
    }
});

module.exports = router;
