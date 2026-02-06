require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Models
const Student = require('./models/Student');
const Assignment = require('./models/Assignment');
const CBTExam = require('./models/CBTExam');
const Submission = require('./models/Submission');
const News = require('./models/News');
const Gallery = require('./models/Gallery');
const Contact = require('./models/Contact');
const Config = require('./models/Config');

// Connect
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB for seeding...");
        seedData();
    })
    .catch(err => {
        console.error("Connection Error:", err);
        process.exit(1);
    });

const loadJSON = (file) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', file), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.log(`No data for ${file} or file missing.`);
        return [];
    }
};

const seedData = async () => {
    try {
        // Clear existing data (optional, but safer for re-runs to avoid duplicates if using insertMany, though we should check for duplicates)
        // For migration, let's assume empty DB or overwrite.
        // Actually, let's just insert if empty.

        console.log("Seeding Students...");
        const students = loadJSON('students.json');
        if (students.length > 0) {
            await Student.deleteMany({});
            await Student.insertMany(students);
        }

        console.log("Seeding Assignments...");
        const assignments = loadJSON('assignments.json');
        if (assignments.length > 0) {
            await Assignment.deleteMany({});
            await Assignment.insertMany(assignments);
        }

        console.log("Seeding CBT Exams...");
        const exams = loadJSON('cbt_exams.json');
        if (exams.length > 0) {
            await CBTExam.deleteMany({});
            await CBTExam.insertMany(exams);
        }

        console.log("Seeding Submissions...");
        const submissions = loadJSON('submissions.json');
        if (submissions.length > 0) {
            await Submission.deleteMany({});
            await Submission.insertMany(submissions);
        }

        console.log("Seeding News...");
        const news = loadJSON('news.json');
        if (news.length > 0) {
            await News.deleteMany({});
            await News.insertMany(news);
        }

        console.log("Seeding Gallery...");
        const gallery = loadJSON('gallery.json');
        if (gallery.length > 0) {
            await Gallery.deleteMany({});
            await Gallery.insertMany(gallery);
        }

        console.log("Seeding Contacts...");
        const contacts = loadJSON('contacts.json');
        if (contacts.length > 0) {
            await Contact.deleteMany({});
            await Contact.insertMany(contacts);
        }

        console.log("Seeding Config...");
        const configData = loadJSON('config.json');
        if (configData) {
            await Config.deleteMany({});
            // Config is likely an object, not array, but check json structure
            // Usually existing logic loaded 'config.json' which was an object.
            // insertMany expects array, create expects object or array.
            await Config.create(configData);
        }

        console.log("Data Seeding Completed Successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Seeding Failed:", error);
        process.exit(1);
    }
};
