
const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./models/Student');

async function checkStudents() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const regs = ['421860', '742365'];
        for (const reg of regs) {
            const student = await Student.findOne({ regNumber: reg });
            if (student) {
                console.log(`Student Found: ${student.name} (${student.regNumber})`);
                console.log(`- Legacy Results Count: ${student.results?.length || 0}`);
                console.log(`- Termly Results Count: ${student.termlyResults?.length || 0}`);
                console.log(`- Position: ${student.position}`);
            } else {
                console.log(`Student NOT found: ${reg}`);
            }
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

checkStudents();
