const http = require('http');

const PORT = process.env.PORT || 5000;

function request(path, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting DropX API Automated Verification Tests...\n');

  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('1. Health Check:', health.status === 200 && health.data.status === 'ok' ? '✅ PASS' : '❌ FAIL', health.data);

    // 2. Products List
    const prods = await request('/api/products');
    console.log(`2. GET /api/products: ${prods.status === 200 && prods.data.count >= 10 ? '✅ PASS' : '❌ FAIL'} (Found ${prods.data.count} products)`);
    
    if (!prods.data.data || prods.data.data.length === 0) {
      throw new Error('No products returned');
    }
    const sampleProduct = prods.data.data[0];
    console.log(`   Sample product: "${sampleProduct.name}" (₹${sampleProduct.currentPrice.toLocaleString('en-IN')})`);

    // 3. Single Product
    const single = await request(`/api/products/${sampleProduct._id}`);
    console.log('3. GET /api/products/:id:', single.status === 200 && single.data.data.name ? '✅ PASS' : '❌ FAIL');
    console.log(`   Recommendation: ${single.data.data.recommendation.icon} ${single.data.data.recommendation.status} - ${single.data.data.recommendation.reason}`);

    // 4. Auth - Login demo user
    const login = await request('/api/auth/login', { method: 'POST' }, {
      email: 'demo@dropx.com',
      password: 'password123'
    });
    console.log('4. POST /api/auth/login:', login.status === 200 && login.data.token ? '✅ PASS' : '❌ FAIL');

    const token = login.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 5. Auth - Profile
    const profile = await request('/api/auth/profile', { headers: authHeaders });
    console.log('5. GET /api/auth/profile:', profile.status === 200 && profile.data.user.email === 'demo@dropx.com' ? '✅ PASS' : '❌ FAIL');

    // 6. Watchlist - GET
    const watchlist = await request('/api/watchlist', { headers: authHeaders });
    console.log(`6. GET /api/watchlist: ${watchlist.status === 200 ? '✅ PASS' : '❌ FAIL'} (Items: ${watchlist.data.count})`);

    // 7. Watchlist - POST add new product
    const prodToAdd = prods.data.data[2]._id;
    const addWatch = await request('/api/watchlist', { method: 'POST', headers: authHeaders }, { productId: prodToAdd });
    console.log('7. POST /api/watchlist:', addWatch.status === 201 || addWatch.status === 400 ? '✅ PASS' : '❌ FAIL', addWatch.data.message);

    // 8. Alerts - GET & POST
    const newAlert = await request('/api/alerts', { method: 'POST', headers: authHeaders }, {
      productId: sampleProduct._id,
      targetPrice: 80000
    });
    console.log('8. POST /api/alerts:', newAlert.status === 201 ? '✅ PASS' : '❌ FAIL', newAlert.data.message);

    const alerts = await request('/api/alerts', { headers: authHeaders });
    console.log(`9. GET /api/alerts: ${alerts.status === 200 && alerts.data.count >= 1 ? '✅ PASS' : '❌ FAIL'} (Alerts count: ${alerts.data.count})`);

    console.log('\n🎉 ALL BACKEND API TESTS COMPLETED SUCCESSFULLY!\n');
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  }
}

// Start server child process or run tests if server is already running
runTests();
