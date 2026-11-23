import { Router } from 'express';
import { getUsers, updateUserStatus, updateMe } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.put('/me', protect, updateMe);
router.get('/', protect, adminOnly, getUsers);
router.patch('/:id/status', protect, adminOnly, updateUserStatus);

export default router;
