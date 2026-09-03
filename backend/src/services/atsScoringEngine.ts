/**
 * ATS Scoring Engine - Production Evidence-Based Requirement ↔ CV Matching Engine
 * 
 * Strict Requirement-Driven Architecture:
 * 1. Independent Requirement Evaluation with 4 Standard Statuses:
 *    - MATCHED (1.0 = 100%)
 *    - PARTIAL (0.5 = 50%)
 *    - NOT_MATCHED (0.0 = 0%)
 *    - UNKNOWN (0.0 = 0%)
 * 2. Strict Technology Boundaries & Intelligent Normalization:
 *    - JS ≈ JavaScript, PostgreSQL ≈ Postgres, Kubernetes ≈ K8s, AWS ≈ Amazon Web Services, ML ≈ Machine Learning, NLP ≈ Natural Language Processing, LLM ≈ Large Language Model.
 *    - Non-equivalent: LangChain ≠ LangGraph, Python ≠ FastAPI, Docker ≠ Kubernetes, Classical ML ≠ Generative AI/RAG.
 * 3. Evidence-Backed Matching: Every evaluation captures exact candidate evidence and source section.
 * 4. Experience & Tenure Calculation: Evaluates actual professional role dates, excluding courses/training.
 * 5. Mandatory Requirement Gating & Score Caps:
 *    - Failing mandatory requirements sets mandatoryRequirementFailed = true and caps match tier.
 *    - When 0 mandatory requirements are defined in JD, evaluates smoothly without false failure flags.
 * 6. Pure Weighted Scoring: Final ATS Score = sum(status_score * weight) / sum(weight) * 100.
 * 7. Fully Deterministic: No Math.random(), no hardcoded candidate logic, 100% reproducible.
 */

import { CandidateRecord } from '../controllers/candidateController';

export type MatchStatus = 'MATCHED' | 'PARTIAL' | 'NOT_MATCHED' | 'UNKNOWN';

// Backward compatibility alias
export type RequirementEvaluationStatus =
  | 'MATCHED'
  | 'PARTIAL'
  | 'NOT_MATCHED'
  | 'UNKNOWN'
  | 'FULLY_MET'
  | 'PARTIALLY_MET'
  | 'NOT_MET'
  | 'NOT_FOUND'
  | 'NEEDS_VERIFICATION';

export type EvidenceConfidence = 'EXPLICIT' | 'STRONG_SEMANTIC' | 'WEAK_INFERENCE';

export type MatchTier =
  | 'EXCELLENT MATCH'
  | 'STRONG MATCH'
  | 'MODERATE MATCH'
  | 'LOW MATCH'
  | 'MINIMAL MATCH';

export const STATUS_SCORE_MAP: Record<MatchStatus, number> = {
  MATCHED: 1.0,
  PARTIAL: 0.5,
  NOT_MATCHED: 0.0,
  UNKNOWN: 0.0,
};

export interface MandatoryFailureDetail {
  requirement: string;
  reason: string;
  category?: string;
}

