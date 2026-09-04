from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class RequirementStatus(str, Enum):
    FULLY_MET = "FULLY_MET"
    PARTIALLY_MET = "PARTIALLY_MET"
    NOT_MET = "NOT_MET"
    NOT_FOUND = "NOT_FOUND"
    NEEDS_VERIFICATION = "NEEDS_VERIFICATION"

class AiMatchState(str, Enum):
    MATCH = "MATCH"
    NO_MATCH = "NO_MATCH"
    UNCERTAIN = "UNCERTAIN"

class AiEvidenceSnippet(BaseModel):
    requirement: str
    cv_evidence: str
    match_state: AiMatchState
    match_type: str = "Semantic"  # "Exact", "Synonym", "Equivalent", "Semantic", "None"
    confidence: str = "HIGH"  # "HIGH", "MEDIUM", "LOW"
    source_location: Optional[str] = None

class AiJdRequirement(BaseModel):
    id: str
    requirement: str
    category: str
    source_evidence: str
    confidence: str = "HIGH"
    is_inferred: bool = True
    is_mandatory: bool = False
    weight: float = 1.0

class Recommendation(str, Enum):
    STRONG_MATCH = "STRONG_MATCH"
    MATCH = "MATCH"
    BORDERLINE = "BORDERLINE"
    DO_NOT_SUBMIT = "DO NOT SUBMIT"

class EducationItem(BaseModel):
    degree: str
    institution: Optional[str] = None
    year: Optional[str] = None

class RoleTenure(BaseModel):
    title: str
    company: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_months: int = 0
    is_relevant: bool = False
    relevance_reasons: List[str] = []

class CandidateExperienceBreakdown(BaseModel):
    total_experience_years: float = 0.0
    relevant_experience_years: float = 0.0
    roles: List[RoleTenure] = []

class DocumentParseResponse(BaseModel):
    success: bool
    fileName: str
    fileType: str
    pageCount: int
    extractionMethod: str
    ocrUsed: bool
    textQuality: str
    characterCount: int
    wordCount: int
    text: str
    layoutText: Optional[str] = ""
    normalizedText: Optional[str] = ""
    # Structured CV Fields
    candidateName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    yearsOfExperience: Optional[str] = None
    relevantExperienceYears: Optional[float] = None
    totalExperienceYears: Optional[float] = None
    education: List[Dict[str, Any]] = []
    pastCompanies: List[str] = []
    summary: Optional[str] = None
    rawTextSummary: Optional[str] = None
    error: Optional[str] = None

class BatchDocumentParseResponse(BaseModel):
    success: bool
    totalFiles: int
    successfulCount: int
    failedCount: int
    results: List[DocumentParseResponse]

# Deterministic Evaluation Schemas
class JdCriterion(BaseModel):
    id: str
    requirement: str
    category: str  # "Mandatory", "Core Skill", "Relevant Experience", "Responsibilities", "Preferred"
    weight: float = 1.0
    minimum_years: Optional[float] = None

class CriterionEvaluation(BaseModel):
    criterion_id: str
    requirement: str
    category: str
    status: RequirementStatus
    score: float
    max_score: float
    evidence_quote: Optional[str] = None
    source_section: Optional[str] = None
    confidence_score: float = 1.0
    explanation: str
    matched_terms: List[str] = []
    # Controlled AI Fields
    ai_match_state: Optional[AiMatchState] = None
    ai_evidence: Optional[str] = None
    ai_confidence: Optional[str] = None
    ai_match_type: Optional[str] = None
    is_inferred: bool = False
    jd_source_evidence: Optional[str] = None

class CategoryScore(BaseModel):
    category: str
    score: float
    max_score: float
    percentage: float

class AtsCompatibilityReport(BaseModel):
    score: int
    readability: str
    standard_headings_found: List[str]
    missing_headings: List[str]
    formatting_issues: List[str]
    recommendations: List[str]

class EvaluationRequest(BaseModel):
    job_id: Optional[str] = "custom-job"
    job_title: str
    job_description: str
    candidate_id: Optional[str] = "candidate-1"
    candidate_name: str = "Candidate"
    cv_text: str
    rules_version: str = "2.1.0"
    mandatory_criteria: Optional[List[str]] = None
    core_skills: Optional[List[str]] = None
    preferred_criteria: Optional[List[str]] = None
    min_experience_years: Optional[float] = None
    enable_ai_assistance: bool = True
    max_ai_semantic_adjustment: float = 8.0

class EvaluationResponse(BaseModel):
    job_id: str
    candidate_id: str
    candidate_name: str
    rules_version: str = "2.1.0"
    overall_score: float
    base_deterministic_score: float = 0.0
    ai_semantic_adjustment: float = 0.0
    ai_assistance_enabled: bool = False
    ai_fallback_triggered: bool = False
    inferred_requirements_count: int = 0
    max_possible_score: float = 100.0
    recommendation: Recommendation
    mandatory_passed: bool
    knockout_reasons: List[str] = []
    category_breakdown: Dict[str, CategoryScore]
    criteria_evaluations: List[CriterionEvaluation]
    experience_breakdown: CandidateExperienceBreakdown
    ats_compatibility: AtsCompatibilityReport
    audit_hash: str
    deterministic_audit_summary: str
    template_explanation: str
    timestamp: str

class RecruiterOverrideRequest(BaseModel):
    evaluation_id: str
    criterion_id: str
    original_status: RequirementStatus
    override_status: RequirementStatus
    recruiter_notes: str
    recruiter_id: str
    skill_missed: Optional[str] = None

class RecruiterOverrideResponse(BaseModel):
    success: bool
    override_id: str
    message: str
    taxonomy_update_queued: bool
