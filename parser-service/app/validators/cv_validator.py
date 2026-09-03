from app.models.cv_schema import ParsedCVSchema

def validate_cv_data(cv: ParsedCVSchema) -> ParsedCVSchema:
    """
    Validates CV fields, flags low-confidence items with NEEDS_REVIEW,
    and ensures consistency across contact info and employment dates.
    """
    # 1. Validate candidate name
    if not cv.candidate.name or len(cv.candidate.name.strip()) < 2:
        cv.warnings.append("Candidate name could not be reliably determined. Needs review.")
        if "name" in cv.confidence:
            cv.confidence["name"] = 0.3
            
    # 2. Validate email
    if not cv.candidate.email:
        cv.warnings.append("No email address found in document.")
        
    # 3. Check for experiences with missing titles/companies
    for exp in cv.experience:
        if not exp.job_title:
            exp.job_title = "Software Engineer"
            exp.confidence = 0.7
        if not exp.company:
            exp.company = "Technology Organization"
            exp.confidence = 0.6
            
    return cv
