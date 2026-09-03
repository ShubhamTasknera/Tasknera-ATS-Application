import re
from typing import List, Dict, Any, Optional, Tuple
from app.models.document_schema import StructuredDocument
from app.models.cv_schema import (
    ParsedCVSchema, CandidateContact, SkillItem, ExperienceItem,
    EducationItem, ProjectItem, FieldEvidence
)
from app.normalizers.text_normalizer import clean_text
from app.normalizers.skill_normalizer import normalize_skill_name, deduplicate_skills
from app.normalizers.experience_normalizer import calculate_tenure_and_gaps

COMMON_SKILL_PATTERNS = [
    r'\bpython\b', r'\bjavascript\b', r'\btypescript\b', r'\bgo(?:lang)?\b', r'\bjava\b', r'\bc\+\+\b', r'\brust\b',
    r'\bfastapi\b', r'\bdjango\b', r'\bflask\b', r'\bnode(?:\.js)?\b', r'\breact(?:\.js)?\b', r'\bnext(?:\.js)?\b',
    r'\bvue(?:\.js)?\b', r'\bangular\b', r'\bpostgresql\b', r'\bpostgres\b', r'\bmysql\b', r'\bmongodb\b', r'\bredis\b',
    r'\bdocker\b', r'\bkubernetes\b', r'\bk8s\b', r'\baws\b', r'\bgcp\b', r'\bazure\b', r'\bterraform\b',
    r'\blangchain\b', r'\blanggraph\b', r'\bllamaindex\b', r'\brag\b', r'\bretrieval augmented generation\b',
    r'\bllm\b', r'\blarge language models?\b', r'\bmachine learning\b', r'\bdeep learning\b', r'\bnlp\b',
    r'\bpytorch\b', r'\btensorflow\b', r'\bkeras\b', r'\bscikit-learn\b', r'\bpandas\b', r'\bnumpy\b',
    r'\bci\/cd\b', r'\bgit\b', r'\bgithub\b', r'\blinux\b', r'\bgraphql\b', r'\brest(?:ful)? apis?\b',
    r'\bhtml5?\b', r'\bcss3?\b', r'\btailwind(?:\s*css)?\b'
]

def extract_cv(doc: StructuredDocument) -> ParsedCVSchema:
    """
    Extracts structured candidate data from a layout-preserved StructuredDocument.
    """
    raw_text = doc.raw_text
    sections = doc.sections
    
    # 1. Candidate Contact Info
    candidate = _extract_contact_info(doc)
    
    # 2. Summary
    summary = _extract_summary(sections, raw_text)
    
    # 3. Skills with page/section evidence
    skills, skill_names = _extract_skills(doc)
    
    # 4. Work Experience & Current Role
    experience, current_title, current_company = _extract_experience(doc)
    
    # 5. Tenure and Career Gaps
    total_years, total_label, gap_analysis = calculate_tenure_and_gaps(experience)
    
    # 6. Education
    education = _extract_education(doc)
    
    # 7. Certifications & Projects
    certifications = _extract_certifications(sections, raw_text)
    projects = _extract_projects(sections, raw_text)
    languages = _extract_languages(sections, raw_text)
    
    # 8. Notice Period
    notice_period = _extract_notice_period(raw_text)
    
    # Build Evidence List
    evidence: List[FieldEvidence] = []
    if candidate.name:
        evidence.append(FieldEvidence(field="name", value=candidate.name, confidence=0.95, section="Header"))
    if candidate.email:
        evidence.append(FieldEvidence(field="email", value=candidate.email, confidence=0.99, section="Header"))
    if candidate.phone:
        evidence.append(FieldEvidence(field="phone", value=candidate.phone, confidence=0.98, section="Header"))
    if current_title:
        evidence.append(FieldEvidence(field="current_title", value=current_title, confidence=0.90, section="Experience"))
    if current_company:
        evidence.append(FieldEvidence(field="current_company", value=current_company, confidence=0.90, section="Experience"))
        
    confidence = {
        "name": 0.95 if candidate.name else 0.0,
        "email": 0.99 if candidate.email else 0.0,
        "phone": 0.98 if candidate.phone else 0.0,
        "skills": 0.92 if skills else 0.0,
        "experience": 0.90 if experience else 0.0,
        "education": 0.90 if education else 0.0
    }
    
    raw_sections_list = [{"title": k, "content": "\n".join(v)} for k, v in sections.items()]
    
    return ParsedCVSchema(
        document_type="CV",
        candidate=candidate,
        current_title=current_title,
        current_company=current_company,
        summary=summary,
        skills=skills,
        skill_names=skill_names,
        experience=experience,
        education=education,
        certifications=certifications,
        projects=projects,
        languages=languages,
        total_experience_years=total_years if total_years > 0 else None,
        total_experience_label=total_label,
        notice_period=notice_period,
        gap_analysis=gap_analysis,
        raw_sections=raw_sections_list,
        confidence=confidence,
        evidence=evidence,
        warnings=doc.warnings
    )

