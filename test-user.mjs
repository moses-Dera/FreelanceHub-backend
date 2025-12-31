import fetch from 'node-fetch';

const registerUser = async () => {
  const userData = {
    fullName: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "FREELANCER"
  };

  try {
    const response = await fetch('http://localhost:4500/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
};

registerUser();
