import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { extractTextFromBuffer, parseJobDescription } from '../services/jdParsingService';
import { extractDocumentTextViaPython } from '../services/pythonDocumentClient';
import { parseJdWithAi } from '../services/jdAiService';

// Standard 36-character UUID format regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// @desc    Parse Job Description from PDF / DOCX file or raw text
// @route   POST /api/jobs/parse
// @access  Private (Authenticated Recruiter)
export const parseJobDescriptionController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let rawText = '';
    let fileName = 'pasted_text.txt';
    let mimeType = 'text/plain';
    let pageCount = 1;
    let method = 'plain-text';
    let ocrUsed = false;

    let layoutText = '';
    let normalizedText = '';

    if (req.file) {
      fileName = req.file.originalname || 'uploaded_document';
      mimeType = req.file.mimetype || 'application/octet-stream';
      console.log(`[JD Parsing Pipeline] Delegating file to Python Document Service: "${fileName}" (${req.file.size} bytes)`);

      const pythonRes = await extractDocumentTextViaPython(req.file.buffer, fileName, mimeType);

      if (pythonRes && pythonRes.success && (pythonRes.normalizedText || pythonRes.text)) {
        rawText = pythonRes.text;
        layoutText = pythonRes.layoutText || pythonRes.text;
        normalizedText = pythonRes.normalizedText || pythonRes.text;
        pageCount = pythonRes.pageCount;
        method = pythonRes.extractionMethod;
        ocrUsed = pythonRes.ocrUsed;
      } else {
        console.log('[JD Parsing Pipeline] Python service fallback; running internal extractor...');
        const fallbackRes = await extractTextFromBuffer(req.file.buffer, mimeType, fileName);
        rawText = fallbackRes.text;
        layoutText = fallbackRes.text;
        normalizedText = fallbackRes.text;
        pageCount = fallbackRes.pageCount;
        method = fallbackRes.method;
        ocrUsed = fallbackRes.ocrUsed;
      }
    } else if (req.body && req.body.text && typeof req.body.text === 'string') {
      rawText = req.body.text;
      layoutText = req.body.text;
      normalizedText = req.body.text;
      console.log(`[JD Parsing Pipeline] Raw text input (${rawText.length} chars)`);
    } else {
      res.status(400).json({ error: 'Please provide either a PDF/DOCX file upload or a JSON body with "text".' });
      return;
    }

    if (!rawText || rawText.trim().length === 0) {
      res.status(400).json({
        error: 'Unable to extract readable text from this document. Text extraction was insufficient.'
      });
      return;
    }

    const textToParse = normalizedText || layoutText || rawText;
    
    // 1. Run deterministic parser
    let result = parseJobDescription(textToParse, fileName, mimeType, pageCount, method, ocrUsed);

    // 2. Run Gemini AI Parser if API key is provided
    try {
      const aiResult = await parseJdWithAi(textToParse);
      if (aiResult) {
        console.log('[JD Parsing Pipeline] AI Semantic model successfully enriched extraction.');
        if (aiResult.companyName) {
          result.data.companyName = aiResult.companyName;
          result.data.metadata.client = aiResult.companyName;
          result.data.metadata.companyName = aiResult.companyName;
          result.data.job.company = aiResult.companyName;
          result.data.job.client = aiResult.companyName;
        }
        if (aiResult.positionTitle) {
          result.data.positionTitle = aiResult.positionTitle;
          result.data.metadata.position = aiResult.positionTitle;
          result.data.metadata.positionTitle = aiResult.positionTitle;
          result.data.job.positionTitle = aiResult.positionTitle;
          result.data.job.jobTitle = aiResult.positionTitle;
        }
        if (aiResult.location) {
          result.data.location = aiResult.location;
          result.data.metadata.location = aiResult.location;
          result.data.job.location = aiResult.location;
        }
        if (aiResult.workMode) {
          result.data.workMode = aiResult.workMode;
          result.data.metadata.workMode = aiResult.workMode;
          result.data.job.workMode = aiResult.workMode;
        }
        if (aiResult.salary) {
          result.data.salary = aiResult.salary;
          result.data.metadata.salary = aiResult.salary;
          result.data.metadata.budget = aiResult.salary;
          result.data.job.salary = aiResult.salary;
          result.data.job.budget = aiResult.salary;
        }
        if (Array.isArray(aiResult.mandatoryRequirements) && aiResult.mandatoryRequirements.length > 0) {
          const aiMandatoryList = aiResult.mandatoryRequirements.map((r, idx) => ({
            requirement: r.requirement,
            category: r.category || 'Experience',
            type: 'SKILL' as const,
            weight: 1.5,
            isMandatory: true,
            mandatory: true,
            evidenceRequired: true,
            recruiterConfirmed: false,
            sourceEvidence: r.sourceEvidence || r.requirement,
            sourceSection: 'Mandatory Requirements',
            confidence: 'HIGH' as const,
            needsVerification: false
          }));

          const aiPreferredList = (aiResult.preferredRequirements || []).map((r, idx) => ({
            requirement: r.requirement,
            category: r.category || 'Technical Skill',
            type: 'SKILL' as const,
            weight: 1.0,
            isMandatory: false,
            mandatory: false,
            evidenceRequired: true,
            recruiterConfirmed: false,
            sourceEvidence: r.sourceEvidence || r.requirement,
            sourceSection: 'Preferred Requirements',
            confidence: 'HIGH' as const,
            needsVerification: false
          }));

          result.data.mandatoryRequirements = aiMandatoryList.map(r => r.requirement);
          result.data.preferredRequirements = aiPreferredList.map(r => r.requirement);
          result.data.requirements = [...aiMandatoryList, ...aiPreferredList];
          result.data.job.mandatoryRequirements = aiMandatoryList.map(r => r.requirement);
          result.data.job.preferredRequirements = aiPreferredList.map(r => r.requirement);
          result.data.validation.counts.mandatoryCount = aiMandatoryList.length;
          result.data.validation.counts.preferredCount = aiPreferredList.length;
          result.data.validation.counts.totalRequirementsCount = result.data.requirements.length;
        }
      }
    } catch (aiErr) {
      console.warn('[JD Parsing Pipeline] AI parsing error, falling back to deterministic extraction:', aiErr);
    }

    console.log('\n========================================');
    console.log('[JD PARSING PIPELINE DEBUG]');
    console.log(`Company: "${result.data.companyName}" | Position: "${result.data.positionTitle}" | Location: "${result.data.location}"`);
    console.log(`Mandatory Count: ${result.data.validation.counts.mandatoryCount} | Preferred Count: ${result.data.validation.counts.preferredCount}`);
    console.log('========================================\n');

    res.status(200).json({
      success: result.success,
      rawText: rawText,
      layoutText: layoutText || rawText,
      normalizedText: normalizedText || rawText,
      data: result.data
    });
  } catch (error: any) {
    console.error('[JD Parsing Pipeline] Error:', error);
    res.status(500).json({
      error: error.message || 'Unable to parse document text.',
      details: error.message || String(error)
    });
  }
};

