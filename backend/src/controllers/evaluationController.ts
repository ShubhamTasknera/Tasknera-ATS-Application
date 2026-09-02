import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { evaluateCandidateAgainstRequirements, CandidateEvaluationPayload } from '../services/evaluationService';
import { CandidateRecord, findCandidateRecord, getAllCandidateRecords, mapDbCandidateToRecord } from './candidateController';
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

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId);
  if (isUuid) {
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

    // 2. Fetch Job and Requirements
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
    const candidateMap = new Map<string, CandidateRecord>();
    for (const r of allRecords) {
      candidateMap.set(r.candidate.id, r.candidate);
    }

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

    // 3. Fetch applications to capture multi-job evaluations
    let applications: any[] = [];
    try {
      applications = await prisma.candidateApplication.findMany({
        include: {
          job: { include: { requirements: true } },
          candidate: true
        },
        orderBy: { updated_at: 'desc' }
      });
    } catch (appErr) {
      console.warn('[Evaluations] Applications fetch error:', appErr);
    }

    const evaluationItems: any[] = [];
    const seenPairs = new Set<string>();

    // Process from DB applications
    for (const app of applications) {
      if (!app.candidate_id || !app.job_id) continue;
      const pairKey = `${app.candidate_id}___${app.job_id}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const candidate = candidateMap.get(app.candidate_id) || (app.candidate ? mapDbCandidateToRecord(app.candidate, app.job_id) : null);
      if (!candidate) continue;

      let jobContext = jobsMap.get(app.job_id);
      if (!jobContext && app.job) {
        jobContext = {
          jobData: {
            id: app.job.id,
            position: app.job.position,
            title: app.job.position,
            client: app.job.client,
            company: app.job.client,
            jd_text: app.job.jd_text || undefined,
          },
          requirements: (app.job.requirements && app.job.requirements.length > 0)
            ? app.job.requirements
            : getStandardRequirementsForPosition(app.job.position, app.job.client)
        };
        jobsMap.set(app.job.id, jobContext);
      }

      if (!jobContext) {
        const { jobData, requirements } = await getJobAndRequirements(app.job_id, candidate.currentTitle || undefined, candidate.currentCompany || undefined);
        jobContext = { jobData, requirements };
        jobsMap.set(app.job_id, jobContext);
      }

      // Check cache or compute using the deterministic matching engine
      const cached = EVALUATION_CACHE.get(pairKey);
      const evalPayload = cached || evaluateCandidateAgainstRequirements(candidate, jobContext.jobData, jobContext.requirements);
      if (!cached) EVALUATION_CACHE.set(pairKey, evalPayload);

      const dateStr = app.updated_at
        ? new Date(app.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : (candidate.uploadedAt ? new Date(candidate.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent');

      const score = Math.round(evalPayload.overallScore ?? evalPayload.overallMatch ?? 0);

      evaluationItems.push({
        id: candidate.id,
        candidate: candidate.name || candidate.fileName || 'Candidate',
        role: candidate.currentTitle || jobContext.jobData.position || 'Professional Role',
        job: jobContext.jobData.position || jobContext.jobData.title || 'Job Position',
        jobId: jobContext.jobData.id || app.job_id,
        company: jobContext.jobData.client || candidate.currentCompany || 'Organization',
        date: dateStr,
        score,
        ats: Math.round(evalPayload.atsScore ?? score),
        overallScore: score,
        matchLevel: evalPayload.matchLevel || (score >= 80 ? 'STRONG MATCH' : 'GOOD MATCH'),
        mandatory: `${evalPayload.mandatoryCompliance.met}/${evalPayload.mandatoryCompliance.total}`,
        mandatoryFailed: evalPayload.mandatoryRequirementFailed,
        decision: evalPayload.recommendation,
        by: 'Deterministic ATS Engine (v2.0)'
      });
    }

    // Process from session EVALUATION_CACHE
    for (const [pairKey, cachedEval] of EVALUATION_CACHE.entries()) {
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const [candId, jId] = pairKey.split('___');
      const candidate = candidateMap.get(candId);
      if (!candidate) continue;

      let jobContext = jobsMap.get(jId);
      if (!jobContext) {
        const { jobData, requirements } = await getJobAndRequirements(jId, candidate.currentTitle || undefined, candidate.currentCompany || undefined);
        jobContext = { jobData, requirements };
        jobsMap.set(jId, jobContext);
      }

      const score = Math.round(cachedEval.overallScore ?? cachedEval.overallMatch ?? 0);

      evaluationItems.push({
        id: candidate.id,
        candidate: candidate.name || candidate.fileName || 'Candidate',
        role: candidate.currentTitle || jobContext.jobData.position || 'Professional Role',
        job: jobContext.jobData.position || jobContext.jobData.title || 'Job Position',
        jobId: jobContext.jobData.id || jId,
        company: jobContext.jobData.client || candidate.currentCompany || 'Organization',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        score,
        ats: Math.round(cachedEval.atsScore ?? score),
        overallScore: score,
        matchLevel: cachedEval.matchLevel || (score >= 80 ? 'STRONG MATCH' : 'GOOD MATCH'),
        mandatory: `${cachedEval.mandatoryCompliance.met}/${cachedEval.mandatoryCompliance.total}`,
        mandatoryFailed: cachedEval.mandatoryRequirementFailed,
        decision: cachedEval.recommendation,
        by: 'Deterministic ATS Engine (v2.0)'
      });
    }

    // For any candidate in candidate pool not yet evaluated against an explicit job, evaluate against default job
    for (const item of allRecords) {
      const { candidate, jobId } = item;
      const targetJobId = jobId || candidate.jobId || 'jd-1';
      const pairKey = `${candidate.id}___${targetJobId}`;
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

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

      const evalPayload = evaluateCandidateAgainstRequirements(candidate, jobContext.jobData, jobContext.requirements);
      const score = Math.round(evalPayload.overallScore ?? evalPayload.overallMatch ?? 0);
      const createdDate = candidate.uploadedAt
        ? new Date(candidate.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Recent';

      evaluationItems.push({
        id: candidate.id,
        candidate: candidate.name || candidate.fileName || 'Candidate',
        role: candidate.currentTitle || jobContext.jobData.position || 'Professional Role',
        job: jobContext.jobData.position || jobContext.jobData.title || 'Job Position',
        jobId: jobContext.jobData.id || targetJobId,
        company: jobContext.jobData.client || candidate.currentCompany || 'Organization',
        date: createdDate,
        score,
        ats: Math.round(evalPayload.atsScore ?? score),
        overallScore: score,
        matchLevel: evalPayload.matchLevel || (score >= 80 ? 'STRONG MATCH' : 'GOOD MATCH'),
        mandatory: `${evalPayload.mandatoryCompliance.met}/${evalPayload.mandatoryCompliance.total}`,
        mandatoryFailed: evalPayload.mandatoryRequirementFailed,
        decision: evalPayload.recommendation,
        by: 'Deterministic ATS Engine (v2.0)'
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

/**
 * In-memory / fast-lookup cache for JD-specific ATS Candidate Evaluations
 * Key format: `${candidateId}___${jobId}`
 */
export const EVALUATION_CACHE = new Map<string, CandidateEvaluationPayload>();

/**
 * Match a Candidate from Candidate Pool with a specific Job Description (Entry Point 2)
 * POST /api/candidates/:candidateId/match-with-job
 */
export const matchCandidateWithJobController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidateId = String(req.params.candidateId || req.params.id || '');
    const { jobId, reevaluate } = req.body;

    if (!candidateId) {
      res.status(400).json({ status: 'ERROR', message: 'Candidate ID is required for matching.' });
      return;
    }
    if (!jobId) {
      res.status(400).json({ status: 'ERROR', message: 'Job ID is required to match with Candidate.' });
      return;
    }

    // 1. Validate Candidate Presence & Parsing Readiness
    const candidateData = await findCandidateRecord(candidateId, jobId);
    if (!candidateData) {
      res.status(404).json({
        status: 'NOT_FOUND',
        message: `Candidate with ID "${candidateId}" not found in database or candidate pool.`
      });
      return;
    }

    const isReady = candidateData.parsingStatus === 'PARSED' ||
                    (candidateData.rawText && candidateData.rawText.length > 20) ||
                    (candidateData.skills && candidateData.skills.length > 0);

    if (!isReady || candidateData.parsingStatus === 'FAILED') {
      res.status(400).json({
        status: 'NOT_READY',
        message: 'Candidate CV is not ready for evaluation.'
      });
      return;
    }

    // 2. Validate Job & Confirmed Requirements
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(jobId);
    let dbJob: any = null;
    if (isUuid) {
      dbJob = await prisma.job.findUnique({
        where: { id: jobId },
        include: { requirements: true }
      });
    }

    if (!dbJob && jobId !== 'jd-1') {
      res.status(404).json({
        status: 'NOT_FOUND',
        message: `Selected Job Description with ID "${jobId}" was not found.`
      });
      return;
    }

    const { jobData, requirements } = await getJobAndRequirements(
      jobId,
      candidateData.currentTitle || undefined,
      candidateData.currentCompany || undefined
    );

    const hasRequirements = requirements && requirements.length > 0;
    const isConfirmed = hasRequirements && (
      requirements.some((r: any) => r.recruiter_confirmed === true) ||
      requirements.length >= 2 ||
      !isUuid // fallback demo job
    );

    if (!hasRequirements || !isConfirmed) {
      res.status(400).json({
        status: 'NOT_READY',
        message: 'JD requirements must be confirmed before evaluation.'
      });
      return;
    }

    // 3. Check if Candidate has already been evaluated for this Job
    const cacheKey = `${candidateId}___${jobId}`;
    const existingEvaluation = EVALUATION_CACHE.get(cacheKey);

    if (existingEvaluation && !reevaluate) {
      res.status(200).json({
        success: true,
        evaluationId: existingEvaluation.evaluationId,
        candidateId: candidateId,
        jobId: jobId,
        status: 'COMPLETED',
        alreadyEvaluated: true,
        overallScore: existingEvaluation.overallScore,
        matchLevel: existingEvaluation.matchLevel,
        mandatoryRequirementFailed: existingEvaluation.mandatoryRequirementFailed,
        evaluation: existingEvaluation
      });
      return;
    }

    // 4. Run Existing Requirement Matching & Deterministic Scoring Engine (DO NOT REPARSE)
    const evaluation = evaluateCandidateAgainstRequirements(candidateData, jobData, requirements);

    // 5. Store in Fast-Lookup Evaluation Cache
    EVALUATION_CACHE.set(cacheKey, evaluation);

    // 6. Record/Upsert Candidate + Job association in PostgreSQL without duplicating Candidate
    const isCandUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidateId);
    if (isUuid && isCandUuid) {
      const finalScore = evaluation.overallScore ?? evaluation.overallMatch ?? 0;
      const stage = finalScore >= 80 ? 'SHORTLISTED' : (finalScore >= 55 ? 'REVIEW' : 'REJECTED');
      await prisma.candidateApplication.upsert({
        where: {
          job_id_candidate_id: {
            job_id: jobId,
            candidate_id: candidateId
          }
        },
        update: {
          match_score: finalScore,
          stage,
          updated_at: new Date()
        },
        create: {
          job_id: jobId,
          candidate_id: candidateId,
          match_score: finalScore,
          stage,
          status: 'active'
        }
      }).catch(err => {
        console.warn('[Candidate Application Upsert Notice]:', err);
      });
    }

    // 7. Successful Response
    res.status(200).json({
      success: true,
      evaluationId: evaluation.evaluationId,
      candidateId: candidateId,
      jobId: jobId,
      status: 'COMPLETED',
      alreadyEvaluated: false,
      overallScore: evaluation.overallScore,
      matchLevel: evaluation.matchLevel,
      mandatoryRequirementFailed: evaluation.mandatoryRequirementFailed,
      evaluation: evaluation
    });
  } catch (error: any) {
    console.error('Error matching candidate with job:', error);
    res.status(500).json({ error: error.message || 'Failed to match candidate with job description' });
  }
};

/**
 * Get all job-specific evaluations for a single candidate across their application history
 * GET /api/candidates/:candidateId/evaluations
 */
export const getCandidateEvaluationHistoryController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidateId = String(req.params.candidateId || req.params.id || '');
    if (!candidateId) {
      res.status(400).json({ error: 'Candidate ID is required' });
      return;
    }

    const candidate = await findCandidateRecord(candidateId);
    if (!candidate) {
      res.status(404).json({ error: `Candidate with ID "${candidateId}" not found.` });
      return;
    }

    const isCandUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidateId);
    let applications: any[] = [];
    if (isCandUuid) {
      applications = await prisma.candidateApplication.findMany({
        where: { candidate_id: candidateId },
        include: {
          job: {
            select: {
              id: true,
              position: true,
              client: true,
              location: true,
              work_mode: true,
              status: true
            }
          }
        },
        orderBy: { updated_at: 'desc' }
      }).catch(() => []);
    }

    const historyItems: any[] = [];
    const seenJobIds = new Set<string>();

    for (const app of applications) {
      if (app.job) {
        seenJobIds.add(app.job_id);
        const cacheKey = `${candidateId}___${app.job_id}`;
        const cached = EVALUATION_CACHE.get(cacheKey);

        historyItems.push({
          jobId: app.job.id,
          jobTitle: app.job.position,
          position: app.job.position,
          client: app.job.client,
          company: app.job.client,
          location: app.job.location || 'Remote',
          score: app.match_score !== null ? Math.round(app.match_score) : (cached?.overallScore || null),
          matchLevel: cached?.matchLevel || (app.match_score && app.match_score >= 80 ? 'STRONG MATCH' : 'GOOD MATCH'),
          status: app.stage || 'SOURCED',
          stage: app.stage || 'SOURCED',
          date: app.updated_at ? new Date(app.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
          evaluationId: cached?.evaluationId || `eval-${app.id}`,
          alreadyEvaluated: Boolean(cached || app.match_score !== null)
        });
      }
    }

    // Include any in-memory cached evaluations for this candidate
    for (const [key, evalData] of EVALUATION_CACHE.entries()) {
      if (key.startsWith(`${candidateId}___`)) {
        const jId = key.split('___')[1];
        if (!seenJobIds.has(jId)) {
          seenJobIds.add(jId);
          const evalScore = evalData.overallScore ?? evalData.overallMatch ?? 0;
          historyItems.push({
            jobId: jId,
            jobTitle: evalData.jobTitle || 'Job Position',
            position: evalData.jobTitle || 'Job Position',
            client: evalData.jobClient || 'Enterprise Client',
            company: evalData.jobClient || 'Enterprise Client',
            location: 'Remote',
            score: evalScore,
            matchLevel: evalData.matchLevel || (evalScore >= 80 ? 'STRONG MATCH' : 'GOOD MATCH'),
            status: evalScore >= 80 ? 'SHORTLISTED' : 'REVIEW',
            stage: evalScore >= 80 ? 'SHORTLISTED' : 'REVIEW',
            date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            evaluationId: evalData.evaluationId,
            alreadyEvaluated: true
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      candidateId,
      candidateName: candidate.name,
      total: historyItems.length,
      evaluations: historyItems
    });
  } catch (error: any) {
    console.error('Error fetching candidate evaluation history:', error);
    res.status(500).json({ error: 'Failed to retrieve candidate evaluation history' });
  }
};
