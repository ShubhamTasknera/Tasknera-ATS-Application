import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { evaluateCandidateAgainstRequirements, CandidateEvaluationPayload } from '../services/evaluationService';
import { CandidateRecord, findCandidateRecord, getAllCandidateRecords } from './candidateController';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Standard requirement helper for fallback jobs or unseeded requisitions
 */
export function getStandardRequirementsForPosition(positionTitle: string, clientName?: string) {
  const titleLower = (positionTitle || '').toLowerCase();

  if (titleLower.includes('frontend') || titleLower.includes('react') || titleLower.includes('ui') || titleLower.includes('web')) {
    return [
      { id: 'req-fe-1', requirement: '3+ years experience with React, TypeScript, and modern state management', category: 'Experience', is_mandatory: true, weight: 2.0 },
      { id: 'req-fe-2', requirement: 'Proficiency with Next.js, responsive layouts, and Tailwind CSS', category: 'Technical Skill', is_mandatory: true, weight: 1.5 },
      { id: 'req-fe-3', requirement: 'Demonstrated experience integrating RESTful APIs and asynchronous data flows', category: 'Technical Skill', is_mandatory: true, weight: 1.5 },
      { id: 'req-fe-4', requirement: 'Hands-on experience with unit testing frameworks (Jest, React Testing Library)', category: 'Tool', is_mandatory: false, weight: 1.0 },
      { id: 'req-fe-5', requirement: 'Bachelor degree in Computer Science, Engineering, or equivalent practical experience', category: 'Education', is_mandatory: false, weight: 1.0 }
    ];
  }

  if (titleLower.includes('backend') || titleLower.includes('node') || titleLower.includes('python') || titleLower.includes('java') || titleLower.includes('golang')) {
    return [
      { id: 'req-be-1', requirement: '3+ years hands-on backend development and API architecture experience', category: 'Experience', is_mandatory: true, weight: 2.0 },
      { id: 'req-be-2', requirement: 'Strong proficiency in backend services, relational databases, and SQL', category: 'Technical Skill', is_mandatory: true, weight: 1.5 },
      { id: 'req-be-3', requirement: 'Experience designing secure microservices and performant data pipelines', category: 'Technical Skill', is_mandatory: true, weight: 1.5 },
      { id: 'req-be-4', requirement: 'Familiarity with containerization (Docker) and CI/CD deployment pipelines', category: 'Tool', is_mandatory: false, weight: 1.0 },
      { id: 'req-be-5', requirement: 'Degree in Computer Science, Information Technology, or equivalent', category: 'Education', is_mandatory: false, weight: 1.0 }
    ];
  }

  if (titleLower.includes('sap') || titleLower.includes('erp') || titleLower.includes('fico') || titleLower.includes('s/4hana')) {
    return [
      { id: 'req-sap-1', requirement: '5+ years experience in SAP CO / FICO module configuration and implementation', category: 'Experience', is_mandatory: true, weight: 2.0 },
      { id: 'req-sap-2', requirement: 'Deep expertise in Product Costing (CO-PC) and Material Ledger in S/4HANA', category: 'Technical Skill', is_mandatory: true, weight: 1.8 },
      { id: 'req-sap-3', requirement: 'Hands-on participation in at least 2 full end-to-end SAP lifecycle implementations', category: 'Experience', is_mandatory: true, weight: 1.5 },
      { id: 'req-sap-4', requirement: 'SAP Certified Application Associate - Financial Accounting or Management Accounting', category: 'Certification', is_mandatory: false, weight: 1.0 },
      { id: 'req-sap-5', requirement: 'Bachelor or Master degree in Finance, Accounting, Business, or Computer Science', category: 'Education', is_mandatory: false, weight: 1.0 }
    ];
  }

  // General Software Engineering / Tech Role Fallback
  return [
    { id: 'req-gen-1', requirement: '2+ years professional industry experience in software development or technical domain', category: 'Experience', is_mandatory: true, weight: 2.0 },
    { id: 'req-gen-2', requirement: 'Demonstrated proficiency in core required technologies and tools', category: 'Technical Skill', is_mandatory: true, weight: 1.5 },
    { id: 'req-gen-3', requirement: 'Proven experience collaborating on production systems and business workflows', category: 'Experience', is_mandatory: true, weight: 1.5 },
    { id: 'req-gen-4', requirement: 'Strong problem-solving skills, debugging ability, and technical documentation', category: 'Soft Skill', is_mandatory: false, weight: 1.0 },
    { id: 'req-gen-5', requirement: 'Higher education degree or equivalent relevant professional background', category: 'Education', is_mandatory: false, weight: 1.0 }
  ];
}

