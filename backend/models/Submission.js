const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    studentReg: { type: String, required: true },
    type: { type: String, enum: ['assignment', 'cbt'], required: true },
    referenceId: { type: Number, required: true }, // ID of the Exam or Assignment
    content: mongoose.Schema.Types.Mixed, // flexible for answers object
    score: Number,
    total: Number,
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
