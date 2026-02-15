const express = require('express');
const router = express.Router();
const VideoLesson = require('../models/VideoLesson');

// Get all video lessons
router.get('/', async (req, res) => {
    try {
        const videos = await VideoLesson.find().sort({ date: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new video lesson
router.post('/', async (req, res) => {
    const { title, description, youtubeUrl, category } = req.body;

    const video = new VideoLesson({
        title,
        description,
        youtubeUrl,
        category
    });

    try {
        const newVideo = await video.save();
        res.status(201).json(newVideo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a video lesson
router.delete('/:id', async (req, res) => {
    try {
        const video = await VideoLesson.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        await video.deleteOne();
        res.json({ message: 'Video deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
