import { Router } from 'express';
import {
  getProducts,
  getBestSellers,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/best-sellers', getBestSellers);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
