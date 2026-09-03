import unittest
from app.normalizers.salary_normalizer import normalize_salary
from app.normalizers.skill_normalizer import normalize_skill_name, deduplicate_skills
from app.normalizers.experience_normalizer import calculate_tenure_and_gaps
from app.normalizers.text_normalizer import clean_text, strip_concatenated_headers
from app.parsers.document_classifier import classify_document
from app.models.cv_schema import ExperienceItem
from app.models.document_schema import StructuredDocument, DocumentBlock, BlockType, DocumentType
from app.extractors.jd_extractor import extract_jd
from app.extractors.cv_extractor import extract_cv

class TestParserService(unittest.TestCase):

    def test_salary_normalization(self):
        # Range in LPA
        s1 = normalize_salary("6–10 LPA")
        self.assertEqual(s1.min, 600000)
        self.assertEqual(s1.max, 1000000)
        self.assertEqual(s1.formatted_label, "₹6–10 LPA")
        
        # Single LPA
        s2 = normalize_salary("₹8.5 LPA")
        self.assertEqual(s2.min, 850000)
        self.assertEqual(s2.max, 850000)
        
        # Lakhs per annum
        s3 = normalize_salary("12 Lakhs Per Annum")
        self.assertEqual(s3.min, 1200000)
        self.assertEqual(s3.max, 1200000)

    def test_skill_normalization(self):
        self.assertEqual(normalize_skill_name("js"), "JavaScript")
        self.assertEqual(normalize_skill_name("postgres"), "PostgreSQL")
        self.assertEqual(normalize_skill_name("k8s"), "Kubernetes")
        self.assertEqual(normalize_skill_name("aws"), "Amazon Web Services (AWS)")
        self.assertEqual(normalize_skill_name("ml"), "Machine Learning")
        
        # Strict boundary preservation (non-equivalents remain separate)
        self.assertNotEqual(normalize_skill_name("LangChain"), normalize_skill_name("LangGraph"))
        self.assertNotEqual(normalize_skill_name("FastAPI"), normalize_skill_name("Python"))

    def test_experience_and_gap_calculation(self):
        exps = [
            ExperienceItem(
                company="Tech Corp",
                job_title="Software Engineer",
                start_date="Jan 2020",
                end_date="Dec 2021"
            ),
            ExperienceItem(
                company="Innovate AI",
                job_title="Senior Engineer",
                start_date="Jun 2022",
                end_date="Dec 2023"
            )
        ]
        years, label, gap_analysis = calculate_tenure_and_gaps(exps)
        self.assertGreaterEqual(years, 3.5)
        self.assertTrue(gap_analysis.has_gap)
        self.assertEqual(len(gap_analysis.gaps), 1)
        self.assertGreaterEqual(gap_analysis.gaps[0].gap_months, 5)

    def test_jd_extraction_no_header_concatenation(self):
        sample_jd_blocks = [
            DocumentBlock(page=1, section="Header", type=BlockType.HEADING, text="Full Stack Developer"),
            DocumentBlock(page=1, section="Header", type=BlockType.PARAGRAPH, text="Company: TechNova Solutions"),
            DocumentBlock(page=1, section="Header", type=BlockType.PARAGRAPH, text="Location: Pune, Maharashtra"),
            DocumentBlock(page=1, section="Header", type=BlockType.PARAGRAPH, text="Work Mode: Hybrid"),
            DocumentBlock(page=1, section="Header", type=BlockType.PARAGRAPH, text="Salary: 6–10 LPA"),
            DocumentBlock(page=1, section="Requirements", type=BlockType.HEADING, text="Requirements"),
            DocumentBlock(page=1, section="Requirements", type=BlockType.LIST_ITEM, text="3+ years of experience with React and Node.js (Must Have)"),
            DocumentBlock(page=1, section="Requirements", type=BlockType.LIST_ITEM, text="Strong proficiency with PostgreSQL and Redis"),
        ]
        
        doc = StructuredDocument(
            file_name="TechNova_JD.pdf",
            file_type="PDF",
            page_count=1,
            character_count=500,
            word_count=80,
            document_type=DocumentType.JOB_DESCRIPTION,
            blocks=sample_jd_blocks,
            raw_text="\n".join([b.text for b in sample_jd_blocks]),
            sections={
                "Header": ["Company: TechNova Solutions", "Location: Pune, Maharashtra", "Work Mode: Hybrid", "Salary: 6–10 LPA"],
                "Requirements": ["3+ years of experience with React and Node.js (Must Have)", "Strong proficiency with PostgreSQL and Redis"]
            }
        )
        
        parsed_jd = extract_jd(doc)
        
        self.assertEqual(parsed_jd.job.title, "Full Stack Developer")
        self.assertEqual(parsed_jd.job.company, "TechNova Solutions") # NOT concatenated!
        self.assertEqual(parsed_jd.job.location, "Pune, Maharashtra") # NOT concatenated with Work Mode!
        self.assertEqual(parsed_jd.job.work_mode, "Hybrid")
        self.assertEqual(parsed_jd.job.salary.min, 600000)
        self.assertEqual(parsed_jd.job.salary.max, 1000000)
        self.assertGreaterEqual(len(parsed_jd.requirements), 2)
        self.assertTrue(parsed_jd.requirements[0].mandatory)

    def test_document_classification(self):
        cv_sample = "John Doe\njohn@example.com\nWork Experience\nSoftware Engineer at TechCorp\nEducation: B.Tech in CS\nSkills: Python, FastAPI"
        jd_sample = "Senior Python Developer\nAbout Us: TechNova\nKey Responsibilities:\n- Build scalable APIs\nMandatory Requirements:\n- 5+ years experience\nCompensation: 15-20 LPA"
        
        self.assertEqual(classify_document(cv_sample, "john_cv.pdf"), DocumentType.CV)
        self.assertEqual(classify_document(jd_sample, "senior_dev_jd.pdf"), DocumentType.JOB_DESCRIPTION)

if __name__ == "__main__":
    unittest.main()
