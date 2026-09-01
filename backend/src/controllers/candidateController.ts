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
export const CANDIDATE_STORE: Map<string, CandidateRecord[]> = new Map();
export const GLOBAL_CANDIDATES: Map<string, CandidateRecord> = new Map(); // Keyed by fileHash or id

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

    const rawList = Array.from(combinedMap.values());
    const seenKeys = new Set<string>();
    const resultList: CandidateRecord[] = [];

    for (const c of rawList) {
      const key = (c.email && c.email.trim().toLowerCase()) ||
                  (c.fileHash && c.fileHash.trim()) ||
                  (c.fileName && c.fileName.trim().toLowerCase()) ||
                  (c.name && c.name.trim().toLowerCase()) ||
                  c.id;

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        resultList.push(c);
      }
    }

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
      
      // ── DUPLICATE CANDIDATE CHECK (FILE HASH / FILENAME / CLIENT VALIDATION) ──
      const normalizedFileName = fileName.trim().toLowerCase();
      const existingInJob = existingCandidates.find(c =>
        (c.fileHash && (c.fileHash === fileHash || c.fileHash === fileMd5)) ||
        (c.fileName && c.fileName.trim().toLowerCase() === normalizedFileName) ||
        (c.name && normalizedFileName.includes(c.name.trim().toLowerCase()) && c.name.trim().length > 3)
      );

      let existingDbCandidate: any = null;
      if (!existingInJob) {
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
      }

      const existingProfile = existingInJob || GLOBAL_CANDIDATES.get(fileHash) || GLOBAL_CANDIDATES.get(fileMd5) || (existingDbCandidate ? {
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
        console.log(`[CV Processing] Duplicate CV detected for: ${fileName}. Skipping insertion.`);
        const dupCandidate: CandidateRecord = {
          ...existingProfile,
          jobId,
          isDuplicate: true,
          parsingStatus: 'DUPLICATE' as any,
          errorMessage: 'Duplicate CV: This document has already been uploaded for this position.',
          fileName,
          fileSize,
          fileHash,
        };

        processedCandidates.push(dupCandidate);
        candidateIds.push(existingProfile.id);

        if (files.length === 1) {
          res.status(200).json({
            status: 'duplicate',
            message: 'Candidate CV already exists for this position',
            isDuplicate: true,
            candidate: dupCandidate,
            candidates: [dupCandidate],
            allCandidates: existingCandidates
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
              name: fileName.replace(/\.[^/.]+$/, '').replace(/[_\-]/g, ' '),
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
          const failRecord: CandidateRecord = {
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
            errorMessage: textQuality.reason || 'Extracted document text was unreadable or failed validation.',
            validationErrors: [textQuality.reason || 'Failed quality threshold check.'],
            parsingMetadata: {
              fileName,
              fileType: fileMime,
              pageCount,
              extractionMethod: `${extractionMethod}-rejected`,
              ocrUsed,
              characterCount: charCount,
              wordCount,
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
                error_message: textQuality.reason || 'Extracted document text was unreadable',
                raw_text: rawText || '',
              }
            }).catch(() => null);
          }

          existingCandidates.unshift(failRecord);
          processedCandidates.push(failRecord);
          continue;
        }

        // Step 3: Extract structured fields from validated text
        const structuredProfile = extractStructuredCandidateFromText(rawText, fileName, {
          fileType: fileMime,
          pageCount,
          extractionMethod,
          ocrUsed,
          characterCount: charCount,
          wordCount,
        });

        console.log(`[CV Processing Step 4] Structured Extraction for ${fileName}:`, {
          name: structuredProfile.name,
          email: structuredProfile.email,
          currentTitle: structuredProfile.currentTitle,
          currentCompany: structuredProfile.currentCompany,
          skillsCount: structuredProfile.skills.length,
          expCount: structuredProfile.experience.length,
        });

        // Step 3b: Check if candidate already exists in current job by extracted details
        const dupInJob = existingCandidates.find(ec =>
          (structuredProfile.email && ec.email && ec.email.toLowerCase() === structuredProfile.email.toLowerCase()) ||
          (structuredProfile.phone && ec.phone && ec.phone.replace(/[^0-9]/g, '') === structuredProfile.phone.replace(/[^0-9]/g, '') && structuredProfile.phone.length > 5) ||
          (structuredProfile.name && ec.name && ec.name.trim().toLowerCase() === structuredProfile.name.trim().toLowerCase())
        );

        if (dupInJob) {
          console.log(`[CV Processing] Duplicate candidate profile detected in job for: ${structuredProfile.name}. Skipping insertion.`);
          if (dbCandidateId) {
            await prisma.candidate.delete({ where: { id: dbCandidateId } }).catch(() => null);
          }

          const dupRecord: CandidateRecord = {
            ...dupInJob,
            jobId,
            isDuplicate: true,
            parsingStatus: 'DUPLICATE' as any,
            errorMessage: `Duplicate Candidate: "${structuredProfile.name || fileName}" has already been uploaded for this position.`,
            fileName,
            fileSize,
            fileHash,
          };

          processedCandidates.push(dupRecord);

          if (files.length === 1) {
            res.status(200).json({
              status: 'duplicate',
              message: 'Candidate CV already exists for this position',
              isDuplicate: true,
              candidate: dupRecord,
              candidates: [dupRecord],
              allCandidates: existingCandidates,
            });
            return;
          }
          continue;
        }

        // Check if candidate exists in Prisma DB for this user/client
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
              console.log(`[CV Processing] Candidate with matching email/phone already exists in database (ID: ${existingByEmailOrPhone.id}).`);
              
              if (dbCandidateId && dbCandidateId !== existingByEmailOrPhone.id) {
                await prisma.candidate.delete({ where: { id: dbCandidateId } }).catch(() => null);
              }

              const dupRecord: CandidateRecord = {
                id: existingByEmailOrPhone.id,
                jobId,
                ...structuredProfile,
                isDuplicate: true,
                parsingStatus: 'DUPLICATE' as any,
                errorMessage: `Candidate "${structuredProfile.name || fileName}" already exists in your account.`,
                fileName,
                fileSize,
                fileHash,
                uploadedAt: existingByEmailOrPhone.created_at.toISOString(),
              };

              GLOBAL_CANDIDATES.set(fileHash, dupRecord);
              GLOBAL_CANDIDATES.set(fileMd5, dupRecord);
              processedCandidates.push(dupRecord);

              if (files.length === 1) {
                res.status(200).json({
                  status: 'duplicate',
                  message: 'Candidate CV already exists in your account',
                  isDuplicate: true,
                  candidate: dupRecord,
                  candidates: [dupRecord],
                  allCandidates: existingCandidates,
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

/**
 * Maps a Prisma Candidate record to a frontend/evaluation-compatible CandidateRecord
 */
export function mapDbCandidateToRecord(c: any, defaultJobId?: string): CandidateRecord {
  return {
    id: c.id,
    jobId: c.job_id || defaultJobId || 'jd-1',
    name: c.name || 'Candidate',
    email: c.email || '',
    phone: c.phone || '',
    location: c.location || '',
    totalExperience: c.total_experience || '',
    relevantExperience: c.total_experience || '',
    currentTitle: c.current_title || '',
    currentCompany: c.current_company || '',
    summary: c.summary || '',
    professionalSummary: c.summary || '',
    skills: Array.isArray(c.skills) ? c.skills.map((s: any) => typeof s === 'string' ? s : s.skill) : [],
    technologies: Array.isArray(c.skills) ? c.skills.map((s: any) => typeof s === 'string' ? s : s.skill) : [],
    tools: [],
    industries: [],
    education: Array.isArray(c.education) ? c.education.map((e: any) => ({
      degree: e.degree || '',
      institution: e.institution || '',
      field: e.field || '',
      year: e.start_year ? `${e.start_year}` : (e.year ? `${e.year}` : undefined),
    })) : [],
    certifications: Array.isArray(c.certifications) ? c.certifications.map((ct: any) => typeof ct === 'string' ? ct : ct.certification) : [],
    languages: Array.isArray(c.languages) ? c.languages.map((l: any) => typeof l === 'string' ? l : l.language) : [],
    experience: Array.isArray(c.experiences) ? c.experiences.map((ex: any) => ({
      title: ex.title || '',
      company: ex.company || '',
      startDate: ex.start_date || '',
      endDate: ex.end_date || '',
      duration: ex.duration || '',
      description: ex.description || '',
    })) : [],
    responsibilities: [],
    achievements: [],
    projects: Array.isArray(c.projects) ? c.projects.map((p: any) => ({
      name: p.name || '',
      description: p.description || '',
      technologies: p.technologies || [],
    })) : [],
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
    uploadedAt: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
  };
}

/**
 * Find candidate record from memory store or DB
 */
export async function findCandidateRecord(candidateId: string, jobId?: string): Promise<CandidateRecord | null> {
  if (!candidateId) return null;

  // 1. Check memory store by jobId if given
  if (jobId && CANDIDATE_STORE.has(jobId)) {
    const memList = CANDIDATE_STORE.get(jobId);
    const found = memList?.find(c => c.id === candidateId);
    if (found) return found;
  }

  // 2. Check all job lists in CANDIDATE_STORE
  for (const list of CANDIDATE_STORE.values()) {
    const found = list.find(c => c.id === candidateId);
    if (found) return found;
  }

  // 3. Check GLOBAL_CANDIDATES
  if (GLOBAL_CANDIDATES.has(candidateId)) {
    return GLOBAL_CANDIDATES.get(candidateId)!;
  }

  // 4. Check Prisma DB
  try {
    const dbCandidate = await prisma.candidate.findUnique({
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
    if (dbCandidate) {
      return mapDbCandidateToRecord(dbCandidate, jobId);
    }
  } catch (err) {
    console.warn('[Candidates] Prisma find candidate error:', err);
  }

  return null;
}

/**
 * Retrieves all candidates from both DB and memory store with their associated jobId
 */
export async function getAllCandidateRecords(): Promise<Array<{ candidate: CandidateRecord; jobId: string }>> {
  const result: Array<{ candidate: CandidateRecord; jobId: string }> = [];
  const seenIds = new Set<string>();

  // 1. Fetch DB candidates
  try {
    const dbCandidates = await prisma.candidate.findMany({
      include: {
        experiences: true,
        education: true,
        skills: true,
        certifications: true,
        languages: true,
        projects: true,
      }
    });

    for (const c of dbCandidates) {
      const record = mapDbCandidateToRecord(c);
      const jId = c.job_id || 'jd-1';
      seenIds.add(record.id);
      result.push({ candidate: record, jobId: jId });
    }
  } catch (err) {
    console.warn('[Candidates] Prisma fetch all error:', err);
  }

  // 2. Add memory store candidates
  for (const [jId, list] of CANDIDATE_STORE.entries()) {
    for (const c of list) {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        result.push({ candidate: c, jobId: jId || c.jobId || 'jd-1' });
      }
    }
  }

  return result;
}
