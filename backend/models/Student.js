const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Pre-save hook to hash password
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare password
studentSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);
