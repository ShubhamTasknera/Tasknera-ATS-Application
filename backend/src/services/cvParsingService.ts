import { PythonDocumentResponse } from './pythonDocumentClient';

export interface SourceEvidenceItem<T = string> {
  value: T;
  sourceEvidence?: string;
}

export interface CandidateEducation {
  degree: string | null;
  field?: string | null;
  institution: string | null;
  year?: string | null;
  details?: string | null;
  sourceEvidence?: string;
}

export interface CandidateExperience {
  title: string | null;
  company: string | null;
  duration?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  description?: string | null;
  highlights?: string[];
  sourceEvidence?: string;
}

export interface CandidateProject {
  name: string | null;
  description?: string | null;
  technologies?: string[];
  role?: string | null;
  sourceEvidence?: string;
}

export interface CandidateCertification {
  name: string;
  issuer?: string | null;
  year?: string | null;
  sourceEvidence?: string;
}

export interface CandidateParsedProfile {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  currentTitle: string | null;
  currentCompany: string | null;
  totalExperience: string | null;
  relevantExperience?: string | null;
  summary: string | null;
  skills: string[];
  technologies: string[];
  tools: string[];
  industries: string[];
  education: CandidateEducation[];
  certifications: (string | CandidateCertification)[];
  languages: string[];
  experience: CandidateExperience[];
  responsibilities: string[];
  achievements: string[];
  projects: CandidateProject[];
  sourceEvidence?: Record<string, string | undefined>;
  rawText: string;
  parsingStatus: 'PARSED' | 'FAILED' | 'PROCESSING' | 'UPLOADED';
  errorMessage?: string;
  validationErrors: string[];
  parsingMetadata: {
    fileName: string;
    fileType: string;
    pageCount: number;
    extractionMethod: string;
    ocrUsed: boolean;
    characterCount: number;
    wordCount: number;
  };
  debug?: {
    rawTextPreview: string;
    extractionMethod: string;
    ocrUsed: boolean;
    characterCount: number;
    wordCount: number;
    parserInputPreview: string;
    parsedCandidate: Record<string, any>;
    validationErrors: string[];
  };
}

/**
 * Validates whether the raw text is legitimate CV text or garbage (HTML, code, binary junk).
 */
export function validateCvTextQuality(rawText: string): { isValid: boolean; reason?: string } {
  if (!rawText || typeof rawText !== 'string') {
    return { isValid: false, reason: 'Extracted text is empty.' };
  }

  const text = rawText.trim();
  if (text.length < 20) {
    return { isValid: false, reason: 'Extracted text length is too short (< 20 characters).' };
  }

  // 1. Check for HTML or template tags
  const htmlPatterns = [
    /<!doctype\s+html/i,
    /<html[\s>]/i,
    /<head[\s>]/i,
    /<body[\s>]/i,
    /<script[\s>]/i,
    /<style[\s>]/i,
    /<\/div>/i,
    /<\/span>/i,
  ];
  for (const pattern of htmlPatterns) {
    if (pattern.test(text)) {
      return { isValid: false, reason: 'Extracted text contains HTML/web markup instead of CV document content.' };
    }
  }

  // 2. Check for application source code
  const codePatterns = [
    /import\s+React/i,
    /from\s+['"]react['"]/i,
    /export\s+default\s+function/i,
    /function\s+\w+\s*\(.*?\)\s*\{/,
    /const\s+\w+\s*=\s*\(\)\s*=>/,
  ];
  for (const pattern of codePatterns) {
    if (pattern.test(text)) {
      return { isValid: false, reason: 'Extracted text appears to be application source code.' };
    }
  }

  // 3. Check for binary / unprintable characters
  const unprintableCount = (text.match(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g) || []).length;
  if (unprintableCount > text.length * 0.25) {
    return { isValid: false, reason: 'Extracted text contains excessive unprintable binary characters.' };
  }

  return { isValid: true };
}

/**
 * Validates email format strictly according to RFC standards.
 */
export function validateEmail(emailCandidate: string | null): string | null {
  if (!emailCandidate) return null;
  const email = emailCandidate.trim().toLowerCase();

  // Reject HTML tags, .doctype, or malformed patterns
  if (
    email.includes('<') ||
    email.includes('>') ||
    email.includes('doctype') ||
    email.startsWith('.') ||
    email.endsWith('.') ||
    email.includes('..') ||
    (email.includes('@email.com') && email.startsWith('.'))
  ) {
    return null;
  }

  const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!strictEmailRegex.test(email)) {
    return null;
  }

  return email;
}

/**
 * Validates and normalizes phone number string.
 */
export function validatePhone(phoneCandidate: string | null): string | null {
  if (!phoneCandidate) return null;
  const raw = phoneCandidate.trim();

  // Reject HTML, strings with letters, or extreme lengths
  if (/[a-zA-Z<>]/.test(raw)) return null;

  const digitsOnly = raw.replace(/\D/g, '');

  // Legitimate phone number digits count is between 10 and 15
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return null;
  }

  // Reject repeating single digit
  if (/^(\d)\1+$/.test(digitsOnly)) {
    return null;
  }

  if (digitsOnly === '1234567890' || digitsOnly === '0123456789') {
    return null;
  }

  return raw;
}

