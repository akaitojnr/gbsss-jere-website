const mongoose = require('mongoose');
const Student = require('./models/Student');

async function test() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';
    await mongoose.connect(MONGO_URI);
    console.log('Connected');

    const reg = 'TEST_TERMLY_888';
    await Student.deleteOne({ regNumber: reg });

    // Create student with termly results
    const student = new Student({
        regNumber: reg,
        password: 'pass',
        name: 'Termly Student',
        class: 'SS1 A',
        termlyResults: [{ 
            term: '1st Term', 
            session: '2025/2026', 
            results: [{ subject: 'Math', score: 90, grade: 'A' }] 
        }]
    });
    await student.save();
    console.log('Created student with termly results');

    // Toggle Block via logic similar to endpoint
    const s1 = await Student.findOne({ regNumber: reg });
    s1.isBlocked = true;
    await s1.save();
    console.log('Blocked student');

    // Toggle Unblock
    const s2 = await Student.findOne({ regNumber: reg });
    s2.isBlocked = false;
    await s2.save();
    console.log('Unblocked student');

    const sFinal = await Student.findOne({ regNumber: reg });
    console.log('Final student block status:', sFinal.isBlocked);
    console.log('Termly results count:', sFinal.termlyResults.length);
    if (sFinal.termlyResults.length > 0) {
        console.log('Termly results[0] scores count:', sFinal.termlyResults[0].results.length);
    }

    await mongoose.disconnect();
}

test();
