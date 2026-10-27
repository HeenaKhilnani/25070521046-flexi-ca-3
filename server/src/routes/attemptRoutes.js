import { AttemptService } from '../services/attemptService.js';
import { requireAuth } from '../http/middleware.js';
import { sendJson, sendError } from '../http/response.js';

export function registerAttemptRoutes(router) {
  // GET /api/dashboard
  router.get('/api/dashboard', requireAuth, async (req, res) => {
    try {
      const data = await AttemptService.getDashboardMetrics(req.student._id);
      sendJson(res, 200, {
        success: true,
        data
      });
    } catch (error) {
      sendError(res, 500, error.message || 'Failed to fetch dashboard data');
    }
  });

  // GET /api/attempts/history
  router.get('/api/attempts/history', requireAuth, async (req, res) => {
    try {
      const history = await AttemptService.getAttemptHistory(req.student._id);
      sendJson(res, 200, {
        success: true,
        history
      });
    } catch (error) {
      sendError(res, 500, error.message || 'Failed to retrieve attempt history');
    }
  });

  // POST /api/attempts/start
  router.post('/api/attempts/start', requireAuth, async (req, res) => {
    try {
      const { testId } = req.body || {};
      if (!testId) {
        return sendError(res, 400, 'testId is required to start an attempt');
      }

      const result = await AttemptService.startOrResumeAttempt(req.student._id, testId);
      sendJson(res, 200, {
        success: true,
        resumed: result.resumed,
        attempt: result.attempt
      });
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  });

  // GET /api/attempts/:id
  router.get('/api/attempts/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await AttemptService.getActiveAttempt(id, req.student._id);
      sendJson(res, 200, {
        success: true,
        isFinalized: result.isFinalized,
        attempt: result.attempt
      });
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  });

  // POST /api/attempts/:id/save
  router.post('/api/attempts/:id/save', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { responses } = req.body || {};
      const result = await AttemptService.saveResponses(id, req.student._id, responses || {});
      sendJson(res, 200, result);
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message, { expired: error.expired });
    }
  });

  // POST /api/attempts/:id/submit
  router.post('/api/attempts/:id/submit', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { responses } = req.body || {};
      const updated = await AttemptService.submitAttempt(id, req.student._id, responses);
      sendJson(res, 200, {
        success: true,
        message: 'Examination submitted successfully.',
        attemptId: updated._id.toString()
      });
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  });

  // GET /api/attempts/:id/result
  router.get('/api/attempts/:id/result', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await AttemptService.getAttemptResult(id, req.student._id);
      sendJson(res, 200, {
        success: true,
        result
      });
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  });
}
