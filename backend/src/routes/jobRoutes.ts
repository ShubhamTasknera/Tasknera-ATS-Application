import { Router } from 'express';
import multer from 'multer';
import { createJob, getAllJobs, getJobById, updateJob, deleteJob, parseJobDescriptionController } from '../controllers/jobController';
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

import {
  uploadCandidateCVs,
  getCandidatesForJob,
  getCandidateById,
  retryCandidateParsing
} from '../controllers/candidateController';

// Protect database routes with JWT authentication middleware
router.post('/', protect, createJob);
router.get('/', protect, getAllJobs);
router.get('/:id', protect, getJobById);
router.put('/:id', protect, updateJob);
router.delete('/:id', protect, deleteJob);

// Requirement CRUD & Confirmation API Routes
router.get('/:jobId/requirements', protect, getRequirements);
router.post('/:jobId/requirements', protect, createRequirement);
router.put('/:jobId/requirements/:requirementId', protect, updateRequirement);
router.delete('/:jobId/requirements/:requirementId', protect, deleteRequirement);
router.post('/:jobId/requirements/confirm', protect, confirmRequirements);

// Candidate CV Upload, Extraction & Status Routes
router.post('/:jobId/candidates/upload', upload.array('files', 50), uploadCandidateCVs);
router.get('/:jobId/candidates', getCandidatesForJob);
router.get('/:jobId/candidates/:candidateId', getCandidateById);
router.post('/:jobId/candidates/:candidateId/retry', retryCandidateParsing);

export default router;