// @desc    Create a new Job
// @route   POST /api/jobs
// @access  Private (Authenticated Recruiter)
export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: 'User authentication required' });
      return;
    }

    const { client, position, location, work_mode, salary, jd_text, jd_file_url, status, requirements } = req.body;

    // Required Field Validation
    if (!client || typeof client !== 'string' || !client.trim()) {
      res.status(400).json({ error: 'Field "client" is required and must be a non-empty string' });
      return;
    }

    if (!position || typeof position !== 'string' || !position.trim()) {
      res.status(400).json({ error: 'Field "position" is required and must be a non-empty string' });
      return;
    }

    // Optional Enum / Status Validation
    const validStatuses = ['draft', 'published', 'closed', 'archived'];
    const jobStatus = status ? String(status).toLowerCase().trim() : 'draft';
    if (status && !validStatuses.includes(jobStatus)) {
      res.status(400).json({ error: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });
      return;
    }

    // Format requirements if passed
    const requirementsData = Array.isArray(requirements)
      ? requirements
          .map((r: any) => ({
            requirement: String(r.requirement || r.text || '').trim(),
            category: r.category ? String(r.category).trim() : 'Other',
            is_mandatory: Boolean(r.is_mandatory ?? r.isMandatory ?? false),
            weight: typeof r.weight === 'number' ? r.weight : 1.0,
            evidence_required: Boolean(r.evidence_required ?? r.evidenceRequired ?? false),
            source_evidence: String(r.sourceEvidence || r.source_evidence || r.requirement || r.text || '').trim(),
            needs_verification: Boolean(r.needsVerification ?? r.needs_verification ?? false)
          }))
          .filter((r: any) => r.requirement.length > 0)
      : [];

    // Save job in PostgreSQL via Prisma with optional nested requirements
    const job = await prisma.job.create({
      data: {
        client: client.trim(),
        position: position.trim(),
        location: location ? String(location).trim() : null,
        work_mode: work_mode ? String(work_mode).trim() : null,
        salary: salary ? String(salary).trim() : null,
        jd_text: jd_text ? String(jd_text).trim() : null,
        jd_file_url: jd_file_url ? String(jd_file_url).trim() : null,
        status: jobStatus,
        created_by: req.user.userId,
        requirements: {
          create: requirementsData
        }
      },
      include: {
        requirements: true
      }
    });

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error: any) {
    console.error('Create Job Error:', error);
    res.status(500).json({ error: 'Server error while creating job', details: error.message || String(error) });
  }
};

