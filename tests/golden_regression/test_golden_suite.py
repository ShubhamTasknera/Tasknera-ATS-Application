import sys
import os
import unittest

# Add document_processor to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "document_processor")))

from app.services.scoring_engine import evaluate_cv_against_jd
from app.models.schemas import Recommendation, RequirementStatus

class TestGoldenRegressionSuite(unittest.TestCase):
    """
    TaskNera Golden Regression Test Suite.
    Guarantees zero score drift and byte-for-byte reproducibility across software updates.
    """

    def test_candidate_a_strong_match(self):
        """Full match: meets all mandatory, core, experience, and preferred requirements."""
        jd = "Senior Python Engineer. Required: Python, Django, PostgreSQL. 4+ years experience. Preferred: Docker."
        cv = """
        Alex Chen
        Senior Software Engineer
        5 years of experience in Python, Django, and PostgreSQL.
        Built REST APIs, deployed containers with Docker, orchestrated CI/CD pipelines.
        Stanford University, B.S. Computer Science.
        """
        res = evaluate_cv_against_jd(
            job_id="gold-job-1",
            job_title="Senior Python Engineer",
            job_description=jd,
            candidate_id="gold-cand-1",
            candidate_name="Alex Chen",
            cv_text=cv,
            mandatory_criteria=["Python", "Django"],
            core_skills=["PostgreSQL"],
            preferred_criteria=["Docker"],
            min_experience_years=4.0
        )
        self.assertTrue(res.mandatory_passed)
        self.assertEqual(res.overall_score, 98.5)
        self.assertEqual(res.recommendation, Recommendation.STRONG_MATCH)

    def test_candidate_b_mandatory_knockout(self):
        """Candidate has high experience and preferred skills, but lacks a mandatory requirement."""
        jd = "Chief Data Scientist. Required: Ph.D. in Computer Science or Statistics. 5+ years experience."
        cv = """
        Maria Garcia
        Data Scientist with 8 years in Python, Machine Learning, TensorFlow, and PyTorch.
        Bachelor of Science in Mathematics.
        """
        res = evaluate_cv_against_jd(
            job_id="gold-job-2",
            job_title="Chief Data Scientist",
            job_description=jd,
            candidate_id="gold-cand-2",
            candidate_name="Maria Garcia",
            cv_text=cv,
            mandatory_criteria=["Ph.D. in Computer Science or Statistics"],
            core_skills=["Machine Learning", "Python"],
            preferred_criteria=["TensorFlow"],
            min_experience_years=5.0
        )
        self.assertFalse(res.mandatory_passed)
        # Critical constraint: Mandatory failure locks recommendation to DO NOT SUBMIT
        self.assertEqual(res.recommendation, Recommendation.DO_NOT_SUBMIT)
        self.assertTrue(len(res.knockout_reasons) >= 1)

    def test_candidate_c_negex_detection(self):
        """Candidate explicitly negates a required skill."""
        jd = "DevOps Engineer. Required: Kubernetes, Terraform."
        cv = """
        DevOps Specialist. Strong in Docker and Kubernetes, but no experience with Terraform.
        """
        res = evaluate_cv_against_jd(
            job_id="gold-job-3",
            job_title="DevOps Engineer",
            job_description=jd,
            candidate_id="gold-cand-3",
            candidate_name="Sam Taylor",
            cv_text=cv,
            mandatory_criteria=["Terraform"],
            core_skills=["Kubernetes"],
            preferred_criteria=[],
            min_experience_years=2.0
        )
        tf_crit = [c for c in res.criteria_evaluations if c.requirement == "Terraform"][0]
        self.assertEqual(tf_crit.status, RequirementStatus.NOT_MET)
        self.assertEqual(res.recommendation, Recommendation.DO_NOT_SUBMIT)

    def test_candidate_d_non_equivalence(self):
        """Java requirement must not match JavaScript candidate."""
        jd = "Backend Java Developer. Required: Java."
        cv = """
        Full Stack JavaScript Engineer. 6 years building modern SPAs in JavaScript, React, and Node.js.
        """
        res = evaluate_cv_against_jd(
            job_id="gold-job-4",
            job_title="Java Developer",
            job_description=jd,
            candidate_id="gold-cand-4",
            candidate_name="Jordan Lee",
            cv_text=cv,
            mandatory_criteria=["Java"],
            core_skills=["Spring Boot"],
            preferred_criteria=[],
            min_experience_years=3.0
        )
        java_crit = [c for c in res.criteria_evaluations if c.requirement == "Java"][0]
        self.assertIn(java_crit.status, [RequirementStatus.NOT_FOUND, RequirementStatus.NOT_MET])
        self.assertEqual(res.recommendation, Recommendation.DO_NOT_SUBMIT)

    def test_byte_identical_reproducibility(self):
        """Verify identical hash across 10 independent evaluation invocations."""
        jd = "Cloud Architect. Required: AWS, Microservices. Preferred: Kubernetes."
        cv = "Senior Architect with AWS, Microservices, and Kubernetes experience across 6 years."

        first_res = evaluate_cv_against_jd(
            "gold-job-5", "Cloud Architect", jd, "cand-5", "Chris", cv,
            ["AWS", "Microservices"], ["System Design"], ["Kubernetes"], 4.0
        )

        for i in range(10):
            run_res = evaluate_cv_against_jd(
                "gold-job-5", "Cloud Architect", jd, "cand-5", "Chris", cv,
                ["AWS", "Microservices"], ["System Design"], ["Kubernetes"], 4.0
            )
            self.assertEqual(run_res.overall_score, first_res.overall_score)
            self.assertEqual(run_res.audit_hash, first_res.audit_hash)
            self.assertEqual(run_res.recommendation, first_res.recommendation)

if __name__ == "__main__":
    unittest.main()
