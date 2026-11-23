import { Router } from 'express';
import { createAuthController } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimit.js';

export function createAuthRouter({ controller = createAuthController(), auth = protect, limiter = createRateLimiter() } = {}) {
  const router = Router();
  router.post('/register', limiter, controller.register);
  router.post('/login', limiter, controller.login);
  router.post('/admin/login', limiter, controller.adminLogin);
  router.get('/me', auth, controller.getMe);
  return router;
}

export default createAuthRouter();