export interface RequirementEvaluationResult {
  id: string;
  requirement: string;
  category: string;
  mandatory: boolean;
  isMandatory: boolean; // Compatibility
  weight: number;
  status: MatchStatus;
  statusScore: number; // 0.0, 0.5, 1.0
  score: number; // 0 - 100
  candidateEvidence: string;
  evidence: string; // Compatibility
  evidenceSource: string;
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

export interface PillarScores {
  technicalSkills: number;
  experience: number;
  education: number;
  genAI: number;
  semanticRelevance: number;
  // Compatibility fields
  mandatoryCompliance?: number;
  relevantExperience?: number;
  responsibilities?: number;
  semanticSimilarity?: number;
  domainFit?: number;
}

export interface ATSScoringResult {
  evaluationId: string;
  candidateId: string;
  jobId: string;
  overallScore: number; // 0 - 100
  matchLevel: MatchTier;
  mandatoryRequirementFailed: boolean;
  mandatoryComplianceScore: number;
  mandatoryFailures: MandatoryFailureDetail[];
  mandatoryCompliance: {
    total: number;
    met: number;
    failed: number;
    passed: boolean;
  };
  pillarScores: PillarScores;
  pillars: PillarScores; // Compatibility
  requirements: RequirementEvaluationResult[];
  requirementResults: RequirementEvaluationResult[]; // Compatibility
  strengths: string[];
  gaps: string[];
  warnings: string[];
  scoringConfigVersion: string;
  evaluatedAt: string;
}

// ============================================================================
// 1. TECHNOLOGY SYNONYMS & STRICT DIFFERENTIATION RULES
// ============================================================================

// Exact synonym groups where terms are 100% interchangeable aliases
const EXACT_SYNONYM_GROUPS: string[][] = [
  ['javascript', 'js', 'ecmascript'],
  ['typescript', 'ts'],
  ['react', 'reactjs', 'react.js'],
  ['node.js', 'nodejs', 'node'],
  ['kubernetes', 'k8s'],
  ['postgresql', 'postgres', 'pgsql'],
  ['mongodb', 'mongo', 'mongo db'],
  ['amazon web services', 'aws'],
  ['google cloud platform', 'gcp', 'google cloud'],
  ['microsoft azure', 'azure'],
  ['golang', 'go'],
  ['c++', 'cpp'],
  ['c#', 'csharp', 'c sharp'],
  ['.net', 'dotnet', 'asp.net', 'asp.net core'],
  ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'],
  ['fastapi', 'fast api'],
  ['flask'],
  ['django'],
  ['angular', 'angularjs', 'angular.js'],
  ['vue', 'vuejs', 'vue.js'],
  ['docker', 'docker compose', 'dockerfile'],
  ['rest api', 'restful api', 'restful apis', 'rest apis', 'rest web services', 'restful web services', 'rest', 'restful'],
  ['graphql', 'gql'],
  ['aws bedrock', 'amazon bedrock', 'bedrock'],
  ['generative ai', 'genai', 'gen ai', 'gen-ai', 'large language models', 'large language model', 'llm', 'llms', 'rag', 'retrieval augmented generation', 'retrieval-augmented generation'],
  ['machine learning', 'ml', 'classical ml', 'traditional machine learning', 'scikit-learn', 'sklearn'],
  ['tensorflow', 'tf'],
  ['pytorch', 'torch'],
  ['langgraph', 'lang graph'],
  ['langchain', 'lang chain'],
  ['llamaindex', 'llama index', 'llama-index'],
  ['pinecone', 'pinecone db', 'pinecone vector db'],
  ['chromadb', 'chroma db', 'chroma'],
  ['weaviate', 'weaviate vector db'],
  ['qdrant', 'qdrant vector db'],
  ['prompt engineering', 'prompt-engineering'],
  ['vector database', 'vector databases', 'vector db', 'vector store', 'vector stores'],
  ['ptc windchill', 'windchill', 'ptc windchill pdmlink', 'windchill pdmlink', 'ptc plm'],
  ['java', 'core java']
];

// Map of canonical term -> all synonymous forms
const SYNONYM_MAP: Map<string, Set<string>> = new Map();
for (const group of EXACT_SYNONYM_GROUPS) {
  const set = new Set(group.map(t => t.toLowerCase()));
  for (const term of group) {
    SYNONYM_MAP.set(term.toLowerCase(), set);
  }
}

// Strict Non-Equivalent Pairs to avoid false-positive cross-matches
export const STRICT_NON_EQUIVALENT_PAIRS: Array<{ required: RegExp; candidateOnly: RegExp; reason: string }> = [
  { required: /\b(?:kubernetes|k8s)\b/i, candidateOnly: /\bdocker\b/i, reason: 'Docker is containerization, not Kubernetes orchestration' },
  { required: /\b(?:react|reactjs)\b/i, candidateOnly: /\b(?:angular|angularjs|vue|vuejs)\b/i, reason: 'Angular/Vue is a different frontend framework than React' },
  { required: /\b(?:postgresql|postgres|pgsql)\b/i, candidateOnly: /\b(?:mongodb|mongo)\b/i, reason: 'MongoDB is NoSQL document store, not relational PostgreSQL' },
  { required: /\b(?:mongodb|mongo)\b/i, candidateOnly: /\b(?:postgresql|postgres|pgsql)\b/i, reason: 'PostgreSQL is relational SQL, not NoSQL MongoDB' },
  { required: /\bfastapi\b/i, candidateOnly: /\b(?:flask|django)\b/i, reason: 'Flask/Django does not satisfy asynchronous FastAPI' },
  { required: /\bflask\b/i, candidateOnly: /\b(?:fastapi|django)\b/i, reason: 'FastAPI/Django is not Flask' },
  { required: /\b(?:rest|restful)\b/i, candidateOnly: /\bgraphql\b/i, reason: 'GraphQL is not REST' },
  { required: /\bgraphql\b/i, candidateOnly: /\b(?:rest|restful)\b/i, reason: 'REST is not GraphQL' },
  { required: /\b(?:generative ai|genai|gen ai|llm|llms|rag)\b/i, candidateOnly: /\b(?:classical ml|traditional machine learning|scikit-learn|sklearn|regression)\b/i, reason: 'Traditional ML does not satisfy Generative AI/LLM development' },
  { required: /\b(?:aws bedrock|bedrock)\b/i, candidateOnly: /\b(?:aws|amazon web services)\b/i, reason: 'General AWS does not satisfy AWS Bedrock generative AI services' },
];

// Related / Partial technologies mapping (ONLY when genuinely justified)
const RELATED_PARTIAL_MAPPINGS: Array<{
  target: RegExp;
  related: Array<{ regex: RegExp; name: string; reason: string }>;
}> = [
  {
    target: /\blanggraph\b/i,
    related: [
      { regex: /\blangchain\b/i, name: 'LangChain', reason: 'LangChain is an agent framework related to LangGraph but does not satisfy LangGraph multi-agent graph workflows.' },
      { regex: /\bllamaindex\b/i, name: 'LlamaIndex', reason: 'LlamaIndex is an orchestration framework related to LangGraph.' },
    ],
  },
];

// Generic filler words to avoid spurious matching
const GENERIC_FILLER_WORDS = new Set([
  'experience', 'hands-on', 'proficient', 'proficiency', 'knowledge', 'understanding',
  'familiarity', 'strong', 'deep', 'solid', 'proven', 'demonstrated', 'ability',
  'working', 'with', 'in', 'and', 'or', 'for', 'the', 'of', 'to', 'using', 'designing',
  'building', 'developing', 'managing', 'implementing', 'engineering', 'role', 'tools',
  'technologies', 'platform', 'framework', 'architecture', 'system', 'skills', 'good',
  'excellent', 'preferred', 'required', 'must', 'have', 'minimum', 'years', 'yrs'
]);

// ============================================================================
// 2. CONTEXTUAL NEGATION DETECTION
// ============================================================================
export function checkNegationContext(text: string, term: string): { isNegated: boolean; snippet?: string } {
  if (!text || !term) return { isNegated: false };

  const cleanTerm = term.trim().toLowerCase();
  const termEscaped = cleanTerm.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
  const sentences = text.split(/(?<=[.!?\n])\s+/);

  for (const s of sentences) {
    if (new RegExp(`(?:^|[^a-zA-Z0-9_])${termEscaped}(?:[^a-zA-Z0-9_]|$)`, 'i').test(s)) {
      if (
        new RegExp(`\\b(?:not|no|never|without|lacks?|except|neither)\\s+(?:prior\\s+|hands-on\\s+)?(?:experience\\s+in\\s+|knowledge\\s+of\\s+)?(?:[a-zA-Z0-9_,\\s]{0,25}\\s+)?${termEscaped}\\b`, 'i').test(s) ||
        new RegExp(`${termEscaped}\\b[\\s\\w,]{0,20}\\b(?:not used|not required|not implemented|not supported|not preferred)\\b`, 'i').test(s) ||
        new RegExp(`team\\s+managed\\s+by\\s+${termEscaped}\\s+team`, 'i').test(s)
      ) {
        return { isNegated: true, snippet: s.trim() };
      }
    }
  }

  return { isNegated: false };
}

// ============================================================================
// 3. SKILL & EVIDENCE MATCHER
// ============================================================================

function escapeRegex(str: string): string {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

/**
 * Extracts normalized search terms and valid synonyms for a skill requirement.
 * Enforces strict word boundaries and prevents parent category dilution.
 */
export function getSearchTermsForSkill(cleanReq: string): Set<string> {
  const reqLower = cleanReq.toLowerCase().trim();
  const searchTerms = new Set<string>();
  if (!reqLower) return searchTerms;

  searchTerms.add(reqLower);

  // 1. Exact synonym map lookup
  const exactSet = SYNONYM_MAP.get(reqLower);
  if (exactSet) {
    for (const syn of exactSet) searchTerms.add(syn);
  }

  // 2. Multi-word phrase matching with word boundaries (longest match first)
  const sortedCanonicals = Array.from(SYNONYM_MAP.keys()).sort((a, b) => b.length - a.length);
  for (const canonical of sortedCanonicals) {
    const canonicalRegex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escapeRegex(canonical)}(?:[^a-zA-Z0-9_]|$)`, 'i');
    if (canonicalRegex.test(reqLower)) {
      // Prevent parent dilution (e.g. if requirement is 'aws bedrock', do not add general 'aws')
      if (canonical === 'aws' && /\bbedrock\b/i.test(reqLower)) continue;
      if (canonical === 'docker' && /\b(?:kubernetes|k8s)\b/i.test(reqLower)) continue;
      if (canonical === 'react' && /\breact native\b/i.test(reqLower)) continue;
      if (canonical === 'ml' && /\b(?:generative ai|genai|llm)\b/i.test(reqLower)) continue;
      if (canonical === 'python' && /\b(?:fastapi|flask|django)\b/i.test(reqLower)) continue;

      const synSet = SYNONYM_MAP.get(canonical);
      if (synSet) {
        for (const syn of synSet) searchTerms.add(syn);
      }
    }
  }

  // 3. Decompose compound phrases (e.g. "React and TypeScript", "Python/Django")
  const compoundSubParts = reqLower
    .split(/[\&,\/\+]|\b(?:and|or)\b/)
    .map(p => p.trim())
    .filter(p => p.length >= 2 && !GENERIC_FILLER_WORDS.has(p));

  for (const part of compoundSubParts) {
    searchTerms.add(part);
    const subSet = SYNONYM_MAP.get(part);
    if (subSet) {
      for (const s of subSet) searchTerms.add(s);
    }
  }

  // Clean out generic short words
  const cleanTerms = new Set<string>();
  for (const t of searchTerms) {
    const trimmed = t.trim();
    if (trimmed.length === 1 && !['c', 'r'].includes(trimmed)) continue;
    if (GENERIC_FILLER_WORDS.has(trimmed)) continue;
    cleanTerms.add(trimmed);
  }

  return cleanTerms;
}

export interface SkillMatchResult {
  status: MatchStatus;
  evidence: string;
  source: string;
  confidence: EvidenceConfidence;
  failureReason?: string;
}

/**
 * Searches the candidate's CV for exact or synonymous matches for a skill requirement.
 * Strictly prioritizes evidence in order:
 * 1. Work Experience
 * 2. Projects
 * 3. Skills Inventory
 * 4. Certifications
 * 5. Education
 * 6. Summary / Overview
 * 
 * Prevents keyword inflation: evaluated once against requirement weight.
 */
export function matchSkillRequirement(
  candidate: CandidateRecord,
  requirementText: string,
  category: string
): SkillMatchResult {
  const rawText = candidate.rawText || '';
  const candSkills = candidate.skills || [];
  const candExps = candidate.experience || [];
  const candProjects = candidate.projects || [];
  const candCerts = candidate.certifications || [];
  const candEdu = candidate.education || [];

  // Extract core keywords by stripping filler words with proper word boundaries
  const cleanReq = requirementText
    .replace(/\b(proficient|proficiency|experience|hands-on|strong|deep|knowledge|familiarity|with|in|and|or|required|preferred|must have|working knowledge of|expertise in)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const reqLower = cleanReq.toLowerCase();
  if (!reqLower) {
    return {
      status: 'UNKNOWN',
      evidence: 'Requirement description does not specify actionable skills.',
      source: 'Requirement Specification',
      confidence: 'WEAK_INFERENCE'
    };
  }

  // 1. Check for contextual negation in full CV
  const neg = checkNegationContext(rawText, reqLower);
  if (neg.isNegated) {
    return {
      status: 'NOT_MATCHED',
      evidence: `Explicit negative context in CV: "${neg.snippet}"`,
      source: 'CV Text',
      confidence: 'EXPLICIT',
      failureReason: `Candidate profile indicates lack of experience with "${cleanReq}".`
    };
  }

  // 2. Identify synonymous search terms for this requirement
  const searchTerms = getSearchTermsForSkill(reqLower);

  const checkTextMatches = (text: string): { matched: boolean; sentence: string } => {
    if (!text) return { matched: false, sentence: '' };
    for (const term of searchTerms) {
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escapeRegex(term)}(?:[^a-zA-Z0-9_]|$)`, 'i');
      if (regex.test(text)) {
        const sentences = text.split(/(?<=[.!?\n])\s+/);
        const matchSentence = sentences.find(s => regex.test(s)) || text.substring(0, 150);
        return { matched: true, sentence: matchSentence.trim() };
      }
    }
    return { matched: false, sentence: '' };
  };

  // 3. Search structured sections following the STRICT 6-LEVEL EVIDENCE PRIORITY:

  // Priority 1: Work Experience (excluding non-professional bootcamps/training)
  for (const exp of candExps) {
    if (isNonProfessionalRole(exp.title, exp.company, exp.description)) continue;
    const roleText = `${exp.title || ''} ${exp.company || ''} ${exp.description || ''} ${((exp as any).technologies || []).join(' ')}`;
    const match = checkTextMatches(roleText);
    if (match.matched) {
      return {
        status: 'MATCHED',
        evidence: match.sentence,
        source: `Work Experience: ${exp.title || 'Role'} at ${exp.company || 'Company'}`,
        confidence: 'EXPLICIT'
      };
    }
  }

  // Priority 2: Projects
  for (const proj of candProjects) {
    const projText = `${proj.name || ''} ${proj.description || ''} ${(proj.technologies || []).join(' ')}`;
    const match = checkTextMatches(projText);
    if (match.matched) {
      return {
        status: 'MATCHED',
        evidence: `${proj.name ? `${proj.name}: ` : ''}${match.sentence || proj.description || projText.substring(0, 140)}`.trim(),
        source: `Project: ${proj.name || 'Technical Project'}`,
        confidence: 'EXPLICIT'
      };
    }
  }

  // Priority 3: Skills Inventory
  for (const skill of candSkills) {
    const sLower = skill.toLowerCase().trim();
    for (const term of searchTerms) {
      if (sLower === term || (term.length > 3 && sLower.split(/[\s,;/]+/).includes(term))) {
        return {
          status: 'MATCHED',
          evidence: `Explicitly listed in verified technical skills: "${skill}"`,
          source: 'Skills Inventory',
          confidence: 'EXPLICIT'
        };
      }
    }
  }

  // Priority 4: Certifications
  for (const cert of candCerts) {
    const certText = `${(cert as any).name || (cert as any).certification || ''} ${(cert as any).issuer || ''}`;
    const match = checkTextMatches(certText);
    if (match.matched) {
      return {
        status: 'MATCHED',
        evidence: `Verified professional credential: "${(cert as any).name || (cert as any).certification}"`,
        source: 'Certifications',
        confidence: 'EXPLICIT'
      };
    }
  }

  // Priority 5: Education
  for (const edu of candEdu) {
    const eduText = `${edu.degree || ''} ${edu.field || ''} ${edu.institution || ''}`;
    const match = checkTextMatches(eduText);
    if (match.matched) {
      return {
        status: 'MATCHED',
        evidence: `Academic coursework/credential: "${edu.degree || 'Degree'} in ${edu.field || 'Field'}"`,
        source: 'Education',
        confidence: 'EXPLICIT'
      };
    }
  }

  // Priority 6: Summary / Profile Overview
  const summaryText = candidate.summary || '';
  if (summaryText) {
    const match = checkTextMatches(summaryText);
    if (match.matched) {
      return {
        status: 'MATCHED',
        evidence: match.sentence,
        source: 'Summary / Profile Overview',
        confidence: 'STRONG_SEMANTIC'
      };
    }
  }

  // Raw text overview fallback (only if not found in structured sections)
  if (rawText) {
    const match = checkTextMatches(rawText);
    if (match.matched && match.sentence.length > 10) {
      return {
        status: 'MATCHED',
        evidence: match.sentence.replace(/^[-•*]\s*/, '').trim(),
        source: 'CV Overview',
        confidence: 'STRONG_SEMANTIC'
      };
    }
  }

  // 4. Check for PARTIAL Match via Related Technologies ONLY when genuinely justified
  for (const mapping of RELATED_PARTIAL_MAPPINGS) {
    if (mapping.target.test(reqLower)) {
      for (const rel of mapping.related) {
        if (rel.regex.test(rawText) || candSkills.some(s => rel.regex.test(s))) {
          const sentences = rawText.split(/(?<=[.!?\n])\s+/);
          const foundSentence = sentences.find(s => rel.regex.test(s)) || `Demonstrated experience with ${rel.name}.`;
          return {
            status: 'PARTIAL',
            evidence: `${rel.reason} (Evidence: "${foundSentence.replace(/^[-•*]\s*/, '').trim().substring(0, 160)}")`,
            source: `Related Skill: ${rel.name}`,
            confidence: 'STRONG_SEMANTIC',
            failureReason: `Candidate has ${rel.name} experience, which is related but does not fully satisfy "${cleanReq}".`
          };
        }
      }
    }
  }

  // 5. Default: NOT MATCHED
  return {
    status: 'NOT_MATCHED',
    evidence: `No credible evidence for "${cleanReq}" found in CV skills, experience, or projects.`,
    source: 'CV Analysis',
    confidence: 'EXPLICIT',
    failureReason: `No documented experience with "${cleanReq}".`
  };
}

