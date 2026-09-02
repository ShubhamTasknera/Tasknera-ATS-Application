import { Router } from 'express';
import multer from 'multer';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  parseJobDescriptionController,
  getAvailableJobsForEvaluation
} from '../controllers/jobController';
import { protect, authorize } from '../middleware/authMiddleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit per file
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
  retryCandidateParsing,
  deleteCandidate
} from '../controllers/candidateController';

// Available Jobs for Candidate Evaluation & Matching (Entry Point 2)
router.get('/available-for-evaluation', getAvailableJobsForEvaluation);

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

import { getCandidateEvaluation, evaluateCandidateController } from '../controllers/evaluationController';

// Candidate CV Upload, Extraction & Status Routes
router.post('/:jobId/candidates/upload', upload.any(), uploadCandidateCVs);
router.get('/:jobId/candidates', getCandidatesForJob);
router.get('/:jobId/candidates/:candidateId', getCandidateById);
router.get('/:jobId/candidates/:candidateId/evaluation', getCandidateEvaluation);
router.post('/:jobId/candidates/:candidateId/evaluate', protect, evaluateCandidateController);
router.post('/:jobId/candidates/:candidateId/retry', retryCandidateParsing);
router.delete('/:jobId/candidates/:candidateId', deleteCandidate);

export default router;
