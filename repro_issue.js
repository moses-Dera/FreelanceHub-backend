
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000/api';

async function main() {
    // 1. Create a fresh freelancer
    console.log('Creating Freelancer...');
    const email = `testfreelancer_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            firstName: 'Test',
            lastName: 'Freelancer',
            email,
            password: 'password123',
            role: 'FREELANCER' // Explicitly asking for FREELANCER
        })
    });

    const regData = await regRes.json().catch(() => ({}));
    console.log('Register Response:', regRes.status, regData);

    // Proceed to login even if 500, assuming user might have been created before email failure


    // 2. Login (to get token, though register might not return it directly in some impls, 
    // but the controller says generic json. The frontend handles login after register? 
    // No, register returns userId. We need to login.)
    console.log('Logging in...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password: 'password123'
        })
    });

    const loginData = await loginRes.json();
    console.log('Login Response:', loginRes.status, loginData.user ? { role: loginData.user.role } : loginData);

    if (!loginData.token) {
        console.error('No token received');
        return;
    }

    const token = loginData.token;

    // 3. Try to access /proposals/me
    console.log('Accessing /proposals/me ...');
    const propRes = await fetch(`${BASE_URL}/proposals/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const propData = await propRes.text();
    console.log('Proposals/Me Response:', propRes.status, propData);

}

main().catch(console.error);
