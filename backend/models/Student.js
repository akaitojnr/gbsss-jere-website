const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    subject: String,
    score: Number,
    grade: String
});

const studentSchema = new mongoose.Schema({
    regNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    class: { type: String, required: true },
    results: [resultSchema]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