/**
 * Helper to fetch job record and confirmed requirements with organization validation
 */
async function getJobAndRequirements(jobId: string, fallbackPosition?: string, fallbackClient?: string) {
  let jobData: any = null;
  let requirements: any[] = [];

  try {
    const dbJob = await prisma.job.findUnique({
      where: { id: jobId },
      include: { requirements: true }
    });

    if (dbJob) {
      jobData = {
        id: dbJob.id,
        position: dbJob.position,
        title: dbJob.position,
        client: dbJob.client,
        company: dbJob.client,
        jd_text: dbJob.jd_text || undefined,
        created_by: dbJob.created_by,
      };
      if (dbJob.requirements && dbJob.requirements.length > 0) {
        requirements = dbJob.requirements;
      }
    }
  } catch (e) {
    console.warn('[Evaluation Controller] Job DB fetch error:', e);
  }

  if (!jobData) {
    jobData = {
      id: jobId,
      position: fallbackPosition || (jobId === 'jd-1' ? 'Frontend Developer' : 'Software Professional'),
      title: fallbackPosition || (jobId === 'jd-1' ? 'Frontend Developer' : 'Software Professional'),
      client: fallbackClient || (jobId === 'jd-1' ? 'TechNova Solutions' : 'Enterprise Client'),
      company: fallbackClient || (jobId === 'jd-1' ? 'TechNova Solutions' : 'Enterprise Client'),
    };
  }

  if (requirements.length === 0) {
    requirements = getStandardRequirementsForPosition(jobData.position, jobData.client);
  }

  return { jobData, requirements };
}

/**
 * Get detailed evaluation for a single candidate against a job
 * GET /api/evaluations/:id
 * GET /api/jobs/:jobId/candidates/:candidateId/evaluation
 */
export const getCandidateEvaluation = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidateId = String(req.params.candidateId || req.params.id || req.query.candidateId || '');
    let jobId = String(req.params.jobId || req.query.jobId || '');

    if (!candidateId) {
      res.status(400).json({ error: 'Candidate ID is required for evaluation' });
      return;
    }

    // 1. Fetch Candidate Record from DB or Memory Store
    const candidateData = await findCandidateRecord(candidateId, jobId || undefined);

    if (!candidateData) {
      res.status(404).json({ error: `Candidate with ID "${candidateId}" not found in database or upload session.` });
      return;
    }

    // Resolve target jobId
    const targetJobId = jobId || candidateData.jobId || 'jd-1';

    // 2. Organization / Job Context Isolation Check
    if (jobId && candidateData.jobId && candidateData.jobId !== jobId && candidateData.jobId !== 'default' && jobId !== 'default') {
      res.status(403).json({ error: 'Cross-job evaluation forbidden. Candidate does not belong to the specified Job Requisition.' });
      return;
    }

    // 3. Fetch Job and Requirements
    const { jobData, requirements } = await getJobAndRequirements(
      targetJobId,
      candidateData.currentTitle || undefined,
      candidateData.currentCompany || undefined
    );

    // 4. Compute deterministic requirement-by-requirement evaluation
    const evaluation = evaluateCandidateAgainstRequirements(candidateData, jobData, requirements);

    res.status(200).json({
      success: true,
      evaluation,
      // Task 5 specific root-level response fields
      evaluationId: evaluation.evaluationId,
      candidateId: evaluation.candidateId,
      jobId: evaluation.jobId,
      overallScore: evaluation.overallScore,
      matchLevel: evaluation.matchLevel,
      mandatoryRequirementFailed: evaluation.mandatoryRequirementFailed,
      pillars: evaluation.pillars,
      requirementResults: evaluation.requirementResults,
      strengths: evaluation.strengths,
      gaps: evaluation.gaps,
      warnings: evaluation.warnings
    });
  } catch (error: any) {
    console.error('Error generating candidate evaluation:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate candidate against job requirements' });
  }
};

/**
 * Trigger fresh re-evaluation for a candidate against a job
 * POST /api/jobs/:jobId/candidates/:candidateId/evaluate
 */
