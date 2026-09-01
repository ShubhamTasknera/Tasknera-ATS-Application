import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { extractDocumentTextViaPython, PythonDocumentResponse } from '../services/pythonDocumentClient';
import {
  extractStructuredCandidateFromText,
  CandidateParsedProfile,
  validateCvTextQuality,
  calculateCareerGaps
} from '../services/cvParsingService';

export interface CandidateRecord extends CandidateParsedProfile {
  id: string;
  jobId: string;
  fileName: string;
  fileSize: number;
  fileHash?: string;
  uploadedAt: string;
  isDuplicate?: boolean;
}

// In-memory store for fast state sync and test resilience
const CANDIDATE_STORE: Map<string, CandidateRecord[]> = new Map();
const GLOBAL_CANDIDATES: Map<string, CandidateRecord> = new Map(); // Keyed by fileHash or id

// Initial realistic default candidates for demo jobs
const DEFAULT_INITIAL_CANDIDATES: Record<string, CandidateRecord[]> = {
  'jd-1': [
    {
      id: 'cand-101',
      jobId: 'jd-1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98234 56789',
      location: 'Pune, Maharashtra',
      totalExperience: '5 years',
      relevantExperience: '5 years',
      currentTitle: 'Senior Frontend Developer',
      currentCompany: 'TechNova Solutions',
      summary: 'Frontend Specialist with 5 years experience designing high-throughput web applications with React, TypeScript, and modern design systems.',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'Jest', 'REST APIs', 'Node.js'],
      technologies: ['React', 'Next.js', 'TypeScript', 'Node.js'],
      tools: ['Git', 'Jest', 'Tailwind CSS'],
      industries: [],
      education: [
        {
          degree: 'Bachelor of Engineering (B.E.)',
          field: 'Computer Engineering',
          institution: 'Pune Institute of Computer Technology',
          year: '2019',
          details: 'First Class with Distinction'
        }
      ],
      certifications: ['Meta Certified Front-End Developer', 'AWS Certified Cloud Practitioner'],
      experience: [
        {
          title: 'Senior Frontend Developer',
          company: 'TechNova Solutions',
          duration: '3 years',
          startDate: '2021',
          endDate: 'Present',
          location: 'Pune, Maharashtra',
          description: 'Architecting core web applications, implementing UI components, and optimizing Core Web Vitals.'
        }
      ],
      projects: [
        {
          name: 'Enterprise Recruitment Portal',
          description: 'Built modular dashboard with real-time state management and custom Tailwind UI components.',
          technologies: ['React', 'TypeScript', 'Tailwind CSS']
        }
      ],
      languages: ['English', 'Hindi', 'Marathi'],
      responsibilities: [],
      achievements: [],
      rawText: `RAHUL SHARMA\nSenior Frontend Developer\nEmail: rahul.sharma@example.com | Phone: +91 98234 56789 | Location: Pune, Maharashtra\n\nSUMMARY\nFrontend Specialist with 5 years experience designing high-throughput web applications with React, TypeScript, and modern design systems.\n\nEXPERIENCE\nSenior Frontend Developer — TechNova Solutions (2021 – Present)\n- Architected enterprise client portal in React & TypeScript.\n- Improved frontend load speed by 42% through code-splitting and asset optimization.\n\nEDUCATION\nBachelor of Engineering (B.E.), Pune Institute of Computer Technology (2015 – 2019)\n\nSKILLS\nReact, TypeScript, Next.js, Tailwind CSS, Redux, Node.js, REST APIs, Git, Jest`,
      parsingStatus: 'PARSED',
      validationErrors: [],
      parsingMetadata: {
        fileName: 'CV_Rahul_Sharma_Frontend.pdf',
        fileType: 'application/pdf',
        pageCount: 2,
        extractionMethod: 'pymupdf-layout',
        ocrUsed: false,
        characterCount: 980,
        wordCount: 145
      },
      fileName: 'CV_Rahul_Sharma_Frontend.pdf',
      fileSize: 184500,
      fileHash: 'seeded-hash-rahul-sharma',
      uploadedAt: '2024-02-15T09:30:00.000Z'
    }
  ]
};

// Initialize global store with defaults
for (const [jobId, list] of Object.entries(DEFAULT_INITIAL_CANDIDATES)) {
  CANDIDATE_STORE.set(jobId, [...list]);
  for (const c of list) {
    if (c.fileHash) GLOBAL_CANDIDATES.set(c.fileHash, c);
    GLOBAL_CANDIDATES.set(c.id, c);
  }
}

