import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { extractTextFromBuffer, parseJobDescription } from '../services/jdParsingService';
import { extractDocumentTextViaPython } from '../services/pythonDocumentClient';
import { parseJdWithAi } from '../services/jdAiService';
import { CANDIDATE_STORE } from './candidateController';

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

    // Role-Based Access Control:
    // If not authenticated, return empty set
    if (!req.user || !req.user.userId) {
      res.status(200).json({ success: true, count: 0, jobs: [] });
      return;
    }

    // If authenticated user is NOT an ADMIN, only return JDs created by this user.
    // Administrators (ADMIN) can view all JDs across the organization.
    if (req.user.role !== 'ADMIN') {
      whereClause.created_by = req.user.userId;
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          candidates: {
            select: {
              id: true,
              created_by: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          },
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
      const memCount = CANDIDATE_STORE.get(job.id)?.length || 0;
      const dbCount = Math.max(job._count?.candidates || 0, job._count?.applications || 0);
      const candidatesCount = Math.max(dbCount, memCount);

      // Collect all unique team members working on this JD from database
      const workedByMap = new Map<string, {
        id: string;
        name: string;
        email: string;
        role: string;
        action: string;
        isCreator: boolean;
      }>();

      const isExcludedWorker = (name?: string | null, email?: string | null) => {
        const n = (name || '').toLowerCase().trim();
        const e = (email || '').toLowerCase().trim();
        return (
          n === 'tasknera user' ||
          n === 'tasknera' ||
          n === 'unassigned' ||
          e.startsWith('frontend_user') ||
          e.includes('frontend_user') ||
          e.includes('tasknera_user')
        );
      };

      // 1. Requisition Owner / Creator
      if (job.user && !isExcludedWorker(job.user.name, job.user.email)) {
        const creatorName = job.user.name || (job.user.email ? job.user.email.split('@')[0] : 'Administrator');
        workedByMap.set(job.user.id, {
          id: job.user.id,
          name: creatorName,
          email: job.user.email,
          role: job.user.role || 'ADMIN',
          action: 'Created Requisition',
          isCreator: true
        });
      }

      // 2. Candidate Processors / Recruiters from database
      if (Array.isArray(job.candidates)) {
        for (const cand of job.candidates) {
          if (cand.user && !workedByMap.has(cand.user.id) && !isExcludedWorker(cand.user.name, cand.user.email)) {
            const candRecruiterName = cand.user.name || (cand.user.email ? cand.user.email.split('@')[0] : 'Recruiter');
            workedByMap.set(cand.user.id, {
              id: cand.user.id,
              name: candRecruiterName,
              email: cand.user.email,
              role: cand.user.role || 'MEMBER',
              action: 'Processed Candidates',
              isCreator: cand.user.id === job.created_by
            });
          }
        }
      }

      const workedBy = Array.from(workedByMap.values());
      const assignedRecruiter = workedBy.length > 0
        ? workedBy.map(u => u.name).join(', ')
        : (job.user?.name || 'Administrator');

      const { applications, candidates, _count, ...rest } = job;
      return {
        ...rest,
        candidatesCount,
        candidates: candidatesCount,
        topScore,
        workedBy,
        assignedRecruiter,
        creator: job.user || null
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
    if (!req.user || !req.user.userId) {
      res.status(200).json({ success: true, count: 0, jobs: [] });
      return;
    }

    const whereClause: any = {
      status: { not: 'archived' }
    };
    // Non-admin members only see their own created jobs for matching
    if (req.user.role !== 'ADMIN') {
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
    const jobId = String(req.params.id || '').trim();

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required.' });
      return;
    }

    // 1. Try finding in database if valid UUID
    if (UUID_REGEX.test(jobId)) {
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          requirements: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          candidates: {
            select: {
              id: true,
              created_by: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          _count: {
            select: {
              candidates: true,
              applications: true
            }
          }
        }
      });

      if (job) {
        // Enforce RBAC: Non-admin recruiters can only access their own jobs
        if (req.user && req.user.role !== 'ADMIN' && job.created_by !== req.user.userId) {
          res.status(403).json({ error: 'Forbidden: You do not have permission to view this requisition.' });
          return;
        }

        const isExcludedWorker = (name?: string | null, email?: string | null) => {
          const n = (name || '').toLowerCase().trim();
          const e = (email || '').toLowerCase().trim();
          return (
            n === 'tasknera user' ||
            n === 'tasknera' ||
            n === 'unassigned' ||
            e.startsWith('frontend_user') ||
            e.includes('frontend_user') ||
            e.includes('tasknera_user')
          );
        };

        const workedByMap = new Map<string, any>();
        if (job.user && !isExcludedWorker(job.user.name, job.user.email)) {
          workedByMap.set(job.user.id, {
            id: job.user.id,
            name: job.user.name || (job.user.email ? job.user.email.split('@')[0] : 'Administrator'),
            email: job.user.email,
            role: job.user.role || 'ADMIN',
            action: 'Created Requisition',
            isCreator: true
          });
        }
        if (Array.isArray(job.candidates)) {
          for (const cand of job.candidates) {
            if (cand.user && !workedByMap.has(cand.user.id) && !isExcludedWorker(cand.user.name, cand.user.email)) {
              workedByMap.set(cand.user.id, {
                id: cand.user.id,
                name: cand.user.name || (cand.user.email ? cand.user.email.split('@')[0] : 'Recruiter'),
                email: cand.user.email,
                role: cand.user.role || 'MEMBER',
                action: 'Processed Candidates',
                isCreator: cand.user.id === job.created_by
              });
            }
          }
        }
        const workedBy = Array.from(workedByMap.values());
        const assignedRecruiter = workedBy.length > 0
          ? workedBy.map(u => u.name).join(', ')
          : (job.user?.name || 'Administrator');

        res.status(200).json({
          job: {
            ...job,
            workedBy,
            assignedRecruiter
          }
        });
        return;
      }
    }

    // 2. Check sample jobs if not found in database
    const sampleJobs: Record<string, any> = {
      'job-sample-1': {
        id: 'job-sample-1',
        position: 'Full Stack Engineer-(Go and React)',
        title: 'Full Stack Engineer-(Go and React)',
        client: 'IBM',
        location: 'Bangalore, Onsite (locals only)',
        work_mode: 'Onsite',
        salary: '20 LPA Max',
        status: 'Draft',
        requirements: []
      },
      'job-sample-2': {
        id: 'job-sample-2',
        position: 'Salesforce Manufacturing Cloud Developer',
        title: 'Salesforce Manufacturing Cloud Developer',
        client: 'Hexaware',
        location: 'Noida (Onsite)',
        work_mode: 'Onsite',
        salary: 'Up to ₹15-18 LPA',
        status: 'Active',
        requirements: []
      },
      'job-sample-3': {
        id: 'job-sample-3',
        position: 'Full-Stack Developer (MERN + AI)',
        title: 'Full-Stack Developer (MERN + AI)',
        client: 'the Role',
        location: 'Mumbai, Maharashtra, India',
        work_mode: 'Hybrid',
        salary: '₹4,00,000–₹8,00,000 per annum',
        status: 'Active',
        requirements: []
      },
      'job-sample-4': {
        id: 'job-sample-4',
        position: 'Salesforce Manufacturing Cloud Developer',
        title: 'Salesforce Manufacturing Cloud Developer',
        client: 'Hexaware',
        location: 'Noida (Onsite)',
        work_mode: 'Onsite',
        salary: 'Up to ₹15-18 LPA',
        status: 'Draft',
        requirements: []
      }
    };

    const matchedSample = sampleJobs[jobId] || Object.values(sampleJobs).find(
      s => s.id === jobId || s.position.toLowerCase().includes(jobId.toLowerCase())
    );

    if (matchedSample) {
      res.status(200).json({ job: matchedSample });
      return;
    }

    // 3. Dynamic formatting fallback from ID
    const formattedTitle = jobId
      .replace(/^job-sample-\d+/i, 'Software Professional')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    res.status(200).json({
      job: {
        id: jobId,
        position: formattedTitle || 'Job Position',
        title: formattedTitle || 'Job Position',
        client: 'Enterprise Client',
        location: 'Remote / Hybrid',
        work_mode: 'Hybrid',
        salary: 'Competitive',
        status: 'Active',
        requirements: []
      }
    });
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

    // Enforce RBAC: Non-admin members can only update their own created JDs
    if (req.user && req.user.role !== 'ADMIN' && existingJob.created_by !== req.user.userId) {
      res.status(403).json({ error: 'Forbidden: You can only edit requisitions created by you.' });
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

    // Enforce RBAC: Non-admin members can only delete their own created JDs
    if (req.user && req.user.role !== 'ADMIN' && existingJob.created_by !== req.user.userId) {
      res.status(403).json({ error: 'Forbidden: You can only delete requisitions created by you.' });
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