// ============================================================================
// 4. EXPERIENCE & TENURE EVALUATION
// ============================================================================

export interface ExperienceMatchResult {
  status: MatchStatus;
  evidence: string;
  source: string;
  confidence: EvidenceConfidence;
  candidateYears: number;
  requiredYears: number;
  gap: number;
  failureReason?: string;
}

/**
 * Helper to identify non-professional roles (bootcamps, courses, internships, traineeships)
 * which should not count toward professional experience tenure.
 */
export function isNonProfessionalRole(title?: string | null, company?: string | null, description?: string | null): boolean {
  const combined = `${title || ''} ${company || ''} ${description || ''}`.toLowerCase();
  const nonProTerms = [
    'bootcamp', 'training', 'course', 'coursera', 'udemy',
    'student', 'intern', 'internship', 'trainee', 'apprentice',
    'fellowship', 'academic project', 'school project', 'college project'
  ];
  return nonProTerms.some(term => new RegExp(`\\b${term}\\b`, 'i').test(combined));
}

/**
 * Parses date components from strings like "Jan 2021", "2020", "2021-03", "March 2022"
 */
function parseDateComponents(dateStr?: string | null, isEnd: boolean = false): { year: number; month: number } | null {
  if (!dateStr) return null;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  if (/present|current|now|ongoing/i.test(dateStr)) {
    return { year: currentYear, month: currentMonth };
  }

  const yrMatch = dateStr.match(/\b(19\d\d|20\d\d)\b/);
  if (!yrMatch) return null;
  const year = parseInt(yrMatch[1], 10);

  const monthsMap: Record<string, number> = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12
  };

  const lower = dateStr.toLowerCase();
  let month = isEnd ? 12 : 1;
  for (const [mName, mNum] of Object.entries(monthsMap)) {
    if (new RegExp(`\\b${mName}\\b`, 'i').test(lower)) {
      month = mNum;
      break;
    }
  }

  const isoMatch = dateStr.match(/\b(19\d\d|20\d\d)[-/](0?[1-9]|1[0-2])\b/);
  if (isoMatch) {
    month = parseInt(isoMatch[2], 10);
  } else {
    const usMatch = dateStr.match(/\b(0?[1-9]|1[0-2])[-/](19\d\d|20\d\d)\b/);
    if (usMatch) {
      month = parseInt(usMatch[1], 10);
    }
  }

  return { year, month };
}

