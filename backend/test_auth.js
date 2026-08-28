const testAuth = async () => {
  const baseUrl = 'http://localhost:3000/api/auth';
  
  console.log('--- Testing Register ---');
  const email = `testuser_${Date.now()}@example.com`;
  const registerRes = await fetch(`${baseUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
  });
  
  const registerData = await registerRes.json();
  console.log('Register Status:', registerRes.status);
  console.log('Register Data:', registerData);
  
  if (registerRes.status !== 201) {
    console.error('Registration failed. Are the tables created?');
    return;
  }
  
  console.log('\n--- Testing Login ---');
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  });
  
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status);
  console.log('Login Data:', loginData);
  
  const token = loginData.token;
  
  console.log('\n--- Testing Me ---');
  const meRes = await fetch(`${baseUrl}/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meData = await meRes.json();
  console.log('Me Status:', meRes.status);
  console.log('Me Data:', meData);
  
  console.log('\n--- Testing Invalid Token ---');
  const invalidMeRes = await fetch(`${baseUrl}/me`, {
    headers: { 'Authorization': `Bearer invalid_token` }
  });
  console.log('Invalid Token Status:', invalidMeRes.status);
};

testAuth();
