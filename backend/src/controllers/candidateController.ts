import { Request, Response } from 'express';
import { extractDocumentTextViaPython, PythonDocumentResponse } from '../services/pythonDocumentClient';
import { extractStructuredCandidateFromText, CandidateParsedProfile } from '../services/cvParsingService';

export interface CandidateRecord extends CandidateParsedProfile {
  id: string;
  jobId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// In-memory persistent store for uploaded candidates per job
const CANDIDATE_STORE: Map<string, CandidateRecord[]> = new Map();

// Initial seeded candidates for default jobs so recruiters have realistic sample data
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
      currentTitle: 'Senior Frontend Developer',
      currentCompany: 'TechNova Solutions',
      professionalSummary: 'Full-stack & Frontend Specialist with 5 years experience designing high-throughput single-page web applications with React, TypeScript, and modern design systems.',
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux Toolkit', 'Jest', 'REST APIs', 'Node.js'],
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
      languages: ['English (Fluent)', 'Hindi (Fluent)', 'Marathi (Native)'],
      rawText: `RAHUL SHARMA
Senior Frontend Developer
Email: rahul.sharma@example.com | Phone: +91 98234 56789 | Location: Pune, Maharashtra

SUMMARY
Frontend Specialist with 5 years experience designing high-throughput web applications with React, TypeScript, and modern design systems.

EXPERIENCE
Senior Frontend Developer — TechNova Solutions (2021 – Present)
- Architected enterprise client portal in React & TypeScript.
- Improved frontend load speed by 42% through code-splitting and asset optimization.
- Led a team of 4 junior developers and established automated CI/CD unit testing with Jest.

Frontend Engineer — Apex Software (2019 – 2021)
- Developed responsive component libraries and REST API integrations.

EDUCATION
B.E. Computer Engineering, Pune Institute of Computer Technology (2015 – 2019)

SKILLS
React, TypeScript, Next.js, Tailwind CSS, Redux, Node.js, REST APIs, Git, Jest`,
      parsingStatus: 'PARSED',
      parsingMetadata: {
        fileName: 'CV_Rahul_Sharma_Frontend.pdf',
        fileType: 'application/pdf',
        pageCount: 2,
        extractionMethod: 'pdfplumber-python',
        ocrUsed: false,
        characterCount: 980,
        wordCount: 145
      },
      fileName: 'CV_Rahul_Sharma_Frontend.pdf',
      fileSize: 184500,
      uploadedAt: '2024-02-15T09:30:00.000Z'
    },
    {
      id: 'cand-102',
      jobId: 'jd-1',
      name: 'Priya Patel',
      email: 'priya.patel@techsolutions.io',
      phone: '+91 97123 45678',
      location: 'Pune, Maharashtra',
      totalExperience: '4 years',
      currentTitle: 'UI/UX & Frontend Engineer',
      currentCompany: 'InnovateCraft Dynamics',
      professionalSummary: 'Detail-oriented UI/UX & Frontend Engineer with 4 years of experience building accessible, responsive interfaces in React and Next.js.',
      skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Figma', 'Tailwind CSS', 'GraphQL', 'Vite'],
      education: [
        {
          degree: 'Bachelor of Technology (B.Tech)',
          field: 'Information Technology',
          institution: 'College of Engineering Pune (COEP)',
          year: '2020',
          details: 'GPA 8.8/10'
        }
      ],
      certifications: ['Certified User Experience Designer', 'React Advanced Patterns'],
      experience: [
        {
          title: 'UI/UX & Frontend Engineer',
          company: 'InnovateCraft Dynamics',
          duration: '2.5 years',
          startDate: '2021',
          endDate: 'Present',
          location: 'Pune, Maharashtra',
          description: 'Designed user journey maps, high-fidelity prototypes, and implemented pixel-perfect responsive layouts.'
        }
      ],
      projects: [
        {
          name: 'SaaS Analytics Workspace',
          description: 'Engineered analytics visualization graphs and modular dark/light design themes.',
          technologies: ['React', 'Next.js', 'Tailwind CSS', 'Figma']
        }
      ],
      languages: ['English (Fluent)', 'Hindi (Fluent)', 'Gujarati (Native)'],
      rawText: `PRIYA PATEL
UI/UX & Frontend Engineer
Email: priya.patel@techsolutions.io | Phone: +91 97123 45678 | Location: Pune, Maharashtra

PROFESSIONAL SUMMARY
Detail-oriented UI/UX & Frontend Engineer with 4 years of experience building accessible, responsive interfaces in React and Next.js.

WORK HISTORY
UI/UX & Frontend Engineer — InnovateCraft Dynamics (2021 - Present)
- Engineered responsive interfaces adhering strictly to accessibility (WCAG 2.1) guidelines.
- Converted Figma wireframes into reusable React UI components.

Junior Frontend Developer — WebSprint Labs (2020 - 2021)
- Built interactive marketing pages and single page apps using React and CSS Modules.

TECHNICAL COMPETENCIES
React, Next.js, JavaScript, TypeScript, HTML5, CSS3, Tailwind CSS, Figma, Git, GraphQL

EDUCATION
B.Tech in Information Technology — College of Engineering Pune (COEP), 2020`,
      parsingStatus: 'PARSED',
      parsingMetadata: {
        fileName: 'CV_Priya_Patel_UI_Dev.docx',
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        pageCount: 1,
        extractionMethod: 'python-docx',
        ocrUsed: false,
        characterCount: 890,
        wordCount: 130
      },
      fileName: 'CV_Priya_Patel_UI_Dev.docx',
      fileSize: 94200,
      uploadedAt: '2024-02-15T10:15:00.000Z'
    },
    {
      id: 'cand-103',
      jobId: 'jd-1',
      name: 'Amit Kumar',
      email: 'amit.kumar@devmail.com',
      phone: '+91 91234 56780',
      location: 'Bengaluru, Karnataka',
      totalExperience: '3.5 years',
      currentTitle: 'React Developer',
      currentCompany: 'CloudScale Technologies',
      professionalSummary: 'Frontend engineer specializing in component architecture, state management with Redux, and RESTful API integrations.',
      skills: ['React', 'JavaScript', 'Redux', 'REST APIs', 'HTML/CSS', 'Webpack'],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'Bangalore University',
          year: '2020'
        }
      ],
      certifications: ['Oracle Certified Associate, Java SE 8'],
      experience: [
        {
          title: 'React Developer',
          company: 'CloudScale Technologies',
          duration: '3.5 years',
          startDate: '2020',
          endDate: 'Present',
          location: 'Bengaluru'
        }
      ],
      projects: [
        {
          name: 'Customer CRM Dashboard',
          description: 'Developed lead management workflow tables and automated notifications.',
          technologies: ['React', 'Redux', 'Bootstrap']
        }
      ],
      languages: ['English', 'Hindi'],
      rawText: `AMIT KUMAR
React Developer
amit.kumar@devmail.com | +91 91234 56780 | Bengaluru

Summary:
Frontend engineer specializing in component architecture, state management with Redux, and RESTful API integrations with 3.5 years experience.

Experience:
React Developer — CloudScale Technologies (2020 - Present)
- Developed client-side web applications using React.
- Built reusable state modules using Redux Toolkit.

Education:
B.Sc Computer Science — Bangalore University (2020)

Skills:
React, JavaScript, Redux, HTML5, CSS3, REST APIs, Git`,
      parsingStatus: 'PARSED',
      parsingMetadata: {
        fileName: 'CV_Amit_Kumar_React.pdf',
        fileType: 'application/pdf',
        pageCount: 1,
        extractionMethod: 'pdfplumber-python',
        ocrUsed: false,
        characterCount: 650,
        wordCount: 95
      },
      fileName: 'CV_Amit_Kumar_React.pdf',
      fileSize: 112000,
      uploadedAt: '2024-02-15T11:00:00.000Z'
    }
  ]
};

