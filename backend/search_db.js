require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

async function searchDB() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log(`Databases: ${dbs.databases.map(d => d.name).join(', ')}`);

        for (const dbInfo of dbs.databases) {
            const dbName = dbInfo.name;
            if (dbName === 'admin' || dbName === 'local' || dbName === 'config') continue;

            console.log(`Searching DB: ${dbName}...`);
            const db = mongoose.connection.useDb(dbName);
            const collections = await db.db.listCollections().toArray();

            for (const col of collections) {
                const docs = await db.db.collection(col.name).find({}).toArray();
                for (const doc of docs) {
                    const str = JSON.stringify(doc);
                    if (str.toLowerCase().includes("restored") || str.toLowerCase().includes("v1.0")) {
                        console.log(`Match found in DB: ${dbName}, collection: ${col.name}`);
                        console.log(JSON.stringify(doc, null, 2));
                    }
                }
            }
        }
        console.log("Search completed.");
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

searchDB();
