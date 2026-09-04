import sys
import os
import unittest
from typing import List, Dict, Any

# Add document_processor to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "document_processor")))

from app.services.scoring_engine import evaluate_cv_against_jd
from app.models.schemas import RequirementStatus

# 12 Ground-truth recruiter labeled profiles
GROUND_TRUTH_DATASET: List[Dict[str, Any]] = [
    {
        "id": "GT-1",
        "job_title": "Senior React Developer",
        "jd_text": "Must have React and TypeScript. 4+ yrs experience.",
        "mandatory": ["React", "TypeScript"],
        "min_exp": 4.0,
        "cv_text": "Experienced Frontend Developer. 5 years building complex web apps in React and TypeScript with Next.js.",
        "expected_mandatory_pass": True,
        "label": "True Positive (Strong Match)"
    },
    {
        "id": "GT-2",
        "job_title": "Senior React Developer",
        "jd_text": "Must have React and TypeScript. 4+ yrs experience.",
        "mandatory": ["React", "TypeScript"],
        "min_exp": 4.0,
        "cv_text": "Experienced Frontend Developer with Vue.js and Angular across 6 years. No React or TypeScript experience.",
        "expected_mandatory_pass": False,
        "label": "True Negative (Missing Skills)"
    },
    {
        "id": "GT-3",
        "job_title": "Java Platform Engineer",
        "jd_text": "Requires Java backend development.",
        "mandatory": ["Java"],
        "min_exp": 3.0,
        "cv_text": "Full Stack developer. Expert in JavaScript, Node.js, and React. Built high-traffic web applications.",
        "expected_mandatory_pass": False,
        "label": "Non-Equivalence Trap (JavaScript for Java)"
    },
    {
        "id": "GT-4",
        "job_title": "Backend Python Architect",
        "jd_text": "Must have Python and FastAPI.",
        "mandatory": ["Python", "FastAPI"],
        "min_exp": 5.0,
        "cv_text": "Backend Architect with 7 years in Python. Deployed high throughput microservices using FastAPI and Docker.",
        "expected_mandatory_pass": True,
        "label": "True Positive (Full Stack Match)"
    },
    {
        "id": "GT-5",
        "job_title": "Cloud Security Specialist",
        "jd_text": "Must have AWS security certification and AWS hands-on.",
        "mandatory": ["AWS"],
        "min_exp": 3.0,
        "cv_text": "Security engineer. Experienced with GCP and on-prem linux. No hands-on with AWS.",
        "expected_mandatory_pass": False,
        "label": "NegEx Trap (Explicit Lack of AWS)"
    },
    {
        "id": "GT-6",
        "job_title": "Data Engineering Lead",
        "jd_text": "Must have Apache Spark and Kafka.",
        "mandatory": ["Apache Spark", "Apache Kafka"],
        "min_exp": 4.0,
        "cv_text": "Big Data Engineer with 5 years in Apache Spark and Kafka streaming pipelines across Hadoop clusters.",
        "expected_mandatory_pass": True,
        "label": "True Positive (Data Eng)"
    },
    {
        "id": "GT-7",
        "job_title": "Data Engineering Lead",
        "jd_text": "Must have Apache Spark and Kafka.",
        "mandatory": ["Apache Spark", "Apache Kafka"],
        "min_exp": 4.0,
        "cv_text": "Data Analyst with 4 years in Tableau, SQL, and PowerBI. No big data streaming.",
        "expected_mandatory_pass": False,
        "label": "True Negative (Analyst vs Big Data)"
    },
    {
        "id": "GT-8",
        "job_title": "Mobile iOS Developer",
        "jd_text": "Must have Swift. Required: Native iOS development.",
        "mandatory": ["Swift"],
        "min_exp": 3.0,
        "cv_text": "Mobile Engineer with 4 years building iOS applications in Swift and SwiftUI. Published 5 apps to App Store.",
        "expected_mandatory_pass": True,
        "label": "True Positive (Swift Mobile)"
    },
    {
        "id": "GT-9",
        "job_title": "Mobile iOS Developer",
        "jd_text": "Must have Swift. Required: Native iOS development.",
        "mandatory": ["Swift"],
        "min_exp": 3.0,
        "cv_text": "Mobile Engineer specialized in Android using Kotlin and Java. Did not work on Swift.",
        "expected_mandatory_pass": False,
        "label": "True Negative (Android vs iOS)"
    },
    {
        "id": "GT-10",
        "job_title": "C++ Systems Engineer",
        "jd_text": "Must have C++ low-latency experience.",
        "mandatory": ["C++"],
        "min_exp": 4.0,
        "cv_text": "Senior Software Developer with 6 years building desktop applications in C# and .NET. Never used C++.",
        "expected_mandatory_pass": False,
        "label": "Non-Equivalence Trap (C# for C++)"
    },
    {
        "id": "GT-11",
        "job_title": "DevOps Engineer",
        "jd_text": "Must have Kubernetes.",
        "mandatory": ["Kubernetes"],
        "min_exp": 3.0,
        "cv_text": "Site Reliability Engineer with 4 years managing K8s clusters, Helm charts, and Prometheus monitoring.",
        "expected_mandatory_pass": True,
        "label": "Synonym Equivalence (K8s for Kubernetes)"
    },
    {
        "id": "GT-12",
        "job_title": "PostgreSQL DBA",
        "jd_text": "Must have PostgreSQL database administration.",
        "mandatory": ["PostgreSQL"],
        "min_exp": 4.0,
        "cv_text": "Database Administrator with 6 years configuring Postgres clusters, replication, and query tuning.",
        "expected_mandatory_pass": True,
        "label": "Synonym Equivalence (Postgres for PostgreSQL)"
    }
]