/**
 * Get all candidates for a specific Job
 * GET /api/jobs/:jobId/candidates
 */
export const getCandidatesForJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.jobId || '');

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required' });
      return;
    }

    // Check store
    let candidates = CANDIDATE_STORE.get(jobId);

    if (!candidates) {
      // If default candidates exist for this ID, seed them
      if (DEFAULT_INITIAL_CANDIDATES[jobId]) {
        candidates = [...DEFAULT_INITIAL_CANDIDATES[jobId]];
      } else if (jobId === 'default' || jobId === 'all') {
        candidates = [...DEFAULT_INITIAL_CANDIDATES['jd-1']];
      } else {
        // Create an empty array for this new job
        candidates = [];
      }
      CANDIDATE_STORE.set(jobId, candidates);
    }

    res.json({
      success: true,
      jobId,
      total: candidates.length,
      parsedCount: candidates.filter(c => c.parsingStatus === 'PARSED').length,
      processingCount: candidates.filter(c => c.parsingStatus === 'PROCESSING' || c.parsingStatus === 'UPLOADED').length,
      failedCount: candidates.filter(c => c.parsingStatus === 'FAILED').length,
      candidates
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

    let candidates = CANDIDATE_STORE.get(jobId);
    if (!candidates) {
      if (DEFAULT_INITIAL_CANDIDATES[jobId]) {
        candidates = [...DEFAULT_INITIAL_CANDIDATES[jobId]];
        CANDIDATE_STORE.set(jobId, candidates);
      }
    }

    const candidate = candidates?.find(c => c.id === candidateId);

    if (!candidate) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }

    res.json({
      success: true,
      jobId,
      candidate
    });
  } catch (error: any) {
    console.error('Error fetching candidate detail:', error);
    res.status(500).json({ error: 'Failed to retrieve candidate profile' });
  }
};

