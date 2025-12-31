async function createUser() {
  const userData = {
    fullName: "John Doe",
    email: "john.doe@example.com",
    password: "Password123!",
    role: "FREELANCER"
  };

  try {
    const response = await fetch('http://localhost:4500/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Body:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createUser();
