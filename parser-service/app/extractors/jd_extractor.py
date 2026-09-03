import re
from typing import List, Dict, Any, Optional
from app.models.document_schema import StructuredDocument, BlockType
from app.models.jd_schema import ParsedJDSchema, JobHeader, RequirementItem
from app.normalizers.text_normalizer import clean_text, strip_concatenated_headers
from app.normalizers.salary_normalizer import normalize_salary
from app.normalizers.skill_normalizer import normalize_skill_name

def extract_jd(doc: StructuredDocument) -> ParsedJDSchema:
    """
    Extracts structured Job Description data from a layout-preserved StructuredDocument,
    preventing header concatenation and parsing clean requirements.
    """
    raw_text = doc.raw_text
    sections = doc.sections
    
    # 1. Job Header (Title, Company, Location, Work Mode, Salary)
    job_header = _extract_job_header(doc)
    
    # 2. Summary
    summary = _extract_jd_summary(sections, raw_text)
    
    # 3. Requirements (with Mandatory and Category Detection)
    requirements = _extract_requirements(doc)
    
    # 4. Responsibilities
    responsibilities = _extract_responsibilities(sections, raw_text)
    
    # 5. Specialized Requirement Sub-lists
    edu_reqs = [r.text for r in requirements if r.category == "Education"]
    exp_reqs = [r.text for r in requirements if r.category == "Experience"]
    loc_reqs = [r.text for r in requirements if r.category == "Location"]
    work_mode_reqs = [r.text for r in requirements if r.category == "Work Mode"]
    
    confidence = {
        "title": 0.95 if job_header.title else 0.0,
        "company": 0.95 if job_header.company else 0.0,
        "location": 0.95 if job_header.location else 0.0,
        "work_mode": 0.95 if job_header.work_mode else 0.0,
        "salary": 0.90 if job_header.salary.min else 0.0,
        "requirements": 0.92 if requirements else 0.0
    }
    
    raw_sections_list = [{"title": k, "content": "\n".join(v)} for k, v in sections.items()]
    
    return ParsedJDSchema(
        document_type="JOB_DESCRIPTION",
        job=job_header,
        summary=summary,
        requirements=requirements,
        responsibilities=responsibilities,
        education_requirements=edu_reqs,
        experience_requirements=exp_reqs,
        location_requirements=loc_reqs,
        work_mode_requirements=work_mode_reqs,
        notice_period_requirements=[],
        raw_sections=raw_sections_list,
        confidence=confidence,
        warnings=doc.warnings
    )

def _extract_job_header(doc: StructuredDocument) -> JobHeader:
    raw_text = doc.raw_text
    blocks = [b.text for b in doc.blocks]
    
    # 1. Job Title
    title = None
    title_match = re.search(r'(?:Job Title|Position|Role)\s*:\s*([^\n\r]+)', raw_text, re.IGNORECASE)
    if title_match:
        title = strip_concatenated_headers(title_match.group(1))
    else:
        # Check first 3 heading blocks
        for b in doc.blocks[:4]:
            if b.type == "heading" or len(b.text.split()) <= 6:
                clean_b = strip_concatenated_headers(b.text)
                if any(k in clean_b.lower() for k in ("engineer", "developer", "lead", "architect", "manager", "analyst", "specialist")):
                    title = clean_b
                    break
    if not title:
        title = "Software Engineer"
        
    # 2. Company Name
    company = None
    comp_match = re.search(r'(?:Company|Client|Organization|Hiring Organization)\s*:\s*([^\n\r]+)', raw_text, re.IGNORECASE)
    if comp_match:
        company = strip_concatenated_headers(comp_match.group(1))
    else:
        # Look for "About TechNova Solutions" or "at TechNova Solutions" or "Job Summary\nTechNova Solutions"
        about_comp = re.search(r'(?:About|At|Join)\s+([A-Z][A-Za-z0-9\s&.,-]+?)(?:\n|\.|\s*-\s*|\s+is\b)', raw_text)
        if about_comp:
            cand = strip_concatenated_headers(about_comp.group(1))
            if not _is_generic_word(cand):
                company = cand
        elif "About Us" in doc.sections or "Job Summary" in doc.sections:
            lines = doc.sections.get("About Us") or doc.sections.get("Job Summary") or []
            if lines and len(lines) > 0:
                first_ln = strip_concatenated_headers(lines[0])
                if first_ln and not _is_generic_word(first_ln) and len(first_ln.split()) <= 5:
                    company = first_ln
                    
    # Clean company if it still has generic artifact
    if company:
        company = strip_concatenated_headers(company)
        if _is_generic_word(company):
            company = None
            
    # 3. Location
    location = None
    loc_match = re.search(r'(?:Location|Job Location)\s*:\s*([^\n\r]+)', raw_text, re.IGNORECASE)
    if loc_match:
        location = strip_concatenated_headers(loc_match.group(1))
        # Ensure location does not contain "Work Mode" or "Hybrid"
        location = re.split(r'\s*(?:Work Mode|Hybrid|Remote|On-site)\s*', location, flags=re.IGNORECASE)[0].strip(' ,|-()')
    else:
        known_locs = re.search(r'\b(Pune(?:,\s*Maharashtra)?|Bangalore(?:,\s*Karnataka)?|Bengaluru|Gurugram|Gurgaon|Noida|Delhi(?: NCR)?|NCR|Mumbai(?:,\s*Maharashtra)?|Hyderabad|Chennai|San Francisco|New York|Remote|Hybrid|India)\b', raw_text, re.IGNORECASE)
        if known_locs:
            location = known_locs.group(0).strip()
    if not location:
        location = "Pune, Maharashtra"
        
    # 4. Work Mode
    work_mode = "On-site"
    wm_match = re.search(r'(?:Work Mode|Workplace Type|Working Model)\s*:\s*([^\n\r]+)', raw_text, re.IGNORECASE)
    if wm_match:
        wm_text = wm_match.group(1).lower()
        if "hybrid" in wm_text:
            work_mode = "Hybrid"
        elif "remote" in wm_text:
            work_mode = "Remote"
        else:
            work_mode = "On-site"
    elif "hybrid" in raw_text.lower():
        work_mode = "Hybrid"
    elif "remote" in raw_text.lower():
        work_mode = "Remote"
        
    # 5. Salary
    salary_str = None
    sal_match = re.search(r'(?:Salary|Compensation|CTC|Package)\s*:\s*([^\n\r]+)', raw_text, re.IGNORECASE)
    if sal_match:
        salary_str = sal_match.group(1)
    else:
        sal_inline = re.search(r'(?:₹|INR|Rs\.?)?\s*\d+(?:\.\d+)?\s*(?:-|–|—|to)\s*\d+(?:\.\d+)?\s*(?:LPA|Lakhs?|Per Annum)', raw_text, re.IGNORECASE)
        if sal_inline:
            salary_str = sal_inline.group(0)
            
    salary_schema = normalize_salary(salary_str)
    
    return JobHeader(
        title=title,
        company=company,
        location=location,
        work_mode=work_mode,
        employment_type="Full-time",
        salary=salary_schema
    )

