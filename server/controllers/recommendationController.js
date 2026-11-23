import Product from '../models/Product.js';
import { recommend, missingCritical } from '../services/recommendationService.js';
import { validatePreferences, validateRecommendationUpdate } from '../validators/recommendationValidator.js';

const DEFAULT_LIMIT = 12;

// Builds handlers around an injectable model so tests can run without MongoDB.
export function createRecommendationController(ProductModel = Product) {
  // POST /api/recommendations/plants
  async function getPlantRecommendations(req, res, next) {
    try {
      const { errors, value } = validatePreferences(req.body);
      if (errors) return res.status(400).json({ success: false, message: 'Invalid preferences', errors });

      // Pre-filter in the database: only products that carry recommendation data,
      // in stock, within budget, and not strictly conflicting on environment.
      const query = { stock: { $gt: 0 }, 'recommendation.environment': { $ne: null } };
      // Budget is checked in the service against the discounted price.
      if (value.environment !== 'both') query['recommendation.environment'] = { $in: [value.environment, 'both'] };

      const products = await ProductModel.find(query).lean();
      const totalProducts = await ProductModel.countDocuments({ category: { $ne: 'planters' } });
      const incompleteInCatalog = totalProducts - products.length;

      const { recommendations, total, stats } = recommend(products, value, { limit: value.limit || DEFAULT_LIMIT });

      return res.json({
        success: true,
        count: recommendations.length,
        total,
        recommendations,
        // Explains what limited the results so the UI can guide the user.
        meta: {
          catalogEmpty: totalProducts === 0,
          plantsWithoutRecommendationData: Math.max(0, incompleteInCatalog),
          excluded: stats.excluded,
          belowThreshold: stats.belowThreshold,
          incompleteSkipped: stats.incomplete,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/recommendations/plants/:id/attributes — admin only (route-level middleware)
  async function updateRecommendationAttributes(req, res, next) {
    try {
      const { errors, value } = validateRecommendationUpdate(req.body);
      if (errors) return res.status(400).json({ success: false, message: 'Invalid attributes', errors });
      const set = {};
      for (const [k, v] of Object.entries(value)) set[`recommendation.${k}`] = v;
      if (!Object.keys(set).length) return res.status(400).json({ success: false, message: 'No attributes supplied' });
      const product = await ProductModel.findByIdAndUpdate(req.params.id, { $set: set }, { new: true, runValidators: true });
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, product, missing: missingCritical(product.toObject()) });
    } catch (err) {
      next(err);
    }
  }

  return { getPlantRecommendations, updateRecommendationAttributes };
}
