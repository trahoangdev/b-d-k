const https = require('http');
const fs = require('fs');
const FormData = require('form-data');

// Create a test file
const testContent = 'This is a test file for Big Data Keeper upload functionality.';
fs.writeFileSync('test-file.txt', testContent);

// Test login first
function testLogin() {
  const postData = JSON.stringify({
    email: 'admin@bigdatakeeper.com',
    password: 'admin123'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('🔐 Login Test:');
      console.log('Status:', res.statusCode);
      const response = JSON.parse(data);
      console.log('Response:', response);
      
      if (res.statusCode === 200 && response.success && response.data.token) {
        console.log('✅ Login successful!');
        testUpload(response.data.token);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Login test failed:', e.message);
  });

  req.write(postData);
  req.end();
}

// Test file upload
function testUpload(token) {
  const form = new FormData();
  form.append('file', fs.createReadStream('test-file.txt'));

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/files/upload',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📤 Upload Test:');
      console.log('Status:', res.statusCode);
      const response = JSON.parse(data);
      console.log('Response:', response);
      
      if (res.statusCode === 201 && response.success) {
        console.log('✅ Upload successful!');
        testFiles(token);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Upload test failed:', e.message);
  });

  form.pipe(req);
}

// Test get files
function testFiles(token) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/files',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📁 Files Test:');
      console.log('Status:', res.statusCode);
      const response = JSON.parse(data);
      console.log('Response:', response);
      
      if (res.statusCode === 200 && response.success) {
        console.log('✅ Files test successful!');
        console.log(`📊 Found ${response.data.files.length} files`);
        
        // Clean up test file
        fs.unlinkSync('test-file.txt');
        console.log('\n🎉 All file upload tests completed successfully!');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Files test failed:', e.message);
  });

  req.end();
}

// Start tests
console.log('🧪 Starting file upload tests...\n');
testLogin();
