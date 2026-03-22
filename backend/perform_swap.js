
const mongoose = require('mongoose');
require('dotenv').config();
const Student = require('./models/Student');

// Mock a simple version of calculateClassRankings if needed, 
// but we can just import from server.js if it was exported.
// Since it's not exported in server.js (usually), we might need to copy logic or just rely on the next update.
// Actually, let's just do the manual update and then the user can trigger rank recalculated if they want, 
// OR we can try to see if we can find a way to trigger it.

async function performSwap() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const fromReg = '421860';
        const toReg = '742365';

        const studentFrom = await Student.findOne({ regNumber: fromReg });
        const studentTo = await Student.findOne({ regNumber: toReg });

        if (!studentFrom || !studentTo) {
            console.error('One or both students not found!');
            process.exit(1);
        }

        console.log(`Swapping data from ${studentFrom.name} (${fromReg}) to ${studentTo.name} (${toReg})`);
        
        // Backup results to move
        const resultsToMove = studentFrom.results || [];
        const termlyResultsToMove = studentFrom.termlyResults || [];
        const positionToMove = studentFrom.position || 'N/A';

        // Move to target
        studentTo.results = resultsToMove;
        studentTo.termlyResults = termlyResultsToMove;
        studentTo.position = positionToMove;

        // Clear from source
        studentFrom.results = [];
        studentFrom.termlyResults = [];
        studentFrom.position = 'N/A';

        await studentTo.save();
        await studentFrom.save();

        console.log('Swap completed successfully!');
        console.log(`${studentTo.name} now has ${studentTo.termlyResults.length} termly results.`);
        console.log(`${studentFrom.name} now has ${studentFrom.termlyResults.length} termly results.`);

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
}

performSwap();
