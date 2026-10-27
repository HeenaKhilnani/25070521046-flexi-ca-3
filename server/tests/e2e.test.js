import { EventEmitter } from 'events';
import assert from 'assert';
import { createServer } from '../src/server.js';

let passed = 0;
let total = 0;

function it(desc, fn) {
  total += 1;
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    passed += 1;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message}`);
  }
}

async function itAsync(desc, fn) {
  total += 1;
  try {
    await fn();
    console.log(`  ✓ ${desc}`);
    passed += 1;
  } catch (err) {
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message}`);
  }
}

/**
 * In-memory HTTP Request/Response Simulator.
 * Allows full E2E testing of Router, Middlewares, Handlers, and Security Headers
 * without requiring OS socket bindings.
 */
function simulateRequest(router, method, url, body = null, headers = {}) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method.toUpperCase();
    req.url = url;
    req.headers = {
      host: 'localhost:5000',
      ...headers
    };
    req.socket = { remoteAddress: '127.0.0.1' };

    const resHeaders = {};
    let responseBody = '';
    let ended = false;

    const res = {
      statusCode: 200,
      headersSent: false,
      writableEnded: false,
      setHeader(name, value) {
        resHeaders[name.toLowerCase()] = value;
      },
      getHeader(name) {
        return resHeaders[name.toLowerCase()];
      },
      write(chunk) {
        responseBody += chunk.toString();
      },
      end(chunk) {
        if (chunk) responseBody += chunk.toString();
        this.writableEnded = true;
        this.headersSent = true;
        ended = true;

        let json = null;
        try {
          json = JSON.parse(responseBody);
        } catch {
          json = responseBody;
        }

        resolve({
          statusCode: res.statusCode,
          headers: resHeaders,
          data: json
        });
      }
    };

    // Invoke router pipeline
    router.handleRequest(req, res);

    // Push body chunks
    if (body) {
      const payload = typeof body === 'object' ? JSON.stringify(body) : body;
      req.emit('data', Buffer.from(payload));
    }
    req.emit('end');
  });
}

async function runE2ETests() {
  console.log('========================================================');
  console.log('🌐 NEXTEST HTTP SERVER E2E INTEGRATION & SECURITY TESTS');
  console.log('========================================================\n');

  const { router } = createServer();

  // 1. Health Endpoint
  await itAsync('GET /api/health responds with 200 and server metadata', async () => {
    const res = await simulateRequest(router, 'GET', '/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.status, 'ok');
    assert.strictEqual(res.data.service, 'NEXTEST API Server');
    assert.ok(typeof res.data.uptimeSeconds === 'number');
  });

  // 2. Security Headers
  await itAsync('Applies HTTP security headers to responses', async () => {
    const res = await simulateRequest(router, 'GET', '/api/health');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(res.headers['x-frame-options'], 'DENY');
    assert.strictEqual(res.headers['x-xss-protection'], '1; mode=block');
    assert.strictEqual(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
  });

  // 3. CORS Preflight
  await itAsync('OPTIONS requests return 204 No Content with CORS headers', async () => {
    const res = await simulateRequest(router, 'OPTIONS', '/api/auth/login', null, {
      origin: 'http://localhost:5173'
    });
    assert.strictEqual(res.statusCode, 204);
    assert.strictEqual(res.headers['access-control-allow-origin'], 'http://localhost:5173');
    assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
  });

  // 4. Registration Input Validation
  await itAsync('POST /api/auth/register rejects missing or short password', async () => {
    const res = await simulateRequest(router, 'POST', '/api/auth/register', {
      name: 'Alex Student',
      email: 'alex@college.edu',
      password: '123',
      confirmPassword: '123'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
    assert.ok(res.data.errors?.password);
  });

  await itAsync('POST /api/auth/register rejects password confirmation mismatch', async () => {
    const res = await simulateRequest(router, 'POST', '/api/auth/register', {
      name: 'Alex Student',
      email: 'alex@college.edu',
      password: 'password123',
      confirmPassword: 'differentPassword456'
    });
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.errors?.confirmPassword, 'Passwords do not match.');
  });

  // 5. Login Input Validation
  await itAsync('POST /api/auth/login rejects empty payload', async () => {
    const res = await simulateRequest(router, 'POST', '/api/auth/login', {});
    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.data.success, false);
  });

  // 6. Authentication Guard
  await itAsync('GET /api/auth/me returns 401 Unauthorized when unauthenticated', async () => {
    const res = await simulateRequest(router, 'GET', '/api/auth/me');
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
  });

  await itAsync('POST /api/attempts/start returns 401 Unauthorized when unauthenticated', async () => {
    const res = await simulateRequest(router, 'POST', '/api/attempts/start', { testId: 'any_id' });
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
  });

  await itAsync('GET /api/dashboard returns 401 Unauthorized when unauthenticated', async () => {
    const res = await simulateRequest(router, 'GET', '/api/dashboard');
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.data.success, false);
  });

  // 7. Route Not Found
  await itAsync('GET /api/nonexistent responds with 404 Not Found', async () => {
    const res = await simulateRequest(router, 'GET', '/api/nonexistent');
    assert.strictEqual(res.statusCode, 404);
    assert.strictEqual(res.data.success, false);
  });

  console.log('--------------------------------------------------------');
  console.log(`E2E Results: ${passed} / ${total} tests passed.`);
  console.log('--------------------------------------------------------\n');

  if (passed < total) {
    process.exit(1);
  }
}

runE2ETests().catch((err) => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
