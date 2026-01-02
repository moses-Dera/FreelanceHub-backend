import fetch from 'node-fetch';

const sendEmail = async ({ to, subject, html, text }) => {
    // Check if configuration exists
    const emailApiUrl = process.env.frontend_url ? `${process.env.frontend_url}/api/email` : 'http://localhost:3000/api/email';
    const apiKey = process.env.INTERNAL_API_KEY || 'default-secret-key';

    try {
        console.log(`Sending email to ${to} via ${emailApiUrl}...`);

        const response = await fetch(emailApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiKey,
                to,
                subject,
                html,
                text
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to send email via microservice');
        }

        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Email Service Error:', error.message);
        // Fallback or re-throw depending on criticality
        // For now, we log but don't crash the request if email fails (unless critical)
        return { success: false, error: error.message };
    }
};

export default sendEmail;
