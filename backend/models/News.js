const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    title: { type: String, required: true },
    date: String,
    content: String
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