/**
 * Extracts candidate name from the top lines of the CV with verified ground truth.
 */
export function extractCandidateName(lines: string[], cleanText: string, fileName?: string): { name: string | null; evidence?: string } {
  const invalidNameKeywords = [
    'curriculum', 'vitae', 'resume', 'profile', 'summary', 'contact', 'email',
    'phone', 'address', 'page', 'objective', 'education', 'experience', 'skills',
    'developer', 'engineer', 'consultant', 'manager', 'specialist', 'doctype',
    'html', 'http', 'https', 'www', 'linkedin', 'github', 'portfolio', 'gender',
    'date of birth', 'nationality', 'languages', 'projects', 'declaration', 'career'
  ];

  // 1. Direct inspection of top lines (first 8 lines)
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    let line = lines[i].trim();

    // Clean leading labels like "Name:", "Full Name:"
    line = line.replace(/^(?:name|full\s*name|candidate\s*name)\s*[:\-–]\s*/i, '').trim();

    if (!line || line.length < 2 || line.length > 40) continue;
    if (line.includes('@') || /\d/.test(line) || line.includes('/') || line.includes('|') || line.includes(':')) continue;

    const lower = line.toLowerCase();
    const hasInvalidKeyword = invalidNameKeywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(lower));
    if (hasInvalidKeyword) continue;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 1 && words.length <= 4) {
      const allAlpha = words.every(w => /^[a-zA-Z'.-]+$/.test(w));
      if (allAlpha) {
        const formatted = words
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        return { name: formatted, evidence: lines[i] };
      }
    }
  }

  // 2. Cross-verify with clean filename if tokens appear in CV body
  if (fileName) {
    const rawBase = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/\(\d+\)/g, '')
      .replace(/^(?:resume|cv|profile|candidate)[\s_-]*/i, '')
      .replace(/[\s_-]*(?:resume|cv|profile|candidate)$/i, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim();

    const nameTokens = rawBase.split(/\s+/).filter(t => t.length >= 2 && /^[a-zA-Z]+$/.test(t));
    if (nameTokens.length >= 2) {
      const allTokensInCv = nameTokens.every(token =>
        new RegExp(`\\b${token}\\b`, 'i').test(cleanText)
      );
      if (allTokensInCv) {
        const formatted = nameTokens
          .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
        return { name: formatted, evidence: `Verified in CV text (${rawBase})` };
      }
    }
  }

  return { name: null };
}

/**
 * Parses CV text strictly using evidence present in the text.
 */
