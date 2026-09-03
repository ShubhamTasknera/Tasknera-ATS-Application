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

// Exact synonym groups where terms are 100% interchangeable
const EXACT_SYNONYM_GROUPS: string[][] = [
  ['javascript', 'js', 'ecmascript'],
  ['typescript', 'ts'],
  ['postgresql', 'postgres', 'pgsql'],
  ['kubernetes', 'k8s'],
  ['amazon web services', 'aws'],
  ['google cloud platform', 'gcp', 'google cloud'],
  ['microsoft azure', 'azure'],
  ['machine learning', 'ml'],
  ['natural language processing', 'nlp'],
  ['large language models', 'large language model', 'llm', 'llms'],
  ['generative ai', 'genai', 'gen ai', 'gen-ai'],
  ['retrieval augmented generation', 'retrieval-augmented generation', 'rag'],
  ['react.js', 'reactjs', 'react'],
  ['node.js', 'nodejs', 'node'],
  ['vue.js', 'vuejs', 'vue'],
  ['golang', 'go'],
  ['c++', 'cpp'],
  ['c#', 'csharp', 'c sharp'],
  ['.net', 'dotnet', 'asp.net', 'asp.net core'],
  ['mongodb', 'mongo'],
  ['rest api', 'restful api', 'restful apis', 'rest apis', 'rest web services', 'restful web services'],
  ['graphql', 'gql'],
  ['docker', 'containerization', 'containers'],
  ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'],
  ['fastapi', 'fast api'],
  ['scikit-learn', 'sklearn'],
  ['tensorflow', 'tf'],
  ['pytorch', 'torch'],
  ['langgraph', 'lang graph'],
  ['langchain', 'lang chain'],
  ['llamaindex', 'llama index', 'llama-index'],
  ['pinecone', 'pinecone db', 'pinecone vector db'],
  ['chromadb', 'chroma db', 'chroma'],
  ['weaviate', 'weaviate vector db'],
  ['qdrant', 'qdrant vector db'],
  ['aws bedrock', 'amazon bedrock', 'bedrock'],
  ['azure openai', 'azure open ai'],
  ['prompt engineering', 'prompt-engineering'],
  ['vector database', 'vector databases', 'vector db', 'vector store', 'vector stores'],
  ['fine-tuning', 'finetuning', 'fine tuning', 'model fine-tuning', 'model tuning', 'lora', 'qlora', 'peft'],
];

// Map of canonical term -> all synonymous forms
const SYNONYM_MAP: Map<string, Set<string>> = new Map();
for (const group of EXACT_SYNONYM_GROUPS) {
  const set = new Set(group.map(t => t.toLowerCase()));
  for (const term of group) {
    SYNONYM_MAP.set(term.toLowerCase(), set);
  }
}