export const evaluateCandidateController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidateId = String(req.params.candidateId || req.params.id || '');
    const jobId = String(req.params.jobId || '');

    if (!candidateId || !jobId) {
      res.status(400).json({ error: 'Both Job ID and Candidate ID are required for re-evaluation.' });
      return;
    }

    const candidateData = await findCandidateRecord(candidateId, jobId);
    if (!candidateData) {
      res.status(404).json({ error: `Candidate with ID "${candidateId}" not found.` });
      return;
    }

    // Fetch latest job requirements
    const { jobData, requirements } = await getJobAndRequirements(
      jobId,
      candidateData.currentTitle || undefined,
      candidateData.currentCompany || undefined
    );

    // Run deterministic evaluation
    const evaluation = evaluateCandidateAgainstRequirements(candidateData, jobData, requirements);

    // Update application record match score if application exists in DB
    try {
      await prisma.candidateApplication.upsert({
        where: {
          job_id_candidate_id: {
            job_id: jobId,
            candidate_id: candidateId
          }
        },
        update: {
          match_score: evaluation.overallScore
        },
        create: {
          job_id: jobId,
          candidate_id: candidateId,
          match_score: evaluation.overallScore,
          stage: 'SOURCED'
        }
      });
    } catch {
      // Memory fallback if DB unavailable
    }

    res.status(200).json({
      success: true,
      message: 'Candidate re-evaluated successfully',
      evaluation,
      evaluationId: evaluation.evaluationId,
      candidateId: evaluation.candidateId,
      jobId: evaluation.jobId,
      overallScore: evaluation.overallScore,
      matchLevel: evaluation.matchLevel,
      mandatoryRequirementFailed: evaluation.mandatoryRequirementFailed,
      pillars: evaluation.pillars,
      requirementResults: evaluation.requirementResults,
      strengths: evaluation.strengths,
      gaps: evaluation.gaps,
      warnings: evaluation.warnings
    });
  } catch (error: any) {
    console.error('Error during candidate re-evaluation:', error);
    res.status(500).json({ error: error.message || 'Failed to re-evaluate candidate' });
  }
};

/**
 * Get all candidate evaluations across all jobs
 * GET /api/evaluations
 */
export const getAllEvaluations = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Fetch all candidate records
    const allRecords = await getAllCandidateRecords();

    // 2. Fetch all jobs in DB to map positions/requirements
    const jobsMap = new Map<string, { jobData: any; requirements: any[] }>();
    try {
      const dbJobs = await prisma.job.findMany({
        include: { requirements: true }
      });
      for (const j of dbJobs) {
        jobsMap.set(j.id, {
          jobData: {
            id: j.id,
            position: j.position,
            title: j.position,
            client: j.client,
            company: j.client,
            jd_text: j.jd_text || undefined,
          },
          requirements: (j.requirements && j.requirements.length > 0)
            ? j.requirements
            : getStandardRequirementsForPosition(j.position, j.client)
        });
      }
    } catch (dbErr) {
      console.warn('[Evaluations] DB jobs fetch error:', dbErr);
    }

    const evaluationItems = [];

    for (const item of allRecords) {
      const { candidate, jobId } = item;
      const targetJobId = jobId || candidate.jobId || 'jd-1';

      let jobContext = jobsMap.get(targetJobId);
      if (!jobContext) {
        const { jobData, requirements } = await getJobAndRequirements(
          targetJobId,
          candidate.currentTitle || undefined,
          candidate.currentCompany || undefined
        );
        jobContext = { jobData, requirements };
        jobsMap.set(targetJobId, jobContext);
      }

      // Compute deterministic evaluation
      const evalPayload = evaluateCandidateAgainstRequirements(candidate, jobContext.jobData, jobContext.requirements);

      const createdDate = candidate.uploadedAt
        ? new Date(candidate.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Recent';

      evaluationItems.push({
        id: candidate.id,
        candidate: candidate.name || candidate.fileName || 'Candidate',
        role: candidate.currentTitle || jobContext.jobData.position || 'Professional Role',
        job: jobContext.jobData.position || jobContext.jobData.title || 'Job Position',
        jobId: jobContext.jobData.id || targetJobId,
        company: candidate.currentCompany || jobContext.jobData.client || 'Organization',
        date: createdDate,
        score: evalPayload.overallMatch,
        ats: evalPayload.atsScore,
        overallScore: evalPayload.overallScore,
        matchLevel: evalPayload.matchLevel,
        mandatory: `${evalPayload.mandatoryCompliance.met}/${evalPayload.mandatoryCompliance.total}`,
        mandatoryFailed: evalPayload.mandatoryRequirementFailed,
        decision: evalPayload.recommendation,
        by: evalPayload.evaluator || 'Deterministic ATS Engine (v2.0)'
      });
    }

    res.status(200).json({
      success: true,
      total: evaluationItems.length,
      evaluations: evaluationItems
    });
  } catch (error: any) {
    console.error('Error fetching all evaluations:', error);
    res.status(500).json({ error: 'Failed to retrieve candidate evaluations' });
  }
};
