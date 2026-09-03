import re
from app.models.document_schema import DocumentType

CV_KEYWORDS = [
    r'\bcurriculum vitae\b', r'\bresume\b', r'\bwork experience\b', r'\bprofessional experience\b',
    r'\beducation\b', r'\bskills\b', r'\bcareer objective\b', r'\bprofile summary\b',
    r'\bprojects\b', r'\baccomplishments\b', r'\bcertifications\b', r'\blanguages\b'
]

JD_KEYWORDS = [
    r'\bjob description\b', r'\brole overview\b', r'\babout the role\b', r'\babout us\b',
    r'\bjob title\b', r'\bposition overview\b', r'\bkey responsibilities\b', r'\bqualifications\b',
    r'\bmandatory requirements\b', r'\brequired skills\b', r'\bpreferred skills\b', r'\bwhat you will do\b',
    r'\bwhat we offer\b', r'\bcompensation\b', r'\bsalary\b', r'\bwork mode\b', r'\bhybrid\b', r'\bremote\b',
    r'\bapply now\b', r'\bwho you are\b', r'\bexperience required\b'
]

def classify_document(text: str, filename: str = "") -> DocumentType:
    """
    Classifies whether the document is a CV or a JOB_DESCRIPTION based on structural clues.
    """
    if not text:
        return DocumentType.UNKNOWN
        
    text_lower = text.lower()
    fn_lower = filename.lower() if filename else ""
    
    # Filename hints
    if any(k in fn_lower for k in ("jd", "job_description", "job-description", "job_spec", "position")):
        return DocumentType.JOB_DESCRIPTION
    if any(k in fn_lower for k in ("cv", "resume", "curriculum", "profile")):
        return DocumentType.CV
        
    # Count keyword occurrences in content
    cv_score = sum(1 for pattern in CV_KEYWORDS if re.search(pattern, text_lower))
    jd_score = sum(1 for pattern in JD_KEYWORDS if re.search(pattern, text_lower))
    
    # JD indicators like "About the Company", "Responsibilities", "Qualifications"
    if jd_score > cv_score and jd_score >= 2:
        return DocumentType.JOB_DESCRIPTION
        
    if cv_score >= 2:
        return DocumentType.CV
        
    return DocumentType.CV if cv_score > 0 else DocumentType.UNKNOWN
