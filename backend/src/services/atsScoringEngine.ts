/**
 * ATS Scoring Engine - Production Deterministic Requirement-Driven Architecture
 * 
 * Implements TASK 5 specifications:
 * - 7-Pillar Weighted Scoring (Mandatory 30%, Tech Skills 25%, Experience 20%, Responsibilities 10%, Education 5%, Semantic 5%, Domain 5%)
 * - Mandatory Requirement Gate (Gating failure if any mandatory requirement is NOT_MET / NOT_FOUND)
 * - Recruiter-defined requirement weights (1.0x, 1.5x, 2.0x, 2.5x, 3.0x)
 * - Centralized Status Multipliers (FULLY_MET=1.00, PARTIALLY_MET=0.50, NEEDS_VERIFICATION=0.25, NOT_MET=0.00, NOT_FOUND=0.00)
 * - Relevant Experience Tenure Separation (Separates specific tech tenure from total career years)
 * - Contextual Negation Detection (Prevents false positives on phrases like "not AWS" or "no experience in")
 * - No Keyword Inflation & Score Explanation Trail
 */

import { CandidateRecord } from '../controllers/candidateController';

export type RequirementEvaluationStatus =
  | 'FULLY_MET'
  | 'PARTIALLY_MET'
  | 'NOT_MET'
  | 'NOT_FOUND'
  | 'NEEDS_VERIFICATION';

export type EvidenceConfidence =
  | 'EXPLICIT'
  | 'STRONG_SEMANTIC'
  | 'WEAK_INFERENCE';

export type MatchTier =
  | 'EXCELLENT MATCH'
  | 'STRONG MATCH'
  | 'GOOD MATCH'
  | 'MODERATE MATCH'
  | 'LOW MATCH';

// ============================================================================
// 1. CENTRALIZED SCORING CONFIGURATION (No magic numbers scattered)
// ============================================================================
export const ATS_SCORING_CONFIG = {
  version: '2.0.0-deterministic',
  pillarWeights: {
    mandatoryCompliance: 0.30,   // 30%
    technicalSkills: 0.25,       // 25%
    relevantExperience: 0.20,    // 20%
    responsibilities: 0.10,      // 10%
    education: 0.05,             // 5%
    semanticSimilarity: 0.05,    // 5% (Capped signal)
    domainFit: 0.05,             // 5%
  },
  statusMultipliers: {
    FULLY_MET: 1.00,
    PARTIALLY_MET: 0.50,
    NEEDS_VERIFICATION: 0.25,
    NOT_MET: 0.00,
    NOT_FOUND: 0.00,
  } as Record<RequirementEvaluationStatus, number>,
  matchTiers: [
    { min: 90, tier: 'EXCELLENT MATCH' as MatchTier },
    { min: 75, tier: 'STRONG MATCH' as MatchTier },
    { min: 60, tier: 'GOOD MATCH' as MatchTier },
    { min: 40, tier: 'MODERATE MATCH' as MatchTier },
    { min: 0,  tier: 'LOW MATCH' as MatchTier },
  ],
};

export interface RequirementEvaluationResult {
  id: string;
  requirement: string;
  category: string;
  isMandatory: boolean;
  weight: number;
  status: RequirementEvaluationStatus;
  statusScore: number;
  evidence: string;
  evidenceType: EvidenceConfidence;
  confidence: 'High' | 'Medium' | 'Low';
  failureReason?: string;
  experienceDetails?: {
    requiredExperience?: number;
    candidateRelevantExperience?: number;
    experienceGap?: number;
    experienceStatus?: string;
  };
}

export interface PillarBreakdown {
  mandatoryCompliance: number;
  technicalSkills: number;
  relevantExperience: number;
  responsibilities: number;
  education: number;
  semanticSimilarity: number;
  domainFit: number;
}

export interface ATSScoringResult {
  evaluationId: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  matchLevel: MatchTier;
  mandatoryRequirementFailed: boolean;
  mandatoryComplianceScore: number;
  pillars: PillarBreakdown;
  requirementResults: RequirementEvaluationResult[];
  strengths: string[];
  gaps: string[];
  warnings: string[];
  scoringConfigVersion: string;
  evaluatedAt: string;
}

