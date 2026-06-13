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

// POST new program
router.post('/', setUploadType('program'), uploadProgram.single('image'), async (req, res) => {
    try {
        const db = getDB();
        const cloudinary = require('../config/cloudinary');

        const data = {
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            status: req.body.status || 'upcoming',
            uploadedAt: new Date().toISOString()
        };

        if (req.file) {
            // Validate Cloudinary Config
            if (!process.env.CLOUDINARY_API_KEY) {
                return res.status(500).json({ error: 'Cloudinary API Key is missing. Please add it to your environment variables.' });
            }

            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'ogea/programs' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                
                stream.on('error', (err) => reject(err));
                
                stream.end(req.file.buffer);
            });

            data.image = uploadResult.secure_url;
        }

        const result = await db.collection('programs').insertOne(data);
        data._id = result.insertedId;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error saving program:', error);
        const errMsg = error.message || (error.http_code ? JSON.stringify(error) : 'Failed to save program');
        res.status(500).json({ error: errMsg });
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