/**
 * Get all candidates associated with a specific Job
 * GET /api/jobs/:jobId/candidates
 */
export const getCandidatesForJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.jobId || '');
    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    // 1. Try fetching from Prisma DB if accessible
    let dbCandidates: CandidateRecord[] = [];
    try {
      const apps = await (prisma as any).candidateApplication?.findMany({
        where: { job_id: jobId },
        include: {
          candidate: {
            include: {
              experiences: true,
              education: true,
              skills: true,
              certifications: true,
              languages: true,
              projects: true,
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      if (apps && apps.length > 0) {
        dbCandidates = apps.map((app: any) => {
          const c = app.candidate;
          return {
            id: c.id,
            jobId,
            name: c.name,
            email: c.email,
            phone: c.phone,
            location: c.location,
            totalExperience: c.total_experience,
            relevantExperience: c.total_experience,
            currentTitle: c.current_title,
            currentCompany: c.current_company,
            summary: c.summary,
            professionalSummary: c.summary,
            skills: c.skills?.map((s: any) => s.skill) || [],
            technologies: c.skills?.map((s: any) => s.skill) || [],
            tools: [],
            industries: [],
            education: c.education?.map((e: any) => ({
              degree: e.degree,
              institution: e.institution,
              field: e.field,
              year: e.start_year ? `${e.start_year}` : undefined,
            })) || [],
            certifications: c.certifications?.map((ct: any) => ct.certification) || [],
            languages: c.languages?.map((l: any) => l.language) || [],
            experience: c.experiences?.map((ex: any) => ({
              title: ex.title,
              company: ex.company,
              startDate: ex.start_date,
              endDate: ex.end_date,
              duration: ex.duration,
              description: ex.description,
            })) || [],
            gapAnalysis: calculateCareerGaps(c.experiences?.map((ex: any) => ({
              title: ex.title,
              company: ex.company,
              startDate: ex.start_date,
              endDate: ex.end_date,
              duration: ex.duration,
              description: ex.description,
            })) || []),
            responsibilities: [],
            achievements: [],
            projects: c.projects?.map((p: any) => ({
              name: p.name,
              description: p.description,
              technologies: p.technologies,
            })) || [],
            rawText: c.raw_text || '',
            parsingStatus: (c.parsing_status as any) || 'PARSED',
            validationErrors: [],
            parsingMetadata: {
              fileName: c.resume_file_url || 'cv.pdf',
              fileType: 'application/pdf',
              pageCount: 1,
              extractionMethod: 'prisma-db',
              ocrUsed: false,
              characterCount: (c.raw_text || '').length,
              wordCount: (c.raw_text || '').split(/\s+/).filter(Boolean).length,
            },
            fileName: c.resume_file_url || 'cv.pdf',
            fileSize: 100000,
            fileHash: c.file_hash || undefined,
            uploadedAt: c.created_at.toISOString(),
          };
        });
      }
    } catch (dbErr) {
      console.warn('[Candidates] Database query fallback to memory store:', dbErr);
    }

    // 2. Check memory store
    let memCandidates = CANDIDATE_STORE.get(jobId);
    if (!memCandidates) {
      if (DEFAULT_INITIAL_CANDIDATES[jobId]) {
        memCandidates = [...DEFAULT_INITIAL_CANDIDATES[jobId]];
      } else if (jobId === 'default' || jobId === 'all') {
        memCandidates = [...DEFAULT_INITIAL_CANDIDATES['jd-1']];
      } else {
        memCandidates = [];
      }
      CANDIDATE_STORE.set(jobId, memCandidates);
    }

    // Combine unique candidates (DB + Memory)
    const combinedMap = new Map<string, CandidateRecord>();
    for (const c of memCandidates) combinedMap.set(c.id, c);
    for (const c of dbCandidates) combinedMap.set(c.id, c);

    const resultList = Array.from(combinedMap.values());

    res.json({
      success: true,
      jobId,
      total: resultList.length,
      parsedCount: resultList.filter(c => c.parsingStatus === 'PARSED').length,
      processingCount: resultList.filter(c => c.parsingStatus === 'PROCESSING' || c.parsingStatus === 'UPLOADED').length,
      failedCount: resultList.filter(c => c.parsingStatus === 'FAILED').length,
      candidates: resultList
    });
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to retrieve candidates for job' });
  }
};

/**
 * Get single candidate details
 * GET /api/jobs/:jobId/candidates/:candidateId
 */
export const getCandidateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.jobId || '');
    const candidateId = String(req.params.candidateId || '');

    // Check memory store
    const candidates = CANDIDATE_STORE.get(jobId);
    const candidate = candidates?.find(c => c.id === candidateId) || GLOBAL_CANDIDATES.get(candidateId);

    if (candidate) {
      res.json({
        success: true,
        jobId,
        candidate
      });
      return;
    }

    // Try DB
    try {
      const c = await prisma.candidate.findUnique({
        where: { id: candidateId },
        include: {
          experiences: true,
          education: true,
          skills: true,
          certifications: true,
          languages: true,
          projects: true,
        }
      });
      if (c) {
        const record: CandidateRecord = {
          id: c.id,
          jobId,
          name: c.name,
          email: c.email,
          phone: c.phone,
          location: c.location,
          totalExperience: c.total_experience,
          relevantExperience: c.total_experience,
          currentTitle: c.current_title,
          currentCompany: c.current_company,
          summary: c.summary,
          professionalSummary: c.summary,
          skills: c.skills.map(s => s.skill),
          technologies: c.skills.map(s => s.skill),
          tools: [],
          industries: [],
          education: c.education.map(e => ({
            degree: e.degree,
            institution: e.institution,
            field: e.field,
            year: e.start_year ? `${e.start_year}` : undefined,
          })),
          certifications: c.certifications.map(ct => ct.certification),
          languages: c.languages.map(l => l.language),
          experience: c.experiences.map(ex => ({
            title: ex.title,
            company: ex.company,
            startDate: ex.start_date,
            endDate: ex.end_date,
            duration: ex.duration,
            description: ex.description,
          })),
          responsibilities: [],
          achievements: [],
          projects: c.projects.map(p => ({
            name: p.name,
            description: p.description,
            technologies: p.technologies,
          })),
          rawText: c.raw_text || '',
          parsingStatus: (c.parsing_status as any) || 'PARSED',
          validationErrors: [],
          parsingMetadata: {
            fileName: c.resume_file_url || 'cv.pdf',
            fileType: 'application/pdf',
            pageCount: 1,
            extractionMethod: 'prisma-db',
            ocrUsed: false,
            characterCount: (c.raw_text || '').length,
            wordCount: (c.raw_text || '').split(/\s+/).filter(Boolean).length,
          },
          fileName: c.resume_file_url || 'cv.pdf',
          fileSize: 100000,
          fileHash: c.file_hash || undefined,
          uploadedAt: c.created_at.toISOString(),
        };
        res.json({ success: true, jobId, candidate: record });
        return;
      }
    } catch (e) {
      console.warn('[Candidate Detail] DB lookup error:', e);
    }

    res.status(404).json({ error: 'Candidate profile not found' });
  } catch (error: any) {
    console.error('Error fetching candidate detail:', error);
    res.status(500).json({ error: 'Failed to retrieve candidate profile' });
  }
};

