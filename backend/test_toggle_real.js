const mongoose = require('mongoose');
const Student = require('./models/Student');

async function test() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';
    await mongoose.connect(MONGO_URI);
    console.log('Connected');

    const reg = 'SCH/2026/001'; // Ibrahim Musa
    const student = await Student.findOne({ regNumber: reg });
    console.log(`Original student: ${student.name}, Results: ${student.results.length}, Termly: ${student.termlyResults.length}`);
    
    // Toggle Block
    student.isBlocked = true;
    await student.save();
    console.log('Blocked student');

    const sBlocked = await Student.findOne({ regNumber: reg });
    console.log(`Blocked state: ${sBlocked.name}, Results: ${sBlocked.results.length}, Termly: ${sBlocked.termlyResults.length}`);

    // Toggle Unblock
    sBlocked.isBlocked = false;
    await sBlocked.save();
    console.log('Unblocked student');

    const sFinal = await Student.findOne({ regNumber: reg });
    console.log(`Final state: ${sFinal.name}, Results: ${sFinal.results.length}, Termly: ${sFinal.termlyResults.length}`);

    await mongoose.disconnect();
}

test();
