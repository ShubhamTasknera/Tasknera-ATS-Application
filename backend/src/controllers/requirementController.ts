import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  isValidCategory,
  normalizeCategory,
  formatRequirementObject,
  detectDuplicateRequirements,
  SUPPORTED_CATEGORIES
} from '../utils/requirementUtils';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const parseParam = (param: string | string[] | undefined): string => {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
};

/**
 * Helper to check if job exists and belongs to the authenticated user
 */
async function findUserJob(jobIdParam: string | string[] | undefined, userId: string) {
  const jobId = parseParam(jobIdParam);
  if (!jobId || !UUID_REGEX.test(jobId)) {
    return { error: 'Invalid Job ID format. Must be a valid UUID.', status: 400, jobId: '' };
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    return { error: `Job with ID "${jobId}" not found.`, status: 404, jobId };
  }

  if (job.created_by !== userId) {
    return { error: 'Unauthorized access. You do not have permission to access requirements for this job.', status: 403, jobId };
  }

  return { job, jobId };
}

// @desc    Get all requirements for a job
// @route   GET /api/jobs/:jobId/requirements
// @access  Private (Authenticated Recruiter)
export const getRequirements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: 'User authentication required' });
      return;
    }

    const check = await findUserJob(req.params.jobId, req.user.userId);
    if (check.error) {
      res.status(check.status || 400).json({ error: check.error });
      return;
    }
    const jobId = check.jobId;

    const dbRequirements = await prisma.requirement.findMany({
      where: { job_id: jobId },
      orderBy: { created_at: 'asc' }
    });

    const formattedReqs = dbRequirements.map(formatRequirementObject);
    const warnings = detectDuplicateRequirements(formattedReqs);

    res.status(200).json({
      success: true,
      requirements: formattedReqs,
      ...(warnings.length > 0 ? { warnings } : {})
    });
  } catch (error: any) {
    console.error('[Get Requirements Error]', error);
    res.status(500).json({ error: 'Server error while fetching job requirements', details: error.message || String(error) });
  }
};

// @desc    Create a new requirement for a job
// @route   POST /api/jobs/:jobId/requirements
// @access  Private (Authenticated Recruiter)
export const createRequirement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: 'User authentication required' });
      return;
    }

    const check = await findUserJob(req.params.jobId, req.user.userId);
    if (check.error) {
      res.status(check.status || 400).json({ error: check.error });
      return;
    }
    const jobId = check.jobId;

    const { requirement, category, weight, isMandatory, evidenceRequired, recruiterConfirmed, sourceEvidence } = req.body;

    // Validation 1: Requirement string is non-empty
    if (!requirement || typeof requirement !== 'string' || !requirement.trim()) {
      res.status(400).json({ error: 'Requirement text is required and cannot be empty.' });
      return;
    }

    // Validation 2: Category validation
    const targetCategory = category ? String(category).trim() : 'Other';
    if (category && !isValidCategory(targetCategory)) {
      res.status(400).json({
        error: `Invalid category "${category}". Allowed categories: ${SUPPORTED_CATEGORIES.join(', ')}`
      });
      return;
    }

    // Validation 3: Weight validation (1.0 - 3.0)
    const reqWeight = typeof weight === 'number' ? weight : 1.0;
    if (reqWeight < 1.0 || reqWeight > 3.0) {
      res.status(400).json({ error: 'Requirement weight must be a number between 1.0 and 3.0 inclusive.' });
      return;
    }

    const newReq = await prisma.requirement.create({
      data: {
        job_id: jobId,
        requirement: requirement.trim(),
        category: normalizeCategory(targetCategory),
        weight: reqWeight,
        is_mandatory: Boolean(isMandatory ?? false),
        evidence_required: Boolean(evidenceRequired ?? false),
        recruiter_confirmed: Boolean(recruiterConfirmed ?? false),
        source_evidence: sourceEvidence ? String(sourceEvidence).trim() : requirement.trim(),
        needs_verification: false
      }
    });

    res.status(201).json({
      success: true,
      requirement: formatRequirementObject(newReq)
    });
  } catch (error: any) {
    console.error('[Create Requirement Error]', error);
    res.status(500).json({ error: 'Server error while creating requirement', details: error.message || String(error) });
  }
};

// @desc    Update a requirement by ID
// @route   PUT /api/jobs/:jobId/requirements/:requirementId
// @access  Private (Authenticated Recruiter)
export const updateRequirement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: 'User authentication required' });
      return;
    }

    const check = await findUserJob(req.params.jobId, req.user.userId);
    if (check.error) {
      res.status(check.status || 400).json({ error: check.error });
      return;
    }
    const jobId = check.jobId;
    const requirementId = parseParam(req.params.requirementId);

    if (!requirementId || !UUID_REGEX.test(requirementId)) {
      res.status(400).json({ error: 'Invalid Requirement ID format. Must be a valid UUID.' });
      return;
    }

    const existingReq = await prisma.requirement.findFirst({
      where: { id: requirementId, job_id: jobId }
    });

    if (!existingReq) {
      res.status(404).json({ error: `Requirement with ID "${requirementId}" not found for this job.` });
      return;
    }

    const { requirement, category, weight, isMandatory, evidenceRequired, recruiterConfirmed } = req.body;

    const updateData: any = {};

    // Validate requirement if updated
    if (requirement !== undefined) {
      if (typeof requirement !== 'string' || !requirement.trim()) {
        res.status(400).json({ error: 'Requirement text cannot be empty.' });
        return;
      }
      updateData.requirement = requirement.trim();
    }

    // Validate category if updated
    if (category !== undefined) {
      if (!isValidCategory(String(category).trim())) {
        res.status(400).json({
          error: `Invalid category "${category}". Allowed categories: ${SUPPORTED_CATEGORIES.join(', ')}`
        });
        return;
      }
      updateData.category = normalizeCategory(String(category).trim());
    }

    // Validate weight if updated
    if (weight !== undefined) {
      if (typeof weight !== 'number' || weight < 1.0 || weight > 3.0) {
        res.status(400).json({ error: 'Requirement weight must be a number between 1.0 and 3.0 inclusive.' });
        return;
      }
      updateData.weight = weight;
    }

    if (isMandatory !== undefined) updateData.is_mandatory = Boolean(isMandatory);
    if (evidenceRequired !== undefined) updateData.evidence_required = Boolean(evidenceRequired);
    if (recruiterConfirmed !== undefined) updateData.recruiter_confirmed = Boolean(recruiterConfirmed);

    // Preserve existing source_evidence (source Evidence should not be modified by normal recruiter editing)
    const updatedReq = await prisma.requirement.update({
      where: { id: requirementId },
      data: updateData
    });

    res.status(200).json({
      success: true,
      requirement: formatRequirementObject(updatedReq)
    });
  } catch (error: any) {
    console.error('[Update Requirement Error]', error);
    res.status(500).json({ error: 'Server error while updating requirement', details: error.message || String(error) });
  }
};

