import { Router } from 'express';
import multer from 'multer';
import { createJob, getAllJobs, getJobById, updateJob, parseJobDescriptionController } from '../controllers/jobController';
import { protect } from '../middleware/authMiddleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

// Document parsing route (stateless document text extraction & analysis)
router.post('/parse', upload.single('file'), parseJobDescriptionController);

import {
  getRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  confirmRequirements
} from '../controllers/requirementController';

// Protect database routes with JWT authentication middleware
router.post('/', protect, createJob);
router.get('/', protect, getAllJobs);
router.get('/:id', protect, getJobById);
router.put('/:id', protect, updateJob);

// Requirement CRUD & Confirmation API Routes
router.get('/:jobId/requirements', protect, getRequirements);
router.post('/:jobId/requirements', protect, createRequirement);
router.put('/:jobId/requirements/:requirementId', protect, updateRequirement);
router.delete('/:jobId/requirements/:requirementId', protect, deleteRequirement);
router.post('/:jobId/requirements/confirm', protect, confirmRequirements);

export default router;
