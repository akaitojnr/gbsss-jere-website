const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    subject: String,
    score: Number,
    grade: String
});

const termResultSchema = new mongoose.Schema({
    term: { type: String, required: true },
    session: { type: String, required: true },
    position: { type: String, default: 'N/A' },
    results: [resultSchema]
});

const studentSchema = new mongoose.Schema({
    regNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    class: { type: String, required: true },
    // Legacy support/Current view
    position: { type: String, default: 'N/A' },
    results: [resultSchema],
    // New multi-term support
    termlyResults: [termResultSchema]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