// @desc    Get all Jobs (with optional filters)
// @route   GET /api/jobs
// @access  Private (Authenticated Recruiter)
export const getAllJobs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, client, search } = req.query;

    const whereClause: any = {};

    if (status && typeof status === 'string') {
      whereClause.status = status.toLowerCase().trim();
    }

    if (client && typeof client === 'string') {
      whereClause.client = {
        contains: client.trim(),
        mode: 'insensitive'
      };
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { position: { contains: search.trim(), mode: 'insensitive' } },
        { client: { contains: search.trim(), mode: 'insensitive' } },
        { location: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    let jobs: any[] = [];
    try {
      jobs = await prisma.job.findMany({
        where: whereClause,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          requirements: true,
          _count: {
            select: {
              candidates: true,
              applications: true
            }
          },
          applications: {
            select: {
              match_score: true
            }
          }
        }
      });
    } catch (dbErr) {
      console.error('[Get All Jobs] Database query error:', dbErr);
    }

    const formattedJobs = jobs.map((job: any) => {
      const matchScores = (job.applications || [])
        .map((a: any) => a.match_score)
        .filter((s: any) => typeof s === 'number' && !isNaN(s));
      const topScore = matchScores.length > 0 ? Math.round(Math.max(...matchScores)) : null;
      const candidatesCount = job._count?.candidates || job._count?.applications || 0;

      const { applications, _count, ...rest } = job;
      return {
        ...rest,
        candidatesCount,
        topScore
      };
    });

    res.status(200).json({
      count: formattedJobs.length,
      jobs: formattedJobs
    });
  } catch (error: any) {
    console.error('Get All Jobs Error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', jobs: [] });
  }
};

// @desc    Get all jobs available for candidate matching/evaluation
// @route   GET /api/jobs/available-for-evaluation
// @access  Private / Authenticated Recruiter
export const getAvailableJobsForEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const whereClause: any = {};
    if (req.user && req.user.userId) {
      whereClause.created_by = req.user.userId;
    }

    let dbJobs: any[] = [];
    try {
      dbJobs = await prisma.job.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        include: {
          requirements: true,
          _count: {
            select: {
              candidates: true,
              applications: true
            }
          }
        }
      });
    } catch (dbErr) {
      console.error('[Available Jobs] Database query error:', dbErr);
    }

    // Fallback if no jobs exist in DB for demo
    if (dbJobs.length === 0) {
      dbJobs = await prisma.job.findMany({
        orderBy: { created_at: 'desc' },
        include: {
          requirements: true,
          _count: {
            select: {
              candidates: true,
              applications: true
            }
          }
        }
      }).catch(() => []);
    }

    const availableJobs = dbJobs.map((job: any) => {
      const requirements = job.requirements || [];
      const requirementsCount = requirements.length;
      // JD requirements are confirmed if at least one requirement has recruiter_confirmed=true OR requirements exist in confirmed status
      const requirementsConfirmed = requirementsCount > 0 && (
        requirements.some((r: any) => r.recruiter_confirmed === true) ||
        requirementsCount >= 3
      );

      return {
        id: job.id,
        position: job.position || 'Software Professional',
        client: job.client || 'Enterprise Client',
        company: job.client || 'Enterprise Client',
        location: job.location || 'Remote',
        workMode: job.work_mode || 'Full-time',
        status: job.status || 'published',
        salary: job.salary || undefined,
        requirementsCount,
        requirementsConfirmed,
        candidatesCount: job._count?.candidates || job._count?.applications || 0,
        createdAt: job.created_at
      };
    });

    res.status(200).json({
      success: true,
      count: availableJobs.length,
      jobs: availableJobs
    });
  } catch (error: any) {
    console.error('Get Available Jobs Error:', error);
    res.status(500).json({ error: 'Failed to fetch available jobs for evaluation', jobs: [] });
  }
};

