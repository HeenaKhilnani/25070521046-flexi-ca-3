/**
 * HTTP Request utilities using Node.js built-ins.
 */

/**
 * Parse Cookie header into a key-value dictionary.
 */
export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

/**
 * Read and parse incoming JSON request body with byte size limit (1MB default).
 */
export function parseJsonBody(req, maxBytes = 1048576) {
  return new Promise((resolve, reject) => {
    // Only parse if content-type includes json or if body is present
    const method = req.method ? req.method.toUpperCase() : 'GET';
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return resolve({});
    }

    let rawData = '';
    let bytesReceived = 0;

    req.on('data', (chunk) => {
      bytesReceived += chunk.length;
      if (bytesReceived > maxBytes) {
        const err = new Error('Payload too large');
        err.statusCode = 413;
        req.destroy(err);
        return reject(err);
      }
      rawData += chunk;
    });

    req.on('end', () => {
      if (!rawData || rawData.trim() === '') {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(rawData);
        resolve(parsed);
      } catch (err) {
        const syntaxErr = new Error('Invalid JSON format');
        syntaxErr.statusCode = 400;
        reject(syntaxErr);
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}
