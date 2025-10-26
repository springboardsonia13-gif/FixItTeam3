// Test script for admin registration endpoint
const http = require('http');

const data = JSON.stringify({
  name: 'Test Admin',
  email: 'testadmin@example.com',
  password: 'Test123456',
  location: 'Test City',
  phone: '1234567890',
  role: 'ADMIN'
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/admin-register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS:`, res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE BODY:', body);
    try {
      console.log('PARSED:', JSON.parse(body));
    } catch (e) {
      console.log('Could not parse response');
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

console.log('Sending request to backend...');
req.write(data);
req.end();