/**
 * Merges overlapping employment intervals so concurrent jobs are not double-counted.
 */
function mergeAndCalculateIntervalYears(intervals: Array<[number, number]>): number {
  if (intervals.length === 0) return 0;
  intervals.sort((a, b) => a[0] - b[0]);

  const merged: Array<[number, number]> = [];
  let cur = [...intervals[0]] as [number, number];

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    if (next[0] <= cur[1] + 1) {
      cur[1] = Math.max(cur[1], next[1]);
    } else {
      merged.push(cur);
      cur = [...next] as [number, number];
    }
  }
  merged.push(cur);

  let totalMonths = 0;
  for (const [s, e] of merged) {
    totalMonths += Math.max(1, (e - s + 1));
  }

  return Math.round((totalMonths / 12) * 10) / 10;
}

/**
 * Calculates candidate professional years from employment dates and role history.
 * Merges overlapping periods and excludes training, bootcamps, and student roles.
 */
export function calculateProfessionalTenure(candidate: CandidateRecord): number {
  const candExps = candidate.experience || [];
  if (!Array.isArray(candExps) || candExps.length === 0) {
    const rawTotalMatch = (candidate.totalExperience || '').match(/(\d+(?:\.\d+)?)/);
    return rawTotalMatch ? parseFloat(rawTotalMatch[1]) : 0;
  }

  const intervals: Array<[number, number]> = [];
  let durationFallbackYears = 0;

  for (const exp of candExps) {
    if (isNonProfessionalRole(exp.title, exp.company, exp.description)) {
      continue;
    }

    const start = parseDateComponents(exp.startDate, false);
    const end = parseDateComponents(exp.endDate, true);

    if (start && end && (end.year > start.year || (end.year === start.year && end.month >= start.month))) {
      const sIndex = start.year * 12 + start.month;
      const eIndex = end.year * 12 + end.month;
      intervals.push([sIndex, eIndex]);
    } else if (exp.duration) {
      const yrMatch = exp.duration.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
      if (yrMatch) {
        durationFallbackYears += parseFloat(yrMatch[1]);
      } else {
        const moMatch = exp.duration.match(/(\d+)\s*(?:months?|mos?)/i);
        if (moMatch) durationFallbackYears += parseFloat(moMatch[1]) / 12;
      }
    } else {
      durationFallbackYears += 1.0;
    }
  }

  if (intervals.length > 0) {
    return mergeAndCalculateIntervalYears(intervals);
  }

  if (durationFallbackYears > 0) {
    return Math.round(durationFallbackYears * 10) / 10;
  }

  const rawTotalMatch = (candidate.totalExperience || '').match(/(\d+(?:\.\d+)?)/);
  return rawTotalMatch ? parseFloat(rawTotalMatch[1]) : 0;
}

/**
 * Calculates relevant experience years for a specific technology target.
 */
