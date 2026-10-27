import { config } from '../config.js';
import { getCollection } from '../db.js';
import { sendError } from './response.js';
import { ObjectId } from 'mongodb';

/**
 * In-memory sliding rate limiter.
 */
const rateLimitMap = new Map();

// Periodic cleanup every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 mins
  const max = options.max || 100;
  const message = options.message || 'Too many requests. Please try again later.';

  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
    const key = `${ip}:${req.pathname}`;
    const now = Date.now();

    let record = rateLimitMap.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitMap.set(key, record);
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return sendError(res, 429, message);
    }

    next();
  };
}

/**
 * Strict authentication middleware: requires valid student session.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies[config.sessionCookieName] ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7).trim()
        : null);

    if (!token) {
      return sendError(res, 401, 'Authentication required. Please sign in.');
    }

    const sessionsCol = getCollection('sessions');
    const session = await sessionsCol.findOne({ token });

    if (!session || new Date() > new Date(session.expiresAt)) {
      if (session) {
        await sessionsCol.deleteOne({ _id: session._id });
      }
      return sendError(res, 401, 'Session expired or invalid. Please sign in again.');
    }

    const studentsCol = getCollection('students');
    const student = await studentsCol.findOne(
      { _id: new ObjectId(session.studentId) },
      { projection: { passwordHash: 0 } }
    );

    if (!student) {
      await sessionsCol.deleteOne({ _id: session._id });
      return sendError(res, 401, 'Student account no longer exists.');
    }

    req.student = student;
    req.sessionToken = token;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error.message);
    return sendError(res, 500, 'Internal authentication error');
  }
}

/**
 * Optional authentication middleware: attaches student if valid session exists.
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies[config.sessionCookieName] ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7).trim()
        : null);

    if (!token) {
      req.student = null;
      return next();
    }

    const sessionsCol = getCollection('sessions');
    const session = await sessionsCol.findOne({ token });

    if (!session || new Date() > new Date(session.expiresAt)) {
      req.student = null;
      return next();
    }

    const studentsCol = getCollection('students');
    const student = await studentsCol.findOne(
      { _id: new ObjectId(session.studentId) },
      { projection: { passwordHash: 0 } }
    );

    req.student = student || null;
    req.sessionToken = token;
    next();
  } catch (error) {
    req.student = null;
    next();
  }
}
