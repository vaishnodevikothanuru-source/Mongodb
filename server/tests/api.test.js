/**
 * Basic Integration Smoke Tests for Server APIs
 */
const http = require('http');

console.log('--- Running API Smoke Test Script ---');

const testEndpoint = (path, method = 'GET') => {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on('error', (e) => {
      resolve({ error: e.message });
    });

    req.end();
  });
};

const runTests = async () => {
  console.log('Testing /api/health...');
  const res = await testEndpoint('/api/health');
  console.log('Health check result:', res);
};

if (require.main === module) {
  runTests();
}

module.exports = { testEndpoint };
