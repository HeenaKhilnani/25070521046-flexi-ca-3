import { StudentService } from '../services/studentService.js';
import { requireAuth } from '../http/middleware.js';
import { sendJson, sendError } from '../http/response.js';

export function registerStudentRoutes(router) {
  // GET /api/students/profile
  router.get('/api/students/profile', requireAuth, async (req, res) => {
    try {
      const profile = await StudentService.getProfile(req.student._id);
      sendJson(res, 200, {
        success: true,
        profile
      });
    } catch (error) {
      sendError(res, error.statusCode || 500, error.message);
    }
  });

  // PUT /api/students/profile
  router.put('/api/students/profile', requireAuth, async (req, res) => {
    try {
      const { name } = req.body || {};
      const updated = await StudentService.updateProfile(req.student._id, { name });
      sendJson(res, 200, {
        success: true,
        message: 'Profile updated successfully.',
        student: updated
      });
    } catch (error) {
      sendError(res, error.statusCode || 400, error.message);
    }
  });
}
