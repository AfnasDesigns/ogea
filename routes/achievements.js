const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { uploadProof, setUploadType } = require('../middleware/upload');

// GET all achievements
router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const achievements = await db.collection('achievements').find({}).toArray();
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// POST new achievement (with optional proof file)
router.post('/', setUploadType('proof'), uploadProof.single('proofFile'), async (req, res) => {
    try {
        const db = getDB();
        const cloudinary = require('../config/cloudinary');

        const data = {
            fullName: req.body.fullName || '',
            class: req.body.class || '',
            admissionNo: req.body.admissionNo || '',
            contact: req.body.contact || '',
            category: req.body.category || '',
            activityTitle: req.body.activityTitle || '',
            level: req.body.level || '',
            result: req.body.result || '',
            platform: req.body.platform || '',
            language: req.body.language || '',
            referenceLink: req.body.referenceLink || '',
            notes: req.body.notes || '',
            submittedAt: new Date().toISOString(),
            status: 'pending',
            pointsAwarded: 0
        };

        if (req.file) {
            // Validate Cloudinary Config
            if (!process.env.CLOUDINARY_API_KEY) {
                return res.status(500).json({ error: 'Cloudinary API Key is missing. Please add it to your environment variables.' });
            }

            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'ogea/proofs' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                
                stream.on('error', (err) => reject(err));
                
                stream.end(req.file.buffer);
            });

            data.proofFile = uploadResult.secure_url;
        } else {
            data.proofFile = '';
        }

        const result = await db.collection('achievements').insertOne(data);
        data._id = result.insertedId;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error saving achievement:', error);
        const errMsg = error.message || (error.http_code ? JSON.stringify(error) : 'Failed to save achievement');
        res.status(500).json({ error: errMsg });
    }
});

// PUT update achievement (approve/reject/update points)
router.put('/:id', async (req, res) => {
    try {
        const db = getDB();
        const id = req.params.id;
        const update = {
            status: req.body.status,
            pointsAwarded: parseInt(req.body.pointsAwarded) || 0,
            reviewedAt: new Date().toISOString()
        };

        await db.collection('achievements').updateOne(
            { _id: new ObjectId(id) },
            { $set: update }
        );

        res.json({ message: 'Achievement updated', ...update });
    } catch (error) {
        console.error('Error updating achievement:', error);
        res.status(500).json({ error: 'Failed to update achievement' });
    }
});

// DELETE achievement
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        await db.collection('achievements').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Achievement deleted' });
    } catch (error) {
        console.error('Error deleting achievement:', error);
        res.status(500).json({ error: 'Failed to delete achievement' });
    }
});

module.exports = router;
