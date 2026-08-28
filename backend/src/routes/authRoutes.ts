import { Router } from 'express';
import { signup, signin, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Auth Endpoints
router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', protect, getMe);

export default router;
