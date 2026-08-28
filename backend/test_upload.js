const fs = require('fs');
const path = require('path');
const authService = require('./src/services/auth/authService');

const testUpload = async () => {
  const token = authService.generateToken('test-user-123');

  // Create a fake EXE masquerading as a PNG
  // MZ header is 4D 5A -> 4d5a9000
  const fakeExe = Buffer.from('4d5a90000300000004000000ffff0000', 'hex');
  fs.writeFileSync('fake.png', fakeExe);

  console.log('Testing upload of fake EXE named fake.png');
  
  const formData = new FormData();
  formData.append('document', new Blob([fakeExe], { type: 'image/png' }), 'fake.png');

  try {
    const res = await fetch('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
    
    if (res.status === 400 && data.error && data.error.includes('Invalid file content')) {
      console.log('✅ Fake EXE was successfully rejected!');
    } else {
      console.log('❌ Fake EXE was NOT rejected as expected.');
    }
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    if (fs.existsSync('fake.png')) fs.unlinkSync('fake.png');
  }
};

testUpload();
