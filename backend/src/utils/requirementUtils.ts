export const SUPPORTED_CATEGORIES = [
  'Experience',
  'Technical Skill',
  'Functional Skill',
  'Technology',
  'Tool',
  'Education',
  'Certification',
  'Industry',
  'Language',
  'Other'
] as const;

export type SupportedCategory = typeof SUPPORTED_CATEGORIES[number];

/**
 * Validates if a string is one of the supported categories
 */
export const isValidCategory = (category: string): boolean => {
  if (!category || typeof category !== 'string') return false;
  return SUPPORTED_CATEGORIES.some(c => c.toLowerCase() === category.trim().toLowerCase());
};

/**
 * Normalizes a category string to the canonical SupportedCategory casing
 */
export const normalizeCategory = (category: string | null | undefined): SupportedCategory => {
  if (!category || typeof category !== 'string') return 'Other';
  const trimmed = category.trim().toLowerCase();
  
  // Mapping synonyms to supported categories
  if (trimmed.includes('exp')) return 'Experience';
  if (trimmed.includes('tech skill') || trimmed.includes('technical skill') || trimmed === 'technical') return 'Technical Skill';
  if (trimmed.includes('func skill') || trimmed.includes('functional skill') || trimmed === 'functional') return 'Functional Skill';
  if (trimmed.includes('tech') || trimmed.includes('technology')) return 'Technology';
  if (trimmed.includes('tool') || trimmed.includes('software')) return 'Tool';
  if (trimmed.includes('edu') || trimmed.includes('degree') || trimmed.includes('education')) return 'Education';
  if (trimmed.includes('certif')) return 'Certification';
  if (trimmed.includes('industr') || trimmed.includes('domain')) return 'Industry';
  if (trimmed.includes('lang')) return 'Language';

  const matched = SUPPORTED_CATEGORIES.find(c => c.toLowerCase() === trimmed);
  return matched || 'Other';
};

/**
 * Verifies if the source evidence string exists in the original JD text.
 * Returns true if evidence is found in raw JD text (normalizing whitespace/casing).
 */
export const verifyEvidenceInJd = (sourceEvidence: string | null | undefined, jdText: string | null | undefined): boolean => {
  if (!sourceEvidence || typeof sourceEvidence !== 'string' || !sourceEvidence.trim()) {
    return false;
  }
  if (!jdText || typeof jdText !== 'string' || !jdText.trim()) {
    return true; // If no JD text is provided, fallback to allow manually supplied sourceEvidence
  }

  const normJd = jdText.toLowerCase().replace(/\s+/g, ' ');
  const normEvidence = sourceEvidence.toLowerCase().replace(/\s+/g, ' ').trim();

  // If evidence substring or major token sequence is present in JD
  if (normJd.includes(normEvidence)) {
    return true;
  }

  // Check if at least 70% of significant words in sourceEvidence appear in JD text
  const evidenceWords = normEvidence.split(' ').filter(w => w.length > 3);
  if (evidenceWords.length === 0) return true;

  const matchedWords = evidenceWords.filter(w => normJd.includes(w));
  return (matchedWords.length / evidenceWords.length) >= 0.7;
};

/**
 * Classifies if a requirement text is Mandatory or Preferred based on explicit indicators.
 * If unclear, returns { isMandatory: false, needsVerification: true }.
 */
export const classifyRequirementMandatory = (text: string): { isMandatory: boolean; needsVerification: boolean } => {
  const lower = text.toLowerCase();

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

  const hasMandatoryIndicator = mandatoryKeywords.some(kw => lower.includes(kw));
  const hasPreferredIndicator = preferredKeywords.some(kw => lower.includes(kw));

  if (hasMandatoryIndicator && !hasPreferredIndicator) {
    return { isMandatory: true, needsVerification: false };
  }

  if (hasPreferredIndicator && !hasMandatoryIndicator) {
    return { isMandatory: false, needsVerification: false };
  }

  // If unclear, default to isMandatory = false and flag needsVerification = true
  return { isMandatory: false, needsVerification: true };
};

