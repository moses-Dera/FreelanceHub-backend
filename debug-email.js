import dotenv from 'dotenv';
dotenv.config();
import sendEmail from './utils/email.js';

const testEmail = async () => {
    console.log('--- Email Debugger ---');
    console.log('Backend URL:', process.env.frontend_url || 'http://localhost:3000');
    console.log('API Key Present:', !!process.env.INTERNAL_API_KEY);
    if (process.env.INTERNAL_API_KEY) {
        console.log('API Key found');
        const fs = require('fs');
        fs.writeFileSync('temp_key.txt', process.env.INTERNAL_API_KEY);
    } else {
        console.error('CRITICAL: INTERNAL_API_KEY is missing in backend .env');
    }

    console.log('\nAttemping to send test email...');
    const result = await sendEmail({
        to: 'test-recipient@example.com', // Replace with your email if you want to really test delivery, but this tests the API call
        subject: 'Debug Test Email',
        text: 'This is a test email from the debugger.',
        html: '<p>This is a test email from the debugger.</p>'
    });

    console.log('\nResult:', JSON.stringify(result, null, 2));
};

testEmail();