export function extractStructuredCandidateFromText(
  rawText: string,
  fileName: string,
  docMetrics: {
    fileType: string;
    pageCount: number;
    extractionMethod: string;
    ocrUsed: boolean;
    characterCount: number;
    wordCount: number;
  }
): CandidateParsedProfile {
  const validationErrors: string[] = [];

  // 1. Text Quality Validation
  const qualityCheck = validateCvTextQuality(rawText);
  if (!qualityCheck.isValid) {
    validationErrors.push(qualityCheck.reason || 'Invalid CV text quality');
    return {
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
      errorMessage: qualityCheck.reason || 'Unable to extract valid CV text from this document.',
      validationErrors,
      parsingMetadata: {
        fileName,
        fileType: docMetrics.fileType || 'application/pdf',
        pageCount: docMetrics.pageCount || 1,
        extractionMethod: docMetrics.extractionMethod || 'failed',
        ocrUsed: docMetrics.ocrUsed || false,
        characterCount: docMetrics.characterCount || 0,
        wordCount: docMetrics.wordCount || 0,
      },
      debug: {
        rawTextPreview: (rawText || '').substring(0, 300),
        extractionMethod: docMetrics.extractionMethod || 'failed',
        ocrUsed: docMetrics.ocrUsed || false,
        characterCount: docMetrics.characterCount || 0,
        wordCount: docMetrics.wordCount || 0,
        parserInputPreview: (rawText || '').substring(0, 200),
        parsedCandidate: {},
        validationErrors,
      },
    };
  }

  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  const sourceEvidence: Record<string, string | undefined> = {};

  // 2. Email Extraction
  let email: string | null = null;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const emailMatches = cleanText.match(emailRegex);
  if (emailMatches) {
    for (const match of emailMatches) {
      const validated = validateEmail(match);
      if (validated) {
        email = validated;
        sourceEvidence['email'] = match;
        break;
      }
    }
  }

  // 3. Phone Extraction
  let phone: string | null = null;
  const phonePatterns = [
    /(?:\+91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g,
    /(?:\+\d{1,3}[\-\s]?)?\(?\d{3}\)?[\-\s]?\d{3}[\-\s]?\d{4}\b/g,
    /\+\d{10,14}\b/g,
  ];

  for (const pattern of phonePatterns) {
    const matches = cleanText.match(pattern);
    if (matches) {
      for (const m of matches) {
        const validated = validatePhone(m);
        if (validated) {
          phone = validated;
          sourceEvidence['phone'] = m;
          break;
        }
      }
    }
    if (phone) break;
  }

  // 4. Candidate Name Extraction
  const nameResult = extractCandidateName(lines, cleanText, fileName);
  const name = nameResult.name;
  if (nameResult.evidence) {
    sourceEvidence['name'] = nameResult.evidence;
  }

  // 5. Total Experience Extraction (Evidence-based only)
  let totalExperience: string | null = null;
  const expMatch = cleanText.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)(?:\s*(?:of\s*)?experience)?/i);
  if (expMatch) {
    totalExperience = `${expMatch[1]} years`;
    sourceEvidence['totalExperience'] = expMatch[0];
  } else {
    const yearRangeMatch = cleanText.match(/\b(20\d{2}|19\d{2})\s*(?:[-–—]|to)\s*(20\d{2}|Present|Current)\b/i);
    if (yearRangeMatch) {
      const startYear = parseInt(yearRangeMatch[1], 10);
      const endYear = yearRangeMatch[2].toLowerCase().includes('present') || yearRangeMatch[2].toLowerCase().includes('current')
        ? new Date().getFullYear()
        : parseInt(yearRangeMatch[2], 10);
      if (!isNaN(startYear) && !isNaN(endYear) && endYear >= startYear && (endYear - startYear) <= 40) {
        const years = endYear - startYear;
        if (years > 0) {
          totalExperience = `${years} years`;
          sourceEvidence['totalExperience'] = yearRangeMatch[0];
        }
      }
    }
  }

  // 6. Current Title & Company Extraction
  let currentTitle: string | null = null;
  let currentCompany: string | null = null;

  const titleList = [
    'Senior Frontend Engineer', 'Senior Frontend Developer', 'Frontend Engineer', 'Frontend Developer',
    'Senior Full Stack Engineer', 'Senior Full Stack Developer', 'Full Stack Engineer', 'Full Stack Developer',
    'Senior Backend Engineer', 'Senior Backend Developer', 'Backend Engineer', 'Backend Developer',
    'Senior Software Engineer', 'Software Engineer', 'Software Developer', 'React Developer',
    'Java Developer', 'Python Developer', 'DevOps Engineer', 'Cloud Architect', 'UI/UX Designer',
    'Product Designer', 'Data Scientist', 'Data Engineer', 'Machine Learning Engineer',
    'QA Automation Engineer', 'SAP CO Consultant', 'SAP FI Consultant', 'SAP S/4HANA Consultant',
    'Product Manager', 'Project Manager', 'Solutions Architect'
  ];

  const headerText = lines.slice(0, 8).join('\n');
  for (const t of titleList) {
    const reg = new RegExp(`\\b${t.replace('/', '\\/')}\\b`, 'i');
    if (reg.test(headerText)) {
      currentTitle = t;
      sourceEvidence['currentTitle'] = t;
      break;
    }
  }

  if (!currentTitle) {
    for (const t of titleList) {
      const reg = new RegExp(`\\b${t.replace('/', '\\/')}\\b`, 'i');
      if (reg.test(cleanText)) {
        currentTitle = t;
        sourceEvidence['currentTitle'] = t;
        break;
      }
    }
  }

  const companyPattern = /(?:at|company|worked at|organization|employer)\s*[:\-–]\s*([A-Za-z0-9\s&.,]{2,40})/i;
  const companyMatch = cleanText.match(companyPattern);
  if (companyMatch && companyMatch[1]) {
    const candidateCompany = companyMatch[1].trim();
    if (!['present', 'current', 'experience', 'skills', 'education'].includes(candidateCompany.toLowerCase())) {
      currentCompany = candidateCompany;
      sourceEvidence['currentCompany'] = companyMatch[0];
    }
  }

  // 7. Location Extraction
  let location: string | null = null;
  const locationPattern = /(?:location|address|city|based in|residence)\s*[:\-–]\s*([A-Za-z\s,]+(?:India|USA|UK|CA|Pune|Bengaluru|Bangalore|Hyderabad|Mumbai|Delhi|Chennai|Noida|Gurgaon|Austin|San Francisco|New York|London|Singapore))/i;
  const locMatch = cleanText.match(locationPattern);
  if (locMatch && locMatch[1]) {
    location = locMatch[1].trim();
    sourceEvidence['location'] = locMatch[0];
  } else {
    const cityList = ['Pune', 'Bengaluru', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Chennai', 'Noida', 'Gurgaon', 'San Francisco', 'New York', 'Austin', 'London'];
    for (const city of cityList) {
      if (new RegExp(`\\b${city}\\b`, 'i').test(cleanText)) {
        location = city;
        sourceEvidence['location'] = city;
        break;
      }
    }
  }

  // 8. Skills Extraction
  const knownSkillCatalog = [
    'React', 'React.js', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'HTML', 'CSS3', 'CSS', 'Tailwind CSS',
    'Tailwind', 'Redux', 'Redux Toolkit', 'Node.js', 'Express', 'Express.js', 'Python', 'FastAPI', 'Django',
    'Flask', 'Java', 'Spring Boot', 'Spring', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'AWS',
    'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'REST APIs', 'REST API', 'GraphQL',
    'Microservices', 'Jest', 'Cypress', 'Webpack', 'Vite', 'SAP CO', 'SAP FI', 'S/4HANA', 'Controlling',
    'CO-PA', 'CO-PC', 'Figma', 'UI/UX', 'Kafka', 'Elasticsearch', 'Linux', 'Bash', 'C++', 'C#', '.NET',
    'Go', 'Golang', 'Rust', 'PHP', 'Laravel'
  ];

  const foundSkillsSet = new Set<string>();
  for (const skill of knownSkillCatalog) {
    const escaped = skill.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:[^a-zA-Z0-9_]|$)`, 'i');
    if (regex.test(cleanText)) {
      foundSkillsSet.add(skill);
    }
  }
  const skills = Array.from(foundSkillsSet);
  if (skills.length > 0) {
    sourceEvidence['skills'] = skills.join(', ');
  }

  // 9. Summary Extraction
  let summary: string | null = null;
  const summaryMatch = cleanText.match(/(?:summary|profile|about me|objective|professional summary)\s*[:\-–\n]+([\s\S]{30,600}?)(?=\n\s*(?:experience|work history|skills|education|projects|certifications|employment)|$)/i);
  if (summaryMatch && summaryMatch[1]) {
    const rawSummary = summaryMatch[1].replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    if (rawSummary.length >= 20) {
      summary = rawSummary;
      sourceEvidence['summary'] = rawSummary;
    }
  }

  // 10. Education Extraction
  const education: CandidateEducation[] = [];
  const eduKeywords = [
    { degree: 'Bachelor of Engineering (B.E.)', match: /\b(?:B\.?E\.?|Bachelor of Engineering)\b/i },
    { degree: 'Bachelor of Technology (B.Tech)', match: /\b(?:B\.?Tech|Bachelor of Technology)\b/i },
    { degree: 'Master of Technology (M.Tech)', match: /\b(?:M\.?Tech|Master of Technology)\b/i },
    { degree: 'Master of Science (M.S.)', match: /\b(?:M\.?S\.?|Master of Science)\b/i },
    { degree: 'Bachelor of Science (B.Sc)', match: /\b(?:B\.?Sc|Bachelor of Science)\b/i },
    { degree: 'Bachelor of Computer Applications (BCA)', match: /\b(?:BCA|Bachelor of Computer Applications)\b/i },
    { degree: 'Master of Computer Applications (MCA)', match: /\b(?:MCA|Master of Computer Applications)\b/i },
    { degree: 'Master of Business Administration (MBA)', match: /\bMBA\b/i },
  ];

  for (const edu of eduKeywords) {
    if (edu.match.test(cleanText)) {
      education.push({
        degree: edu.degree,
        institution: null,
        year: null,
        sourceEvidence: edu.degree,
      });
    }
  }

  // 11. Experience Entries Extraction
  const experience: CandidateExperience[] = [];
  const experienceSectionMatch = cleanText.match(/(?:experience|work experience|employment history|work history)\s*[:\-–\n]+([\s\S]{50,3000}?)(?=\n\s*(?:education|skills|certifications|projects|languages|declaration)|$)/i);
  if (experienceSectionMatch && experienceSectionMatch[1]) {
    const expText = experienceSectionMatch[1];
    const expLines = expText.split('\n').map(l => l.trim()).filter(Boolean);
    
    for (let i = 0; i < expLines.length; i++) {
      const expLine = expLines[i];
      const jobMatch = expLine.match(/^([A-Za-z0-9\s&.,\(\)\/]+?)\s*(?:—|–|-|at|@)\s*([A-Za-z0-9\s&.,]+?)(?:\s*\((\d{4}[^\)]*)\))?$/);
      if (jobMatch) {
        experience.push({
          title: jobMatch[1].trim(),
          company: jobMatch[2].trim(),
          duration: jobMatch[3] ? jobMatch[3].trim() : null,
          sourceEvidence: expLine,
        });
      }
    }
  }

  // 12. Certifications Extraction
  const certifications: string[] = [];
  const certSectionMatch = cleanText.match(/(?:certifications?|licenses?|credentials?)\s*[:\-–\n]+([\s\S]{20,800}?)(?=\n\s*(?:education|skills|experience|projects|languages|declaration)|$)/i);
  if (certSectionMatch && certSectionMatch[1]) {
    const certLines = certSectionMatch[1].split('\n').map(l => l.replace(/^[●•*\-–—▪▫➢✓✔\d\.\)]\s*/, '').trim()).filter(l => l.length > 3 && l.length < 80);
    certifications.push(...certLines);
  }

  // 13. Languages Extraction
  const languages: string[] = [];
  const langList = ['English', 'Hindi', 'Marathi', 'Spanish', 'French', 'German', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Mandarin', 'Japanese'];
  for (const lang of langList) {
    if (new RegExp(`\\b${lang}\\b`, 'i').test(cleanText)) {
      languages.push(lang);
    }
  }

  const parsedProfile: CandidateParsedProfile = {
    name,
    email,
    phone,
    location,
    currentTitle,
    currentCompany,
    totalExperience,
    relevantExperience: totalExperience,
    summary,
    skills,
    technologies: skills.filter(s => ['React', 'Next.js', 'Node.js', 'Python', 'FastAPI', 'Java', 'SQL', 'PostgreSQL', 'Docker', 'AWS'].includes(s)),
    tools: skills.filter(s => ['Git', 'GitHub', 'Figma', 'Docker', 'Kubernetes', 'Jest', 'Cypress', 'Webpack', 'Vite'].includes(s)),
    industries: [],
    education,
    certifications,
    languages,
    experience,
    responsibilities: [],
    achievements: [],
    projects: [],
    sourceEvidence,
    rawText,
    parsingStatus: 'PARSED',
    errorMessage: undefined,
    validationErrors: [],
    parsingMetadata: {
      fileName,
      fileType: docMetrics.fileType || 'application/pdf',
      pageCount: docMetrics.pageCount || 1,
      extractionMethod: docMetrics.extractionMethod || 'direct-text',
      ocrUsed: docMetrics.ocrUsed || false,
      characterCount: docMetrics.characterCount || rawText.length,
      wordCount: docMetrics.wordCount || rawText.split(/\s+/).filter(Boolean).length,
    },
    debug: {
      rawTextPreview: rawText.substring(0, 400),
      extractionMethod: docMetrics.extractionMethod || 'direct-text',
      ocrUsed: docMetrics.ocrUsed || false,
      characterCount: docMetrics.characterCount || rawText.length,
      wordCount: docMetrics.wordCount || rawText.split(/\s+/).filter(Boolean).length,
      parserInputPreview: rawText.substring(0, 250),
      parsedCandidate: {
        name,
        email,
        phone,
        currentTitle,
        currentCompany,
        totalExperience,
        skillsCount: skills.length,
      },
      validationErrors: [],
    },
  };

  return parsedProfile;
}