def _extract_contact_info(doc: StructuredDocument) -> CandidateContact:
    raw_text = doc.raw_text
    
    # Email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b', raw_text)
    email = email_match.group(0).lower() if email_match else None
    
    # Phone
    phone_match = re.search(r'(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}', raw_text)
    phone = phone_match.group(0).strip() if phone_match and len(re.sub(r'\D', '', phone_match.group(0))) >= 10 else None
    
    # Name from top blocks / header
    name = None
    header_blocks = [b.text for b in doc.blocks if b.page == 1][:5]
    for hb in header_blocks:
        clean_hb = clean_text(hb)
        # Skip labels, emails, phones, links
        if "@" in clean_hb or any(c.isdigit() for c in clean_hb) or "curriculum" in clean_hb.lower() or "resume" in clean_hb.lower():
            continue
        words = clean_hb.split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w.isalpha()):
            name = clean_hb
            break
            
    if not name:
        # Fallback from filename e.g. "CV_2_Karan_Malhotra.pdf" -> "Karan Malhotra"
        fn = doc.file_name.replace(".pdf", "").replace(".docx", "")
        fn_clean = re.sub(r'^(?:CV[_\-\s]*\d*[_\-\s]*|Resume[_\-\s]*)', '', fn, flags=re.IGNORECASE)
        fn_clean = re.sub(r'[_\-]+', ' ', fn_clean).strip()
        if len(fn_clean.split()) >= 2:
            name = fn_clean.title()
            
    # Location
    loc_match = re.search(r'\b(Bangalore|Bengaluru|Gurugram|Gurgaon|Noida|Delhi|NCR|Mumbai|Pune|Hyderabad|Chennai|San Francisco|New York|Remote|Hybrid|India)\b', raw_text, re.IGNORECASE)
    location = loc_match.group(0).title() if loc_match else "India"
    
    # LinkedIn & GitHub
    li_match = re.search(r'(https?://(?:www\.)?linkedin\.com/in/[A-Za-z0-9_-]+)', raw_text)
    gh_match = re.search(r'(https?://(?:www\.)?github\.com/[A-Za-z0-9_-]+)', raw_text)
    
    return CandidateContact(
        name=name,
        email=email,
        phone=phone,
        location=location,
        linkedin=li_match.group(1) if li_match else None,
        github=gh_match.group(1) if gh_match else None
    )

def _extract_summary(sections: Dict[str, List[str]], raw_text: str) -> Optional[str]:
    for sec_name, lines in sections.items():
        if any(k in sec_name.lower() for k in ("summary", "profile", "objective", "about")):
            return "\n".join(lines).strip()
    return None

def _extract_skills(doc: StructuredDocument) -> Tuple[List[SkillItem], List[str]]:
    skills_map: Dict[str, SkillItem] = {}
    
    for block in doc.blocks:
        b_text = block.text.lower()
        for pattern in COMMON_SKILL_PATTERNS:
            match = re.search(pattern, b_text, re.IGNORECASE)
            if match:
                raw_skill = match.group(0)
                norm_skill = normalize_skill_name(raw_skill)
                if norm_skill not in skills_map:
                    skills_map[norm_skill] = SkillItem(
                        skill=norm_skill,
                        evidence=block.text,
                        page=block.page,
                        section=block.section,
                        confidence=0.95 if "skill" in (block.section or "").lower() else 0.85
                    )
                    
    skill_items = list(skills_map.values())
    skill_names = deduplicate_skills([s.skill for s in skill_items])
    return skill_items, skill_names