/**
 * Bulk upload CVs for a specific job
/**
 * Bulk upload CVs for a specific job
 * POST /api/jobs/:jobId/candidates/upload
 * Supports multi-part form data array of file inputs ('files' or 'files[]')
 */
export const uploadCandidateCVs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.jobId || req.body?.jobId || '');
    
    // Support files from multer array, any fields, or single file fallback
    let files: Express.Multer.File[] = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === 'object') {
      // If multer.fields was used
      const filesObj = req.files as Record<string, Express.Multer.File[]>;
      for (const fieldKey of Object.keys(filesObj)) {
        if (Array.isArray(filesObj[fieldKey])) {
          files.push(...filesObj[fieldKey]);
        }
      }
    } else if (req.file) {
      files = [req.file];
    }

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required in URL parameters or request body' });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files provided for candidate CV upload. Ensure field is named "files" or "files[]"' });
      return;
    }

    console.log(`\n=============================================================`);
    console.log(`[Batch CV Upload] Received ${files.length} file(s) for Job ID: ${jobId}`);
    console.log(`=============================================================`);

    let existingCandidates = CANDIDATE_STORE.get(jobId);
    if (!existingCandidates) {
      existingCandidates = DEFAULT_INITIAL_CANDIDATES[jobId] ? [...DEFAULT_INITIAL_CANDIDATES[jobId]] : [];
      CANDIDATE_STORE.set(jobId, existingCandidates);
    }

    const processedCandidates: CandidateRecord[] = [];
    const candidateIds: string[] = [];

    // Find default user or authenticated user for database attribution
    let defaultUserId: string | null = null;
    try {
      const authUser = (req as any).user;
      if (authUser && authUser.id) {
        defaultUserId = authUser.id;
      } else {
        const user = await prisma.user.findFirst();
        if (user) defaultUserId = user.id;
      }
    } catch {
      // Prisma user lookup fallback
    }

    // Process each uploaded CV file
    for (const file of files) {
      const fileName = file.originalname || 'uploaded_cv.pdf';
      const fileSize = file.size;
      const fileMime = file.mimetype || 'application/pdf';
      const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
      const fileMd5 = crypto.createHash('md5').update(file.buffer).digest('hex');

      console.log(`\n--- [Processing File] ${fileName} (${fileSize} bytes, Hash: ${fileHash.substring(0, 10)}) ---`);

      // ── DUPLICATE CANDIDATE CHECK (FILE HASH / CLIENT VALIDATION) ───────────
      let existingDbCandidate: any = null;
      try {
        existingDbCandidate = await prisma.candidate.findFirst({
          where: {
            OR: [
              { file_hash: fileHash },
              { file_hash: fileMd5 },
              ...(defaultUserId ? [{ created_by: defaultUserId, resume_file_url: fileName }] : [])
            ]
          },
          include: {
            experiences: true,
            education: true,
            skills: true,
          }
        });
      } catch {
        // Fallback to memory store if DB lookup fails
      }

      const existingProfile = GLOBAL_CANDIDATES.get(fileHash) || GLOBAL_CANDIDATES.get(fileMd5) || (existingDbCandidate ? {
        id: existingDbCandidate.id,
        jobId,
        name: existingDbCandidate.name,
        email: existingDbCandidate.email,
        phone: existingDbCandidate.phone,
        location: existingDbCandidate.location,
        totalExperience: existingDbCandidate.total_experience,
        relevantExperience: existingDbCandidate.total_experience,
        currentTitle: existingDbCandidate.current_title,
        currentCompany: existingDbCandidate.current_company,
        summary: existingDbCandidate.summary,
        professionalSummary: existingDbCandidate.summary,
        skills: existingDbCandidate.skills?.map((s: any) => s.skill) || [],
        technologies: existingDbCandidate.skills?.map((s: any) => s.skill) || [],
        tools: [],
        industries: [],
        education: existingDbCandidate.education?.map((e: any) => ({
          degree: e.degree,
          institution: e.institution,
          field: e.field,
          year: e.start_year ? `${e.start_year}` : undefined,
        })) || [],
        certifications: [],
        languages: [],
        experience: existingDbCandidate.experiences?.map((ex: any) => ({
          title: ex.title,
          company: ex.company,
          startDate: ex.start_date,
          endDate: ex.end_date,
          duration: ex.duration,
          description: ex.description,
        })) || [],
        responsibilities: [],
        achievements: [],
        projects: [],
        rawText: existingDbCandidate.raw_text || '',
        parsingStatus: 'PARSED' as const,
        validationErrors: [],
        parsingMetadata: {
          fileName,
          fileType: fileMime,
          pageCount: 1,
          extractionMethod: 'cached-duplicate',
          ocrUsed: false,
          characterCount: (existingDbCandidate.raw_text || '').length,
          wordCount: 0,
        },
        fileName,
        fileSize,
        fileHash,
        uploadedAt: existingDbCandidate.created_at.toISOString(),
        isDuplicate: true,
      } : null);

      if (existingProfile) {
        console.log(`[CV Processing] Duplicate detected via file hash/client record for: ${fileName}. Skipping duplicate insertion.`);
        const linkedCandidate: CandidateRecord = {
          ...existingProfile,
          jobId,
          isDuplicate: true,
          uploadedAt: new Date().toISOString()
        };

        // Ensure linked to current job's store if not already present
        if (!existingCandidates.some(c => c.id === linkedCandidate.id)) {
          existingCandidates.unshift(linkedCandidate);
        }
        processedCandidates.push(linkedCandidate);
        candidateIds.push(linkedCandidate.id);

        if (files.length === 1) {
          res.status(200).json({
            status: 'duplicate',
            message: 'Candidate CV already exists in your account',
            candidate: linkedCandidate,
            candidates: [linkedCandidate]
          });
          return;
        }
        continue;
      }

      const candidateId = `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      candidateIds.push(candidateId);

      // Step 0: Record initial candidate in Prisma database with status PROCESSING
      let dbCandidateId: string | null = null;
      if (defaultUserId) {
        try {
          const initialDbCand = await prisma.candidate.create({
            data: {
              job_id: jobId.includes('-') && jobId.length === 36 ? jobId : undefined,
              name: fileName.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' '),
              resume_file_url: fileName,
              file_hash: fileHash,
              parsing_status: 'PROCESSING',
              created_by: defaultUserId,
            }
          });
          dbCandidateId = initialDbCand.id;
          console.log(`[Prisma DB] Stored initial candidate record ${dbCandidateId} with status PROCESSING`);
        } catch (dbInitErr) {
          console.warn('[Prisma DB Init Notice] Initial candidate record creation bypassed:', dbInitErr);
        }
      }

      try {
        // Step 1: Extract text via Python FastAPI Document processor
        console.log(`[CV Processing Step 1] Passing file buffer directly to Python document processor on port 8000 for ${fileName}...`);
        const pythonResult: PythonDocumentResponse = await extractDocumentTextViaPython(
          file.buffer,
          fileName,
          fileMime
        );

        let rawText = '';
        let extractionMethod = pythonResult.extractionMethod || 'direct-text';
        let pageCount = pythonResult.pageCount || 1;
        let ocrUsed = pythonResult.ocrUsed || false;
        let charCount = pythonResult.characterCount || 0;
        let wordCount = pythonResult.wordCount || 0;

        if (pythonResult.success && pythonResult.text && pythonResult.text.trim().length > 20) {
          rawText = pythonResult.normalizedText || pythonResult.text;
        }

        // Step 2: Quality validation of raw extracted text
        const textQuality = validateCvTextQuality(rawText);
        console.log(`[CV Processing Step 2] Extracted ${rawText.length} chars. Quality check valid: ${textQuality.isValid} (Reason: ${textQuality.reason || 'OK'})`);

        if (!rawText || !textQuality.isValid) {
          console.warn(`[CV Processing FAILED] Rejected document ${fileName}: ${textQuality.reason || 'Insufficient text'}`);
          const failedRecord: CandidateRecord = {
            id: dbCandidateId || candidateId,
            jobId,
            name: null,
            email: null,
            phone: null,
            location: null,
            currentTitle: null,
            currentCompany: null,
            totalExperience: null,
            relevantExperience: null,
            summary: null,
            skills: [],
            technologies: [],
            tools: [],
            industries: [],
            education: [],
            certifications: [],
            languages: [],
            experience: [],
            responsibilities: [],
            achievements: [],
            projects: [],
            sourceEvidence: {},
            rawText: rawText || '',
            parsingStatus: 'FAILED',
            errorMessage: textQuality.reason || 'Unable to extract valid CV text from this document.',
            validationErrors: [textQuality.reason || 'Unable to extract valid CV text from this document.'],
            parsingMetadata: {
              fileName,
              fileType: fileMime,
              pageCount: pageCount || 0,
              extractionMethod: extractionMethod || 'failed',
              ocrUsed: ocrUsed || false,
              characterCount: rawText.length,
              wordCount: wordCount || 0,
            },
            fileName,
            fileSize,
            fileHash,
            uploadedAt: new Date().toISOString(),
          };

          // Update Prisma candidate record status to FAILED if exists
          if (dbCandidateId) {
            await prisma.candidate.update({
              where: { id: dbCandidateId },
              data: {
                parsing_status: 'FAILED',
                error_message: textQuality.reason || 'Unable to extract valid CV text',
                raw_text: rawText || '',
              }
            }).catch(() => null);
          }

          existingCandidates.unshift(failedRecord);
          processedCandidates.push(failedRecord);
          continue;
        }

        // Step 3: Run strict evidence-based CV Parser & Entity Extraction
        console.log(`[CV Processing Step 3] Running strict evidence extractor on ${fileName}...`);
        const structuredProfile = extractStructuredCandidateFromText(rawText, fileName, {
          fileType: fileMime,
          pageCount,
          extractionMethod,
          ocrUsed,
          characterCount: charCount || rawText.length,
          wordCount: wordCount || rawText.split(/\s+/).filter(Boolean).length,
        });

        console.log(`[CV Processing Step 4] Structured Extraction for ${fileName}:`, {
          name: structuredProfile.name,
          email: structuredProfile.email,
          currentTitle: structuredProfile.currentTitle,
          currentCompany: structuredProfile.currentCompany,
          skillsCount: structuredProfile.skills.length,
          expCount: structuredProfile.experience.length,
        });

        // Step 3b: Check if candidate already exists in client account by extracted Email or Phone
        if (structuredProfile.email || structuredProfile.phone) {
          try {
            const existingByEmailOrPhone = await prisma.candidate.findFirst({
              where: {
                AND: [
                  ...(defaultUserId ? [{ created_by: defaultUserId }] : []),
                  {
                    OR: [
                      ...(structuredProfile.email ? [{ email: { equals: structuredProfile.email, mode: 'insensitive' as const } }] : []),
                      ...(structuredProfile.phone ? [{ phone: structuredProfile.phone }] : [])
                    ]
                  }
                ]
              }
            });

            if (existingByEmailOrPhone) {
              console.log(`[CV Processing] Candidate with matching email/phone already exists in client account (ID: ${existingByEmailOrPhone.id}). Skipping duplicate entry.`);
              
              if (dbCandidateId && dbCandidateId !== existingByEmailOrPhone.id) {
                await prisma.candidate.delete({ where: { id: dbCandidateId } }).catch(() => null);
              }

              const dupRecord: CandidateRecord = {
                id: existingByEmailOrPhone.id,
                jobId,
                ...structuredProfile,
                isDuplicate: true,
                fileName,
                fileSize,
                fileHash,
                uploadedAt: existingByEmailOrPhone.created_at.toISOString(),
              };

              GLOBAL_CANDIDATES.set(fileHash, dupRecord);
              GLOBAL_CANDIDATES.set(fileMd5, dupRecord);
              existingCandidates.unshift(dupRecord);
              processedCandidates.push(dupRecord);

              if (files.length === 1) {
                res.status(200).json({
                  status: 'duplicate',
                  message: 'Candidate CV already exists in your account',
                  candidate: dupRecord,
                  candidates: [dupRecord],
                });
                return;
              }
              continue;
            }
          } catch (dupLookupErr) {
            console.warn('[Duplicate Check] Email/Phone lookup note:', dupLookupErr);
          }
        }


        const newRecord: CandidateRecord = {
          id: dbCandidateId || candidateId,
          jobId,
          ...structuredProfile,
          fileName,
          fileSize,
          fileHash,
          uploadedAt: new Date().toISOString(),
        };

        // Cache globally for duplicate detection across jobs
        GLOBAL_CANDIDATES.set(fileHash, newRecord);
        GLOBAL_CANDIDATES.set(newRecord.id, newRecord);

        // Update / Persist full candidate metadata into Prisma database
        try {
          if (dbCandidateId) {
            await prisma.candidate.update({
              where: { id: dbCandidateId },
              data: {
                name: newRecord.name,
                email: newRecord.email,
                phone: newRecord.phone,
                location: newRecord.location,
                total_experience: newRecord.totalExperience,
                current_title: newRecord.currentTitle,
                current_company: newRecord.currentCompany,
                summary: newRecord.summary,
                raw_text: rawText,
                parsing_status: 'PARSED',
              }
            });

            // Link candidate to job application record if job exists
            const validJob = await prisma.job.findUnique({ where: { id: jobId } }).catch(() => null);
            if (validJob) {
              await prisma.candidateApplication.upsert({
                where: {
                  job_id_candidate_id: {
                    job_id: validJob.id,
                    candidate_id: dbCandidateId,
                  }
                },
                update: {
                  stage: 'PARSED',
                  status: 'active',
                },
                create: {
                  job_id: validJob.id,
                  candidate_id: dbCandidateId,
                  stage: 'PARSED',
                  status: 'active',
                }
              }).catch(() => null);
            }
          } else if (defaultUserId) {
            const createdDbCand = await prisma.candidate.create({
              data: {
                job_id: jobId.includes('-') && jobId.length === 36 ? jobId : undefined,
                name: newRecord.name,
                email: newRecord.email,
                phone: newRecord.phone,
                location: newRecord.location,
                total_experience: newRecord.totalExperience,
                current_title: newRecord.currentTitle,
                current_company: newRecord.currentCompany,
                summary: newRecord.summary,
                resume_file_url: fileName,
                raw_text: rawText,
                file_hash: fileHash,
                parsing_status: 'PARSED',
                created_by: defaultUserId,
              }
            });
            newRecord.id = createdDbCand.id;
          }
        } catch (dbSaveErr) {
          console.warn('[Prisma DB Save Notice] Candidate metadata stored in memory cache:', dbSaveErr);
        }

        existingCandidates.unshift(newRecord);
        processedCandidates.push(newRecord);
      } catch (err: any) {
        console.error(`Error processing CV ${fileName}:`, err);
        const errRecord: CandidateRecord = {
          id: dbCandidateId || candidateId,
          jobId,
          name: null,
          email: null,
          phone: null,
          location: null,
          currentTitle: null,
          currentCompany: null,
          totalExperience: null,
          relevantExperience: null,
          summary: null,
          skills: [],
          technologies: [],
          tools: [],
          industries: [],
          education: [],
          certifications: [],
          languages: [],
          experience: [],
          responsibilities: [],
          achievements: [],
          projects: [],
          sourceEvidence: {},
          rawText: '',
          parsingStatus: 'FAILED',
          errorMessage: `Processing error: ${err.message || 'Unknown error'}`,
          validationErrors: [err.message || 'Unknown processing error'],
          parsingMetadata: {
            fileName,
            fileType: fileMime,
            pageCount: 0,
            extractionMethod: 'error',
            ocrUsed: false,
            characterCount: 0,
            wordCount: 0,
          },
          fileName,
          fileSize,
          fileHash,
          uploadedAt: new Date().toISOString(),
        };

        if (dbCandidateId) {
          await prisma.candidate.update({
            where: { id: dbCandidateId },
            data: {
              parsing_status: 'FAILED',
              error_message: err.message || 'Processing error',
            }
          }).catch(() => null);
        }

        existingCandidates.unshift(errRecord);
        processedCandidates.push(errRecord);
      }
    }

    CANDIDATE_STORE.set(jobId, existingCandidates);

    // Return aggregated response for real-time frontend feedback
    res.status(201).json({
      success: true,
      jobId,
      uploadedCount: processedCandidates.length,
      successfulCount: processedCandidates.filter(c => c.parsingStatus === 'PARSED').length,
      failedCount: processedCandidates.filter(c => c.parsingStatus === 'FAILED').length,
      candidateIds,
      processingStatus: 'COMPLETED',
      candidates: processedCandidates,
      allCandidates: existingCandidates
    });
  } catch (error: any) {
    console.error('Error during bulk CV upload:', error);
    res.status(500).json({ error: 'Bulk CV upload failed on server' });
  }
};

/**
 * Retry parsing a failed candidate
 * POST /api/jobs/:jobId/candidates/:candidateId/retry
 */
export const retryCandidateParsing = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.jobId || '');
    const candidateId = String(req.params.candidateId || '');

    const candidates = CANDIDATE_STORE.get(jobId);
    if (!candidates) {
      res.status(404).json({ error: 'Job candidate list not found' });
      return;
    }

    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    if (!candidate.rawText || candidate.rawText.length < 20) {
      res.status(400).json({ error: 'Candidate has no raw text available for retry.' });
      return;
    }

    const recovered = extractStructuredCandidateFromText(candidate.rawText, candidate.fileName, {
      fileType: candidate.parsingMetadata.fileType || 'application/pdf',
      pageCount: Math.max(1, candidate.parsingMetadata.pageCount || 1),
      extractionMethod: 'retry-recovered',
      ocrUsed: true,
      characterCount: candidate.rawText.length,
      wordCount: candidate.rawText.split(/\s+/).filter(Boolean).length,
    });

    Object.assign(candidate, {
      ...recovered,
      errorMessage: undefined,
    });

    res.json({
      success: true,
      jobId,
      candidate,
    });
  } catch (error: any) {
    console.error('Error retrying candidate:', error);
    res.status(500).json({ error: 'Failed to retry candidate parsing' });
  }
};
