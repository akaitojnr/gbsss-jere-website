const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const fs = require('fs');

// Models
const Student = require('./models/Student');
const Assignment = require('./models/Assignment');
const CBTExam = require('./models/CBTExam');
const Submission = require('./models/Submission');
const News = require('./models/News');
const Gallery = require('./models/Gallery');
const Contact = require('./models/Contact');
const Config = require('./models/Config');

// --- CONFIGURATION ---
// PASTE YOUR MONGODB ATLAS CONNECTION STRING HERE IF NOT IN .ENV
const ATLAS_URI = process.env.MONGO_URI || "";

if (!ATLAS_URI || ATLAS_URI.includes("localhost")) {
    console.error("ERROR: Please set MONGO_URI in your .env file to your Atlas Connection String.");
    console.error("Example: MONGO_URI=mongodb+srv://admin:password@cluster0.abcde.mongodb.net/school_db?retryWrites=true&w=majority");
    process.exit(1);
}

console.log("Connecting to Cloud Database...");

mongoose.connect(ATLAS_URI)
    .then(() => {
        console.log("CONNECTED TO ATLAS! Starting data migration...");
        seedData();
    })
    .catch(err => {
        console.error("Connection Error:", err);
        console.log("Check your IP Access List in Atlas (Network Access -> Allow 0.0.0.0/0)");
        process.exit(1);
    });

const loadJSON = (file) => {
    try {
        const filePath = path.join(__dirname, 'data', file);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (err) {
        console.log(`Skipping ${file} (not found or empty).`);
        return [];
    }
};

const seedData = async () => {
    try {
        // --- STUDENTS ---
        const students = loadJSON('students.json');
        if (students.length > 0) {
            console.log(`Uploading ${students.length} Students...`);
            await Student.deleteMany({});
            await Student.insertMany(students);
        }

        // --- ASSIGNMENTS ---
        const assignments = loadJSON('assignments.json');
        if (assignments.length > 0) {
            console.log(`Uploading ${assignments.length} Assignments...`);
            await Assignment.deleteMany({});
            await Assignment.insertMany(assignments);
        }

        // --- EXAMS ---
        const exams = loadJSON('cbt_exams.json');
        if (exams.length > 0) {
            console.log(`Uploading ${exams.length} Exams...`);
            await CBTExam.deleteMany({});
            await CBTExam.insertMany(exams);
        }

        // --- NEWS ---
        const news = loadJSON('news.json');
        if (news.length > 0) {
            console.log(`Uploading ${news.length} News Articles...`);
            await News.deleteMany({});
            await News.insertMany(news);
        }

        // --- GALLERY ---
        const gallery = loadJSON('gallery.json');
        if (gallery.length > 0) {
            console.log(`Uploading ${gallery.length} Gallery Images...`);
            await Gallery.deleteMany({});
            await Gallery.insertMany(gallery);
        }

        // --- CONFIG ---
        // Try to load config.json, if not found, try to create default
        let configData = loadJSON('config.json');

        // Handle object vs array for config (Config is singleton object usually)
        if (Array.isArray(configData) && configData.length > 0) configData = configData[0];

        if (configData && Object.keys(configData).length > 0) {
            console.log("Uploading School Configuration...");
            await Config.deleteMany({});
            await Config.create(configData);
        } else {
            console.log("No local config.json found. Creating default...");
            // Optional: Create default if missing
            await Config.deleteMany({});
            await Config.create({
                name: "Government Boys Science Secondary School Jere",
                motto: "The creative minds",
                // ... minimal defaults
            });
        }

        console.log("SUCCESS! Your data is now in the Cloud.");
        console.log("Visit your deployed website to see the changes.");
        process.exit(0);

    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
};