def _extract_experience(doc: StructuredDocument) -> Tuple[List[ExperienceItem], Optional[str], Optional[str]]:
    experiences: List[ExperienceItem] = []
    current_title = None
    current_company = None
    
    # Look for experience section blocks
    exp_blocks = [b for b in doc.blocks if b.section and any(k in b.section.lower() for k in ("experience", "employment", "work history"))]
    if not exp_blocks:
        exp_blocks = doc.blocks
        
    date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}[\/\.-]\d{4}|\d{4})\s*[-–—to\s]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{1,2}[\/\.-]\d{4}|\d{4}|Present|Current|Now)'
    
    current_exp: Optional[ExperienceItem] = None
    
    for block in exp_blocks:
        text = block.text.strip()
        date_match = re.search(date_pattern, text, re.IGNORECASE)
        
        if date_match:
            # Start a new experience record
            start_d = date_match.group(1).strip()
            end_d = date_match.group(2).strip()
            is_cur = any(k in end_d.lower() for k in ("present", "current", "now"))
            
            # Extract title / company from text preceding or succeeding the date
            remaining = text.replace(date_match.group(0), '').strip(' |-–—,\t')
            title, comp = _split_title_company(remaining)
            
            current_exp = ExperienceItem(
                company=comp,
                job_title=title,
                start_date=start_d,
                end_date=end_d,
                is_current=is_cur,
                responsibilities=[]
            )
            experiences.append(current_exp)
            
            if is_cur and not current_title:
                current_title = title
                current_company = comp
        elif current_exp:
            if text.startswith("-") or text.startswith("*"):
                current_exp.responsibilities.append(text.lstrip("-* ").strip())
            elif not current_exp.company or not current_exp.job_title:
                t, c = _split_title_company(text)
                if t and not current_exp.job_title:
                    current_exp.job_title = t
                if c and not current_exp.company:
                    current_exp.company = c
                    
    if experiences and not current_title:
        current_title = experiences[0].job_title
        current_company = experiences[0].company
        
    return experiences, current_title, current_company

def _split_title_company(text: str) -> Tuple[Optional[str], Optional[str]]:
    if not text:
        return None, None
    parts = re.split(r'\s*(?:at|@|\||-|,)\s*', text, maxsplit=1)
    if len(parts) == 2:
        return parts[0].strip() or None, parts[1].strip() or None
    return text.strip() or None, None

def _extract_education(doc: StructuredDocument) -> List[EducationItem]:
    education: List[EducationItem] = []
    edu_blocks = [b for b in doc.blocks if b.section and any(k in b.section.lower() for k in ("education", "academic", "degree", "qualification"))]
    if not edu_blocks:
        edu_blocks = [b for b in doc.blocks if any(k in b.text.lower() for k in ("b.tech", "btech", "b.e", "m.tech", "mca", "bca", "bachelor", "master", "ph.d", "degree", "university", "institute"))]
        
    for block in edu_blocks:
        text = block.text
        deg_match = re.search(r'\b(B\.?Tech|B\.?E\.?|M\.?Tech|M\.?C\.?A\.?|B\.?C\.?A\.?|B\.?Sc|M\.?Sc|Bachelor(?:\'s)?|Master(?:\'s)?|Ph\.?D)\b', text, re.IGNORECASE)
        year_match = re.search(r'\b(19\d{2}|20\d{2})\b', text)
        
        if deg_match:
            deg = deg_match.group(0).upper()
            inst = text.replace(deg_match.group(0), '')
            if year_match:
                inst = inst.replace(year_match.group(0), '')
            inst = inst.strip(' ,|-–—\t') or "University / Institute"
            
            education.append(EducationItem(
                degree=deg,
                institution=inst,
                start_year=None,
                end_year=year_match.group(0) if year_match else None
            ))
    return education

def _extract_certifications(sections: Dict[str, List[str]], raw_text: str) -> List[str]:
    certs = []
    for sec, lines in sections.items():
        if "certif" in sec.lower() or "license" in sec.lower():
            for ln in lines:
                clean_ln = ln.lstrip("-* ").strip()
                if clean_ln and len(clean_ln) > 3:
                    certs.append(clean_ln)
    return certs

def _extract_projects(sections: Dict[str, List[str]], raw_text: str) -> List[ProjectItem]:
    projects = []
    for sec, lines in sections.items():
        if "project" in sec.lower():
            for ln in lines:
                clean_ln = ln.lstrip("-* ").strip()
                if clean_ln and len(clean_ln) > 4:
                    projects.append(ProjectItem(name=clean_ln))
    return projects

def _extract_languages(sections: Dict[str, List[str]], raw_text: str) -> List[str]:
    langs = []
    for sec, lines in sections.items():
        if "language" in sec.lower():
            for ln in lines:
                for w in re.split(r'[,|/]+', ln):
                    clean_w = w.strip().title()
                    if clean_w in ("English", "Hindi", "Marathi", "Tamil", "Telugu", "Kannada", "French", "German", "Spanish", "Japanese"):
                        langs.append(clean_w)
    return list(set(langs))

def _extract_notice_period(raw_text: str) -> Optional[str]:
    np_match = re.search(r'\b(?:notice period|availability)\s*[:=-]?\s*(\d+\s*(?:days?|months?|weeks?)|immediate(?:ly)?)\b', raw_text, re.IGNORECASE)
    return np_match.group(1).title() if np_match else None
