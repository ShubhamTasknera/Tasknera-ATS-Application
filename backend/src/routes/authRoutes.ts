import { Router } from 'express';
import { signup, signin, googleSignin, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Auth Endpoints
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', googleSignin);
router.get('/me', protect, getMe);

export default router;