class TestGroundTruthAccuracySuite(unittest.TestCase):
    """
    Evaluates TaskNera deterministic engine against recruiter ground truth dataset.
    Reports False Negative Rate on Mandatory Requirements as a prominent first-class metric.
    """

    def test_evaluate_ground_truth_dataset(self):
        tp = 0  # True Positives (Passed mandatory correctly)
        fp = 0  # False Positives (Engine passed mandatory, but ground truth says FAIL)
        tn = 0  # True Negatives (Engine failed mandatory correctly)
        fn = 0  # False Negatives (Engine failed mandatory, but ground truth says PASS)

        detailed_results = []

        for item in GROUND_TRUTH_DATASET:
            eval_res = evaluate_cv_against_jd(
                job_id=f"eval-{item['id']}",
                job_title=item["job_title"],
                job_description=item["jd_text"],
                candidate_id=f"cand-{item['id']}",
                candidate_name=item["id"],
                cv_text=item["cv_text"],
                mandatory_criteria=item["mandatory"],
                core_skills=[],
                preferred_criteria=[],
                min_experience_years=item["min_exp"]
            )

            predicted_pass = eval_res.mandatory_passed
            actual_pass = item["expected_mandatory_pass"]

            if predicted_pass and actual_pass:
                tp += 1
                outcome = "TP (Correct Pass)"
            elif not predicted_pass and not actual_pass:
                tn += 1
                outcome = "TN (Correct Knockout)"
            elif predicted_pass and not actual_pass:
                fp += 1
                outcome = "FP (CRITICAL: Engine passed unqualified candidate)"
            else:
                fn += 1
                outcome = "FN (Engine rejected qualified candidate)"

            detailed_results.append({
                "id": item["id"],
                "label": item["label"],
                "actual": actual_pass,
                "predicted": predicted_pass,
                "score": eval_res.overall_score,
                "outcome": outcome
            })

        # Calculate metrics
        precision = tp / max(1, (tp + fp))
        recall = tp / max(1, (tp + fn))
        f1 = (2 * precision * recall) / max(1e-6, (precision + recall))

        # First-class prominent metric: Mandatory False Negative Rate
        # Measures whether unqualified candidates slip through mandatory screening
        mandatory_false_positive_rate = fp / max(1, (fp + tn))
        mandatory_false_negative_rate = fn / max(1, (fn + tp))

        print("\n" + "=" * 75)
        print("  TASKNERA DETERMINISTIC RECRUITER GROUND-TRUTH ACCURACY AUDIT")
        print("=" * 75)
        print(f"Total Test Cases: {len(GROUND_TRUTH_DATASET)}")
        print(f"True Positives  : {tp} | True Negatives : {tn}")
        print(f"False Positives : {fp} | False Negatives: {fn}")
        print("-" * 75)
        print(f"Precision : {precision * 100:.2f}%")
        print(f"Recall    : {recall * 100:.2f}%")
        print(f"F1 Score  : {f1 * 100:.2f}%")
        print("-" * 75)
        print(f"* MANDATORY DEFICIT ESCAPE RATE (FP Rate): {mandatory_false_positive_rate * 100:.2f}% (Target: 0.00%)")
        print(f"* MANDATORY FALSE NEGATIVE RATE         : {mandatory_false_negative_rate * 100:.2f}% (Target: 0.00%)")
        print("=" * 75)

        for r in detailed_results:
            status_symbol = "[OK]" if "Correct" in r["outcome"] else "[FAIL]"
            print(f"{status_symbol:<6} {r['id']:<6} | {r['outcome']:<30} | Score: {r['score']:<4} | {r['label']}")
        print("=" * 75 + "\n")

        # Strict quality assertions
        self.assertEqual(fp, 0, "No unqualified candidate may pass mandatory requirements!")
        self.assertEqual(fn, 0, "No qualified candidate should be falsely knocked out!")
        self.assertEqual(mandatory_false_positive_rate, 0.0)
        self.assertEqual(mandatory_false_negative_rate, 0.0)

if __name__ == "__main__":
    unittest.main()