// @desc    Get single Job by ID
// @route   GET /api/jobs/:id
// @access  Private (Authenticated Recruiter)
export const getJobById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.id || '');

    if (!jobId || !UUID_REGEX.test(jobId)) {
      res.status(400).json({ error: 'Invalid Job ID format. Must be a valid UUID.' });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        requirements: true,
        _count: {
          select: {
            candidates: true,
            applications: true
          }
        }
      }
    });

    if (!job) {
      res.status(404).json({ error: `Job with ID "${jobId}" not found` });
      return;
    }

    res.status(200).json({ job });
  } catch (error: any) {
    console.error('Get Job By ID Error:', error);
    res.status(500).json({ error: 'Server error while fetching job' });
  }
};

// @desc    Update Job by ID
// @route   PUT /api/jobs/:id
// @access  Private (Authenticated Recruiter)
export const updateJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.id || '');

    if (!jobId || !UUID_REGEX.test(jobId)) {
      res.status(400).json({ error: 'Invalid Job ID format. Must be a valid UUID.' });
      return;
    }

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!existingJob) {
      res.status(404).json({ error: `Job with ID "${jobId}" not found` });
      return;
    }

    const { client, position, location, work_mode, salary, jd_text, jd_file_url, status } = req.body;

    // Optional Status Validation if provided
    if (status) {
      const validStatuses = ['draft', 'published', 'closed', 'archived'];
      if (!validStatuses.includes(String(status).toLowerCase().trim())) {
        res.status(400).json({ error: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });
        return;
      }
    }

    const updateData: any = {};
    if (client !== undefined) updateData.client = String(client).trim();
    if (position !== undefined) updateData.position = String(position).trim();
    if (location !== undefined) updateData.location = location ? String(location).trim() : null;
    if (work_mode !== undefined) updateData.work_mode = work_mode ? String(work_mode).trim() : null;
    if (salary !== undefined) updateData.salary = salary ? String(salary).trim() : null;
    if (jd_text !== undefined) updateData.jd_text = jd_text ? String(jd_text).trim() : null;
    if (jd_file_url !== undefined) updateData.jd_file_url = jd_file_url ? String(jd_file_url).trim() : null;
    if (status !== undefined) updateData.status = String(status).toLowerCase().trim();

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
      include: {
        requirements: true
      }
    });

    res.status(200).json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error: any) {
    console.error('Update Job Error:', error);
    res.status(500).json({ error: 'Server error while updating job', details: error.message || String(error) });
  }
};

// @desc    Delete Job by ID
// @route   DELETE /api/jobs/:id
// @access  Private (Authenticated Recruiter)
export const deleteJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.id || '');

    if (!jobId || !UUID_REGEX.test(jobId)) {
      res.status(400).json({ error: 'Invalid Job ID format. Must be a valid UUID.' });
      return;
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!existingJob) {
      res.status(404).json({ error: `Job with ID "${jobId}" not found` });
      return;
    }

    // Cascade delete related records
    await prisma.candidateApplication.deleteMany({ where: { job_id: jobId } });
    await prisma.candidate.deleteMany({ where: { job_id: jobId } });
    await prisma.requirement.deleteMany({ where: { job_id: jobId } });
    await prisma.job.delete({ where: { id: jobId } });

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete Job Error:', error);
    res.status(500).json({ error: 'Server error while deleting job', details: error.message || String(error) });
  }
};

