import { TestService } from '../services/testService.js';
import { requireAuth, optionalAuth } from '../http/middleware.js';
import { sendJson, sendError } from '../http/response.js';

export function registerTestRoutes(router) {
  // GET /api/tests/available
  router.get('/api/tests/available', optionalAuth, async (req, res) => {
    try {
      const studentId = req.student ? req.student._id : null;
      const tests = await TestService.getAvailableTests(studentId);
      sendJson(res, 200, {
        success: true,
        tests
      });
    } catch (error) {
      sendError(res, 500, error.message || 'Failed to retrieve available tests');
    }
  });

  // GET /api/tests/upcoming
  router.get('/api/tests/upcoming', async (req, res) => {
    try {
      const tests = await TestService.getUpcomingTests();
      sendJson(res, 200, {
        success: true,
        tests
      });
    } catch (error) {
      sendError(res, 500, error.message || 'Failed to retrieve upcoming tests');
    }
  });

  // GET /api/tests/:id/instructions
  router.get('/api/tests/:id/instructions', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const instructions = await TestService.getTestInstructions(id, req.student._id);
      sendJson(res, 200, {
        success: true,
        test: instructions
      });
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  });
}
