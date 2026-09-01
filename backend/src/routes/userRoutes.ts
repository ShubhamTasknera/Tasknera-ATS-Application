import { Router } from 'express';
import { getAllUsers, updateUserRole, assignUserTeam, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// All user routes require valid authentication
router.use(protect);

// GET /api/users - Available to ADMIN
router.get('/', authorize('ADMIN'), getAllUsers);

// PATCH /api/users/:id/role - ADMIN only
router.patch('/:id/role', authorize('ADMIN'), updateUserRole);

// PATCH /api/users/:id/team - ADMIN only
router.patch('/:id/team', authorize('ADMIN'), assignUserTeam);

// DELETE /api/users/:id - ADMIN only
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
