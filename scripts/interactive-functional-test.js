const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on('error', reject);
  });
}

async function runInteractiveTests() {
  console.log('===========================================================');
  console.log('      INTERACTIVE Q&A & SYSTEM BEHAVIOR VALIDATION         ');
  console.log('===========================================================');

  let passed = 0;
  let total = 0;

  // Test 1: Preference recommendation engine
  total++;
  const recRes = await get('http://localhost:3001/api/routes?origin=Hebbal&destination=Electronic%20City&preference=fastest');
  if (recRes.status === 200 && recRes.data.routes && recRes.data.routes.length > 0) {
    const top = recRes.data.routes[0];
    console.log(`[PASS] 1. Preference Engine (Fastest): Top route "${top.name}" with score ${top.matchScore}`);
    passed++;
  } else {
    console.log('[FAIL] 1. Preference Engine failed');
  }

  // Test 2: Live Transit Telemetry Feed
  total++;
  const liveRes = await get('http://localhost:3001/api/transit/live');
  if (liveRes.status === 200 && Array.isArray(liveRes.data.routes) && liveRes.data.routes.length >= 4) {
    console.log(`[PASS] 2. Real-Time Telemetry: Tracking ${liveRes.data.routes.length} corridors (${liveRes.data.networkStats.networkPunctuality}% punctuality, ${liveRes.data.updates.length} live incident updates)`);
    passed++;
  } else {
    console.log('[FAIL] 2. Real-Time Telemetry failed');
  }

  // Test 3: Incident Notifications Feed
  total++;
  const notifRes = await get('http://localhost:3001/api/notifications');
  if (notifRes.status === 200 && Array.isArray(notifRes.data.notifications) && notifRes.data.notifications.length > 0) {
    console.log(`[PASS] 3. Dynamic Disruption Feed: ${notifRes.data.notifications.length} alerts loaded`);
    passed++;
  } else {
    console.log('[FAIL] 3. Disruption Feed failed');
  }

  // Test 4: Commuter Feedback Submission
  total++;
  const feedbackRes = await post('http://localhost:3001/api/feedback', {
    routeId: 'R-BLUE-01',
    rating: 5,
    category: 'Crowding',
    comment: 'Real-time vehicle beacon and alternate bypass worked seamlessly at Indiranagar!'
  });
  if (feedbackRes.status === 200 && feedbackRes.data.success) {
    console.log(`[PASS] 4. Feedback & Commuter Q&A: Successfully submitted rating & comment`);
    passed++;
  } else {
    console.log('[FAIL] 4. Feedback Submission failed', feedbackRes);
  }

  // Test 5: Saved Journey Bookmark
  total++;
  const saveRes = await post('http://localhost:3001/api/saved-journeys', {
    name: 'Daily QA Test Commute',
    origin: 'Indiranagar',
    destination: 'Whitefield',
    preferredMode: 'Metro',
    estimatedTime: 25,
    estimatedFare: 40
  });
  if (saveRes.status === 200 && saveRes.data.savedJourney) {
    console.log(`[PASS] 5. Journey Persistence: Successfully saved commute bookmark "${saveRes.data.savedJourney.name}"`);
    passed++;
  } else {
    console.log('[FAIL] 5. Journey Persistence failed', saveRes);
  }

  // Test 6: System Status & Fallback Integrity
  total++;
  const statusRes = await get('http://localhost:3001/api/system/status');
  if (statusRes.status === 200 && statusRes.data.systemMetrics) {
    console.log(`[PASS] 6. Dual-Mode DB Engine: ${statusRes.data.systemMetrics.routesCount} routes loaded, mode: "${statusRes.data.database.mode}", operational`);
    passed++;
  } else {
    console.log('[FAIL] 6. System Status failed', statusRes);
  }

  console.log('-----------------------------------------------------------');
  console.log(`Interactive Verification: ${passed}/${total} TESTS PASSED`);
  console.log(`Result: ${passed === total ? 'ALL INTERACTIVE SYSTEMS FULLY OPERATIONAL' : 'ERRORS DETECTED'}`);
  console.log('===========================================================\n');
}

runInteractiveTests();
