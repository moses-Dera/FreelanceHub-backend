import dotenv from 'dotenv';
dotenv.config();
import sendEmail from './utils/email.js';

const testEmail = async () => {
    console.log('--- Email Debugger ---');
    console.log('Backend URL:', process.env.frontend_url || 'http://localhost:3000');
    console.log('API Key Present:', !!process.env.INTERNAL_API_KEY);
    if (process.env.INTERNAL_API_KEY) {
        console.log('API Key present');
    } else {
        console.error('CRITICAL: INTERNAL_API_KEY is missing in backend .env');
    }

    console.log('\nAttemping to send test email...');
    const result = await sendEmail({
        to: 'okonkwomoses158@gmail.com',
        subject: 'Welcome to FreelanceHub!',
        text: `Hi Moses, welcome to FreelanceHub! We're excited to have you on board.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Welcome to FreelanceHub!</h2>
                <p>Hi Moses,</p>
                <p>We're thrilled to have you join our community of freelancers and clients.</p>
                <p>Get started by setting up your profile or browsing available jobs.</p>
                <br>
                <p>Best regards,</p>
                <p>The FreelanceHub Team</p>
            </div>
        `
    });

    console.log('\nResult:', JSON.stringify(result, null, 2));
};

testEmail();