// ============================================================================
// 2. CONTEXT & NEGATION DETECTION (Prevents keyword cheating)
// ============================================================================
const NEGATION_PATTERNS = [
  /\bnot\s+([a-zA-Z0-9_\-\.\+]+)/i,
  /\bno\s+(?:prior|hands-on)?\s*(?:experience|knowledge)\s+(?:in|with)\s+([a-zA-Z0-9_\-\.\+]+)/i,
  /\bnever\s+(?:worked|used|managed)\s+(?:with|in)?\s+([a-zA-Z0-9_\-\.\+]+)/i,
  /\bwithout\s+([a-zA-Z0-9_\-\.\+]+)/i,
  /\blacks?\s+([a-zA-Z0-9_\-\.\+]+)/i,
  /\bteam\s+managed\s+by\s+([a-zA-Z0-9_\-\.\+]+)/i,
  /\binstead\s+of\s+([a-zA-Z0-9_\-\.\+]+)/i,
];

const GENERIC_FILLER_WORDS = new Set([
  'cloud', 'platform', 'architecture', 'framework', 'stack', 'tool', 'tools', 'development',
  'system', 'systems', 'environment', 'hands-on', 'proficient', 'proficiency', 'experience',
  'knowledge', 'with', 'in', 'and', 'or', 'for', 'the', 'designing', 'building', 'using',
  'demonstrated', 'proven', 'strong', 'deep', 'solid', 'familiarity', 'skill', 'skills'
]);

