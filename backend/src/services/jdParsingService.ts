const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

export interface DocumentMetrics {
  fileName: string;
  fileType: string;
  pageCount: number;
  extractionMethod: string;
  ocrUsed: boolean;
  textLength: number;
  wordCount: number;
  lineCount: number;
}

export interface SalaryDebugInfo {
  rawMatch: string | null;
  normalizedValue: string | null;
  sourceFound: boolean;
  method: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ParsedRequirement {
  requirement: string;
  category: string;
  mandatory: boolean;
  weight: number;
  evidenceRequired: boolean;
  sourceEvidence: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  needsVerification: boolean;
}

export interface ParsedJobData {
  jobTitle: string | null;
  company: string | null;
  location: string | null;
  workMode: string | null;
  employmentType: string | null;
  salary: string | null;
  requiredExperience: string | null;
  education: string[];
  certifications: string[];
  technicalSkills: string[];
  functionalSkills: string[];
  tools: string[];
  technologies: string[];
  industries: string[];
  languages: string[];
  responsibilities: string[];
  mandatoryRequirements: string[];
  preferredRequirements: string[];
  niceToHaveRequirements: string[];
}

export interface ParsingResult {
  success: boolean;
  rawText: string;
  data: {
    document: DocumentMetrics;
    job: ParsedJobData;
    requirements: ParsedRequirement[];
    warnings: string[];
    salaryDebug?: SalaryDebugInfo;
  };
}

/**
 * Perform Optical Character Recognition (OCR) fallback for scanned image PDFs/documents
 */
export const performOcrFallback = async (buffer: Buffer): Promise<string> => {
  try {
    console.log('[OCR Fallback] Initializing Tesseract OCR engine worker...');
    const worker = await createWorker('eng');
    const ret = await worker.recognize(buffer);
    await worker.terminate();
    console.log(`[OCR Fallback] OCR completed. Extracted ${ret.data.text.length} characters.`);
    return ret.data.text || '';
  } catch (err: any) {
    console.error('[OCR Fallback Error]', err.message || err);
    return '';
  }
};

/**
 * Calculate Document Extraction Quality Metrics
 */
export const calculateDocumentMetrics = (
  rawText: string,
  pageCount: number,
  extractionMethod: string,
  ocrUsed: boolean,
  fileName: string,
  fileType: string
): DocumentMetrics => {
  const text = rawText || '';
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  return {
    fileName,
    fileType,
    pageCount: pageCount || 1,
    extractionMethod,
    ocrUsed,
    textLength: text.length,
    wordCount: words.length,
    lineCount: lines.length
  };
};

/**
 * 1. EXTRACT TEXT FROM BUFFER (PDF, DOCX, TXT) WITH OCR FALLBACK
 */
export const extractTextFromBuffer = async (
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<{ text: string; pageCount: number; method: string; ocrUsed: boolean }> => {
  const lowerName = filename.toLowerCase();
  let extractedText = '';
  let pageCount = 1;
  let method = 'utf8';
  let ocrUsed = false;

  // A. PDF Extraction
  if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) {
    method = 'pdf-parse';
    try {
      const data = await pdfParse(buffer);
      if (data) {
        pageCount = data.numpages || 1;
        extractedText = data.text || '';
      }
    } catch (err: any) {
      console.warn('[PDF Extractor] pdf-parse warning, attempting stream text extraction:', err.message || String(err));
    }

    // Direct Stream Extraction Fallback if pdf-parse text is insufficient
    if (!extractedText || extractedText.trim().length < 30) {
      method = 'pdf-stream-extractor';
      try {
        const rawString = buffer.toString('latin1');
        const textChunks: string[] = [];

        const tjMatches = rawString.match(/\(([^()]{2,})\)\s*(?:Tj|TJ|\')/g) || [];
        for (const m of tjMatches) {
          const s = m.replace(/^\(/, '').replace(/\)\s*(?:Tj|TJ|\')$/, '').trim();
          if (s && !s.startsWith('/') && !s.startsWith('%PDF') && !s.includes('FontName')) {
            textChunks.push(s);
          }
        }

        if (textChunks.length > 3) {
          extractedText = textChunks.join('\n');
        } else {
          const blocks = rawString.match(/[A-Za-z0-9+#.,:\-$%\s]{4,}/g) || [];
          const cleanBlocks = blocks
            .map(b => b.trim())
            .filter(b =>
              b.length > 3 &&
              !b.startsWith('%PDF') &&
              !b.startsWith('obj') &&
              !b.startsWith('endobj') &&
              !b.startsWith('stream') &&
              !b.startsWith('endstream') &&
              !b.startsWith('xref') &&
              !b.startsWith('trailer') &&
              !b.startsWith('/Type') &&
              !b.startsWith('/Font') &&
              !b.startsWith('/Catalog') &&
              !/^\d+\.\d+$/.test(b)
            );
          extractedText = cleanBlocks.join('\n');
        }
      } catch (e: any) {
        console.error('[PDF Extractor] Stream fallback error:', e);
      }
    }

    // OCR Fallback if PDF text is still empty or scanned image PDF (< 30 characters or < 8 words)
    const words = extractedText.trim().split(/\s+/).filter(Boolean);
    if (extractedText.trim().length < 30 || words.length < 8) {
      console.log('[Text Quality Check] PDF text is insufficient/scanned image. Triggering Tesseract OCR fallback...');
      const ocrText = await performOcrFallback(buffer);
      if (ocrText && ocrText.trim().length > 30) {
        extractedText = ocrText;
        method = 'tesseract-ocr';
        ocrUsed = true;
      }
    }

    return { text: extractedText, pageCount, method, ocrUsed };
  }

  // B. DOCX Extraction
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc')
  ) {
    method = 'mammoth-docx';
    try {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || '';
    } catch (err: any) {
      console.error('DOCX parsing error:', err);
      throw new Error(`Failed to extract text from Word document: ${err.message || String(err)}`);
    }
    return { text: extractedText, pageCount: 1, method, ocrUsed: false };
  }

  // C. TXT Extraction
  extractedText = buffer.toString('utf-8');
  return { text: extractedText, pageCount: 1, method: 'plain-text', ocrUsed: false };
};

/**
 * 2. CLEAN AND NORMALIZE TEXT
 * Strips PDF metadata & structural artifacts while preserving linebreaks and bullet points
 */
export const cleanAndNormalizeText = (rawText: string): string => {
  if (!rawText) return '';

  return rawText
    // Remove PDF structural header/trailer artifacts
    .replace(/%PDF-[\d.]+/gi, '')
    .replace(/ReportLab Generated PDF document/gi, '')
    .replace(/\/Producer\s*\([^)]*\)/gi, '')
    .replace(/\/Creator\s*\([^)]*\)/gi, '')
    .replace(/\/Title\s*\([^)]*\)/gi, '')
    .replace(/obj[\s\S]*?endobj/gi, '')
    // Normalize linebreaks and whitespace
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

/**
 * DEDICATED DETERMINISTIC SALARY EXTRACTOR & NORMALIZER
 * Authoritative extractor that recognizes salary expressions regardless of line breaks,
 * normalizes hyphens & spaces (e.g., "₹6 - 10 LPA" -> "₹6–10 LPA"),
 * rejects non-salary numbers (experience years, dates), and returns salaryDebug metadata.
 */
export const extractSalary = (text: string): { salary: string | null; debug: SalaryDebugInfo } => {
  if (!text || typeof text !== 'string') {
    return {
      salary: null,
      debug: { rawMatch: null, normalizedValue: null, sourceFound: false, method: 'deterministic-pattern', confidence: 'HIGH' }
    };
  }

  // Normalize all Unicode dash/hyphen variants to en-dash (–) and normalize spaces
  const normText = text
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212~]/g, '–')
    .replace(/[ \t]+/g, ' ');

  // List of precise salary patterns (ordered by specificity)
  const salaryPatterns: RegExp[] = [
    // 1. Full Range: Currency (₹/$/INR/USD) + number range + LPA / per annum / PA / p.a.
    // e.g. "Salary: ₹6–10 LPA", "₹6 - 10 LPA", "INR 6–10 LPA", "$60,000–$80,000", "USD 60,000–80,000"
    /(?:Salary|Compensation|Package|Pay|Remuneration)?\s*:?\s*((?:₹|INR|\$|USD)?\s*\d{1,3}(?:,\d{2,3})*(?:\.\d+)?\s*[-–]\s*(?:₹|INR|\$|USD)?\s*\d{1,3}(?:,\d{2,3})*(?:\.\d+)?(?:\s*(?:LPA|per annum|PA|p\.a\.|yr|year|k|K))?)/i,

    // 2. Number range + LPA / per annum / PA / p.a.
    // e.g. "6–10 LPA", "6 - 10 LPA", "10–15 LPA"
    /\b(\d{1,2}(?:\.\d+)?\s*[-–]\s*\d{1,2}(?:\.\d+)?\s*(?:LPA|per annum|PA|p\.a\.))\b/i,

    // 3. Currency + large numeric range + per annum / LPA
    // e.g. "₹10,00,000 - ₹15,00,000 per annum" or "₹10,00,000–₹15,00,000 per annum"
    /((?:₹|INR|\$|USD)\s*\d{1,2}(?:,\d{2,3})+\s*[-–]\s*(?:₹|INR|\$|USD)?\s*\d{1,2}(?:,\d{2,3})+\s*(?:per annum|PA|p\.a\.|LPA))/i,

    // 4. Single monetary amount with LPA / per annum / PA
    // e.g. "Compensation: ₹12 LPA", "12 LPA", "₹10,00,000 per annum"
    /(?:Salary|Compensation|Package)?\s*:?\s*((?:₹|INR|\$|USD)\s*\d{1,3}(?:,\d{2,3})*(?:\.\d+)?\s*(?:LPA|per annum|PA|p\.a\.|Lakhs?))/i,
    /\b(\d{1,2}(?:\.\d+)?\s*(?:LPA|per annum|PA|p\.a\.))\b/i
  ];

  for (const pattern of salaryPatterns) {
    const match = normText.match(pattern);
    if (match && match[1]) {
      let rawMatch = match[1].trim();

      // Immediately truncate if any glued letters follow LPA / per annum
      rawMatch = rawMatch.replace(/(LPA|per annum|PA|p\.a\.|year|yr|k|K)[\s\S]*/i, '$1').trim();

      // Normalize hyphens to en-dash (–) and normalize spaces
      let normalized = rawMatch
        .replace(/\s*[-–]\s*/g, '–')
        .replace(/\s+/g, ' ')
        .trim();

      // Rejection check: Reject object IDs like "$019" or single digits
      if (/^\$0\d{1,3}$/.test(normalized) || normalized.length < 3) {
        continue;
      }

      // Rejection check: Ensure non-salary numbers like "2+ years experience" or "2026" are not captured
      if (/year|exp|req|joining|date/i.test(normalized) && !/per annum|PA|p\.a\.|yr/i.test(normalized)) {
        continue;
      }

      // Reattach currency symbol if missing from token match
      if (!normalized.startsWith('₹') && !normalized.startsWith('$') && !normalized.startsWith('€') && !normalized.startsWith('£') && !normalized.toLowerCase().startsWith('inr') && !normalized.toLowerCase().startsWith('usd')) {
        if (normText.includes('₹') || normText.includes('\u20b9') || /\bLPA\b/i.test(normalized) || /\bLakhs?\b/i.test(normalized)) {
          normalized = '₹' + normalized;
        } else if (normText.includes('$') || /\bUSD\b/i.test(normText)) {
          normalized = '$' + normalized;
        } else if (normText.includes('€') || /\bEUR\b/i.test(normText)) {
          normalized = '€' + normalized;
        }
      }

      return {
        salary: normalized,
        debug: {
          rawMatch,
          normalizedValue: normalized,
          sourceFound: true,
          method: 'deterministic-pattern',
          confidence: 'HIGH'
        }
      };
    }
  }

  return {
    salary: null,
    debug: {
      rawMatch: null,
      normalizedValue: null,
      sourceFound: false,
      method: 'deterministic-pattern',
      confidence: 'HIGH'
    }
  };
};

const KNOWN_FIELD_LABELS = [
  'company', 'client', 'position', 'job title', 'location', 'work mode', 'workmode',
  'salary', 'compensation', 'package', 'pay', 'ctc', 'job summary', 'employment type',
  'experience', 'education', 'certification', 'skills', 'responsibilities', 'requirements'
];

const REJECT_COMPANY_TOKENS = new Set([
  'lpa', 'inr', 'usd', '₹', '$', 'ctc', 'lakh', 'lakhs', 'per annum', 'pa', 'p.a.',
  'years', 'year', 'exp', 'hybrid', 'remote', 'onsite', 'full-time', 'part-time',
  'job summary', 'location', 'salary', 'position', 'job title', 'requirements',
  'responsibilities', 'about the role', 'key responsibilities', 'overview'
]);

/**
 * GENERIC FIELD CONTAMINATION VALIDATOR & LABEL STRIPPER
 */
export const validateCleanFieldValue = (value: string | null, fieldName: string): string | null => {
  if (!value || typeof value !== 'string') return null;

  let cleaned = value.trim();

  // Strip leading label prefix if present
  for (const label of KNOWN_FIELD_LABELS) {
    const prefixRegex = new RegExp(`^(?:${label})\\s*:?\\s*`, 'i');
    cleaned = cleaned.replace(prefixRegex, '').trim();
  }

  // Strip trailing label contamination
  for (const label of KNOWN_FIELD_LABELS) {
    if (label.toLowerCase() === fieldName.toLowerCase()) continue;

    const lowerCleaned = cleaned.toLowerCase();
    const lowerLabel = label.toLowerCase();

    if (lowerCleaned.includes(lowerLabel)) {
      const parts = cleaned.split(new RegExp(`(?:${label}):?\\s*`, 'i'));
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (trimmedPart.length >= 2 && !KNOWN_FIELD_LABELS.includes(trimmedPart.toLowerCase())) {
          cleaned = trimmedPart;
          break;
        }
      }
    }
  }

  cleaned = cleaned.replace(/^[:\s–\-]+|[:\s–\-]+$/g, '').trim();

  if (fieldName.toLowerCase() === 'company') {
    const lowerComp = cleaned.toLowerCase();
    if (
      REJECT_COMPANY_TOKENS.has(lowerComp) ||
      /^\d+$/.test(cleaned) ||
      /^(lpa|inr|usd|ctc|lakh|lakhs)$/i.test(cleaned) ||
      cleaned.length < 2
    ) {
      return null;
    }
  }

  if (!cleaned || KNOWN_FIELD_LABELS.includes(cleaned.toLowerCase())) {
    return null;
  }

  return cleaned;
};

/**
 * 3. STRUCTURED JD EXTRACTION & REQUIREMENT PARSING
 */
export const parseJobDescription = (
  text: string,
  filename: string = 'document.pdf',
  fileType: string = 'application/pdf',
  pageCount: number = 1,
  extractionMethod: string = 'pdf-parse',
  ocrUsed: boolean = false
): ParsingResult => {
  const cleanedText = cleanAndNormalizeText(text);
  const warnings: string[] = [];
  const metrics = calculateDocumentMetrics(cleanedText, pageCount, extractionMethod, ocrUsed, filename, fileType);

  // Quality Check Gatekeeper: Reject empty or unusable documents
  if (!cleanedText || metrics.textLength < 25 || metrics.wordCount < 5) {
    warnings.push('Unable to extract readable text from this document.');
    return {
      success: false,
      rawText: cleanedText,
      data: {
        document: metrics,
        job: {
          jobTitle: null,
          company: null,
          location: null,
          workMode: null,
          employmentType: null,
          salary: null,
          requiredExperience: null,
          education: [],
          certifications: [],
          technicalSkills: [],
          functionalSkills: [],
          tools: [],
          technologies: [],
          industries: [],
          languages: [],
          responsibilities: [],
          mandatoryRequirements: [],
          preferredRequirements: [],
          niceToHaveRequirements: []
        },
        requirements: [],
        warnings
      }
    };
  }

  const lines = cleanedText
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  // A. JOB TITLE EXTRACTION (Must come from text content; NEVER PDF metadata)
  let extractedJobTitle: string | null = null;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower.includes('job title:') ||
      lower.includes('position:') ||
      lower.includes('role:') ||
      lower.includes('designation:') ||
      lower.startsWith('title:')
    ) {
      const match = line.match(/(?:job title|position|role|designation|title):?\s*([A-Za-z0-9\s&.\-]+)/i);
      if (match && match[1] && match[1].trim().length >= 2) {
        extractedJobTitle = match[1].trim();
        break;
      }
    }
  }

  if (!extractedJobTitle && lines.length > 0) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const candidate = lines[i];
      const lowerCandidate = candidate.toLowerCase();
      
      // Reject metadata keywords and section headers
      if (
        lowerCandidate.includes('reportlab') ||
        lowerCandidate.includes('generated pdf') ||
        lowerCandidate.startsWith('job description') ||
        lowerCandidate.startsWith('overview') ||
        lowerCandidate.startsWith('requirements') ||
        candidate.length > 70
      ) {
        continue;
      }

      if (candidate.includes('-')) {
        const parts = candidate.split('-');
        extractedJobTitle = parts[0].trim();
        break;
      } else if (candidate.length >= 3 && candidate.length <= 60 && !candidate.includes(':')) {
        extractedJobTitle = candidate.trim();
        break;
      }
    }
  }

  // Validate Job Title against raw text content
  if (
    !extractedJobTitle ||
    extractedJobTitle.toLowerCase().includes('reportlab') ||
    extractedJobTitle.toLowerCase().includes('generated pdf') ||
    extractedJobTitle.toLowerCase() === 'job description' ||
    !cleanedText.includes(extractedJobTitle)
  ) {
    extractedJobTitle = null;
    warnings.push('Job title could not be confidently identified from document content.');
  }

  // B. COMPANY EXTRACTION
  let extractedCompany: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (
      lower === 'company' ||
      lower.startsWith('company:') ||
      lower.startsWith('company ') ||
      lower.startsWith('company\t') ||
      lower === 'client' ||
      lower.startsWith('client:') ||
      lower.startsWith('client ') ||
      lower === 'employer' ||
      lower.startsWith('employer:') ||
      lower.startsWith('employer ')
    ) {
      const val = line.replace(/^(company|client|organization|employer):?\s*/i, '').trim();
      if (val && val.length >= 2 && !val.toLowerCase().includes('reportlab')) {
        extractedCompany = val;
        break;
      } else if (i + 1 < lines.length) {
        const candidateParts: string[] = [];
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nextVal = lines[j].trim();
          if (
            nextVal &&
            !nextVal.includes(':') &&
            !KNOWN_FIELD_LABELS.includes(nextVal.toLowerCase()) &&
            !nextVal.toLowerCase().includes('reportlab')
          ) {
            candidateParts.push(nextVal);
          } else {
            break;
          }
        }
        if (candidateParts.length > 0) {
          extractedCompany = candidateParts.join(' ');
          break;
        }
      }
    }
  }

  if (!extractedCompany) {
    const introMatch = cleanedText.match(/([A-Z][A-Za-z0-9\s&.]{2,50}\s+(?:Solutions|Technologies|Tech|Inc|Corp|Ltd|Pvt Ltd|Private Limited|Group|Services|Systems|Software|Labs|Interactive|Global))\s+(?:is looking|is hiring|is seeking|looking for|hiring for)/i);
    if (introMatch && introMatch[1]) {
      extractedCompany = introMatch[1].trim();
    }
  }

  if (!extractedCompany && lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.includes('-')) {
      const parts = firstLine.split('-');
      if (parts[1] && parts[1].trim().length > 2 && parts[1].trim().length < 50) {
        extractedCompany = parts[1].trim();
      }
    }
  }

  if (extractedCompany) {
    const normDocText = cleanedText.toLowerCase().replace(/\s+/g, ' ');
    const normCompText = extractedCompany.toLowerCase().replace(/\s+/g, ' ');
    if (!normDocText.includes(normCompText) || extractedCompany.toLowerCase().includes('reportlab')) {
      extractedCompany = null;
    }
  }

  // C. LOCATION EXTRACTION
  let extractedLocation: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (lower.startsWith('location:') || lower.startsWith('location ') || lower.startsWith('location\t') || lower.startsWith('city:') || lower.startsWith('city ')) {
      const val = line.replace(/^(location|city):?\s*/i, '').trim();
      if (val && val.length >= 2 && !val.toLowerCase().includes('reportlab')) {
        extractedLocation = val;
        break;
      } else if (i + 1 < lines.length) {
        const nextVal = lines[i + 1].trim();
        if (nextVal && nextVal.length >= 2 && !nextVal.includes(':') && !nextVal.toLowerCase().includes('reportlab')) {
          extractedLocation = nextVal;
          break;
        }
      }
    }
  }

  if (!extractedLocation) {
    const locMatch = cleanedText.match(/\b([A-Z][a-zA-Z\s]{2,20},\s*[A-Z][a-zA-Z\s]{2,20})\b/);
    if (locMatch && locMatch[1]) {
      const candidate = locMatch[1].trim();
      if (!candidate.toLowerCase().includes('job summary') && !candidate.toLowerCase().includes('about')) {
        extractedLocation = candidate;
      }
    }
  }

  // D. WORK MODE EXTRACTION
  let extractedWorkMode: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (lower.startsWith('work mode:') || lower.startsWith('work mode') || lower.startsWith('workmode')) {
      const val = line.replace(/^(work mode|workmode):?\s*/i, '').trim();
      if (val && ['remote', 'hybrid', 'onsite', 'on-site'].includes(val.toLowerCase())) {
        extractedWorkMode = val.toLowerCase().includes('remote') ? 'Remote' : val.toLowerCase().includes('hybrid') ? 'Hybrid' : 'Onsite';
        break;
      } else if (i + 1 < lines.length) {
        const nextVal = lines[i + 1].trim().toLowerCase();
        if (['remote', 'hybrid', 'onsite', 'on-site'].includes(nextVal)) {
          extractedWorkMode = nextVal.includes('remote') ? 'Remote' : nextVal.includes('hybrid') ? 'Hybrid' : 'Onsite';
          break;
        }
      }
    }
  }

  if (!extractedWorkMode) {
    const lowerText = cleanedText.toLowerCase();
    if (lowerText.includes('hybrid')) extractedWorkMode = 'Hybrid';
    else if (lowerText.includes('remote')) extractedWorkMode = 'Remote';
    else if (lowerText.includes('onsite') || lowerText.includes('on-site')) extractedWorkMode = 'Onsite';
  }

  // E. SALARY EXTRACTION (DETERMINISTIC EXTRACTOR)
  const salaryExtraction = extractSalary(cleanedText);
  const extractedSalary = salaryExtraction.salary;
  const salaryDebug = salaryExtraction.debug;

  // F. REQUIREMENT EXTRACTION & CLASSIFICATION (SECTION-AWARE PARSER)
  const requirements: ParsedRequirement[] = [];
  const mandatoryReqs: string[] = [];
  const preferredReqs: string[] = [];
  const educationList: string[] = [];
  const certList: string[] = [];
  const techSkillsList: string[] = [];
  const funcSkillsList: string[] = [];

  let currentSection: 'mandatory' | 'preferred' | 'general' = 'general';

  lines.forEach((line) => {
    const lower = line.toLowerCase();

    // Section Header Trackers
    if (lower.includes('mandatory requirements') || lower === 'mandatory' || lower.startsWith('mandatory requirements:')) {
      currentSection = 'mandatory';
      return;
    }
    if (lower.includes('preferred requirements') || lower === 'preferred' || lower.startsWith('preferred requirements:')) {
      currentSection = 'preferred';
      return;
    }
    if (lower.startsWith('key responsibilities') || lower.startsWith('about the role') || lower.startsWith('soft skills')) {
      currentSection = 'general';
      return;
    }

    const isNumberedOrBullet = /^\d+[\.\)]\s/.test(line) || line.startsWith('-') || line.startsWith('•') || line.startsWith('*');
    const hasRequirementKeywords =
      lower.includes('years') ||
      lower.includes('experience') ||
      lower.includes('degree') ||
      lower.includes('bachelor') ||
      lower.includes('master') ||
      lower.includes('certification') ||
      lower.includes('certified') ||
      lower.includes('proficient') ||
      lower.includes('knowledge') ||
      lower.includes('implementation') ||
      lower.includes('module') ||
      lower.includes('sap');

    if ((isNumberedOrBullet || hasRequirementKeywords || currentSection !== 'general') && line.length >= 8) {
      const cleanReqText = line.replace(/^[-•*\d.]+\s*/, '').replace(/—\s*(Mandatory|Preferred)/i, '').trim();

      if (
        cleanReqText.toLowerCase().startsWith('requirements') ||
        cleanReqText.toLowerCase().startsWith('responsibilities') ||
        cleanReqText.toLowerCase().startsWith('qualifications') ||
        cleanReqText.toLowerCase().includes('reportlab') ||
        cleanReqText.toLowerCase().startsWith('test job description') ||
        cleanReqText.toLowerCase() === 'technical skills' ||
        cleanReqText.toLowerCase() === 'experience' ||
        cleanReqText.toLowerCase() === 'education' ||
        cleanReqText.toLowerCase() === 'certification' ||
        cleanReqText.toLowerCase() === 'soft skills'
      ) {
        return;
      }

      // Mandatory / Preferred Classification according to Task 2 rules
      let mandatory = false;
      let needsVerification = false;

      const lowerClean = cleanReqText.toLowerCase();

      const mandatoryKeywords = [
        'required',
        'mandatory',
        'must have',
        'essential',
        'minimum',
        'candidate must have',
        'must possess',
        'must be'
      ];

      const preferredKeywords = [
        'preferred',
        'nice to have',
        'desirable',
        'advantage',
        'plus',
        'beneficial',
        'optional'
      ];

      const hasMandatoryKw = mandatoryKeywords.some(kw => lower.includes(kw) || lowerClean.includes(kw));
      const hasPreferredKw = preferredKeywords.some(kw => lower.includes(kw) || lowerClean.includes(kw));

      if (currentSection === 'mandatory') {
        mandatory = true;
      } else if (currentSection === 'preferred') {
        mandatory = false;
      } else if (hasMandatoryKw && !hasPreferredKw) {
        mandatory = true;
      } else if (hasPreferredKw && !hasMandatoryKw) {
        mandatory = false;
      } else {
        // Unclear classification: isMandatory = false, needsVerification = true
        mandatory = false;
        needsVerification = true;
      }

      // Supported Category Classification according to Task 2 (Section 6)
      let category = 'Functional Skill';
      if (lowerClean.includes('degree') || lowerClean.includes('bachelor') || lowerClean.includes('master') || lowerClean.includes('education') || lowerClean.includes('university') || lowerClean.includes('college')) {
        category = 'Education';
        educationList.push(cleanReqText);
      } else if (lowerClean.includes('certification') || lowerClean.includes('certified') || lowerClean.includes('aws certified') || lowerClean.includes('sap cert')) {
        category = 'Certification';
        certList.push(cleanReqText);
      } else if (lowerClean.includes('years') || lowerClean.includes('experience')) {
        category = 'Experience';
      } else if (lowerClean.includes('git') || lowerClean.includes('figma') || lowerClean.includes('docker') || lowerClean.includes('jira') || lowerClean.includes('postman')) {
        category = 'Tool';
      } else if (lowerClean.includes('react') || lowerClean.includes('next.js') || lowerClean.includes('typescript') || lowerClean.includes('javascript') || lowerClean.includes('html') || lowerClean.includes('css') || lowerClean.includes('tailwind') || lowerClean.includes('redux') || lowerClean.includes('node') || lowerClean.includes('python')) {
        category = 'Technical Skill';
        techSkillsList.push(cleanReqText);
      } else {
        funcSkillsList.push(cleanReqText);
      }

      // Source Evidence Verification (Section 5): Evidence MUST exist in original JD text
      const sourceEv = line.trim();
      const normJd = cleanedText.toLowerCase().replace(/\s+/g, ' ');
      const normEv = sourceEv.toLowerCase().replace(/\s+/g, ' ');

      if (!normJd.includes(normEv) && !normJd.includes(cleanReqText.toLowerCase().replace(/\s+/g, ' '))) {
        console.warn(`[Requirement Rejection] Rejecting fabricated requirement without evidence in JD: "${cleanReqText}"`);
        return;
      }

      if (mandatory) {
        mandatoryReqs.push(cleanReqText);
      } else {
        preferredReqs.push(cleanReqText);
      }

      requirements.push({
        requirement: cleanReqText,
        category,
        mandatory,
        weight: 1.0, // Default weight = 1.0 (Section 7)
        evidenceRequired: true,
        sourceEvidence: sourceEv,
        confidence: 'HIGH',
        needsVerification
      });
    }
  });

  let requiredExperience: string | null = null;
  const expMatch = cleanedText.match(/(\d+\+?\s*years(?:\s+of)?\s+[^.\n]+)/i);
  if (expMatch) {
    requiredExperience = expMatch[1].trim();
  }

  const cleanTitle = validateCleanFieldValue(extractedJobTitle, 'Job Title');
  const cleanCompany = validateCleanFieldValue(extractedCompany, 'Company');
  const cleanLocation = validateCleanFieldValue(extractedLocation, 'Location');
  const cleanWorkMode = validateCleanFieldValue(extractedWorkMode, 'Work Mode');
  const cleanSalary = validateCleanFieldValue(extractedSalary, 'Salary');

  const jobData: ParsedJobData = {
    jobTitle: cleanTitle,
    company: cleanCompany,
    location: cleanLocation,
    workMode: cleanWorkMode,
    employmentType: 'Full-time',
    salary: cleanSalary,
    requiredExperience,
    education: educationList,
    certifications: certList,
    technicalSkills: techSkillsList,
    functionalSkills: funcSkillsList,
    tools: [],
    technologies: [],
    industries: [],
    languages: [],
    responsibilities: [],
    mandatoryRequirements: mandatoryReqs,
    preferredRequirements: preferredReqs,
    niceToHaveRequirements: []
  };

  return {
    success: true,
    rawText: cleanedText,
    data: {
      document: metrics,
      job: jobData,
      requirements,
      warnings,
      salaryDebug
    }
  };
};
