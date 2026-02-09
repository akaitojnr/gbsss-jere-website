const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testPinFlow() {
    try {
        console.log('1. Generating a new PIN...');
        const genRes = await axios.post(`${API_URL}/admission-pins`, {
            count: 1,
            candidateName: 'Test User'
        });

        if (!genRes.data.success) {
            console.error('Failed to generate PIN:', genRes.data);
            return;
        }

        const newPin = genRes.data.pins[0];
        console.log('Generated PIN:', newPin);

        console.log('2. Validating the generated PIN...');
        const valRes = await axios.post(`${API_URL}/admission-pins/validate`, {
            code: newPin.code
        });

        console.log('Validation Response:', valRes.data);

        if (valRes.data.success) {
            console.log('✅ PIN Validation PASSED');
        } else {
            console.error('❌ PIN Validation FAILED');
        }

    } catch (error) {
        console.error('Error during test:');
        if (error.response) {
            console.error('Data:', error.response.data);
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('Request made but no response received:', error.request);
        } else {
            console.error('Error message:', error.message);
        }
        console.error('Config:', error.config);
    }
}

testPinFlow();
