import prisma from '../config/prisma';
import { CandidateRecord } from '../controllers/candidateController';
import {
  calculateATSScore,
  ATSScoringResult,
  MatchStatus,
  EvidenceConfidence,
  MatchTier,
  MandatoryFailureDetail,
  PillarScores
} from './atsScoringEngine';

export type EvaluationStatus =
  | 'MATCHED'
  | 'PARTIAL'
  | 'NOT_MATCHED'
  | 'UNKNOWN'
  | 'FULLY MET'
  | 'PARTIALLY MET'
  | 'NOT MET'
  | 'NOT FOUND';

export interface RequirementEvaluationResult {
  id: string;
  requirement: string;
  category: string;
  mandatory: boolean;
  isMandatory: boolean;
  evidence: string;
  candidateEvidence: string;
  evidenceSource: string;
  status: MatchStatus;
  confidence: 'High' | 'Medium' | 'Low';
  weight: number;
  score: number;
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
  overallScore: number;
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
  recommendation: 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT';
  recommendationReason: string;
  pillarScores: PillarScores;
  pillars: PillarScores;
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
    matched: number;
    partial: number;
    notMatched: number;
    unknown: number;
    // Compatibility fields
    fullyMet: number;
    partiallyMet: number;
    notMet: number;
    needsVerification: number;
    notFound: number;
  };
  requirements: RequirementEvaluationResult[];
  requirementResults: RequirementEvaluationResult[];
  explanation: {
    summary: string;
    strengths: string[];
    gaps: string[];
    mandatoryStatus: string;
  };
  strengths: string[];
  gaps: string[];
  warnings: string[];
  scoringConfigVersion: string;
  evaluatedAt: string;
  evaluator: string;
}

/**
 * Evaluates a single candidate against a job's confirmed requirements deterministically
 * Using the Evidence-Based ATS Engine
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

  const mappedReqs: RequirementEvaluationResult[] = result.requirements.map(r => ({
    id: r.id,
    requirement: r.requirement,
    category: r.category,
    mandatory: r.mandatory,
    isMandatory: r.mandatory,
    evidence: r.candidateEvidence,
    candidateEvidence: r.candidateEvidence,
    evidenceSource: r.evidenceSource,
    status: r.status,
    confidence: r.confidence,
    weight: r.weight,
    score: r.score,
    failureReason: r.failureReason,
    evidenceType: r.evidenceType
  }));

  const mandatoryTotal = result.mandatoryCompliance.total;
  const mandatoryMet = result.mandatoryCompliance.met;
  const mandatoryFailed = result.mandatoryCompliance.failed;

  let recommendation: 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT' = 'REVIEW';
  let recommendationReason = 'Candidate meets core qualifications and requires recruiter review.';

  if (result.mandatoryRequirementFailed) {
    recommendation = 'DO NOT SUBMIT';
    const failedNames = result.mandatoryFailures.map(f => f.requirement).join(', ');
    recommendationReason = `Critical mandatory requirement failed: ${failedNames || 'Mandatory prerequisite not satisfied'}.`;
  } else if (result.overallScore >= 75) {
    recommendation = 'SUBMIT';
    recommendationReason = 'Strong qualification alignment across mandatory requirements, technical stack, and verified experience.';
  } else if (result.overallScore < 50) {
    recommendation = 'DO NOT SUBMIT';
    recommendationReason = 'Candidate overall fit is below threshold for this position.';
  }

  const matchedCount = mappedReqs.filter(r => r.status === 'MATCHED').length;
  const partialCount = mappedReqs.filter(r => r.status === 'PARTIAL').length;
  const notMatchedCount = mappedReqs.filter(r => r.status === 'NOT_MATCHED').length;
  const unknownCount = mappedReqs.filter(r => r.status === 'UNKNOWN').length;

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
    mandatoryFailures: result.mandatoryFailures,
    mandatoryCompliance: {
      total: mandatoryTotal,
      met: mandatoryMet,
      failed: mandatoryFailed,
      passed: !result.mandatoryRequirementFailed
    },
    recommendation,
    recommendationReason,
    pillarScores: result.pillarScores,
    pillars: result.pillarScores,
    scoreBreakdown: {
      mandatory: {
        score: result.mandatoryComplianceScore,
        max: 100,
        pct: result.mandatoryComplianceScore,
        label: mandatoryTotal > 0 ? `Mandatory Compliance (${mandatoryMet}/${mandatoryTotal})` : 'Mandatory Compliance (N/A)'
      },
      skills: {
        score: result.pillarScores.technicalSkills,
        max: 100,
        pct: result.pillarScores.technicalSkills,
        label: 'Technical Skills'
      },
      experience: {
        score: result.pillarScores.experience,
        max: 100,
        pct: result.pillarScores.experience,
        label: 'Experience'
      },
      responsibilities: {
        score: result.pillarScores.genAI,
        max: 100,
        pct: result.pillarScores.genAI,
        label: 'GenAI & Domain Fit'
      },
      preferred: {
        score: result.pillarScores.education,
        max: 100,
        pct: result.pillarScores.education,
        label: 'Education'
      }
    },
    summaryCounts: {
      mandatoryTotal,
      preferredTotal: mappedReqs.filter(r => !r.mandatory).length,
      matched: matchedCount,
      partial: partialCount,
      notMatched: notMatchedCount,
      unknown: unknownCount,
      // Compatibility fields
      fullyMet: matchedCount,
      partiallyMet: partialCount,
      notMet: notMatchedCount,
      needsVerification: unknownCount,
      notFound: notMatchedCount
    },
    requirements: mappedReqs,
    requirementResults: mappedReqs,
    strengths: result.strengths,
    gaps: result.gaps,
    warnings: result.warnings,
    explanation: {
      summary: `${result.matchLevel} (${result.overallScore}% Overall Score). ${mandatoryTotal > 0 ? `Mandatory: ${mandatoryMet}/${mandatoryTotal}` : 'No mandatory constraints'}.`,
      strengths: result.strengths,
      gaps: result.gaps,
      mandatoryStatus: result.mandatoryRequirementFailed ? 'FAILED' : 'PASSED'
    },
    scoringConfigVersion: result.scoringConfigVersion,
    evaluatedAt: result.evaluatedAt,
    evaluator: 'Evidence-Based ATS Engine (v3.0)'
  };

  return payload;
}
