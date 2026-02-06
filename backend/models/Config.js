const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    name: String,
    fullName: String,
    motto: String,
    principal: {
        name: String,
        welcomeTitle: String,
        welcomeMessage: String
    },
    contact: {
        address: String,
        email: String,
        phone: String,
        hours: String
    },
    socials: {
        facebook: String,
        twitter: String,
        instagram: String
    },
    images: {
        logo: String,
        hero: String,
        heroSlider: [{ url: String, caption: String }],
        principal: String
    },
    vision: String,
    mission: String,
    coreValues: [{
        title: String,
        desc: String
    }],
    academics: {
        sss: {
            science: [String]
        },
        calendar: [{ term: String, start: String, end: String, activity: String }]
    },
    management: {
        vicePrincipals: [{ name: String, role: String, initials: String }]
    },
    admissions: {
        formPrice: String,
        requirements: {
            sss1: [String]
        },
        procedure: [String]
    }
}, { timestamps: true });

// Ensure only one config document exists usually, but schema doesn't enforce singleton strictness
module.exports = mongoose.model('Config', configSchema);
