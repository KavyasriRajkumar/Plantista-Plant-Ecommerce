import { Router } from 'express';
import { createRecommendationController } from '../controllers/recommendationController.js';
import { protect, adminOnly } from '../middleware/auth.js';

export function createRecommendationRouter(controller = createRecommendationController(), auth = { protect, adminOnly }) {
  const router = Router();
  router.post('/plants', controller.getPlantRecommendations); // public, like browsing the shop
  router.put('/plants/:id/attributes', auth.protect, auth.adminOnly, controller.updateRecommendationAttributes);
  return router;
}

export default createRecommendationRouter();
