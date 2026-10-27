import { AuthService } from '../services/authService.js';
import { sendJson, sendError, setCookie, clearCookie } from '../http/response.js';
import { requireAuth, createRateLimiter } from '../http/middleware.js';
import { config } from '../config.js';

export function registerAuthRoutes(router) {
  const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Please wait a few minutes.'
  });

  // POST /api/auth/register
  router.post('/api/auth/register', authRateLimiter, async (req, res) => {
    try {
      const { name, email, password, confirmPassword } = req.body || {};
      const { student, token } = await AuthService.register({
        name,
        email,
        password,
        confirmPassword
      });

      setCookie(res, config.sessionCookieName, token, {
        maxAge: config.sessionMaxAgeMs / 1000,
        httpOnly: true,
        path: '/'
      });

      sendJson(res, 201, {
        success: true,
        message: 'Account created successfully.',
        student
      });
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message, error.errors);
    }
  });

  // POST /api/auth/login
  router.post('/api/auth/login', authRateLimiter, async (req, res) => {
    try {
      const { email, password } = req.body || {};
      const { student, token } = await AuthService.login({ email, password });

      setCookie(res, config.sessionCookieName, token, {
        maxAge: config.sessionMaxAgeMs / 1000,
        httpOnly: true,
        path: '/'
      });

      sendJson(res, 200, {
        success: true,
        message: 'Signed in successfully.',
        student
      });
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  });

  // POST /api/auth/logout
  router.post('/api/auth/logout', async (req, res) => {
    try {
      const token = req.cookies[config.sessionCookieName];
      if (token) {
        await AuthService.logout(token);
      }
      clearCookie(res, config.sessionCookieName);
      sendJson(res, 200, {
        success: true,
        message: 'Signed out successfully.'
      });
    } catch (error) {
      sendError(res, 500, 'Error during sign out.');
    }
  });

  // GET /api/auth/me
  router.get('/api/auth/me', requireAuth, async (req, res) => {
    sendJson(res, 200, {
      success: true,
      student: {
        id: req.student._id.toString(),
        name: req.student.name,
        email: req.student.email,
        createdAt: req.student.createdAt
      }
    });
  });
}
