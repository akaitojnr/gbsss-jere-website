const mongoose = require('mongoose');

const videoLessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    youtubeUrl: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    category: {
        type: String,
        enum: ['Science', 'Arts', 'Commercial', 'General'],
        default: 'General'
    }
});

module.exports = mongoose.model('VideoLesson', videoLessonSchema);
