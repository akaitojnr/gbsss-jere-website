const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
    const logFile = path.join(__dirname, 'test_output.txt');
    const log = (msg) => fs.appendFileSync(logFile, msg + '\n');

    try {
        fs.writeFileSync(logFile, 'Starting test...\n');

        // Create a dummy CSV file
        const filePath = path.join(__dirname, 'test_questions.csv');
        const csvContent = "Question,Option A,Option B,Option C,Option D,Correct Answer\nWhat is 2+2?,1,2,3,4,D";
        fs.writeFileSync(filePath, csvContent);

        const form = new FormData();
        form.append('file', fs.createReadStream(filePath));

        log('Attempting to upload file to http://localhost:3000/api/import-questions...');

        const response = await axios.post('http://localhost:3000/api/import-questions', form, {
            headers: {
                ...form.getHeaders()
            },
            validateStatus: () => true // Don't throw on error status
        });

        log(`Status: ${response.status}`);
        log(`Data: ${JSON.stringify(response.data, null, 2)}`);

        // Cleanup
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    } catch (error) {
        log(`Test script error: ${error.message}`);
        if (error.response) {
            log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
        } else if (error.code === 'ECONNREFUSED') {
            log('Connection refused. Is the server running on port 3000?');
        }
    }
}

testUpload();
