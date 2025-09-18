const https = require('http');

// Test login API
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
      console.log('Response:', JSON.parse(data));
      
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        if (response.success && response.data.token) {
          console.log('✅ Login successful!');
          testProfile(response.data.token);
        }
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Login test failed:', e.message);
  });

  req.write(postData);
  req.end();
}

// Test profile API
function testProfile(token) {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/profile',
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
      console.log('\n👤 Profile Test:');
      console.log('Status:', res.statusCode);
      console.log('Response:', JSON.parse(data));
      
      if (res.statusCode === 200) {
        console.log('✅ Profile test successful!');
        testFiles(token);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Profile test failed:', e.message);
  });

  req.end();
}

// Test files API
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
      console.log('Response:', JSON.parse(data));
      
      if (res.statusCode === 200) {
        console.log('✅ Files test successful!');
        console.log('\n🎉 All API tests completed successfully!');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Files test failed:', e.message);
  });

  req.end();
}

// Start tests
console.log('🧪 Starting API tests...\n');
testLogin();