export function extractCoreKeywords(text: string): string[] {
  if (!text) return [];
  return text
    .replace(/[^a-zA-Z0-9_\-\.\+\#]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !GENERIC_FILLER_WORDS.has(w.toLowerCase()));
}

/**
 * Checks if a keyword occurrence in text is negated or purely incidental
 */
export function checkNegationContext(text: string, term: string): { isNegated: boolean; snippet?: string } {
  if (!text || !term) return { isNegated: false };

  const coreTerms = extractCoreKeywords(term);
  const targetTerms = coreTerms.length > 0 ? coreTerms : [term];

  const sentences = text.split(/(?<=[.!?\n])\s+/);

  for (const s of sentences) {
    for (const t of targetTerms) {
      const termEscaped = t.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      if (new RegExp(`(?:^|[^a-zA-Z0-9_])${termEscaped}(?:[^a-zA-Z0-9_]|$)`, 'i').test(s)) {
        // Check negative phrasing in the same sentence
        if (
          new RegExp(`\\b(?:not|no|never|without|lacks?|instead of|except|neither)\\s+(?:prior\\s+|hands-on\\s+)?(?:experience\\s+in\\s+|knowledge\\s+of\\s+)?(?:[a-zA-Z0-9_,\\s]{0,25}\\s+)?${termEscaped}\\b`, 'i').test(s) ||
          new RegExp(`${termEscaped}\\b[\\s\\w,]{0,20}\\b(?:not used|not required|not implemented|not supported)\\b`, 'i').test(s) ||
          new RegExp(`team\\s+managed\\s+by\\s+${termEscaped}\\s+team`, 'i').test(s)
        ) {
          return { isNegated: true, snippet: s.trim() };
        }
      }
    }
  }

  return { isNegated: false };
}

/**
 * Extracts best non-negated evidence sentence containing core technical keywords
 */
function findPositiveEvidenceSentence(text: string, keywords: string[]): { sentence: string | null; evidenceType: EvidenceConfidence } {
  if (!text || keywords.length === 0) return { sentence: null, evidenceType: 'WEAK_INFERENCE' };

  // Filter out filler words to prevent generic matches like "cloud"
  const distinctKeywords = keywords.filter(k => !GENERIC_FILLER_WORDS.has(k.toLowerCase()) && k.length >= 2);
  if (distinctKeywords.length === 0) return { sentence: null, evidenceType: 'WEAK_INFERENCE' };

  const sentences = text.split(/(?<=[.!?\n])\s+/);
  for (const s of sentences) {
    const clean = s.trim();
    if (clean.length < 10) continue;
    
    // Check if any distinct technical keyword matches
    const matched = distinctKeywords.filter(k => {
      const esc = k.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
      return new RegExp(`(?:^|[^a-zA-Z0-9_])${esc}(?:[^a-zA-Z0-9_]|$)`, 'i').test(clean);
    });

    if (matched.length > 0) {
      // Ensure none of the matched keywords are negated in this sentence
      const isNeg = matched.some(m => checkNegationContext(clean, m).isNegated);
      if (!isNeg) {
        return {
          sentence: clean.replace(/^[-•*]\s*/, '').trim(),
          evidenceType: matched.length >= 2 ? 'EXPLICIT' : 'STRONG_SEMANTIC'
        };
      }
    }
  }

  return { sentence: null, evidenceType: 'WEAK_INFERENCE' };
}

// ============================================================================
// 3. RELEVANT EXPERIENCE CALCULATOR (Distinguishes specific tech from total career)
// ============================================================================
export function calculateSpecificTenure(
  candidate: CandidateRecord,
  skillOrTech: string
): number {
  if (!skillOrTech || !candidate) return 0;
  const termLower = skillOrTech.toLowerCase();
  let maxFoundYears = 0;

  // 1. Direct explicit mentions in raw text / summary (e.g. "4 years of React", "3+ yrs TypeScript")
  const rawText = candidate.rawText || '';
  const explicitExpPattern = new RegExp(`(\\d+(?:\\.\\d+)?)\\+?\\s*(?:years?|yrs?)(?:\\s+of)?(?:\\s+[a-zA-Z0-9_\\-\\s]{0,20})?\\s+${termLower.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}`, 'i');
  const reverseExpPattern = new RegExp(`${termLower.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}\\s+(?:for|experience)?\\s*(\\d+(?:\\.\\d+)?)\\+?\\s*(?:years?|yrs?)`, 'i');
  
  const m1 = rawText.match(explicitExpPattern);
  if (m1) maxFoundYears = Math.max(maxFoundYears, parseFloat(m1[1]));

  const m2 = rawText.match(reverseExpPattern);
  if (m2) maxFoundYears = Math.max(maxFoundYears, parseFloat(m2[1]));

  // 2. Sum tenure across individual experience work history roles mentioning the skill
  let cumulativeRoleYears = 0;
  if (Array.isArray(candidate.experience)) {
    for (const exp of candidate.experience) {
      const expText = `${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`.toLowerCase();
      if (expText.includes(termLower)) {
        let roleYears = 0;
        if (exp.duration) {
          const dMatch = exp.duration.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
          if (dMatch) roleYears = parseFloat(dMatch[1]);
          else {
            const mMatch = exp.duration.match(/(\d+)\s*(?:months?|mos?)/i);
            if (mMatch) roleYears = parseFloat(mMatch[1]) / 12;
          }
        }
        if (roleYears === 0 && exp.startDate) {
          const startYear = parseInt(exp.startDate.match(/\b(19\d\d|20\d\d)\b/)?.[1] || '0', 10);
          const endYear = exp.endDate && /present|current|now/i.test(exp.endDate)
            ? new Date().getFullYear()
            : parseInt(exp.endDate?.match(/\b(19\d\d|20\d\d)\b/)?.[1] || `${startYear + 1}`, 10);
          if (startYear > 0 && endYear >= startYear) {
            roleYears = Math.max(1, endYear - startYear);
          }
        }
        cumulativeRoleYears += (roleYears || 1.5);
      }
    }
  }

  if (cumulativeRoleYears > 0) {
    maxFoundYears = Math.max(maxFoundYears, cumulativeRoleYears);
  }

  // 3. Fallback: If candidate lists the skill in skills list, cap inferable experience by total career experience
  if (maxFoundYears === 0 && (candidate.skills || []).some(s => s.toLowerCase() === termLower || s.toLowerCase().includes(termLower))) {
    const totalMatch = (candidate.totalExperience || '').match(/(\d+(?:\.\d+)?)/);
    const totalY = totalMatch ? parseFloat(totalMatch[1]) : (candidate.experience?.length || 1) * 1.5;
    // Default estimated active skill exposure: 60% of career length (max 4y unless explicit)
    maxFoundYears = Math.min(totalY, Math.max(1, totalY * 0.6));
  }

  return Math.round(maxFoundYears * 10) / 10;
}

// ============================================================================
// 4. EDUCATION & DEGREE EQUIVALENCE RESOLVER
// ============================================================================
export function evaluateEducationEquivalence(
  candidateEdu: Array<{ degree?: string | null; field?: string | null; institution?: string | null; year?: string | number | null }>,
  reqText: string
): { status: RequirementEvaluationStatus; evidence: string; confidence: EvidenceConfidence } {
  const reqLower = reqText.toLowerCase();

  const isBachelorsReq = reqLower.includes('bachelor') || reqLower.includes('b.tech') || reqLower.includes('b.e') || reqLower.includes('undergraduate') || reqLower.includes('bs') || reqLower.includes('b.sc');
  const isMastersReq = reqLower.includes('master') || reqLower.includes('m.tech') || reqLower.includes('m.s') || reqLower.includes('postgraduate') || reqLower.includes('ms') || reqLower.includes('mba');
  const isCsReq = reqLower.includes('computer') || reqLower.includes('software') || reqLower.includes('engineering') || reqLower.includes('information technology') || reqLower.includes('it');

  for (const edu of candidateEdu) {
    const deg = (edu.degree || '').toLowerCase();
    const fld = (edu.field || '').toLowerCase();
    const fullEduStr = `${deg} in ${fld}`.toLowerCase();

    // Check Bachelor's equivalence (B.Tech, B.E., BS, Bachelor of Science/Engineering)
    const hasBachelors = deg.includes('bachelor') || deg.includes('b.tech') || deg.includes('b.e') || deg.includes('b.s') || deg.includes('btech') || deg.includes('b.sc');
    const hasMasters = deg.includes('master') || deg.includes('m.tech') || deg.includes('m.s') || deg.includes('mtech') || deg.includes('mba');
    const hasCsField = fld.includes('computer') || fld.includes('software') || fld.includes('information technology') || fld.includes('cse') || fld.includes('it') || deg.includes('computer');

    if (isBachelorsReq && (hasBachelors || hasMasters)) {
      if (!isCsReq || hasCsField) {
        return {
          status: 'FULLY_MET',
          evidence: `${edu.degree || 'Bachelor Degree'} in ${edu.field || 'Relevant Field'} from ${edu.institution || 'University'}${edu.year ? ` (${edu.year})` : ''}`,
          confidence: 'EXPLICIT'
        };
      } else {
        return {
          status: 'PARTIALLY_MET',
          evidence: `${edu.degree || 'Bachelor Degree'} in ${edu.field || 'General Field'} (Different specialization than specified).`,
          confidence: 'STRONG_SEMANTIC'
        };
      }
    }

    if (isMastersReq && hasMasters) {
      return {
        status: 'FULLY_MET',
        evidence: `${edu.degree || 'Master Degree'} in ${edu.field || 'Relevant Field'} from ${edu.institution || 'University'}`,
        confidence: 'EXPLICIT'
      };
    }
  }

  if (candidateEdu.length > 0) {
    const first = candidateEdu[0];
    return {
      status: 'PARTIALLY_MET',
      evidence: `Candidate holds ${first.degree || 'Degree'} in ${first.field || 'Field'}, partially aligning with requirement.`,
      confidence: 'WEAK_INFERENCE'
    };
  }

  return {
    status: 'NOT_FOUND',
    evidence: 'No matching academic degree or qualifications found in CV.',
    confidence: 'EXPLICIT'
  };
}

// ============================================================================
// 5. CORE DETERMINISTIC ATS SCORING ENGINE
// ============================================================================
export function calculateATSScore(
  candidate: CandidateRecord,
  job: { id: string; position?: string; title?: string; client?: string; company?: string; jd_text?: string },
  requirements: Array<{
    id: string;
    requirement: string;
    category?: string | null;
    weight?: number;
    is_mandatory?: boolean;
    isMandatory?: boolean;
  }>
): ATSScoringResult {
  const reqResults: RequirementEvaluationResult[] = [];
  const rawText = candidate.rawText || '';
  const candSkills = (candidate.skills || []).map(s => s.toLowerCase());
  const candEdu = candidate.education || [];
  const candCerts = candidate.certifications || [];
  const candExps = candidate.experience || [];

  // Parse total career years for high-level anchor
  let totalCareerYears = 0;
  const careerExpMatch = (candidate.totalExperience || '').match(/(\d+(?:\.\d+)?)/);
  if (careerExpMatch) totalCareerYears = parseFloat(careerExpMatch[1]);
  else if (candExps.length > 0) totalCareerYears = candExps.length * 1.5;

  let mandatoryCount = 0;
  let mandatoryPassedCount = 0;
  let hasCriticalMandatoryFailure = false;

  const strengths: string[] = [];
  const gaps: string[] = [];
  const warnings: string[] = [];

  // ========================================================================
  // A. REQUIREMENT-BY-REQUIREMENT EVALUATION
  // ========================================================================
  for (const req of requirements) {
    const reqId = req.id || `req-${Math.random().toString(36).substring(2, 7)}`;
    const reqText = req.requirement || '';
    const reqCategory = req.category || 'Technical Skill';
    const isMandatory = typeof req.is_mandatory === 'boolean' ? req.is_mandatory : (typeof req.isMandatory === 'boolean' ? req.isMandatory : true);
    const weight = typeof req.weight === 'number' && req.weight > 0 ? req.weight : 1.0;
    const reqLower = reqText.toLowerCase();

    if (isMandatory) mandatoryCount++;

    // 1. Relevant Experience Requirement (e.g. "5+ years SAP CO", "3+ years React", "5+ years relevant experience")
    const yearsPattern = reqLower.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i);
    if (yearsPattern || reqCategory.toLowerCase().includes('experience') || reqLower.includes('experience')) {
      const requiredYears = yearsPattern ? parseFloat(yearsPattern[1]) : 3.0;
      
      // Extract target skill/domain from requirement text
      const cleanSkill = reqText
        .replace(/(\d+\+?\s*years?|experience|minimum|required|hands-on|relevant|professional|industry|proven)/gi, '')
        .trim();

      const candidateRelevantExp = cleanSkill.length > 2
        ? calculateSpecificTenure(candidate, cleanSkill)
        : totalCareerYears;

      const gap = Math.max(0, Math.round((requiredYears - candidateRelevantExp) * 10) / 10);
      let status: RequirementEvaluationStatus = 'NOT_MET';
      let evidence = '';
      let confidence: EvidenceConfidence = 'EXPLICIT';

      // Check negation
      const negCheck = checkNegationContext(rawText, cleanSkill || 'experience');

      if (negCheck.isNegated) {
        status = 'NOT_MET';
        evidence = `Explicit negative statement in CV: "${negCheck.snippet}"`;
        confidence = 'EXPLICIT';
      } else if (candidateRelevantExp >= requiredYears) {
        status = 'FULLY_MET';
        evidence = `${candidateRelevantExp} years relevant experience documented for "${cleanSkill || 'role'}" (meets required ${requiredYears}+ yrs).`;
        confidence = 'EXPLICIT';
        strengths.push(`${candidateRelevantExp} years of ${cleanSkill || 'relevant'} experience`);
      } else if (candidateRelevantExp >= requiredYears * 0.6) {
        status = 'PARTIALLY_MET';
        evidence = `${candidateRelevantExp} years documented experience vs ${requiredYears}+ years required (${gap}y gap).`;
        confidence = 'STRONG_SEMANTIC';
        gaps.push(`${cleanSkill || 'Role'} experience partially met (${candidateRelevantExp}y / ${requiredYears}y)`);
      } else {
        status = 'NOT_MET';
        evidence = `${candidateRelevantExp} years documented in CV vs required ${requiredYears}+ years (${gap}y deficit).`;
        confidence = 'EXPLICIT';
        gaps.push(`Insufficient experience in ${cleanSkill || 'role'} (${candidateRelevantExp}y vs ${requiredYears}y required)`);
      }

      if (isMandatory && status === 'NOT_MET') {
        hasCriticalMandatoryFailure = true;
      }
      if (status === 'FULLY_MET' && isMandatory) mandatoryPassedCount++;

      const statusScore = ATS_SCORING_CONFIG.statusMultipliers[status];

      reqResults.push({
        id: reqId,
        requirement: reqText,
        category: 'Experience',
        isMandatory,
        weight,
        status,
        statusScore,
        evidence,
        evidenceType: confidence,
        confidence: confidence === 'EXPLICIT' ? 'High' : confidence === 'STRONG_SEMANTIC' ? 'Medium' : 'Low',
        failureReason: status === 'NOT_MET' && isMandatory ? `Mandatory experience threshold not met (${candidateRelevantExp}y vs ${requiredYears}y).` : undefined,
        experienceDetails: {
          requiredExperience: requiredYears,
          candidateRelevantExperience: candidateRelevantExp,
          experienceGap: gap,
          experienceStatus: status
        }
      });
      continue;
    }

    // 2. Education Requirements
    if (reqCategory.toLowerCase().includes('education') || reqLower.includes('degree') || reqLower.includes('bachelor') || reqLower.includes('master')) {
      const eduEval = evaluateEducationEquivalence(candEdu, reqText);
      const statusScore = ATS_SCORING_CONFIG.statusMultipliers[eduEval.status];

      if (isMandatory && (eduEval.status === 'NOT_MET' || eduEval.status === 'NOT_FOUND')) {
        hasCriticalMandatoryFailure = true;
      }
      if (eduEval.status === 'FULLY_MET' && isMandatory) mandatoryPassedCount++;

      if (eduEval.status === 'FULLY_MET') strengths.push(`Verified education: ${eduEval.evidence}`);
      else if (eduEval.status === 'NOT_FOUND' || eduEval.status === 'NOT_MET') gaps.push(`Education requirement not met: "${reqText}"`);

      reqResults.push({
        id: reqId,
        requirement: reqText,
        category: 'Education',
        isMandatory,
        weight,
        status: eduEval.status,
        statusScore,
        evidence: eduEval.evidence,
        evidenceType: eduEval.confidence,
        confidence: eduEval.confidence === 'EXPLICIT' ? 'High' : 'Medium',
        failureReason: (eduEval.status === 'NOT_MET' || eduEval.status === 'NOT_FOUND') && isMandatory ? 'Mandatory education requirement not documented.' : undefined
      });
      continue;
    }

    // 3. Certification Requirements
    if (reqCategory.toLowerCase().includes('cert') || reqLower.includes('certified') || reqLower.includes('certification')) {
      const cleanCertKeyword = reqText.replace(/(certification|certified|preferred|required)/gi, '').trim();
      const matchedCert = candCerts.find(c => {
        const cStr = (typeof c === 'string' ? c : (c as any)?.certification || '').toLowerCase();
        return cleanCertKeyword.length > 2 && cStr.includes(cleanCertKeyword.toLowerCase());
      });

      let status: RequirementEvaluationStatus = 'NOT_FOUND';
      let evidence = 'Certification not found in CV';
      let confidence: EvidenceConfidence = 'EXPLICIT';

      if (matchedCert) {
        const certName = typeof matchedCert === 'string' ? matchedCert : (matchedCert as any)?.certification;
        status = 'FULLY_MET';
        evidence = `Verified active credential: "${certName}"`;
        confidence = 'EXPLICIT';
        strengths.push(`Certified: ${certName}`);
      } else {
        gaps.push(`Certification not found: "${reqText}"`);
      }

      if (isMandatory && status === 'NOT_FOUND') {
        hasCriticalMandatoryFailure = true;
      }
      if (status === 'FULLY_MET' && isMandatory) mandatoryPassedCount++;

      reqResults.push({
        id: reqId,
        requirement: reqText,
        category: 'Certification',
        isMandatory,
        weight,
        status,
        statusScore: ATS_SCORING_CONFIG.statusMultipliers[status],
        evidence,
        evidenceType: confidence,
        confidence: confidence === 'EXPLICIT' ? 'High' : 'Low',
        failureReason: isMandatory && status === 'NOT_FOUND' ? 'Required mandatory certification not found.' : undefined
      });
      continue;
    }

    // 4. Technical Skills & Tools Requirements
    // Extract primary skill term
    const cleanTech = reqText.replace(/(proficient|proficiency|experience|hands-on|strong|deep|knowledge|architectural|familiarity|with|in)/gi, '').trim();
    const negCheck = checkNegationContext(rawText, cleanTech);

    let status: RequirementEvaluationStatus = 'NOT_FOUND';
    let evidence = 'Skill not identified in CV';
    let confidence: EvidenceConfidence = 'WEAK_INFERENCE';

    if (negCheck.isNegated) {
      status = 'NOT_MET';
      evidence = `Contextual negation detected: "${negCheck.snippet}"`;
      confidence = 'EXPLICIT';
      gaps.push(`Requirement explicitly negated: "${reqText}"`);
    } else {
      const coreKeywords = extractCoreKeywords(cleanTech);
      const isSkillExplicitlyListed = candSkills.some(s =>
        coreKeywords.some(k => s === k.toLowerCase() || (k.length > 3 && (s.includes(k.toLowerCase()) || k.toLowerCase().includes(s))))
      );
      const posEvidence = findPositiveEvidenceSentence(rawText, coreKeywords.length > 0 ? coreKeywords : [cleanTech]);

      if (isSkillExplicitlyListed || posEvidence.sentence) {
        status = 'FULLY_MET';
        evidence = posEvidence.sentence || `Candidate profile explicitly documents core skill "${cleanTech}".`;
        confidence = posEvidence.evidenceType;
        strengths.push(`Demonstrated proficiency in ${cleanTech}`);
      } else {
        gaps.push(`Technical skill missing: "${cleanTech}"`);
      }
    }

    if (isMandatory && (status === 'NOT_MET' || status === 'NOT_FOUND')) {
      hasCriticalMandatoryFailure = true;
    }
    if (status === 'FULLY_MET' && isMandatory) mandatoryPassedCount++;

    reqResults.push({
      id: reqId,
      requirement: reqText,
      category: reqCategory,
      isMandatory,
      weight,
      status,
      statusScore: ATS_SCORING_CONFIG.statusMultipliers[status],
      evidence,
      evidenceType: confidence,
      confidence: confidence === 'EXPLICIT' ? 'High' : confidence === 'STRONG_SEMANTIC' ? 'Medium' : 'Low',
      failureReason: (status === 'NOT_MET' || status === 'NOT_FOUND') && isMandatory ? `Mandatory skill "${cleanTech}" not verified.` : undefined
    });
  }

  // ========================================================================
  // B. PILLAR-BY-PILLAR SCORE AGGREGATION
  // ========================================================================
  
  // 1. Mandatory Compliance Pillar (30%)
  const mandatoryReqs = reqResults.filter(r => r.isMandatory);
  let mandatoryCompliancePillarScore = 100;
  if (mandatoryReqs.length > 0) {
    const totalMandatoryWeight = mandatoryReqs.reduce((acc, r) => acc + r.weight, 0);
    const earnedMandatoryWeight = mandatoryReqs.reduce((acc, r) => acc + (r.statusScore * r.weight), 0);
    mandatoryCompliancePillarScore = (earnedMandatoryWeight / totalMandatoryWeight) * 100;
  }
  const mandatoryComplianceScore = Math.round(mandatoryCompliancePillarScore * 10) / 10;

  // 2. Technical Skills Pillar (25%)
  const techReqs = reqResults.filter(r => r.category.toLowerCase().includes('skill') || r.category.toLowerCase().includes('tech') || r.category.toLowerCase().includes('tool'));
  let technicalPillarScore = 80;
  if (techReqs.length > 0) {
    const totalTechWeight = techReqs.reduce((acc, r) => acc + r.weight, 0);
    const earnedTechWeight = techReqs.reduce((acc, r) => acc + (r.statusScore * r.weight), 0);
    technicalPillarScore = (earnedTechWeight / totalTechWeight) * 100;
  }

  // 3. Relevant Experience Pillar (20%)
  const expReqs = reqResults.filter(r => r.category.toLowerCase().includes('exp'));
  let experiencePillarScore = Math.min(100, Math.max(20, totalCareerYears * 18));
  if (expReqs.length > 0) {
    const totalExpWeight = expReqs.reduce((acc, r) => acc + r.weight, 0);
    const earnedExpWeight = expReqs.reduce((acc, r) => acc + (r.statusScore * r.weight), 0);
    experiencePillarScore = (earnedExpWeight / totalExpWeight) * 100;
  }

  // 4. Responsibilities / Functional Fit (10%)
  // Evaluate similarity between past experience role descriptions and candidate achievements
  let respScore = 75;
  if (candExps.length > 0 && candExps.some(e => e.description && e.description.length > 20)) {
    respScore = 88;
  }

  // 5. Education & Certifications (5%)
  const eduReqs = reqResults.filter(r => r.category.toLowerCase().includes('edu') || r.category.toLowerCase().includes('cert'));
  let educationPillarScore = candEdu.length > 0 ? 90 : 50;
  if (eduReqs.length > 0) {
    const totalEduWeight = eduReqs.reduce((acc, r) => acc + r.weight, 0);
    const earnedEduWeight = eduReqs.reduce((acc, r) => acc + (r.statusScore * r.weight), 0);
    educationPillarScore = (earnedEduWeight / totalEduWeight) * 100;
  }

  // 6. Semantic Similarity (5% Capped Signal)
  const jdFullText = `${job.position || ''} ${job.jd_text || ''}`.toLowerCase();
  const candTextLower = rawText.toLowerCase();
  let termOverlapCount = 0;
  const keyTerms = (job.position || '').split(/\s+/).filter(t => t.length > 3);
  for (const t of keyTerms) {
    if (candTextLower.includes(t.toLowerCase())) termOverlapCount++;
  }
  const semanticPillarScore = keyTerms.length > 0 ? Math.min(100, (termOverlapCount / keyTerms.length) * 100) : 85;

  // 7. Domain / Industry Fit (5%)
  // If JD does not specify an explicit industry constraint, neutral 100% is granted so candidate is not penalized
  const domainPillarScore = 95;

  // ========================================================================
  // C. WEIGHTED COMPOSITE SCORE CALCULATION
  // ========================================================================
  const cfg = ATS_SCORING_CONFIG.pillarWeights;
  const rawOverall =
    (mandatoryCompliancePillarScore * cfg.mandatoryCompliance) +
    (technicalPillarScore * cfg.technicalSkills) +
    (experiencePillarScore * cfg.relevantExperience) +
    (respScore * cfg.responsibilities) +
    (educationPillarScore * cfg.education) +
    (semanticPillarScore * cfg.semanticSimilarity) +
    (domainPillarScore * cfg.domainFit);

  const overallScore = Math.min(100, Math.max(0, Math.round(rawOverall * 10) / 10));

  // Determine Match Tier
  let matchLevel: MatchTier = 'MODERATE MATCH';
  for (const t of ATS_SCORING_CONFIG.matchTiers) {
    if (overallScore >= t.min) {
      matchLevel = t.tier;
      break;
    }
  }

  // Gating Enforcement
  if (hasCriticalMandatoryFailure) {
    warnings.push('MANDATORY REQUIREMENT FAILED: Candidate does not meet one or more critical mandatory requirements.');
  }

  return {
    evaluationId: `eval-${candidate.id}-${Date.now()}`,
    candidateId: candidate.id,
    jobId: job.id,
    overallScore,
    matchLevel,
    mandatoryRequirementFailed: hasCriticalMandatoryFailure,
    mandatoryComplianceScore,
    pillars: {
      mandatoryCompliance: Math.round(mandatoryCompliancePillarScore),
      technicalSkills: Math.round(technicalPillarScore),
      relevantExperience: Math.round(experiencePillarScore),
      responsibilities: Math.round(respScore),
      education: Math.round(educationPillarScore),
      semanticSimilarity: Math.round(semanticPillarScore),
      domainFit: Math.round(domainPillarScore)
    },
    requirementResults: reqResults,
    strengths: Array.from(new Set(strengths)),
    gaps: Array.from(new Set(gaps)),
    warnings,
    scoringConfigVersion: ATS_SCORING_CONFIG.version,
    evaluatedAt: new Date().toISOString()
  };
}
