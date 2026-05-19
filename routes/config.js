const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

// Default points configuration
const defaultPointsConfig = [
    { category: 'Academic', activity: 'Paper Presentation', level: 'International', points: 30 },
    { category: 'Academic', activity: 'Paper Presentation', level: 'National', points: 20 },
    { category: 'Academic', activity: 'Paper Presentation', level: 'Local', points: 10 },
    { category: 'Research', activity: 'Research Article', level: 'ISSN Journal', points: 30 },
    { category: 'Research', activity: 'Research Article', level: 'Periodicals', points: 20 },
    { category: 'Research', activity: 'Research Article', level: 'Magazines', points: 15 },
    { category: 'Literary', activity: 'Poem/Story/Essay', level: 'Magazines', points: 12 },
    { category: 'Literary', activity: 'Poem/Story/Essay', level: 'Periodicals', points: 12 },
    { category: 'Literary', activity: 'Poem/Story/Essay', level: 'Online', points: 8 },
    { category: 'Blogs', activity: 'Academic blog post', level: 'Educational blog', points: 5 },
    { category: 'Books', activity: 'Academic with ISBN', level: '—', points: 40 },
    { category: 'Books', activity: 'Academic without ISBN', level: '—', points: 30 },
    { category: 'Books', activity: 'Literary Book', level: '—', points: 20 },
    { category: 'Media', activity: 'Article/Essay', level: 'Newspaper', points: 25 },
    { category: 'Media', activity: 'Letter', level: '—', points: 8 },
    { category: 'Media', activity: 'Opinions', level: '—', points: 8 },
    { category: 'Creative', activity: 'Art/Photo', level: 'Recognised', points: 10 },
    { category: 'Competition', activity: '1st Prize', level: 'International', points: 30 },
    { category: 'Competition', activity: '2nd Prize', level: 'International', points: 25 },
    { category: 'Competition', activity: '3rd Prize', level: 'International', points: 20 },
    { category: 'Competition', activity: '1st Prize', level: 'National', points: 25 },
    { category: 'Competition', activity: '2nd Prize', level: 'National', points: 20 },
    { category: 'Competition', activity: '3rd Prize', level: 'National', points: 15 },
    { category: 'Competition', activity: '1st Prize', level: 'State', points: 20 },
    { category: 'Competition', activity: '2nd Prize', level: 'State', points: 15 },
    { category: 'Competition', activity: '3rd Prize', level: 'State', points: 10 },
    { category: 'Competition', activity: '1st Prize', level: 'Local', points: 10 },
    { category: 'Competition', activity: '2nd Prize', level: 'Local', points: 8 },
    { category: 'Competition', activity: '3rd Prize', level: 'Local', points: 6 }
];

// GET points configuration
router.get('/points', async (req, res) => {
    try {
        const db = getDB();
        let config = await db.collection('config').findOne({ type: 'points' });

        if (!config) {
            // Initialize with defaults
            config = { type: 'points', items: defaultPointsConfig };
            await db.collection('config').insertOne(config);
        }

        res.json(config.items);
    } catch (error) {
        console.error('Error fetching points config:', error);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

// PUT update points configuration
router.put('/points', async (req, res) => {
    try {
        const db = getDB();
        const items = req.body.items || [];

        await db.collection('config').updateOne(
            { type: 'points' },
            { $set: { items } },
            { upsert: true }
        );

        res.json({ message: 'Points config updated' });
    } catch (error) {
        console.error('Error updating points config:', error);
        res.status(500).json({ error: 'Failed to update config' });
    }
});

// POST reset points to defaults
router.post('/points/reset', async (req, res) => {
    try {
        const db = getDB();
        await db.collection('config').updateOne(
            { type: 'points' },
            { $set: { items: defaultPointsConfig } },
            { upsert: true }
        );
        res.json({ message: 'Points config reset to defaults', items: defaultPointsConfig });
    } catch (error) {
        console.error('Error resetting points config:', error);
        res.status(500).json({ error: 'Failed to reset config' });
    }
});

module.exports = router;
