require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./models/Config');

const MONGO_URI = process.env.MONGO_URI;

async function checkConfig() {
    try {
        if (!MONGO_URI) {
            console.error("MONGO_URI not found in .env");
            process.exit(1);
        }
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");
        const configs = await Config.find({}).lean();
        console.log(`Found ${configs.length} configs.`);
        configs.forEach((c, i) => {
            console.log(`Config ${i}:`);
            console.log(JSON.stringify(c, null, 2));
        });
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkConfig();