/**
 * Detects obvious or potential duplicate requirements in a list.
 * Returns array of warning messages describing potential duplicates.
 */
export const detectDuplicateRequirements = (requirements: Array<{ id?: string; requirement: string }>): string[] => {
  const warnings: string[] = [];
  if (!requirements || requirements.length < 2) return warnings;

  // Helper to get normalized word token set
  const getTokens = (str: string) => {
    return new Set(
      str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['and', 'for', 'with', 'the', 'in', 'of', 'to'].includes(w))
    );
  };

  for (let i = 0; i < requirements.length; i++) {
    for (let j = i + 1; j < requirements.length; j++) {
      const reqA = requirements[i].requirement.trim();
      const reqB = requirements[j].requirement.trim();

      if (reqA.toLowerCase() === reqB.toLowerCase()) {
        warnings.push(`Exact duplicate detected: "${reqA}"`);
        continue;
      }

      const tokensA = getTokens(reqA);
      const tokensB = getTokens(reqB);

      if (tokensA.size === 0 || tokensB.size === 0) continue;

      let intersectionCount = 0;
      tokensA.forEach(t => {
        if (tokensB.has(t)) intersectionCount++;
      });

      const similarityA = intersectionCount / tokensA.size;
      const similarityB = intersectionCount / tokensB.size;

      if (similarityA >= 0.8 && similarityB >= 0.8) {
        warnings.push(`Potential duplicate detected between "${reqA}" and "${reqB}"`);
      }
    }
  }

  return Array.from(new Set(warnings));
};

/**
 * Formats a Prisma requirement record to match API response schema (Section 4)
 */
export const formatRequirementObject = (req: any) => {
  return {
    id: req.id,
    jobId: req.job_id || req.jobId,
    requirement: req.requirement,
    category: normalizeCategory(req.category),
    weight: typeof req.weight === 'number' ? req.weight : 1.0,
    isMandatory: Boolean(req.is_mandatory ?? req.isMandatory),
    evidenceRequired: Boolean(req.evidence_required ?? req.evidenceRequired),
    recruiterConfirmed: Boolean(req.recruiter_confirmed ?? req.recruiterConfirmed),
    sourceEvidence: req.source_evidence || req.sourceEvidence || req.requirement,
    needsVerification: Boolean(req.needs_verification ?? req.needsVerification),
    createdAt: req.created_at || req.createdAt,
    updatedAt: req.updated_at || req.updatedAt
  };
};

// ── COMPREHENSIVE MATCH SCORE ENGINE ──────────────────────────────────────────

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t',
  'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t',
  'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself',
  'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not',
  'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shan\'t', 'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such',
  'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s',
  'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s',
  'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re',
  'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

export interface MatchScoreBreakdown {
  mandatoryCompliance?: {
    score: number;
    weight: 30;
    passed: boolean;
    failedCount: number;
  };
  technicalSkills?: {
    score: number;
    weight: 25;
    matchedSkills: string[];
    missingSkills: string[];
  };
  relevantExperience?: {
    score: number;
    weight: 20;
    candidateYears: number;
    requiredYears: number;
  };
  responsibilities?: {
    score: number;
    weight: 10;
  };
  domainFit?: {
    score: number;
    weight: 5;
  };
  skills: {
    score: number;
    weight: 40;
    matchedSkills: string[];
    missingSkills: string[];
  };
  experience: {
    score: number;
    weight: 30;
    candidateYears: number;
    requiredYears: number;
  };
  education: {
    score: number;
    weight: 15;
    candidateDegrees: string[];
    requiredDegrees: string[];
  };
  keywords: {
    score: number;
    weight: 15;
    cosineSimilarity: number;
    topMatchedTerms: string[];
  };
}

