const mongoose = require('mongoose');

const admissionPinSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    candidateName: {
        type: String,
        default: ''
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedBy: {
        type: String, // Potentially store student name or reg number later
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AdmissionPin', admissionPinSchema);
