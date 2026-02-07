const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    public_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
