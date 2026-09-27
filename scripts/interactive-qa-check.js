const http = require('http');

const endpoints = [
  { name: 'Home Landing Page', path: '/' },
  { name: 'Dashboard Hub', path: '/dashboard' },
  { name: 'Multi-Modal Route Planner', path: '/planner' },
  { name: 'Routes Explorer', path: '/routes' },
  { name: 'Route Detail (Blue Line)', path: '/routes/R-BLUE-01' },
  { name: 'Live Transit Realtime Cockpit', path: '/live-transit' },
  { name: 'Saved Journeys', path: '/saved-journeys' },
  { name: 'Trip History & Receipts', path: '/history' },
  { name: 'Commuter Analytics & Insights', path: '/analytics' },
  { name: 'User Profile & Preferences', path: '/profile' },
  { name: 'Application Settings', path: '/settings' },
  { name: 'Fleet & Dispatch Admin', path: '/admin' },
  { name: 'User Authentication (Login)', path: '/login' },
  { name: 'User Registration', path: '/register' },
  { name: 'API: Route Catalog', path: '/api/routes' },
  { name: 'API: Live GPS Transit Feeds', path: '/api/transit/live' },
  { name: 'API: System Alerts & Notifications', path: '/api/notifications' },
  { name: 'API: Commuter Analytics Feed', path: '/api/analytics' },
  { name: 'API: Admin Stats & Telemetry', path: '/api/admin/stats' },
  { name: 'API: Dual-Mode DB System Status', path: '/api/system/status' }
];

async function checkPort(port) {
  let passed = 0;
  let failed = 0;
  console.log(`\n======================================================`);
  console.log(`   RUNNING INTERACTIVE QA CHECK ON PORT ${port}       `);
  console.log(`======================================================`);

  for (const ep of endpoints) {
    const url = `http://localhost:${port}${ep.path}`;
    await new Promise((resolve) => {
      const req = http.get(url, (res) => {
        let size = 0;
        res.on('data', chunk => { size += chunk.length; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            console.log(`[PASS] [${res.statusCode}] ${ep.name.padEnd(35)} -> ${ep.path} (${size} B)`);
            passed++;
          } else {
            console.log(`[FAIL] [${res.statusCode}] ${ep.name.padEnd(35)} -> ${ep.path}`);
            failed++;
          }
          resolve();
        });
      });
      req.on('error', (err) => {
        console.log(`[ERROR] ${ep.name.padEnd(35)} -> ${err.message}`);
        failed++;
        resolve();
      });
      req.setTimeout(5000, () => {
        req.destroy();
        console.log(`[TIMEOUT] ${ep.name.padEnd(35)} -> ${ep.path}`);
        failed++;
        resolve();
      });
    });
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`QA Result: ${passed}/${endpoints.length} PASSED (${failed} FAILED)`);
  console.log(`Status: ${failed === 0 ? 'ALL SYSTEMS OPERATIONAL & HEALTHY' : 'NEEDS ATTENTION'}`);
  console.log(`------------------------------------------------------\n`);
  return { passed, failed };
}

async function run() {
  await checkPort(3001);
}

run();
