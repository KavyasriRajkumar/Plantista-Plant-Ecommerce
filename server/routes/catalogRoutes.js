import { Router } from 'express';
import { getCategories, getTestimonials, validateCoupon } from '../controllers/catalogController.js';
import { getDashboardStats } from '../controllers/statsController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/testimonials', getTestimonials);
router.post('/coupons/validate', validateCoupon); // public so guests can try a code in the cart
router.get('/stats', protect, adminOnly, getDashboardStats);

export default router;
