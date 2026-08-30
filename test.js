const http = require('http');

const data = JSON.stringify({
  name: 'TestUser',
  email: 'test' + Date.now() + '@example.com',
  password: 'password123'
});

const req = http.request('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    console.log('Register:', json);
    
    // Now try to update profile
    const token = json.token;
    
    // We will use multipart/form-data
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    let formData = '--' + boundary + '\r\n';
    formData += 'Content-Disposition: form-data; name="name"\r\n\r\n';
    formData += 'Jaswanth\r\n';
    formData += '--' + boundary + '\r\n';
    formData += 'Content-Disposition: form-data; name="phone_number"\r\n\r\n';
    formData += '9392713779\r\n';
    formData += '--' + boundary + '--\r\n';

    const req2 = http.request('http://localhost:3000/api/auth/me', {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': formData.length
      }
    }, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        console.log('Update Profile Status:', res2.statusCode);
        console.log('Update Profile Response:', body2);
      });
    });
    
    req2.write(formData);
    req2.end();
  });
});

req.write(data);
req.end();
