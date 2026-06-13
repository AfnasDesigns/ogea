const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const { uploadPoster, setUploadType } = require('../middleware/upload');

// GET posters by category (mission200 or mission1)
router.get('/:category', async (req, res) => {
    try {
        const db = getDB();
        const category = req.params.category; // 'mission200' or 'mission1'
        const posters = await db.collection('posters')
            .find({ category })
            .sort({ uploadedAt: -1 })
            .toArray();
        res.json(posters);
    } catch (error) {
        console.error('Error fetching posters:', error);
        res.status(500).json({ error: 'Failed to fetch posters' });
    }
});

// POST upload poster(s) - supports multiple files
router.post('/:category', setUploadType('poster'), uploadPoster.array('files', 250), async (req, res) => {
    try {
        const db = getDB();
        const category = req.params.category;
        const cloudinary = require('../config/cloudinary');

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        // Validate Cloudinary Config
        if (!process.env.CLOUDINARY_API_KEY) {
            return res.status(500).json({ error: 'Cloudinary API Key is missing. Please add it to your environment variables.' });
        }

        const uploadedPosters = [];

        // Upload each file to Cloudinary manually
        for (const file of req.files) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'ogea/posters' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(file.buffer);
            });

            uploadedPosters.push({
                category,
                src: uploadResult.secure_url, // Use the secure Cloudinary URL
                name: file.originalname,
                uploadedAt: new Date().toISOString()
            });
        }

        const result = await db.collection('posters').insertMany(uploadedPosters);
        res.status(201).json({
            message: `${uploadedPosters.length} posters uploaded`,
            count: uploadedPosters.length,
            ids: Object.values(result.insertedIds)
        });
    } catch (error) {
        console.error('Error uploading posters:', error);
        // Extract inner error message if available
        const errMsg = error.message || (error.http_code ? JSON.stringify(error) : 'Failed to upload posters');
        res.status(500).json({ error: errMsg });
    }
});

// DELETE single poster
router.delete('/:id', async (req, res) => {
    try {
        const db = getDB();
        const id = req.params.id;

        // Don't try to convert 'bulk' to ObjectId
        if (id === 'bulk') {
            return res.status(400).json({ error: 'Use POST /api/posters/bulk-delete instead' });
        }

        await db.collection('posters').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Poster deleted' });
    } catch (error) {
        console.error('Error deleting poster:', error);
        res.status(500).json({ error: 'Failed to delete poster' });
    }
});

// POST bulk delete posters
router.post('/bulk-delete', async (req, res) => {
    try {
        const db = getDB();
        const ids = req.body.ids || [];

        if (ids.length === 0) {
            return res.status(400).json({ error: 'No poster IDs provided' });
        }

        const objectIds = ids.map(id => new ObjectId(id));
        const result = await db.collection('posters').deleteMany({
            _id: { $in: objectIds }
        });

        res.json({ message: `${result.deletedCount} posters deleted` });
    } catch (error) {
        console.error('Error bulk deleting posters:', error);
        res.status(500).json({ error: 'Failed to delete posters' });
    }
});

// PUT sort posters (update sort order metadata)
router.put('/sort/:category', async (req, res) => {
    try {
        const db = getDB();
        const category = req.params.category;
        const order = req.body.order || 'newest'; // 'newest' or 'oldest'

        const posters = await db.collection('posters')
            .find({ category })
            .sort({ uploadedAt: order === 'newest' ? -1 : 1 })
            .toArray();

        res.json(posters);
    } catch (error) {
        console.error('Error sorting posters:', error);
        res.status(500).json({ error: 'Failed to sort posters' });
    }
});

module.exports = router;
