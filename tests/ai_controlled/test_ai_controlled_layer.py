import sys
import os
import unittest

# Add document_processor to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "document_processor")))

from app.models.schemas import AiMatchState, RequirementStatus, Recommendation
from app.services.ai_assistance import (
    extract_jd_requirements_ai,
    match_cv_requirement_ai,
    calculate_ai_semantic_adjustment,
    are_strictly_distinct,
    get_all_equivalent_terms
)
from app.services.scoring_engine import evaluate_cv_against_jd

class TestControlledAiLayer(unittest.TestCase):
    """
    Automated Acceptance Suite for Controlled AI ATS Enhancement Layer.
    Validates:
    - Zero hallucination JD requirement completion
    - Acronym & synonym understanding (AWS ↔ Amazon Web Services, K8s ↔ Kubernetes)
    - Strict false positive shielding (Docker ≠ Kubernetes, React ≠ JavaScript, Java ≠ JavaScript)
    - 3-State classification (MATCH, UNCERTAIN, NO_MATCH)
    - Strictly bounded AI semantic adjustment (max +8.0 pts, 0.0 on failed mandatory)
    - 100% graceful fallback
    """

    def test_jd_requirement_completion_zero_hallucination(self):
        jd = "Looking for a DevOps Engineer with strong AWS experience, knowledge of Docker and Kubernetes, and experience managing CI/CD pipelines."
        reqs = extract_jd_requirements_ai(jd)

        req_names = [r.requirement.upper() for r in reqs]
        
        # Must identify present technologies
        self.assertIn("AWS", req_names)
        self.assertTrue(any("DOCKER" in r for r in req_names))
        self.assertTrue(any("KUBERNETES" in r for r in req_names))
        self.assertTrue(any("CI/CD" in r for r in req_names))
        self.assertTrue(any("DEVOPS" in r for r in req_names))

        # Must NEVER hallucinate or invent unmentioned technologies
        self.assertNotIn("AZURE", req_names)
        self.assertNotIn("GCP", req_names)
        self.assertNotIn("TERRAFORM", req_names)

        # Inferred requirements must be non-mandatory
        for r in reqs:
            self.assertTrue(r.is_inferred)
            self.assertFalse(r.is_mandatory)

    def test_cv_acronym_and_synonym_understanding(self):
        # 1. AWS ↔ Amazon Web Services
        cv_aws = "Senior Cloud Architect. 5 years managing AWS infrastructure, EC2 instances, and S3 storage."
        res1 = match_cv_requirement_ai("Amazon Web Services", cv_aws)
        self.assertEqual(res1["ai_match_state"], AiMatchState.MATCH)
        self.assertEqual(res1["score"], 1.0)
        self.assertIn("AWS", res1["evidence_quote"])

        # 2. Kubernetes ↔ K8s
        cv_k8s = "DevOps Specialist with extensive experience deploying microservices on K8s clusters."
        res2 = match_cv_requirement_ai("Kubernetes", cv_k8s)
        self.assertEqual(res2["ai_match_state"], AiMatchState.MATCH)
        self.assertEqual(res2["score"], 1.0)
        self.assertIn("K8s", res2["evidence_quote"])

        # 3. CI/CD Pipeline Implementation ↔ Natural language description
        cv_cicd = "Designed and maintained continuous integration and continuous deployment pipelines using Jenkins and GitHub Actions."
        res3 = match_cv_requirement_ai("CI/CD pipeline implementation", cv_cicd)
        self.assertEqual(res3["ai_match_state"], AiMatchState.MATCH)
        self.assertEqual(res3["score"], 1.0)

        # 4. JavaScript ↔ JS
        cv_js = "Frontend Developer skilled in JS, HTML5, CSS3, and responsive web design."
        res4 = match_cv_requirement_ai("JavaScript", cv_js)
        self.assertEqual(res4["ai_match_state"], AiMatchState.MATCH)
        self.assertEqual(res4["score"], 1.0)

    def test_strict_false_positive_shielding(self):
        # 1. Docker must NOT be credited as Kubernetes
        cv_docker_only = "Container Specialist. Built and containerized applications using Docker and Docker Compose."
        res_k8s = match_cv_requirement_ai("Kubernetes", cv_docker_only)
        self.assertNotEqual(res_k8s["ai_match_state"], AiMatchState.MATCH)

        # 2. JavaScript must NOT be credited as React
        cv_js_only = "Web developer proficient in vanilla JavaScript and DOM manipulation."
        res_react = match_cv_requirement_ai("React", cv_js_only)
        self.assertNotEqual(res_react["ai_match_state"], AiMatchState.MATCH)

        # 3. JavaScript must NOT be credited as Java
        cv_js_dev = "Full stack JavaScript developer using Node.js and Express."
        res_java = match_cv_requirement_ai("Java", cv_js_dev)
        self.assertNotEqual(res_java["ai_match_state"], AiMatchState.MATCH)

        # 4. Verify distinction helper
        self.assertTrue(are_strictly_distinct("docker", "kubernetes"))
        self.assertTrue(are_strictly_distinct("java", "javascript"))
        self.assertTrue(are_strictly_distinct("react", "javascript"))

    def test_three_state_ambiguity_uncertain(self):
        # Vague/general cloud statement for specific AWS requirement
        cv_vague_cloud = "Experienced Systems Administrator. Worked on cloud infrastructure and virtualization for several years."
        res = match_cv_requirement_ai("AWS", cv_vague_cloud)
        
        # Must be UNCERTAIN (for human recruiter review), NOT an automatic MATCH
        self.assertEqual(res["ai_match_state"], AiMatchState.UNCERTAIN)
        self.assertEqual(res["status"], RequirementStatus.PARTIALLY_MET)
        self.assertLess(res["score"], 1.0)

    def test_bounded_semantic_adjustment_limit(self):
        # 1. Candidate with vocabulary differences
        eval_items = [
            {
                "requirement": "Amazon Web Services",
                "category": "Core Skill",
                "is_mandatory": False,
                "deterministic_score": 0.0,
                "ai_match_state": AiMatchState.MATCH,
                "match_type": "Acronym",
                "weight": 2.0
            },
            {
                "requirement": "Kubernetes",
                "category": "Core Skill",
                "is_mandatory": False,
                "deterministic_score": 0.0,
                "ai_match_state": AiMatchState.MATCH,
                "match_type": "Acronym",
                "weight": 2.0
            },
            {
                "requirement": "Continuous Integration",
                "category": "Core Skill",
                "is_mandatory": False,
                "deterministic_score": 0.0,
                "ai_match_state": AiMatchState.MATCH,
                "match_type": "Semantic",
                "weight": 2.0
            },
            {
                "requirement": "Infrastructure as Code",
                "category": "Core Skill",
                "is_mandatory": False,
                "deterministic_score": 0.0,
                "ai_match_state": AiMatchState.MATCH,
                "match_type": "Semantic",
                "weight": 2.0
            }
        ]

        adj, final_score, reasons = calculate_ai_semantic_adjustment(
            base_deterministic_score=72.0,
            mandatory_failed=False,
            evaluations=eval_items,
            max_adjustment_cap=8.0
        )

        # Must be strictly bounded at <= 8.0 points
        self.assertGreater(adj, 0.0)
        self.assertLessEqual(adj, 8.0)
        self.assertEqual(final_score, round(72.0 + adj, 1))

        # 2. Candidate who failed a mandatory requirement: adjustment MUST be 0.0
        adj_mand_fail, final_mand_fail, _ = calculate_ai_semantic_adjustment(
            base_deterministic_score=45.0,
            mandatory_failed=True,
            evaluations=eval_items,
            max_adjustment_cap=8.0
        )
        self.assertEqual(adj_mand_fail, 0.0)
        self.assertEqual(final_mand_fail, 45.0)

    def test_full_evaluation_with_controlled_ai_and_fallback(self):
        jd_text = "Looking for Senior DevOps Engineer with Amazon Web Services, Kubernetes, and CI/CD experience."
        cv_text = "Jane Doe. Experienced DevOps Engineer with 4 years deploying microservices on AWS, K8s, and Jenkins CI/CD pipelines."

        # A. Evaluation with Controlled AI enabled
        res_ai = evaluate_cv_against_jd(
            job_id="job-ai-1",
            job_title="Senior DevOps Engineer",
            job_description=jd_text,
            candidate_id="cand-jane-1",
            candidate_name="Jane Doe",
            cv_text=cv_text,
            mandatory_criteria=["Relevant background in Senior DevOps Engineer"],
            core_skills=["Amazon Web Services", "Kubernetes", "CI/CD"],
            enable_ai_assistance=True,
            max_ai_semantic_adjustment=8.0
        )

        self.assertTrue(res_ai.ai_assistance_enabled)
        self.assertFalse(res_ai.ai_fallback_triggered)
        self.assertGreater(res_ai.overall_score, 0.0)
        self.assertTrue(res_ai.mandatory_passed)
        self.assertIn(res_ai.recommendation, [Recommendation.MATCH, Recommendation.STRONG_MATCH])

        # B. Fallback test: when AI assistance is disabled
        res_det = evaluate_cv_against_jd(
            job_id="job-ai-1",
            job_title="Senior DevOps Engineer",
            job_description=jd_text,
            candidate_id="cand-jane-1",
            candidate_name="Jane Doe",
            cv_text=cv_text,
            mandatory_criteria=["Relevant background in Senior DevOps Engineer"],
            core_skills=["Amazon Web Services", "Kubernetes", "CI/CD"],
            enable_ai_assistance=False
        )

        self.assertFalse(res_det.ai_assistance_enabled)
        self.assertEqual(res_det.ai_semantic_adjustment, 0.0)
        self.assertEqual(res_det.overall_score, res_det.base_deterministic_score)

if __name__ == "__main__":
    unittest.main()
