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
