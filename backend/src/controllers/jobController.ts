import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { extractTextFromBuffer, parseJobDescription } from '../services/jdParsingService';
import { extractDocumentTextViaPython } from '../services/pythonDocumentClient';

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
    const result = parseJobDescription(textToParse, fileName, mimeType, pageCount, method, ocrUsed);

    console.log(`[JD Parsing Pipeline] Extracted Title: "${result.data.job.jobTitle || 'null'}", Client: "${result.data.job.company || 'null'}", Salary: "${result.data.job.salary || 'null'}", Requirements Count: ${result.data.requirements.length}`);

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
            category: r.category ? String(r.category).trim() : 'General',
            is_mandatory: Boolean(r.is_mandatory ?? r.isMandatory ?? false),
            weight: typeof r.weight === 'number' ? r.weight : 1.0,
            evidence_required: Boolean(r.evidence_required ?? r.evidenceRequired ?? false)
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

    const jobs = await prisma.job.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        requirements: true
      }
    });

    res.status(200).json({
      count: jobs.length,
      jobs
    });
  } catch (error: any) {
    console.error('Get All Jobs Error:', error);
    res.status(500).json({ error: 'Server error while fetching jobs', details: error.message || String(error) });
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
        requirements: true
      }
    });

    if (!job) {
      res.status(404).json({ error: `Job with ID "${jobId}" not found` });
      return;
    }

    res.status(200).json({ job });
  } catch (error: any) {
    console.error('Get Job By ID Error:', error);
    res.status(500).json({ error: 'Server error while fetching job details', details: error.message || String(error) });
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