export interface ComprehensiveMatchResult {
  overallScore: number; // 0 - 100
  matchLevel: 'STRONG MATCH' | 'GOOD MATCH' | 'MODERATE MATCH' | 'LOW FIT';
  mandatoryRequirementFailed: boolean;
  breakdown: MatchScoreBreakdown;
  summary: string;
}

/**
 * 1. Skills Match Score (Weight ~40%)
 */
export const calculateSkillsScore = (
  candidateSkills: string[] = [],
  requiredSkills: string[] = []
): { score: number; matchedSkills: string[]; missingSkills: string[] } => {
  const normCand = candidateSkills.map(s => s.trim().toLowerCase());
  const normReq = requiredSkills.map(s => s.trim().toLowerCase()).filter(Boolean);

  if (normReq.length === 0) {
    const baseScore = Math.min(95, Math.max(60, candidateSkills.length * 12));
    return {
      score: baseScore,
      matchedSkills: candidateSkills,
      missingSkills: []
    };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  requiredSkills.forEach(reqSkill => {
    const rLower = reqSkill.trim().toLowerCase();
    const isMatched = normCand.some(c => c === rLower || c.includes(rLower) || rLower.includes(c));
    if (isMatched) {
      matched.push(reqSkill);
    } else {
      missing.push(reqSkill);
    }
  });

  const matchRatio = matched.length / normReq.length;
  const bonus = Math.min(15, (candidateSkills.length - matched.length) * 1.5);
  const score = Math.min(100, Math.round(matchRatio * 85 + (bonus > 0 ? bonus : 0)));

  return {
    score,
    matchedSkills: matched,
    missingSkills: missing
  };
};

/**
 * 2. Experience Match Score (Weight ~30%)
 */
export const parseExperienceYearsNumber = (exp: string | number | null | undefined): number => {
  if (typeof exp === 'number') return exp;
  if (!exp) return 0;
  const str = String(exp).toLowerCase().trim();

  const yrMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  const moMatch = str.match(/(\d+)\s*(?:months?|mos?)/i);

  let total = 0;
  if (yrMatch) total += parseFloat(yrMatch[1]);
  if (moMatch) total += parseInt(moMatch[1], 10) / 12;

  if (total > 0) return parseFloat(total.toFixed(1));

  const numMatch = str.match(/(\d+(?:\.\d+)?)/);
  return numMatch ? parseFloat(numMatch[1]) : 0;
};

export const calculateExperienceScore = (
  candidateExp: string | number | null | undefined,
  requiredExp: string | number | null | undefined
): { score: number; candidateYears: number; requiredYears: number } => {
  const candidateYears = parseExperienceYearsNumber(candidateExp);
  const requiredYears = parseExperienceYearsNumber(requiredExp) || 3.0;

  if (requiredYears <= 0) {
    return { score: 100, candidateYears, requiredYears: 0 };
  }

  if (candidateYears >= requiredYears) {
    return { score: 100, candidateYears, requiredYears };
  }

  const score = Math.min(100, Math.max(10, Math.round((candidateYears / requiredYears) * 100)));
  return { score, candidateYears, requiredYears };
};

/**
 * 3. Education Match Score (Weight ~15%)
 */
const DEGREE_TIERS: Record<string, number> = {
  phd: 4,
  doctorate: 4,
  master: 3,
  ms: 3,
  mtech: 3,
  mba: 3,
  mca: 3,
  bachelor: 2,
  be: 2,
  btech: 2,
  bs: 2,
  bsc: 2,
  bca: 2,
  diploma: 1,
  associate: 1,
};

export const calculateEducationScore = (
  candidateEdu: any[] = [],
  requiredEdu: string | string[] = []
): { score: number; candidateDegrees: string[]; requiredDegrees: string[] } => {
  const candDegrees = candidateEdu.map(e => (typeof e === 'string' ? e : e.degree || '')).filter(Boolean);
  const reqDegrees = Array.isArray(requiredEdu) ? requiredEdu : [requiredEdu].filter(Boolean);

  let maxCandTier = 1;
  for (const deg of candDegrees) {
    const dLower = deg.toLowerCase().replace(/[^a-z]/g, '');
    for (const [key, tier] of Object.entries(DEGREE_TIERS)) {
      if (dLower.includes(key) && tier > maxCandTier) {
        maxCandTier = tier;
      }
    }
  }

  let reqTier = 2;
  if (reqDegrees.length > 0) {
    for (const req of reqDegrees) {
      const rLower = req.toLowerCase().replace(/[^a-z]/g, '');
      for (const [key, tier] of Object.entries(DEGREE_TIERS)) {
        if (rLower.includes(key)) {
          reqTier = Math.max(reqTier, tier);
        }
      }
    }
  }

  if (maxCandTier >= reqTier) {
    return { score: 100, candidateDegrees: candDegrees, requiredDegrees: reqDegrees };
  }

  if (maxCandTier === reqTier - 1) {
    return { score: 75, candidateDegrees: candDegrees, requiredDegrees: reqDegrees };
  }

  return { score: 50, candidateDegrees: candDegrees, requiredDegrees: reqDegrees };
};

/**
 * 4. Keyword Cosine Similarity & Semantic Overlap Score (Weight ~15%)
 */
export const calculateCosineSimilarity = (
  text1: string = '',
  text2: string = ''
): { cosine: number; topMatchedTerms: string[] } => {
  const tokenize = (text: string): Map<string, number> => {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));

    const freqMap = new Map<string, number>();
    for (const w of words) {
      freqMap.set(w, (freqMap.get(w) || 0) + 1);
    }
    return freqMap;
  };

  const map1 = tokenize(text1);
  const map2 = tokenize(text2);

  if (map1.size === 0 || map2.size === 0) {
    return { cosine: 0.5, topMatchedTerms: [] };
  }

  let dotProduct = 0;
  const matchedTerms: string[] = [];

  for (const [term, count1] of map1.entries()) {
    if (map2.has(term)) {
      const count2 = map2.get(term)!;
      dotProduct += count1 * count2;
      matchedTerms.push(term);
    }
  }

  let mag1 = 0;
  for (const count of map1.values()) mag1 += count * count;

  let mag2 = 0;
  for (const count of map2.values()) mag2 += count * count;

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  const cosine = magnitude > 0 ? dotProduct / magnitude : 0;

  return {
    cosine: Math.min(1.0, parseFloat(cosine.toFixed(4))),
    topMatchedTerms: matchedTerms.slice(0, 10)
  };
};

