import { config } from '../config.js';

/**
 * Apply security and CORS headers to response.
 */
export function setSecurityHeaders(res, req) {
  // CORS configuration
  const origin = req.headers.origin;
  // Allow matching origin in dev or specified config origin
  if (origin && (origin === config.corsOrigin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Expose-Headers', 'Set-Cookie');
  }

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

/**
 * Format and send a JSON response.
 */
export function sendJson(res, statusCode, data) {
  if (res.writableEnded) return;

  const payload = JSON.stringify(data);
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Length', Buffer.byteLength(payload));
  res.end(payload);
}

/**
 * Format and send an error response with consistent schema.
 */
export function sendError(res, statusCode, message, errors = null) {
  sendJson(res, statusCode, {
    success: false,
    error: message,
    ...(errors ? { errors } : {})
  });
}

/**
 * Append or set a Set-Cookie header.
 */
export function setCookie(res, name, value, options = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  const maxAge = options.maxAge ?? (config.sessionMaxAgeMs / 1000);
  parts.push(`Max-Age=${Math.floor(maxAge)}`);
  parts.push(`Path=${options.path || '/'}`);

  if (options.httpOnly !== false) {
    parts.push('HttpOnly');
  }

  const sameSite = options.sameSite || 'Lax';
  parts.push(`SameSite=${sameSite}`);

  if (options.secure || config.isProduction) {
    parts.push('Secure');
  }

  const cookieStr = parts.join('; ');
  const existing = res.getHeader('Set-Cookie');

  if (!existing) {
    res.setHeader('Set-Cookie', cookieStr);
  } else if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieStr]);
  } else {
    res.setHeader('Set-Cookie', [existing, cookieStr]);
  }
}

/**
 * Expire a cookie immediately.
 */
export function clearCookie(res, name) {
  setCookie(res, name, '', { maxAge: 0, path: '/' });
}
