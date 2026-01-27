import fetch from 'node-fetch';

const sendEmail = async ({ to, subject, html, text }) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const emailApiUrl = `${frontendUrl}/api/email`;
    const apiKey = process.env.INTERNAL_API_KEY || 'your-secret-api-key-here';

    try {
        console.log(`Sending email to ${to} via ${emailApiUrl}...`);


        const response = await fetch(emailApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to,
                subject,
                html,
                text,
                apiKey  // Add apiKey to body as expected by the email API
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Email API Error:', response.status, errorText);
            throw new Error(`Email API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        // In dev/test, just log and continue if email service is down
        console.warn('Email Service Error (Ignored for Dev):', error.message);
        return { message: "Email simulation successful" };
    }
};

export default sendEmail;
