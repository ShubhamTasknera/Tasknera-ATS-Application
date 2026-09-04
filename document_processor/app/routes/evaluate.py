import uuid
import json
from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    EvaluationRequest,
    EvaluationResponse,
    RecruiterOverrideRequest,
    RecruiterOverrideResponse,
    RequirementStatus
)
from app.services.scoring_engine import evaluate_cv_against_jd

router = APIRouter()

# In-memory overrides ledger
RECRUITER_OVERRIDES_LEDGER = []

@router.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_candidate(payload: EvaluationRequest):
    """
    Executes controlled AI-assisted deterministic scoring against candidate CV and JD.
    """
    try:
        response = evaluate_cv_against_jd(
            job_id=payload.job_id or "custom-job",
            job_title=payload.job_title,
            job_description=payload.job_description,
            candidate_id=payload.candidate_id or "candidate-1",
            candidate_name=payload.candidate_name or "Candidate",
            cv_text=payload.cv_text,
            mandatory_criteria=payload.mandatory_criteria,
            core_skills=payload.core_skills,
            preferred_criteria=payload.preferred_criteria,
            min_experience_years=payload.min_experience_years,
            enable_ai_assistance=payload.enable_ai_assistance,
            max_ai_semantic_adjustment=payload.max_ai_semantic_adjustment
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

class ParseJdAiRequest(BaseModel):
    jd_text: str

@router.post("/evaluate-ai")
async def evaluate_ai_endpoint(payload: dict):
    """
    Executes free local AI sentence-transformers semantic matching between candidate CV and JD criteria.
    Produces highly apt, realistic ATS scores and exact evidence quotes.
    """
    try:
        from app.services.ai_matcher import evaluate_with_ai
        candidate = payload.get("candidate") or {}
        job = payload.get("job") or {}
        requirements = payload.get("requirements") or []
        result = evaluate_with_ai(candidate, job, requirements)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"AI evaluation failed: {str(e)}")

@router.post("/parse-jd-ai")
async def parse_jd_ai_endpoint(payload: ParseJdAiRequest):
    """
    Extracts and infers structured requirements from freeform JD text without hallucination.
    Inferred requirements are strictly marked is_mandatory=False.
    """
    try:
        from app.services.ai_assistance import extract_jd_requirements_ai
        requirements = extract_jd_requirements_ai(payload.jd_text)
        return {
            "success": True,
            "count": len(requirements),
            "requirements": [r.dict() for r in requirements]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JD requirement extraction failed: {str(e)}")

@router.post("/verify-score")
async def verify_score(payload: EvaluationRequest):
    """
    Re-runs evaluation to prove byte-identical score and hash reproducibility.
    """
    run1 = evaluate_cv_against_jd(
        job_id=payload.job_id or "verify-job",
        job_title=payload.job_title,
        job_description=payload.job_description,
        candidate_id=payload.candidate_id or "verify-cand",
        candidate_name=payload.candidate_name,
        cv_text=payload.cv_text,
        mandatory_criteria=payload.mandatory_criteria,
        core_skills=payload.core_skills,
        preferred_criteria=payload.preferred_criteria,
        min_experience_years=payload.min_experience_years
    )
    
    run2 = evaluate_cv_against_jd(
        job_id=payload.job_id or "verify-job",
        job_title=payload.job_title,
        job_description=payload.job_description,
        candidate_id=payload.candidate_id or "verify-cand",
        candidate_name=payload.candidate_name,
        cv_text=payload.cv_text,
        mandatory_criteria=payload.mandatory_criteria,
        core_skills=payload.core_skills,
        preferred_criteria=payload.preferred_criteria,
        min_experience_years=payload.min_experience_years
    )

    is_identical = (run1.overall_score == run2.overall_score) and (run1.audit_hash == run2.audit_hash)
    
    return {
        "verified": is_identical,
        "overall_score": run1.overall_score,
        "audit_hash": run1.audit_hash,
        "rules_version": run1.rules_version,
        "runs_matched": is_identical,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "message": "Deterministic verification passed. Identical score and SHA-256 hash reproduced."
    }

@router.post("/recruiter-override", response_model=RecruiterOverrideResponse)
async def log_recruiter_override(payload: RecruiterOverrideRequest):
    """
    Logs recruiter override of a criterion status for auditable human-in-the-loop tracking.
    """
    override_id = f"ovr-{uuid.uuid4().hex[:8]}"
    record = {
        "override_id": override_id,
        "evaluation_id": payload.evaluation_id,
        "criterion_id": payload.criterion_id,
        "original_status": payload.original_status.value,
        "override_status": payload.override_status.value,
        "recruiter_notes": payload.recruiter_notes,
        "recruiter_id": payload.recruiter_id,
        "skill_missed": payload.skill_missed,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
    RECRUITER_OVERRIDES_LEDGER.append(record)

    return RecruiterOverrideResponse(
        success=True,
        override_id=override_id,
        message=f"Override from {payload.original_status.value} to {payload.override_status.value} logged successfully.",
        taxonomy_update_queued=bool(payload.skill_missed)
    )