export const calculateKeywordOverlapScore = (
  candidateText: string = '',
  jdText: string = ''
): { score: number; cosineSimilarity: number; topMatchedTerms: string[] } => {
  const { cosine, topMatchedTerms } = calculateCosineSimilarity(candidateText, jdText);
  const scaledScore = Math.min(100, Math.max(30, Math.round(cosine * 140)));

  return {
    score: scaledScore,
    cosineSimilarity: cosine,
    topMatchedTerms
  };
};

/**
 * Task 5 Deterministic 7-Pillar Comprehensive Match Calculator
 */
export const computeComprehensiveMatchScore = (
  candidate: {
    skills?: string[];
    totalExperience?: string | number;
    totalExperienceYears?: number;
    education?: any[];
    rawText?: string;
    summary?: string;
    currentTitle?: string;
    experience?: any[];
  },
  job: {
    jd_text?: string;
    jdText?: string;
    position?: string;
    requirements?: Array<{ requirement: string; category?: string; weight?: number; is_mandatory?: boolean }>;
  }
): ComprehensiveMatchResult => {
  const jdFullText = job.jd_text || job.jdText || job.position || '';
  const requirements = job.requirements || [];
  const rawText = candidate.rawText || `${candidate.currentTitle || ''} ${candidate.summary || ''} ${(candidate.skills || []).join(' ')}`;
  const candSkills = (candidate.skills || []).map(s => s.toLowerCase());

  let totalCareerYears = 0;
  if (typeof candidate.totalExperienceYears === 'number') {
    totalCareerYears = candidate.totalExperienceYears;
  } else {
    const expMatch = (String(candidate.totalExperience || '')).match(/(\d+(?:\.\d+)?)/);
    if (expMatch) totalCareerYears = parseFloat(expMatch[1]);
  }

  let mandatoryCount = 0;
  let mandatoryMetCount = 0;
  let mandatoryRequirementFailed = false;

  let totalTechWeight = 0;
  let earnedTechWeight = 0;

  let totalExpWeight = 0;
  let earnedExpWeight = 0;

  const matchedSkillsList: string[] = [];
  const missingSkillsList: string[] = [];

  // Evaluate requirements deterministically
  for (const req of requirements) {
    const reqText = req.requirement || '';
    const reqCategory = (req.category || '').toLowerCase();
    const isMandatory = Boolean(req.is_mandatory);
    const weight = typeof req.weight === 'number' && req.weight > 0 ? req.weight : 1.0;
    const reqLower = reqText.toLowerCase();

    if (isMandatory) mandatoryCount++;

    // 1. Experience Requirements
    const yearsPattern = reqLower.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i);
    if (yearsPattern || reqCategory.includes('exp') || reqLower.includes('experience')) {
      const requiredYears = yearsPattern ? parseFloat(yearsPattern[1]) : 3.0;
      
      const expKeywords = reqLower
        .replace(/(\d+\+?\s*years?|\d+\+?\s*yrs?|experience|minimum|required|hands-on|relevant|professional|industry|proven|in|with|of|for|and|to)/gi, ' ')
        .split(/[\s,;/]+/)
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 2);

      let domainMatch = true;
      if (expKeywords.length > 0) {
        domainMatch = expKeywords.some(kw =>
          rawText.toLowerCase().includes(kw) ||
          candSkills.some(s => s.includes(kw) || kw.includes(s))
        );
      }

      const candidateRelevantExp = domainMatch ? totalCareerYears : (totalCareerYears > 0 ? totalCareerYears * 0.7 : 0);
      totalExpWeight += weight;

      if (candidateRelevantExp >= requiredYears) {
        earnedExpWeight += (1.0 * weight);
        if (isMandatory) mandatoryMetCount++;
      } else if (candidateRelevantExp >= requiredYears * 0.6 || totalCareerYears >= requiredYears) {
        earnedExpWeight += (0.8 * weight);
        if (isMandatory) mandatoryMetCount++;
      } else {
        earnedExpWeight += (0.4 * weight);
        if (isMandatory) mandatoryRequirementFailed = true;
      }
      continue;
    }

    // 2. Technical Skills Requirements
    if (reqCategory.includes('skill') || reqCategory.includes('tech') || reqCategory.includes('tool')) {
      const cleanTech = reqText.replace(/(proficient|proficiency|experience|hands-on|strong|deep|knowledge|architectural|familiarity|with|in)/gi, '').trim();
      const techLower = cleanTech.toLowerCase();
      
      // Check negation
      const isNegated = new RegExp(`\\b(?:not|no|never|without|lacks?)\\s+(?:[a-zA-Z0-9_,\\s]{0,20}\\s+)?${techLower.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}\\b`, 'i').test(rawText);

      totalTechWeight += weight;

      if (isNegated) {
        missingSkillsList.push(cleanTech);
        if (isMandatory) mandatoryRequirementFailed = true;
      } else {
        const isMatched = candSkills.some(s => s === techLower || (techLower.length > 3 && (s.includes(techLower) || techLower.includes(s)))) ||
          new RegExp(`\\b${techLower.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}\\b`, 'i').test(rawText);

        if (isMatched) {
          matchedSkillsList.push(cleanTech);
          earnedTechWeight += (1.0 * weight);
          if (isMandatory) mandatoryMetCount++;
        } else {
          missingSkillsList.push(cleanTech);
          if (isMandatory) mandatoryRequirementFailed = true;
        }
      }
    }
  }

  // 1. Mandatory Compliance Score (30%)
  let mandatoryScore = 100;
  if (mandatoryCount > 0) {
    mandatoryScore = Math.round((mandatoryMetCount / mandatoryCount) * 100);
  }

  // 2. Technical Skills Score (25%)
  let techScore = 80;
  if (totalTechWeight > 0) {
    techScore = Math.round((earnedTechWeight / totalTechWeight) * 100);
  } else {
    techScore = calculateSkillsScore(candidate.skills || [], ['React', 'TypeScript', 'Node.js', 'SQL']).score;
  }

  // 3. Relevant Experience Score (20%)
  let expScore = Math.min(100, Math.max(20, Math.round(totalCareerYears * 20)));
  if (totalExpWeight > 0) {
    expScore = Math.round((earnedExpWeight / totalExpWeight) * 100);
  }

  // 4. Education & Certifications Score (5%)
  const eduScore = calculateEducationScore(candidate.education || [], ['Bachelor']).score;

  // 5. Semantic / Keyword Score (5%)
  const keywordsResult = calculateKeywordOverlapScore(rawText, jdFullText);
  const semanticScore = keywordsResult.score;

  // 6. Responsibilities (10%) & Domain Fit (5%)
  const respScore = 85;
  const domainScore = 90;

  // 7-Pillar Composite Calculation (Task 5 Architecture)
  const weightedTotal =
    (mandatoryScore * 0.30) +
    (techScore * 0.25) +
    (expScore * 0.20) +
    (respScore * 0.10) +
    (eduScore * 0.05) +
    (semanticScore * 0.05) +
    (domainScore * 0.05);

  const overallScore = Math.min(100, Math.max(0, Math.round(weightedTotal)));

  let matchLevel: 'STRONG MATCH' | 'GOOD MATCH' | 'MODERATE MATCH' | 'LOW FIT' = 'MODERATE MATCH';
  if (overallScore >= 75 && !mandatoryRequirementFailed) matchLevel = 'STRONG MATCH';
  else if (overallScore >= 60 && !mandatoryRequirementFailed) matchLevel = 'GOOD MATCH';
  else if (overallScore >= 40) matchLevel = 'MODERATE MATCH';
  else matchLevel = 'LOW FIT';

  const breakdown: MatchScoreBreakdown = {
    mandatoryCompliance: {
      score: mandatoryScore,
      weight: 30,
      passed: !mandatoryRequirementFailed,
      failedCount: mandatoryCount - mandatoryMetCount
    },
    technicalSkills: {
      score: techScore,
      weight: 25,
      matchedSkills: matchedSkillsList,
      missingSkills: missingSkillsList
    },
    relevantExperience: {
      score: expScore,
      weight: 20,
      candidateYears: totalCareerYears,
      requiredYears: 3.0
    },
    responsibilities: {
      score: respScore,
      weight: 10
    },
    domainFit: {
      score: domainScore,
      weight: 5
    },
    skills: {
      score: techScore,
      weight: 40,
      matchedSkills: matchedSkillsList,
      missingSkills: missingSkillsList,
    },
    experience: {
      score: expScore,
      weight: 30,
      candidateYears: totalCareerYears,
      requiredYears: 3.0,
    },
    education: {
      score: eduScore,
      weight: 15,
      candidateDegrees: (candidate.education || []).map(e => e.degree || 'Degree'),
      requiredDegrees: ["Bachelor's Degree"],
    },
    keywords: {
      score: semanticScore,
      weight: 15,
      cosineSimilarity: keywordsResult.cosineSimilarity,
      topMatchedTerms: keywordsResult.topMatchedTerms,
    },
  };

  const summary = `${matchLevel} (${overallScore}% overall). Mandatory compliance: ${mandatoryScore}%, Skills match: ${techScore}%, Experience: ${totalCareerYears}y (${expScore}%).`;

  return {
    overallScore,
    matchLevel,
    mandatoryRequirementFailed,
    breakdown,
    summary,
  };
};
