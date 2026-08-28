import { Router } from 'express';
import multer from 'multer';
import { createJob, getAllJobs, getJobById, updateJob, parseJobDescriptionController } from '../controllers/jobController';
import { protect } from '../middleware/authMiddleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

// Protect all job routes with JWT authentication middleware
router.post('/parse', protect, upload.single('file'), parseJobDescriptionController);
router.post('/', protect, createJob);
router.get('/', protect, getAllJobs);
router.get('/:id', protect, getJobById);
router.put('/:id', protect, updateJob);

export default router;