// @desc    Delete a requirement by ID
// @route   DELETE /api/jobs/:jobId/requirements/:requirementId
// @access  Private (Authenticated Recruiter)
export const deleteRequirement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: 'User authentication required' });
      return;
    }

    const check = await findUserJob(req.params.jobId, req.user.userId);
    if (check.error) {
      res.status(check.status || 400).json({ error: check.error });
      return;
    }
    const jobId = check.jobId;
    const requirementId = parseParam(req.params.requirementId);

    if (!requirementId || !UUID_REGEX.test(requirementId)) {
      res.status(400).json({ error: 'Invalid Requirement ID format. Must be a valid UUID.' });
      return;
    }

    const existingReq = await prisma.requirement.findFirst({
      where: { id: requirementId, job_id: jobId }
    });

    if (!existingReq) {
      res.status(404).json({ error: `Requirement with ID "${requirementId}" not found for this job.` });
      return;
    }

    await prisma.requirement.delete({
      where: { id: requirementId }
    });

    res.status(200).json({
      success: true,
      message: 'Requirement deleted successfully'
    });
  } catch (error: any) {
    console.error('[Delete Requirement Error]', error);
    res.status(500).json({ error: 'Server error while deleting requirement', details: error.message || String(error) });
  }
};

// @desc    Save & Confirm Requirements transactionally
// @route   POST /api/jobs/:jobId/requirements/confirm
// @access  Private (Authenticated Recruiter)
export const confirmRequirements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: 'User authentication required' });
      return;
    }

    const check = await findUserJob(req.params.jobId, req.user.userId);
    if (check.error) {
      res.status(check.status || 400).json({ error: check.error });
      return;
    }
    const jobId = check.jobId;

    const { requirements } = req.body;

    if (!Array.isArray(requirements) || requirements.length === 0) {
      res.status(400).json({ error: 'Payload must contain a non-empty "requirements" array.' });
      return;
    }

    // Validate all requirements before initiating database transaction
    for (let i = 0; i < requirements.length; i++) {
      const item = requirements[i];
      if (!item.requirement || typeof item.requirement !== 'string' || !item.requirement.trim()) {
        res.status(400).json({ error: `Requirement at index ${i} cannot be empty.` });
        return;
      }

      if (item.category && !isValidCategory(String(item.category).trim())) {
        res.status(400).json({
          error: `Requirement at index ${i} has invalid category "${item.category}". Allowed: ${SUPPORTED_CATEGORIES.join(', ')}`
        });
        return;
      }

      const itemWeight = typeof item.weight === 'number' ? item.weight : 1.0;
      if (itemWeight < 1.0 || itemWeight > 3.0) {
        res.status(400).json({ error: `Requirement at index ${i} has invalid weight ${item.weight}. Must be between 1.0 and 3.0 inclusive.` });
        return;
      }
    }

    // Execute transactional save & confirm via prisma.$transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete existing requirements for this job if replacing/overwriting set
      await tx.requirement.deleteMany({
        where: { job_id: jobId }
      });

      // 2. Create updated & confirmed requirement set
      const createdReqs = await Promise.all(
        requirements.map((r: any) =>
          tx.requirement.create({
            data: {
              job_id: jobId,
              requirement: String(r.requirement).trim(),
              category: normalizeCategory(r.category),
              weight: typeof r.weight === 'number' ? r.weight : 1.0,
              is_mandatory: Boolean(r.isMandatory ?? r.is_mandatory ?? false),
              evidence_required: Boolean(r.evidenceRequired ?? r.evidence_required ?? false),
              recruiter_confirmed: true, // Mark confirmed requirements
              source_evidence: r.sourceEvidence || r.source_evidence || r.requirement,
              needs_verification: Boolean(r.needsVerification ?? r.needs_verification ?? false)
            }
          })
        )
      );

      // 3. Update Job status if draft to active/published
      await tx.job.update({
        where: { id: jobId },
        data: { status: 'published' }
      });

      return createdReqs;
    });

    const formattedConfirmed = result.map(formatRequirementObject);

    res.status(200).json({
      success: true,
      message: 'Requirements confirmed successfully',
      requirements: formattedConfirmed
    });
  } catch (error: any) {
    console.error('[Confirm Requirements Error]', error);
    res.status(500).json({ error: 'Server error while confirming requirements', details: error.message || String(error) });
  }
};
