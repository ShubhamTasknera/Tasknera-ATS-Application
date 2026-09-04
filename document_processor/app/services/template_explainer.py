from typing import List, Dict, Any
from app.models.schemas import CategoryScore, CriterionEvaluation, CandidateExperienceBreakdown, RequirementStatus

def generate_deterministic_explanation(
    candidate_name: str,
    job_title: str,
    overall_score: float,
    recommendation: str,
    mandatory_passed: bool,
    knockout_reasons: List[str],
    category_breakdown: Dict[str, CategoryScore],
    criteria_evaluations: List[CriterionEvaluation],
    experience_breakdown: CandidateExperienceBreakdown,
    audit_hash: str
) -> str:
    """
    Generates a structured, auditable, template-driven evaluation report.
    Guaranteed zero LLM hallucination: all values are pure arithmetic projections.
    """
    lines = []
    lines.append(f"# TaskNera Evaluation Audit: {candidate_name} for {job_title}")
    lines.append(f"**Evaluation Status:** {recommendation.replace('_', ' ')} | **Overall Score:** {overall_score} / 100.0")
    lines.append(f"**Verification Hash:** `{audit_hash}` | **Ruleset:** Evaluation Rules v2.1 (Deterministic Engine)")
    lines.append("")

    # 1. Executive Summary & Mandatory Knock-Out Status
    lines.append("## 1. Executive Determination")
    if not mandatory_passed:
        lines.append(f"⚠️ **MANDATORY KNOCK-OUT TRIGGERED**: Candidate scored {overall_score}/100, but is classified as **DO NOT SUBMIT** because one or more non-negotiable mandatory job requirements were NOT met:")
        for reason in knockout_reasons:
            lines.append(f"- ❌ {reason}")
    else:
        lines.append(f"✅ **ALL MANDATORY REQUIREMENTS MET**: Candidate successfully satisfied all critical threshold criteria. Final recommendation is **{recommendation.replace('_', ' ')}** based on arithmetic score {overall_score}/100.")
    lines.append("")

    # 2. Category Weighting Breakdown
    lines.append("## 2. Weighted Arithmetic Score Breakdown")
    lines.append("| Dimension | Maximum Weight | Awarded Score | Attainment |")
    lines.append("| :--- | :--- | :--- | :--- |")
    for cat_name, cat_obj in category_breakdown.items():
        lines.append(f"| **{cat_name}** | {cat_obj.max_score} pts | {cat_obj.score} pts | {cat_obj.percentage}% |")
    lines.append(f"| **TOTAL** | **100.0 pts** | **{overall_score} pts** | **{overall_score}%** |")
    lines.append("")

    # 3. Experience Tenure Audit
    lines.append("## 3. Experience Tenure Verification (Total vs. Relevant)")
    lines.append(f"- **Total Career Tenure:** {experience_breakdown.total_experience_years} years")
    lines.append(f"- **Directly Relevant Tenure:** {experience_breakdown.relevant_experience_years} years")
    if experience_breakdown.roles:
        lines.append("\n**Identified Employment Periods:**")
        for r in experience_breakdown.roles:
            rel_badge = "✅ Relevant" if r.is_relevant else "⚪ General"
            reasons = f" (Skills: {', '.join(r.relevance_reasons)})" if r.relevance_reasons else ""
            lines.append(f"- {r.title} | {r.start_date} to {r.end_date} ({r.duration_months} mos) — {rel_badge}{reasons}")
    lines.append("")

    # 4. Itemized Criteria Evidence Audit
    lines.append("## 4. Itemized Criteria Evidence Audit")
    for crit in criteria_evaluations:
        status_icon = {
            RequirementStatus.FULLY_MET: "✅ FULLY MET",
            RequirementStatus.PARTIALLY_MET: "⚠️ PARTIALLY MET",
            RequirementStatus.NOT_MET: "❌ NOT MET",
            RequirementStatus.NOT_FOUND: "❓ NOT FOUND",
            RequirementStatus.NEEDS_VERIFICATION: "🔍 NEEDS VERIFICATION"
        }.get(crit.status, crit.status.value)

        lines.append(f"### [{crit.category}] {crit.requirement}")
        lines.append(f"- **Status:** {status_icon} | **Score:** {crit.score} / {crit.max_score} pts")
        lines.append(f"- **Audit Explanation:** {crit.explanation}")
        if crit.evidence_quote:
            lines.append(f"- **CV Evidence Quote:** *\"{crit.evidence_quote}\"*")
        lines.append("")

    lines.append("---")
    lines.append("*This score is deterministic, auditable, and produced by TaskNera's frozen evaluation ruleset without generative LLM inference.*")

    return "\n".join(lines)