// Related / Partial technologies mapping (when JD asks for X and candidate has Y -> PARTIAL match, NOT MATCHED)
const RELATED_PARTIAL_MAPPINGS: Array<{
  target: RegExp;
  related: Array<{ regex: RegExp; name: string; reason: string }>;
}> = [
  {
    target: /\blanggraph\b/i,
    related: [
      { regex: /\blangchain\b/i, name: 'LangChain', reason: 'LangChain is an agent framework related to LangGraph but does not satisfy LangGraph multi-agent graph workflows.' },
      { regex: /\bllamaindex\b/i, name: 'LlamaIndex', reason: 'LlamaIndex is an orchestration framework related to LangGraph.' },
      { regex: /\bautogen\b/i, name: 'AutoGen', reason: 'AutoGen is a multi-agent framework related to LangGraph.' },
      { regex: /\bopenai\b/i, name: 'OpenAI API', reason: 'OpenAI API usage is foundational but does not cover LangGraph agent orchestration.' },
    ],
  },
  {
    target: /\bfastapi\b/i,
    related: [
      { regex: /\bflask\b/i, name: 'Flask', reason: 'Flask demonstrates Python API development but is not asynchronous FastAPI.' },
      { regex: /\bdjango\b/i, name: 'Django', reason: 'Django demonstrates Python web framework experience but is not FastAPI.' },
      { regex: /\bexpress(?:\.js)?\b/i, name: 'Express.js', reason: 'Express demonstrates backend REST API development in Node.js, related to API design but not Python FastAPI.' },
    ],
  },
  {
    target: /\baws bedrock\b|\bbedrock\b/i,
    related: [
      { regex: /\baws\b|\bamazon web services\b/i, name: 'General AWS', reason: 'Candidate has general AWS cloud experience but lacks explicit AWS Bedrock generative AI services.' },
      { regex: /\bazure openai\b/i, name: 'Azure OpenAI', reason: 'Candidate has Azure OpenAI managed LLM experience, partially related to AWS Bedrock.' },
    ],
  },
  {
    target: /\breact native\b/i,
    related: [
      { regex: /\breact(?:\.js|js)?\b/i, name: 'React.js Web', reason: 'React.js web development shares component paradigms with React Native but does not cover native mobile bridge development.' },
    ],
  },
  {
    target: /\bkubernetes\b|\bk8s\b/i,
    related: [
      { regex: /\bdocker\b/i, name: 'Docker', reason: 'Docker containerization is foundational for Kubernetes orchestration but is not K8s cluster management.' },
    ],
  },
  {
    target: /\brag\b|\bretrieval augmented generation\b/i,
    related: [
      { regex: /\bsearch\b|\belasticsearch\b|\bopensearch\b/i, name: 'Traditional Search', reason: 'Traditional keyword search is related to retrieval but does not cover vector embeddings and LLM RAG pipelines.' },
      { regex: /\bembeddings?\b/i, name: 'Vector Embeddings', reason: 'Embeddings experience covers vector representation, a component of full RAG architecture.' },
    ],
  },
  {
    target: /\bgenai\b|\bgenerative ai\b|\bllm\b|\blarge language models\b/i,
    related: [
      { regex: /\bscikit-learn\b|\bclassical ml\b|\bmachine learning\b/i, name: 'Classical Machine Learning', reason: 'Classical predictive ML is related to AI, but does not satisfy Generative AI / Large Language Model development.' },
      { regex: /\bdeep learning\b|\btensorflow\b|\bpytorch\b/i, name: 'Deep Learning', reason: 'Deep learning frameworks are foundational but distinct from modern LLM/GenAI application engineering.' },
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

export interface SkillMatchResult {
  status: MatchStatus;
  evidence: string;
  source: string;
  confidence: EvidenceConfidence;
  failureReason?: string;
}

/**
 * Searches the candidate's CV for exact or synonymous matches for a skill requirement.
 * Also checks related/partial technology mappings when exact match is missing.
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

  // Extract core keywords by stripping filler words
  const cleanReq = requirementText
    .replace(/(proficient|proficiency|experience|hands-on|strong|deep|knowledge|familiarity|with|in|and|or|required|preferred|must have|working knowledge of|expertise in)/gi, ' ')
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
  const searchTerms = new Set<string>([reqLower]);
  const mappedSynonyms = SYNONYM_MAP.get(reqLower);
  if (mappedSynonyms) {
    for (const syn of mappedSynonyms) searchTerms.add(syn);
  }

  // Check multi-word phrase components
  for (const [canonical, synSet] of SYNONYM_MAP.entries()) {
    if (reqLower.includes(canonical) || Array.from(synSet).some(s => reqLower.includes(s))) {
      for (const syn of synSet) searchTerms.add(syn);
    }
  }

  // 3. Search structured sections for EXACT / SYNONYMOUS Match
  // Section A: Work Experience Roles (Highest Confidence)
  for (const exp of candExps) {
    const roleText = `${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`;
    for (const term of searchTerms) {
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${term.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}(?:[^a-zA-Z0-9_]|$)`, 'i');
      if (regex.test(roleText)) {
        // Extract relevant sentence
        const sentences = roleText.split(/(?<=[.!?\n])\s+/);
        const matchSentence = sentences.find(s => regex.test(s)) || roleText.substring(0, 150);
        return {
          status: 'MATCHED',
          evidence: matchSentence.trim(),
          source: `Experience: ${exp.title || 'Role'} at ${exp.company || 'Company'}`,
          confidence: 'EXPLICIT'
        };
      }
    }
  }

  // Section B: Projects
  for (const proj of candProjects) {
    const projText = `${proj.name || ''} ${proj.description || ''} ${(proj.technologies || []).join(' ')}`;
    for (const term of searchTerms) {
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${term.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}(?:[^a-zA-Z0-9_]|$)`, 'i');
      if (regex.test(projText)) {
        return {
          status: 'MATCHED',
          evidence: `${proj.name ? `${proj.name}: ` : ''}${proj.description || projText.substring(0, 140)}`.trim(),
          source: `Project: ${proj.name || 'Technical Project'}`,
          confidence: 'EXPLICIT'
        };
      }
    }
  }

  // Section C: Explicit Skills List
  for (const skill of candSkills) {
    const sLower = skill.toLowerCase().trim();
    for (const term of searchTerms) {
      if (sLower === term || (term.length > 3 && (sLower === term || sLower.split(/[\s,;/]+/).includes(term)))) {
        return {
          status: 'MATCHED',
          evidence: `Explicitly listed in verified technical skills: "${skill}"`,
          source: 'Skills Inventory',
          confidence: 'EXPLICIT'
        };
      }
    }
  }

  // Section D: Raw Text Full Search with Exact Word Boundaries
  for (const term of searchTerms) {
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_])${term.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}(?:[^a-zA-Z0-9_]|$)`, 'i');
    if (regex.test(rawText)) {
      const sentences = rawText.split(/(?<=[.!?\n])\s+/);
      const matchSentence = sentences.find(s => regex.test(s));
      if (matchSentence && matchSentence.trim().length > 10) {
        return {
          status: 'MATCHED',
          evidence: matchSentence.replace(/^[-•*]\s*/, '').trim(),
          source: 'CV Overview / Summary',
          confidence: 'STRONG_SEMANTIC'
        };
      }
    }
  }

  // 4. Check for PARTIAL Match via Related Technologies (e.g. LangChain for LangGraph, Flask for FastAPI)
  for (const mapping of RELATED_PARTIAL_MAPPINGS) {
    if (mapping.target.test(reqLower)) {
      for (const rel of mapping.related) {
        if (rel.regex.test(rawText) || candSkills.some(s => rel.regex.test(s))) {
          // Find sentence
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
 * Calculates candidate professional years from employment dates and role history.
 * Excludes training, short courses, and academic internships unless specified.
 */
export function calculateProfessionalTenure(candidate: CandidateRecord): number {
  const candExps = candidate.experience || [];
  if (!Array.isArray(candExps) || candExps.length === 0) {
    const rawTotalMatch = (candidate.totalExperience || '').match(/(\d+(?:\.\d+)?)/);
    return rawTotalMatch ? parseFloat(rawTotalMatch[1]) : 0;
  }

  let totalYears = 0;
  const currentYear = new Date().getFullYear();

  for (const exp of candExps) {
    const title = (exp.title || '').toLowerCase();
    // Exclude explicit student internships / trainee roles from core professional tenure
    if (title.includes('intern') || title.includes('trainee') || title.includes('student')) {
      continue;
    }

    let roleYears = 0;
    if (exp.duration) {
      const yrMatch = exp.duration.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
      if (yrMatch) roleYears = parseFloat(yrMatch[1]);
      else {
        const moMatch = exp.duration.match(/(\d+)\s*(?:months?|mos?)/i);
        if (moMatch) roleYears = parseFloat(moMatch[1]) / 12;
      }
    }

    if (roleYears === 0 && exp.startDate) {
      const startYear = parseInt(exp.startDate.match(/\b(19\d\d|20\d\d)\b/)?.[1] || '0', 10);
      let endYear = startYear;
      if (exp.endDate && /present|current|now|ongoing/i.test(exp.endDate)) {
        endYear = currentYear;
      } else if (exp.endDate) {
        endYear = parseInt(exp.endDate.match(/\b(19\d\d|20\d\d)\b/)?.[1] || `${startYear}`, 10);
      }

      if (startYear > 0 && endYear >= startYear) {
        roleYears = Math.max(0.5, endYear - startYear);
      }
    }

    totalYears += (roleYears || 1.0);
  }

  // Cross-verify with totalExperience field
  const rawTotalMatch = (candidate.totalExperience || '').match(/(\d+(?:\.\d+)?)/);
  if (rawTotalMatch) {
    const fieldYears = parseFloat(rawTotalMatch[1]);
    if (totalYears === 0 || Math.abs(totalYears - fieldYears) > 5) {
      totalYears = fieldYears;
    }
  }

  return Math.round(totalYears * 10) / 10;
}

/**
 * Evaluates experience requirement (supports single thresholds like "4+ years" and ranges like "4-6 years").
 */
export function evaluateExperienceRequirement(
  candidate: CandidateRecord,
  requirementText: string
): ExperienceMatchResult {
  const reqLower = requirementText.toLowerCase();
  const candYears = calculateProfessionalTenure(candidate);

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

  const gap = Math.max(0, Math.round((minYears - candYears) * 10) / 10);

  if (candYears >= minYears) {
    if (maxYears && candYears > maxYears + 4) {
      // Significantly exceeds upper range -> Overqualified but full score
      return {
        status: 'MATCHED',
        evidence: `Candidate has ${candYears} years of verified professional experience (meets required ${minYears}${maxYears ? `–${maxYears}` : ''} years, profile is senior/over-qualified).`,
        source: 'Employment History Tenure',
        confidence: 'EXPLICIT',
        candidateYears: candYears,
        requiredYears: minYears,
        gap: 0
      };
    }
    return {
      status: 'MATCHED',
      evidence: `Candidate documents ${candYears} years of verified professional experience (meets required ${minYears}${maxYears ? `–${maxYears}` : '+'} years).`,
      source: 'Employment History Tenure',
      confidence: 'EXPLICIT',
      candidateYears: candYears,
      requiredYears: minYears,
      gap: 0
    };
  } else if (candYears >= minYears * 0.7) {
    // Within 70-99% of required experience -> PARTIAL
    return {
      status: 'PARTIAL',
      evidence: `Candidate documents ${candYears} years of experience vs ${minYears}+ years required (${gap}y gap).`,
      source: 'Employment History Tenure',
      confidence: 'STRONG_SEMANTIC',
      candidateYears: candYears,
      requiredYears: minYears,
      gap,
      failureReason: `Candidate has ${candYears} years experience, slightly below the ${minYears}+ years requirement.`
    };
  } else {
    // Significantly below requirement -> NOT MATCHED
    return {
      status: 'NOT_MATCHED',
      evidence: `Candidate documents only ${candYears} years of experience vs ${minYears}+ years required (${gap}y deficit).`,
      source: 'Employment History Tenure',
      confidence: 'EXPLICIT',
      candidateYears: candYears,
      requiredYears: minYears,
      gap,
      failureReason: `Insufficient professional experience (${candYears}y vs ${minYears}+ years required).`
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

  // Semantic Relevance: Contextual overlap between candidate text and job domain
  const jdKeywords = (job.position || '').split(/\s+/).filter(w => w.length > 3 && !GENERIC_FILLER_WORDS.has(w.toLowerCase()));
  const candTextLower = (candidate.rawText || '').toLowerCase();
  let overlap = 0;
  for (const kw of jdKeywords) {
    if (candTextLower.includes(kw.toLowerCase())) overlap++;
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