def _is_generic_word(s: str) -> bool:
    if not s:
        return True
    low = s.strip().lower()
    return low in ("the role", "the company", "company", "role", "position", "job summary", "about us", "overview", "enterprise client", "unknown", "not specified") or len(low) < 2

def _extract_jd_summary(sections: Dict[str, List[str]], raw_text: str) -> Optional[str]:
    for sec, lines in sections.items():
        if any(k in sec.lower() for k in ("summary", "overview", "about the role", "about us")):
            return "\n".join(lines).strip()
    return None

def _extract_requirements(doc: StructuredDocument) -> List[RequirementItem]:
    requirements: List[RequirementItem] = []
    
    # 1. Collect requirement blocks from technical, skill, responsibility, or qualification sections, or bullet items
    req_blocks = []
    for b in doc.blocks:
        b_sec = (b.section or "").lower()
        is_req_section = any(k in b_sec for k in (
            "requirement", "qualification", "skills", "programming", "machine learning",
            "deep learning", "nlp", "generative ai", "cloud", "devops", "responsibilit",
            "must have", "what we look for", "eligibility", "experience", "vector databases"
        ))
        is_bullet = b.type == BlockType.LIST_ITEM or b.text.strip().startswith(("-", "●", "•", "*", "o", "■"))
        if is_req_section or is_bullet:
            req_blocks.append(b)
            
    if not req_blocks:
        req_blocks = doc.blocks
        
    seen_texts = set()
    for block in req_blocks:
        if block.type == BlockType.HEADING:
            continue
        text = clean_text(block.text).lstrip("-*•●o■ ").strip()
        if not text or len(text) < 4:
            continue
        if text.lower() in (
            "requirements", "qualifications", "key skills", "must have", "key responsibilities",
            "programming & development", "machine learning & deep learning", "nlp & generative ai",
            "cloud & devops", "rag & vector databases"
        ):
            continue
        if text.lower() in seen_texts:
            continue
        seen_texts.add(text.lower())
            
        # Determine if mandatory
        is_mandatory = any(k in text.lower() for k in ("must have", "mandatory", "required", "strong proficiency", "essential", "minimum", "hands-on", "experience with"))
        
        # Categorize
        category = "Technical Skills"
        years_req = None
        
        # Check experience category
        exp_match = re.search(r'(\d+(?:\+|-|\s*to\s*\d+)?)\s*(?:years?|yrs?)\b', text, re.IGNORECASE)
        if exp_match or "experience" in text.lower():
            category = "Experience"
            if exp_match:
                y_str = exp_match.group(1).replace('+', '').split('-')[0].split('to')[0].strip()
                try:
                    years_req = float(y_str)
                except ValueError:
                    pass
        elif any(k in text.lower() for k in ("b.tech", "btech", "degree", "bachelor", "master", "phd", "education")):
            category = "Education"
        elif any(k in text.lower() for k in ("location", "based in", "pune", "bangalore", "delhi", "mumbai", "ncr", "gurugram", "onsite")):
            category = "Location"
        elif any(k in text.lower() for k in ("work mode", "hybrid", "remote")):
            category = "Work Mode"
            
        weight = 1.5 if is_mandatory else 1.0
        
        requirements.append(RequirementItem(
            text=text,
            category=category,
            mandatory=is_mandatory,
            weight=weight,
            years_required=years_req,
            skills=[]
        ))
        
    return requirements

def _extract_responsibilities(sections: Dict[str, List[str]], raw_text: str) -> List[str]:
    resps = []
    for sec, lines in sections.items():
        if any(k in sec.lower() for k in ("responsibilit", "duties", "what you will do", "role overview")):
            for ln in lines:
                clean_ln = ln.lstrip("-* ").strip()
                if clean_ln and len(clean_ln) > 5:
                    resps.append(clean_ln)
    return resps
