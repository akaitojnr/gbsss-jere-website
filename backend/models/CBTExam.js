const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: String
});

const questionSchema = new mongoose.Schema({
    question: String,
    options: [String], // Array of strings is simpler
    correct: Number // Index 0-3
});

const cbtExamSchema = new mongoose.Schema({
    id: { type: Number, unique: true }, // Legacy ID support
    title: { type: String, required: true },
    subject: { type: String, required: true },
    class: { type: String, required: true },
    timeLimit: { type: Number, default: 30 },
    questions: [questionSchema]
}, { timestamps: true });

module.exports = mongoose.model('CBTExam', cbtExamSchema);
