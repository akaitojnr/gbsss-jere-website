const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'unread' }
});

module.exports = mongoose.model('Contact', contactSchema);
