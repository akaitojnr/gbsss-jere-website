const mongoose = require('mongoose');
const Student = require('./models/Student');

async function check() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';
    await mongoose.connect(MONGO_URI);
    console.log('Connected');

    const students = await Student.find({}, 'regNumber name isBlocked results termlyResults');
    console.log(`Checking ${students.length} students...`);

    students.forEach(s => {
        const hasLegacy = s.results && s.results.length > 0;
        const hasTermly = s.termlyResults && s.termlyResults.length > 0;
        
        if (!hasLegacy && !hasTermly) {
            console.log(`[!] Student ${s.regNumber} (${s.name}) has NO results. Blocked: ${s.isBlocked}`);
        } else {
            console.log(`[OK] Student ${s.regNumber} (${s.name}) has ${s.results.length} legacy and ${s.termlyResults.length} termly results. Blocked: ${s.isBlocked}`);
        }
    });

    await mongoose.disconnect();
}

check();
