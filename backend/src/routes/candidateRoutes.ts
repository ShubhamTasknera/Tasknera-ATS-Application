import { Router } from 'express';
import multer from 'multer';
import {
  getAllCandidates,
  getCandidateById,
  deleteCandidate,
  uploadCandidateCVs
} from '../controllers/candidateController';
import {
  matchCandidateWithJobController,
  getCandidateEvaluationHistoryController
} from '../controllers/evaluationController';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit per file
});

const router = Router();

// Retrieve all candidates in central candidate pool
router.get('/', getAllCandidates);

// Bulk upload CVs directly to candidate pool
router.post('/upload', upload.any(), uploadCandidateCVs);

// Match candidate from pool with a specific Job Description (Entry Point 2)
router.post('/:candidateId/match-with-job', matchCandidateWithJobController);

// Candidate evaluation history across multiple jobs
router.get('/:candidateId/evaluations', getCandidateEvaluationHistoryController);

// Single candidate lookup & delete
router.get('/:candidateId', getCandidateById);
router.delete('/:candidateId', deleteCandidate);

export default router;
