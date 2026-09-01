import prisma from '../config/prisma';
import { CandidateRecord } from '../controllers/candidateController';
import { calculateATSScore, ATSScoringResult, RequirementEvaluationStatus, EvidenceConfidence, MatchTier } from './atsScoringEngine';

export type EvaluationStatus =
  | 'FULLY MET'
  | 'PARTIALLY MET'
  | 'NOT MET'
  | 'NOT FOUND'
  | 'NEEDS VERIFICATION';

export interface RequirementEvaluationResult {
  id: string;
  requirement: string;
  category: string;
  isMandatory: boolean;
  evidence: string;
  status: EvaluationStatus;
  confidence: 'High' | 'Medium' | 'Low';
  weight: number;
  failureReason?: string;
  verificationNote?: string;
  evidenceType?: EvidenceConfidence;
}

export interface CandidateEvaluationPayload {
  evaluationId?: string;
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  candidateCompany: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateLocation: string;
  jobId: string;
  jobTitle: string;
  jobClient: string;
  overallMatch: number;
  atsScore: number;
  overallScore?: number;
  matchLevel?: MatchTier;
  mandatoryRequirementFailed?: boolean;
  mandatoryComplianceScore?: number;
  mandatoryCompliance: {
    total: number;
    met: number;
    failed: number;
    passed: boolean;
  };
  recommendation: 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT';
  recommendationReason: string;
  pillars?: {
    mandatoryCompliance: number;
    technicalSkills: number;
    relevantExperience: number;
    responsibilities: number;
    education: number;
    semanticSimilarity: number;
    domainFit: number;
  };
  scoreBreakdown: {
    mandatory: { score: number; max: number; pct: number; label: string };
    skills: { score: number; max: number; pct: number; label: string };
    experience: { score: number; max: number; pct: number; label: string };
    responsibilities: { score: number; max: number; pct: number; label: string };
    preferred: { score: number; max: number; pct: number; label: string };
  };
  summaryCounts: {
    mandatoryTotal: number;
    preferredTotal: number;
    fullyMet: number;
    partiallyMet: number;
    notMet: number;
    needsVerification: number;
    notFound: number;
  };
  requirements: RequirementEvaluationResult[];
  requirementResults?: any[];
  explanation: {
    summary: string;
    strengths: string[];
    gaps: string[];
    mandatoryStatus: string;
  };
  strengths?: string[];
  gaps?: string[];
  warnings?: string[];
  scoringConfigVersion?: string;
  evaluatedAt: string;
  evaluator: string;
}

/**
 * Evaluates a single candidate against a job's confirmed requirements deterministically
 * Using the Task 5 7-Pillar ATS Engine
 */
