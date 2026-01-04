import fetch from 'node-fetch';

const run = async () => {
    const url = 'http://localhost:3000/api/email';
    const key = 'bcsiiafgaklsaliqofmxdnxbxvfa'; // The correct key we verified

    console.log('Testing with hardcoded key:', key);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: key,
                to: 'okonkwomoses158@gmail.com',
                subject: 'Manual Test (Hardcoded)',
                text: 'This uses the hardcoded key.',
                html: '<p>This uses the hardcoded key.</p>'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Body:', data);
    } catch (e) {
        console.error(e);
    }
};

run();