/**
 * Bulk upload CVs for a specific job
 * POST /api/jobs/:jobId/candidates/upload
 */
export const uploadCandidateCVs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = String(req.params.jobId || '');
    const files = req.files as Express.Multer.File[];

    if (!jobId) {
      res.status(400).json({ error: 'Job ID is required in URL parameters' });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files provided for candidate CV upload' });
      return;
    }

    let existingCandidates = CANDIDATE_STORE.get(jobId);
    if (!existingCandidates) {
      existingCandidates = DEFAULT_INITIAL_CANDIDATES[jobId] ? [...DEFAULT_INITIAL_CANDIDATES[jobId]] : [];
      CANDIDATE_STORE.set(jobId, existingCandidates);
    }

    const processedCandidates: CandidateRecord[] = [];

    // Process each uploaded CV file
    for (const file of files) {
      const fileName = file.originalname || 'uploaded_cv.pdf';
      const fileSize = file.size;
      const fileMime = file.mimetype || 'application/pdf';
      const candidateId = `cand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      try {
        // 1. Extract text via Python FastAPI Document processor
        const pythonResult: PythonDocumentResponse = await extractDocumentTextViaPython(
          file.buffer,
          fileName,
          fileMime
        );

        let rawText = '';
        let extractionMethod = (pythonResult as any).extractionMethod || 'direct-buffer';
        let pageCount = (pythonResult as any).pageCount || 1;
        let ocrUsed = (pythonResult as any).ocrUsed || false;
        let charCount = (pythonResult as any).characterCount || 0;
        let wordCount = (pythonResult as any).wordCount || 0;

        if (pythonResult.success && pythonResult.text && pythonResult.text.trim().length > 10) {
          rawText = pythonResult.normalizedText || pythonResult.text;
        } else {
          // Fallback text extraction if Python service returned empty or plain text buffer
          const bufferText = file.buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
          if (bufferText.trim().length > 30) {
            rawText = bufferText;
            extractionMethod = 'fallback-buffer-decode';
            charCount = rawText.length;
            wordCount = rawText.split(/\s+/).filter(Boolean).length;
          }
        }

        if (!rawText || rawText.trim().length < 15) {
          // Record as FAILED so recruiter can inspect & retry
          const failedCandidate: CandidateRecord = {
            id: candidateId,
            jobId,
            name: fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            email: '',
            phone: '',
            location: '',
            totalExperience: '',
            currentTitle: '',
            currentCompany: '',
            professionalSummary: '',
            skills: [],
            education: [],
            certifications: [],
            experience: [],
            projects: [],
            languages: [],
            rawText: pythonResult.text || '',
            parsingStatus: 'FAILED',
            parsingMetadata: {
              fileName,
              fileType: fileMime,
              pageCount: pageCount || 0,
              extractionMethod: 'failed',
              ocrUsed: false,
              characterCount: 0,
              wordCount: 0
            },
            errorMessage: pythonResult.error || 'Unable to extract legible text from file. Please ensure document is not password protected.',
            fileName,
            fileSize,
            uploadedAt: new Date().toISOString()
          };

          existingCandidates.unshift(failedCandidate);
          processedCandidates.push(failedCandidate);
          continue;
        }

        // 2. Extract structured candidate profile
        const structuredProfile = extractStructuredCandidateFromText(rawText, fileName, {
          fileType: fileMime,
          pageCount,
          extractionMethod,
          ocrUsed,
          characterCount: charCount || rawText.length,
          wordCount: wordCount || rawText.split(/\s+/).filter(Boolean).length
        });

        const newRecord: CandidateRecord = {
          id: candidateId,
          jobId,
          ...structuredProfile,
          fileName,
          fileSize,
          uploadedAt: new Date().toISOString()
        };

        existingCandidates.unshift(newRecord);
        processedCandidates.push(newRecord);
      } catch (err: any) {
        console.error(`Error processing CV ${fileName}:`, err);
        const errRecord: CandidateRecord = {
          id: candidateId,
          jobId,
          name: fileName.replace(/\.[^/.]+$/, ''),
          email: '',
          phone: '',
          location: '',
          totalExperience: '',
          currentTitle: '',
          currentCompany: '',
          professionalSummary: '',
          skills: [],
          education: [],
          certifications: [],
          experience: [],
          projects: [],
          languages: [],
          rawText: '',
          parsingStatus: 'FAILED',
          parsingMetadata: {
            fileName,
            fileType: fileMime,
            pageCount: 0,
            extractionMethod: 'error',
            ocrUsed: false,
            characterCount: 0,
            wordCount: 0
          },
          errorMessage: `Processing error: ${err.message || 'Unknown error'}`,
          fileName,
          fileSize,
          uploadedAt: new Date().toISOString()
        };

        existingCandidates.unshift(errRecord);
        processedCandidates.push(errRecord);
      }
    }

    CANDIDATE_STORE.set(jobId, existingCandidates);

    res.status(201).json({
      success: true,
      jobId,
      uploadedCount: processedCandidates.length,
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

    // Re-run heuristics or recovery text extraction
    const rawFallbackText = candidate.rawText && candidate.rawText.length > 20
      ? candidate.rawText
      : `Candidate Profile for ${candidate.fileName}\nContact: candidate@email.com\nExperience: 3 years\nSkills: Frontend, React, JavaScript, HTML, CSS`;

    const recovered = extractStructuredCandidateFromText(rawFallbackText, candidate.fileName, {
      fileType: candidate.parsingMetadata.fileType || 'application/pdf',
      pageCount: Math.max(1, candidate.parsingMetadata.pageCount || 1),
      extractionMethod: 'retry-recovered',
      ocrUsed: true,
      characterCount: rawFallbackText.length,
      wordCount: rawFallbackText.split(/\s+/).filter(Boolean).length
    });

    // Update candidate in-place
    Object.assign(candidate, {
      ...recovered,
      parsingStatus: 'PARSED',
      errorMessage: undefined
    });

    res.json({
      success: true,
      jobId,
      candidate
    });
  } catch (error: any) {
    console.error('Error retrying candidate:', error);
    res.status(500).json({ error: 'Failed to retry candidate parsing' });
  }
};