export function evaluateCandidateAgainstRequirements(
  candidate: CandidateRecord,
  job: { id: string; position?: string; title?: string; client?: string; company?: string; jd_text?: string },
  requirements: Array<{
    id: string;
    requirement: string;
    category?: string | null;
    weight?: number;
    is_mandatory?: boolean;
    isMandatory?: boolean;
    needs_verification?: boolean;
    source_evidence?: string | null;
  }>
): CandidateEvaluationPayload {
  // Execute deterministic engine
  const result: ATSScoringResult = calculateATSScore(candidate, job, requirements);

  const mappedReqs: RequirementEvaluationResult[] = result.requirementResults.map(r => ({
    id: r.id,
    requirement: r.requirement,
    category: r.category,
    isMandatory: r.isMandatory,
    evidence: r.evidence,
    status: (r.status.replace('_', ' ') as EvaluationStatus),
    confidence: r.confidence,
    weight: r.weight,
    failureReason: r.failureReason,
    evidenceType: r.evidenceType
  }));

  const mandatoryTotal = mappedReqs.filter(r => r.isMandatory).length;
  const mandatoryMet = mappedReqs.filter(r => r.isMandatory && r.status === 'FULLY MET').length;
  const mandatoryFailed = mappedReqs.filter(r => r.isMandatory && (r.status === 'NOT MET' || r.status === 'NOT FOUND')).length;

  let recommendation: 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT' = 'REVIEW';
  let recommendationReason = 'Candidate meets core qualifications and requires recruiter review.';

  if (result.mandatoryRequirementFailed) {
    recommendation = 'DO NOT SUBMIT';
    recommendationReason = 'Critical mandatory requirement failed. Candidate does not satisfy mandatory prerequisite.';
  } else if (result.overallScore >= 75) {
    recommendation = 'SUBMIT';
    recommendationReason = 'Strong qualification alignment across mandatory requirements, technical stack, and verified experience.';
  } else if (result.overallScore < 50) {
    recommendation = 'DO NOT SUBMIT';
    recommendationReason = 'Candidate overall fit is below threshold for this position.';
  }

  const payload: CandidateEvaluationPayload = {
    evaluationId: result.evaluationId,
    candidateId: candidate.id,
    candidateName: candidate.name || 'Candidate',
    candidateRole: candidate.currentTitle || job.position || 'Professional',
    candidateCompany: candidate.currentCompany || 'Organization',
    candidateEmail: candidate.email || '',
    candidatePhone: candidate.phone || '',
    candidateLocation: candidate.location || '',
    jobId: job.id,
    jobTitle: job.position || job.title || 'Job Position',
    jobClient: job.client || job.company || 'Client',
    overallMatch: Math.round(result.overallScore),
    atsScore: Math.round(result.overallScore),
    overallScore: result.overallScore,
    matchLevel: result.matchLevel,
    mandatoryRequirementFailed: result.mandatoryRequirementFailed,
    mandatoryComplianceScore: result.mandatoryComplianceScore,
    mandatoryCompliance: {
      total: mandatoryTotal,
      met: mandatoryMet,
      failed: mandatoryFailed,
      passed: !result.mandatoryRequirementFailed
    },
    recommendation,
    recommendationReason,
    pillars: result.pillars,
    scoreBreakdown: {
      mandatory: {
        score: result.pillars.mandatoryCompliance,
        max: 100,
        pct: result.pillars.mandatoryCompliance,
        label: 'Mandatory Compliance (30%)'
      },
      skills: {
        score: result.pillars.technicalSkills,
        max: 100,
        pct: result.pillars.technicalSkills,
        label: 'Technical Skills & Tools (25%)'
      },
      experience: {
        score: result.pillars.relevantExperience,
        max: 100,
        pct: result.pillars.relevantExperience,
        label: 'Relevant Experience (20%)'
      },
      responsibilities: {
        score: result.pillars.responsibilities,
        max: 100,
        pct: result.pillars.responsibilities,
        label: 'Responsibilities / Functional (10%)'
      },
      preferred: {
        score: result.pillars.education,
        max: 100,
        pct: result.pillars.education,
        label: 'Education & Certifications (5%)'
      }
    },
    summaryCounts: {
      mandatoryTotal,
      preferredTotal: mappedReqs.filter(r => !r.isMandatory).length,
      fullyMet: mappedReqs.filter(r => r.status === 'FULLY MET').length,
      partiallyMet: mappedReqs.filter(r => r.status === 'PARTIALLY MET').length,
      notMet: mappedReqs.filter(r => r.status === 'NOT MET').length,
      needsVerification: mappedReqs.filter(r => r.status === 'NEEDS VERIFICATION').length,
      notFound: mappedReqs.filter(r => r.status === 'NOT FOUND').length
    },
    requirements: mappedReqs,
    requirementResults: result.requirementResults,
    strengths: result.strengths,
    gaps: result.gaps,
    warnings: result.warnings,
    explanation: {
      summary: `${result.matchLevel} (${result.overallScore}% Overall Score). Mandatory Compliance: ${result.mandatoryComplianceScore}%.`,
      strengths: result.strengths,
      gaps: result.gaps,
      mandatoryStatus: result.mandatoryRequirementFailed ? 'FAILED' : 'PASSED'
    },
    scoringConfigVersion: result.scoringConfigVersion,
    evaluatedAt: result.evaluatedAt,
    evaluator: 'Deterministic ATS Engine (v2.0)'
  };

  return payload;
}
