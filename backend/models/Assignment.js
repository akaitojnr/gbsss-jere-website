const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    id: { type: Number, unique: true }, // Keeping numeric ID for compatibility, or rely on _id? Let's keep a counter if needed, but for now standard _id is better. However, frontend might expect numeric ID. Let's start with auto-generated but also keep a 'legacyId' if needed. Actually, migrating to _id is better, but requires frontend refactor. Let's try to stick to numeric id for 'id' field to minimize frontend breakage, using a counter or random timestamp.
    // Actually, simple Date.now() was used before.
    title: { type: String, required: true },
    description: String,
    dueDate: String, // Keeping as string to match JSON 'YYYY-MM-DD'
    subject: { type: String, required: true },
    class: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
