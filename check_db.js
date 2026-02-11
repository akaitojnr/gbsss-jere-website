require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Config = require('./backend/models/Config');

const MONGO_URI = process.env.MONGO_URI;

async function checkConfig() {
    try {
        if (!MONGO_URI) {
            console.error("MONGO_URI not found in .env");
            process.exit(1);
        }
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");
        const config = await Config.findOne();
        console.log("Current Config in DB:");
        console.log(JSON.stringify(config, null, 2));
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkConfig();
