require('dotenv').config();
const mongoose = require('mongoose');
const AdmissionPin = require('./models/AdmissionPin');

const MONGO_URI = process.env.MONGO_URI;

async function checkPins() {
    try {
        if (!MONGO_URI) {
            console.error("MONGO_URI not found");
            process.exit(1);
        }
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        const pins = await AdmissionPin.find().sort({ createdAt: -1 }).limit(10);
        console.log("Last 10 PINs:");
        console.log(JSON.stringify(pins, null, 2));

        const pinsWithoutName = await AdmissionPin.countDocuments({
            $or: [
                { candidateName: { $exists: false } },
                { candidateName: null },
                { candidateName: "" }
            ]
        });
        console.log(`Total PINs without candidate name: ${pinsWithoutName}`);

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkPins();