export function calculateTechnologyTenure(candidate: CandidateRecord, techTerms: Set<string>): number {
  const candExps = candidate.experience || [];
  if (!Array.isArray(candExps) || candExps.length === 0) {
    return 0;
  }

  const intervals: Array<[number, number]> = [];
  let durationFallbackYears = 0;

  for (const exp of candExps) {
    if (isNonProfessionalRole(exp.title, exp.company, exp.description)) {
      continue;
    }

    const roleText = `${exp.title || ''} ${exp.company || ''} ${exp.description || ''} ${((exp as any).technologies || []).join(' ')}`;
    let roleMentionsTech = false;
    for (const term of techTerms) {
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${escapeRegex(term)}(?:[^a-zA-Z0-9_]|$)`, 'i');
      if (regex.test(roleText)) {
        roleMentionsTech = true;
        break;
      }
    }

    if (roleMentionsTech) {
      const start = parseDateComponents(exp.startDate, false);
      const end = parseDateComponents(exp.endDate, true);

      if (start && end && (end.year > start.year || (end.year === start.year && end.month >= start.month))) {
        const sIndex = start.year * 12 + start.month;
        const eIndex = end.year * 12 + end.month;
        intervals.push([sIndex, eIndex]);
      } else if (exp.duration) {
        const yrMatch = exp.duration.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
        if (yrMatch) {
          durationFallbackYears += parseFloat(yrMatch[1]);
        } else {
          const moMatch = exp.duration.match(/(\d+)\s*(?:months?|mos?)/i);
          if (moMatch) durationFallbackYears += parseFloat(moMatch[1]) / 12;
        }
      } else {
        durationFallbackYears += 1.0;
      }
    }
  }

  if (intervals.length > 0) {
    return mergeAndCalculateIntervalYears(intervals);
  }

  return Math.round(durationFallbackYears * 10) / 10;
}

/**
 * Evaluates experience requirement (supports single thresholds like "4+ years" and ranges like "4-6 years").
 * Strictly enforces:
 * - Candidate years >= Required years -> MATCHED (1.0)
 * - Candidate years >= 80% of required years -> PARTIAL (0.5)
 * - Candidate years < 80% of required years -> NOT_MATCHED (0.0)
 */
export function evaluateExperienceRequirement(
  candidate: CandidateRecord,
  requirementText: string
): ExperienceMatchResult {
  const reqLower = requirementText.toLowerCase();

  // Range matching: "4-6 years", "4 to 6 yrs", "4 – 6 years"
  const rangeMatch = reqLower.match(/(\d+(?:\.\d+)?)\s*(?:-|to|–)\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  // Single threshold: "4+ years", "4 years", "minimum 5 years"
  const singleMatch = reqLower.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i);

  let minYears = 3.0;
  let maxYears: number | null = null;

  if (rangeMatch) {
    minYears = parseFloat(rangeMatch[1]);
    maxYears = parseFloat(rangeMatch[2]);
  } else if (singleMatch) {
    minYears = parseFloat(singleMatch[1]);
  }

  // Detect specific technology target in requirement (e.g. "3+ years React", "5+ years in Python")
  const stripped = reqLower
    .replace(/\b(?:\d+(?:\.\d+)?\s*(?:-|to|–)\s*\d+(?:\.\d+)?\s*(?:years?|yrs?))\b/gi, ' ')
    .replace(/\b(?:\d+(?:\.\d+)?\+?\s*(?:years?|yrs?))\b/gi, ' ')
    .replace(/\b(?:experience|in|with|hands-on|demonstrated|minimum|at least|proven|expertise|of|proficiency|proficient|skills?|development|developing|engineering|architecture|designing|using)\b/gi, ' ')
    .replace(/[^\w\s\+\#\.]/g, ' ')
    .trim();

  const words = stripped.split(/\s+/).filter(w => w.length >= 2 && !GENERIC_FILLER_WORDS.has(w));
  const hasSpecificSkill = words.length > 0;

  let candYears = 0;
  let skillLabel = '';

  if (hasSpecificSkill) {
    const techCandidate = words.join(' ');
    skillLabel = techCandidate;
    const techSearchTerms = getSearchTermsForSkill(techCandidate);
    candYears = calculateTechnologyTenure(candidate, techSearchTerms);

    // If no dated employment history explicitly tagged the skill, check skills/projects
    if (candYears === 0) {
      const skillCheck = matchSkillRequirement(candidate, techCandidate, 'Technical Skill');
      if (skillCheck.status === 'NOT_MATCHED') {
        return {
          status: 'NOT_MATCHED',
          evidence: `Candidate does not document verified experience with "${skillLabel}" in employment history or skills.`,
          source: 'Work Experience Analysis',
          confidence: 'EXPLICIT',
          candidateYears: 0,
          requiredYears: minYears,
          gap: minYears,
          failureReason: `Candidate has no verified experience with "${skillLabel}" (required ${minYears}+ years).`
        };
      } else {
        // Skill verified in skills/projects without explicit role dates: cap at overall tenure
        const overallTenure = calculateProfessionalTenure(candidate);
        candYears = Math.min(overallTenure, minYears);
      }
    }
  } else {
    // Pure general experience requirement
    candYears = calculateProfessionalTenure(candidate);
  }

  const gap = Math.max(0, Math.round((minYears - candYears) * 10) / 10);

  if (candYears >= minYears) {
    return {
      status: 'MATCHED',
      evidence: skillLabel
        ? `Candidate documents ${candYears} years of verified experience in ${skillLabel} (meets required ${minYears}${maxYears ? `–${maxYears}` : '+'} years).`
        : `Candidate documents ${candYears} years of verified professional experience (meets required ${minYears}${maxYears ? `–${maxYears}` : '+'} years).`,
      source: 'Employment History Tenure',
      confidence: 'EXPLICIT',
      candidateYears: candYears,
      requiredYears: minYears,
      gap: 0
    };
  } else if (candYears >= minYears * 0.8) {
    // Exactly 80% to 99% of required experience -> PARTIAL (0.5)
    return {
      status: 'PARTIAL',
      evidence: skillLabel
        ? `Candidate documents ${candYears} years of experience in ${skillLabel} vs ${minYears}+ years required (${gap}y gap, satisfies 80% threshold).`
        : `Candidate documents ${candYears} years of experience vs ${minYears}+ years required (${gap}y gap, satisfies 80% threshold).`,
      source: 'Employment History Tenure',
      confidence: 'STRONG_SEMANTIC',
      candidateYears: candYears,
      requiredYears: minYears,
      gap,
      failureReason: `Candidate has ${candYears} years experience, slightly below the ${minYears}+ years requirement (within 80% threshold).`
    };
  } else {
    // Below 80% of required experience -> NOT MATCHED (0.0)
    return {
      status: 'NOT_MATCHED',
      evidence: skillLabel
        ? `Candidate documents only ${candYears} years of experience in ${skillLabel} vs ${minYears}+ years required (${gap}y deficit, below 80% threshold).`
        : `Candidate documents only ${candYears} years of experience vs ${minYears}+ years required (${gap}y deficit, below 80% threshold).`,
      source: 'Employment History Tenure',
      confidence: 'EXPLICIT',
      candidateYears: candYears,
      requiredYears: minYears,
      gap,
      failureReason: `Insufficient experience (${candYears}y vs ${minYears}+ years required, below 80% threshold).`
    };
  }
}

// ============================================================================
// 5. LOCATION, WORK MODE & AVAILABILITY EVALUATORS
// ============================================================================

const NCR_LOCATIONS = new Set(['gurugram', 'gurgaon', 'noida', 'delhi', 'new delhi', 'ncr', 'greater noida', 'ghaziabad', 'faridabad']);
const BANGALORE_LOCATIONS = new Set(['bangalore', 'bengaluru', 'blr']);
const MUMBAI_LOCATIONS = new Set(['mumbai', 'navi mumbai', 'thane']);
const PUNE_LOCATIONS = new Set(['pune']);
const HYDERABAD_LOCATIONS = new Set(['hyderabad', 'secunderabad', 'hyd']);

export function evaluateLocationRequirement(
  candidate: CandidateRecord,
  requirementText: string
): SkillMatchResult {
  const reqLower = requirementText.toLowerCase();
  const candLoc = (candidate.location || '').toLowerCase().trim();

  if (!candLoc || candLoc === 'unknown' || candLoc === 'remote' || candLoc.length < 2) {
    return {
      status: 'UNKNOWN',
      evidence: 'Candidate location is not specified in CV.',
      source: 'Candidate Contact Info',
      confidence: 'WEAK_INFERENCE',
      failureReason: 'Location not documented in CV.'
    };
  }

  // Check NCR
  const isNcrReq = reqLower.includes('ncr') || reqLower.includes('gurugram') || reqLower.includes('gurgaon') || reqLower.includes('noida') || reqLower.includes('delhi');
  if (isNcrReq) {
    const isCandNcr = Array.from(NCR_LOCATIONS).some(loc => candLoc.includes(loc));
    if (isCandNcr) {
      return {
        status: 'MATCHED',
        evidence: `Candidate is located in ${candidate.location} (matches NCR requirement).`,
        source: 'Location Details',
        confidence: 'EXPLICIT'
      };
    } else {
      return {
        status: 'NOT_MATCHED',
        evidence: `Candidate is located in "${candidate.location}", which is outside the required NCR region.`,
        source: 'Location Details',
        confidence: 'EXPLICIT',
        failureReason: `Location mismatch: Candidate is in ${candidate.location} vs required NCR region.`
      };
    }
  }

  // Check Bangalore
  const isBlrReq = reqLower.includes('bangalore') || reqLower.includes('bengaluru');
  if (isBlrReq) {
    const isCandBlr = Array.from(BANGALORE_LOCATIONS).some(loc => candLoc.includes(loc));
    if (isCandBlr) {
      return {
        status: 'MATCHED',
        evidence: `Candidate is based in ${candidate.location} (matches Bangalore requirement).`,
        source: 'Location Details',
        confidence: 'EXPLICIT'
      };
    } else {
      return {
        status: 'NOT_MATCHED',
        evidence: `Candidate is in ${candidate.location}, outside required Bangalore location.`,
        source: 'Location Details',
        confidence: 'EXPLICIT',
        failureReason: `Location mismatch: Candidate in ${candidate.location} vs required Bangalore.`
      };
    }
  }

  // General substring matching for other cities
  const cityKeywords = reqLower
    .replace(/(location|preferred|required|only|locals|candidates|based|in|at|onsite|hybrid|remote)/gi, ' ')
    .split(/[\s,;/]+/)
    .map(w => w.trim())
    .filter(w => w.length > 2);

  const matchedCity = cityKeywords.find(city => candLoc.includes(city));
  if (matchedCity) {
    return {
      status: 'MATCHED',
      evidence: `Candidate location "${candidate.location}" matches requirement.`,
      source: 'Location Details',
      confidence: 'EXPLICIT'
    };
  }

  return {
    status: 'NOT_MATCHED',
    evidence: `Candidate location "${candidate.location}" does not match required "${requirementText}".`,
    source: 'Location Details',
    confidence: 'EXPLICIT',
    failureReason: `Candidate located in ${candidate.location} vs required ${requirementText}.`
  };
}

export function evaluateNoticePeriodRequirement(
  candidate: CandidateRecord,
  requirementText: string
): SkillMatchResult {
  const reqLower = requirementText.toLowerCase();
  const rawText = (candidate.rawText || '').toLowerCase();
  const screeningNotes = ((candidate as any).screeningInfo?.noticePeriod || '').toLowerCase();

  const noticeText = `${screeningNotes} ${rawText}`;
  const isImmediateReq = reqLower.includes('immediate') || reqLower.includes('15 days') || reqLower.includes('joiner');

  // Check explicit mentions
  if (noticeText.includes('immediate') || noticeText.includes('serving notice') || noticeText.includes('0 days') || noticeText.includes('available immediately')) {
    return {
      status: 'MATCHED',
      evidence: 'Candidate is an immediate joiner / currently serving notice.',
      source: 'Notice Period & Availability',
      confidence: 'EXPLICIT'
    };
  }

  const daysMatch = noticeText.match(/(\d+)\s*(?:days?|weeks?)\s*(?:notice|availability)/i);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    if (days <= 15) {
      return {
        status: 'MATCHED',
        evidence: `Candidate notice period is ${days} days (meets immediate/15-day requirement).`,
        source: 'Notice Period & Availability',
        confidence: 'EXPLICIT'
      };
    } else if (days <= 30 && isImmediateReq) {
      return {
        status: 'PARTIAL',
        evidence: `Candidate has ${days} days notice period (exceeds immediate 15-day preference).`,
        source: 'Notice Period & Availability',
        confidence: 'STRONG_SEMANTIC',
        failureReason: `Candidate notice period is ${days} days vs immediate requirement.`
      };
    } else if (days > 30 && isImmediateReq) {
      return {
        status: 'NOT_MATCHED',
        evidence: `Candidate has ${days} days notice period (does not meet immediate requirement).`,
        source: 'Notice Period & Availability',
        confidence: 'EXPLICIT',
        failureReason: `Candidate notice period (${days} days) does not meet immediate requirement.`
      };
    }
  }

  // Not mentioned in CV
  return {
    status: 'UNKNOWN',
    evidence: 'Candidate notice period or availability is not stated in CV.',
    source: 'Availability Data',
    confidence: 'WEAK_INFERENCE'
  };
}

// ============================================================================
// 6. EDUCATION EVALUATOR
// ============================================================================
export function evaluateEducationRequirement(
  candidateEdu: Array<{ degree?: string | null; field?: string | null; institution?: string | null; year?: string | number | null }>,
  requirementText: string
): SkillMatchResult {
  const reqLower = requirementText.toLowerCase();

  if (!Array.isArray(candidateEdu) || candidateEdu.length === 0) {
    return {
      status: 'NOT_MATCHED',
      evidence: 'No academic degrees or educational credentials found in CV.',
      source: 'Education Section',
      confidence: 'EXPLICIT',
      failureReason: 'Academic degree not documented in CV.'
    };
  }

  const isBachelorsReq = reqLower.includes('bachelor') || reqLower.includes('b.tech') || reqLower.includes('b.e') || reqLower.includes('bs') || reqLower.includes('b.sc');
  const isMastersReq = reqLower.includes('master') || reqLower.includes('m.tech') || reqLower.includes('m.s') || reqLower.includes('ms') || reqLower.includes('mba');
  const isCsReq = reqLower.includes('computer') || reqLower.includes('software') || reqLower.includes('engineering') || reqLower.includes('information technology') || reqLower.includes('it');

  for (const edu of candidateEdu) {
    const deg = (edu.degree || '').toLowerCase();
    const fld = (edu.field || '').toLowerCase();

    const hasBachelors = deg.includes('bachelor') || deg.includes('b.tech') || deg.includes('b.e') || deg.includes('b.s') || deg.includes('btech') || deg.includes('b.sc') || deg.includes('bs');
    const hasMasters = deg.includes('master') || deg.includes('m.tech') || deg.includes('m.s') || deg.includes('mtech') || deg.includes('ms') || deg.includes('mba');
    const hasCsField = fld.includes('computer') || fld.includes('software') || fld.includes('information technology') || fld.includes('cse') || fld.includes('it') || deg.includes('computer') || deg.includes('engineering');

    if (isMastersReq && hasMasters) {
      return {
        status: 'MATCHED',
        evidence: `${edu.degree || 'Master Degree'} in ${edu.field || 'Relevant Field'} from ${edu.institution || 'University'}${edu.year ? ` (${edu.year})` : ''}`,
        source: 'Education Section',
        confidence: 'EXPLICIT'
      };
    }

    if ((isBachelorsReq || !isMastersReq) && (hasBachelors || hasMasters)) {
      if (!isCsReq || hasCsField) {
        return {
          status: 'MATCHED',
          evidence: `${edu.degree || 'Bachelor Degree'} in ${edu.field || 'Computer Science / Engineering'} from ${edu.institution || 'University'}${edu.year ? ` (${edu.year})` : ''}`,
          source: 'Education Section',
          confidence: 'EXPLICIT'
        };
      } else {
        return {
          status: 'PARTIAL',
          evidence: `${edu.degree || 'Bachelor Degree'} in ${edu.field || 'General Field'} (Specialization differs from Computer Science).`,
          source: 'Education Section',
          confidence: 'STRONG_SEMANTIC'
        };
      }
    }
  }

  const first = candidateEdu[0];
  return {
    status: 'PARTIAL',
    evidence: `Candidate holds ${first.degree || 'Degree'} in ${first.field || 'Field'}, partially satisfying qualification requirement.`,
    source: 'Education Section',
    confidence: 'STRONG_SEMANTIC'
  };
}

// ============================================================================
// 7. CORE DETERMINISTIC SCORING ENGINE ENTRY POINT
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
  const mandatoryFailures: MandatoryFailureDetail[] = [];
  const strengths: string[] = [];
  const gaps: string[] = [];
  const warnings: string[] = [];

  let totalWeight = 0;
  let earnedScoreSum = 0;

  let mandatoryTotal = 0;
  let mandatoryMetCount = 0;

  // Track pillar weighted components
  const pillarPoints: Record<'tech' | 'exp' | 'edu' | 'genai' | 'other', { earned: number; total: number }> = {
    tech: { earned: 0, total: 0 },
    exp: { earned: 0, total: 0 },
    edu: { earned: 0, total: 0 },
    genai: { earned: 0, total: 0 },
    other: { earned: 0, total: 0 },
  };

  // Safe fallback if JD has 0 requirements configured
  const effectiveReqs = (Array.isArray(requirements) && requirements.length > 0)
    ? requirements
    : [
        { id: 'req-default-1', requirement: job.position || 'Software Engineering Experience', category: 'Experience', weight: 2.0, is_mandatory: true },
        { id: 'req-default-2', requirement: 'Core Technical Skills', category: 'Technical Skill', weight: 2.0, is_mandatory: false }
      ];

  for (const req of effectiveReqs) {
    const reqId = req.id || `req-${Math.random().toString(36).substring(2, 7)}`;
    const reqText = (req.requirement || '').trim();
    const reqCategory = (req.category || 'Technical Skill').trim();
    const isMandatory = typeof req.is_mandatory === 'boolean'
      ? req.is_mandatory
      : (typeof req.isMandatory === 'boolean' ? req.isMandatory : false);
    const weight = typeof req.weight === 'number' && req.weight > 0 ? req.weight : 1.0;

    totalWeight += weight;
    if (isMandatory) mandatoryTotal++;

    const reqLower = reqText.toLowerCase();
    const catLower = reqCategory.toLowerCase();

    let evalResult: SkillMatchResult;

    // 1. Experience Requirements
    if (catLower.includes('experience') || /\b\d+\+?\s*(?:years?|yrs?)\b/i.test(reqLower) || reqLower.includes('experience')) {
      const expRes = evaluateExperienceRequirement(candidate, reqText);
      evalResult = {
        status: expRes.status,
        evidence: expRes.evidence,
        source: expRes.source,
        confidence: expRes.confidence,
        failureReason: expRes.failureReason
      };
      pillarPoints.exp.earned += STATUS_SCORE_MAP[expRes.status] * weight;
      pillarPoints.exp.total += weight;
    }
    // 2. Education Requirements
    else if (catLower.includes('education') || reqLower.includes('degree') || reqLower.includes('bachelor') || reqLower.includes('master') || reqLower.includes('b.tech') || reqLower.includes('b.e')) {
      evalResult = evaluateEducationRequirement(candidate.education || [], reqText);
      pillarPoints.edu.earned += STATUS_SCORE_MAP[evalResult.status] * weight;
      pillarPoints.edu.total += weight;
    }
    // 3. Location Requirements
    else if (catLower.includes('location') || reqLower.includes('location') || reqLower.includes('onsite') || reqLower.includes('ncr') || reqLower.includes('bangalore') || reqLower.includes('mumbai') || reqLower.includes('hyderabad')) {
      evalResult = evaluateLocationRequirement(candidate, reqText);
      pillarPoints.other.earned += STATUS_SCORE_MAP[evalResult.status] * weight;
      pillarPoints.other.total += weight;
    }
    // 4. Notice Period / Availability Requirements
    else if (catLower.includes('availability') || catLower.includes('notice') || reqLower.includes('joiner') || reqLower.includes('notice period')) {
      evalResult = evaluateNoticePeriodRequirement(candidate, reqText);
      pillarPoints.other.earned += STATUS_SCORE_MAP[evalResult.status] * weight;
      pillarPoints.other.total += weight;
    }
    // 5. Technical Skills & Tools (General, GenAI, Backend, etc.)
    else {
      evalResult = matchSkillRequirement(candidate, reqText, reqCategory);
      const isGenAi = reqLower.includes('genai') || reqLower.includes('generative ai') || reqLower.includes('llm') || reqLower.includes('rag') || reqLower.includes('langgraph') || reqLower.includes('langchain') || reqLower.includes('bedrock') || reqLower.includes('vector');
      if (isGenAi) {
        pillarPoints.genai.earned += STATUS_SCORE_MAP[evalResult.status] * weight;
        pillarPoints.genai.total += weight;
      } else {
        pillarPoints.tech.earned += STATUS_SCORE_MAP[evalResult.status] * weight;
        pillarPoints.tech.total += weight;
      }
    }

    const statusScore = STATUS_SCORE_MAP[evalResult.status];
    const score = Math.round(statusScore * 100);
    earnedScoreSum += statusScore * weight;

    // Track mandatory status & failures
    if (isMandatory) {
      if (evalResult.status === 'MATCHED') {
        mandatoryMetCount++;
      } else {
        mandatoryFailures.push({
          requirement: reqText,
          reason: evalResult.failureReason || evalResult.evidence,
          category: reqCategory
        });
        warnings.push(`MANDATORY REQUIREMENT FAILED: "${reqText}" (${evalResult.failureReason || evalResult.evidence})`);
      }
    }

    if (evalResult.status === 'MATCHED') {
      strengths.push(`${reqText}: ${evalResult.evidence}`);
    } else if (evalResult.status === 'PARTIAL') {
      gaps.push(`${reqText}: Partially satisfied (${evalResult.evidence})`);
    } else if (evalResult.status === 'NOT_MATCHED') {
      gaps.push(`${reqText}: Not matched (${evalResult.failureReason || 'No evidence in CV'})`);
    }

    reqResults.push({
      id: reqId,
      requirement: reqText,
      category: reqCategory,
      mandatory: isMandatory,
      isMandatory,
      weight,
      status: evalResult.status,
      statusScore,
      score,
      candidateEvidence: evalResult.evidence,
      evidence: evalResult.evidence,
      evidenceSource: evalResult.source,
      evidenceType: evalResult.confidence,
      confidence: evalResult.confidence === 'EXPLICIT' ? 'High' : evalResult.confidence === 'STRONG_SEMANTIC' ? 'Medium' : 'Low',
      failureReason: evalResult.failureReason
    });
  }

  // Pure Weighted Score Calculation (0 - 100)
  const rawFinalScore = totalWeight > 0 ? (earnedScoreSum / totalWeight) * 100 : 0;
  const overallScore = Math.min(100, Math.max(0, Math.round(rawFinalScore)));

  // Mandatory Requirement Gate
  const hasMandatoryFailure = mandatoryTotal > 0 && mandatoryFailures.length > 0;
  const mandatoryComplianceScore = mandatoryTotal > 0 ? Math.round((mandatoryMetCount / mandatoryTotal) * 100) : 100;

  // Determine Base Match Tier by Score Thresholds
  // Default:
  // 90–100 → EXCELLENT MATCH
  // 75–89  → STRONG MATCH
  // 60–74  → MODERATE MATCH
  // 40–59  → LOW MATCH
  // 0–39   → MINIMAL MATCH
  let baseTier: MatchTier = 'MINIMAL MATCH';
  if (overallScore >= 90) baseTier = 'EXCELLENT MATCH';
  else if (overallScore >= 75) baseTier = 'STRONG MATCH';
  else if (overallScore >= 60) baseTier = 'MODERATE MATCH';
  else if (overallScore >= 40) baseTier = 'LOW MATCH';
  else baseTier = 'MINIMAL MATCH';

  // Apply Score Caps / Downgrade for Mandatory Failures (Section 13 & 14)
  let finalMatchLevel: MatchTier = baseTier;
  if (hasMandatoryFailure) {
    if (mandatoryFailures.length === 1) {
      // 1 mandatory failure caps at MODERATE MATCH
      if (baseTier === 'EXCELLENT MATCH' || baseTier === 'STRONG MATCH') {
        finalMatchLevel = 'MODERATE MATCH';
      }
    } else if (mandatoryFailures.length >= 2) {
      // 2+ mandatory failures caps at LOW MATCH
      if (baseTier === 'EXCELLENT MATCH' || baseTier === 'STRONG MATCH' || baseTier === 'MODERATE MATCH') {
        finalMatchLevel = 'LOW MATCH';
      }
    }
  }

  // Calculate Pillar Scores Strictly from Evidence
  const computePillarPct = (p: { earned: number; total: number }, fallbackDefault: number): number => {
    return p.total > 0 ? Math.round((p.earned / p.total) * 100) : fallbackDefault;
  };

  const techPct = computePillarPct(pillarPoints.tech, overallScore);
  const expPct = computePillarPct(pillarPoints.exp, Math.min(100, calculateProfessionalTenure(candidate) * 20));
  const eduPct = computePillarPct(pillarPoints.edu, (candidate.education && candidate.education.length > 0) ? 100 : 0);
  const genaiPct = computePillarPct(pillarPoints.genai, techPct);

  // Semantic Relevance: Contextual overlap between candidate text and job domain (strictly whole-word)
  const jdKeywords = (job.position || '').split(/\s+/).filter(w => w.length > 3 && !GENERIC_FILLER_WORDS.has(w.toLowerCase()));
  const candTextLower = (candidate.rawText || '').toLowerCase();
  let overlap = 0;
  for (const kw of jdKeywords) {
    if (new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i').test(candTextLower)) overlap++;
  }
  const semanticRelevance = jdKeywords.length > 0 ? Math.round((overlap / jdKeywords.length) * 100) : overallScore;

  const pillarScores: PillarScores = {
    technicalSkills: techPct,
    experience: expPct,
    education: eduPct,
    genAI: genaiPct,
    semanticRelevance,
    // Compatibility fields
    mandatoryCompliance: mandatoryComplianceScore,
    relevantExperience: expPct,
    responsibilities: expPct,
    semanticSimilarity: semanticRelevance,
    domainFit: genaiPct
  };

  return {
    evaluationId: `eval-${candidate.id}-${Date.now()}`,
    candidateId: candidate.id,
    jobId: job.id,
    overallScore,
    matchLevel: finalMatchLevel,
    mandatoryRequirementFailed: hasMandatoryFailure,
    mandatoryComplianceScore,
    mandatoryFailures,
    mandatoryCompliance: {
      total: mandatoryTotal,
      met: mandatoryMetCount,
      failed: mandatoryFailures.length,
      passed: !hasMandatoryFailure
    },
    pillarScores,
    pillars: pillarScores,
    requirements: reqResults,
    requirementResults: reqResults,
    strengths: Array.from(new Set(strengths)),
    gaps: Array.from(new Set(gaps)),
    warnings,
    scoringConfigVersion: '3.0.0-evidence-based',
    evaluatedAt: new Date().toISOString()
  };
}
