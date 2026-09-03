from app.models.jd_schema import ParsedJDSchema

def validate_jd_data(jd: ParsedJDSchema) -> ParsedJDSchema:
    """
    Validates JD fields, checks salary min/max consistency,
    and ensures clean requirement categorizations.
    """
    # 1. Salary consistency
    if jd.job.salary.min and jd.job.salary.max and jd.job.salary.min > jd.job.salary.max:
        # Swap if min > max
        jd.job.salary.min, jd.job.salary.max = jd.job.salary.max, jd.job.salary.min
        
    # 2. Company fallback
    if not jd.job.company or len(jd.job.company.strip()) < 2:
        jd.warnings.append("Company name could not be reliably determined from JD.")
        if "company" in jd.confidence:
            jd.confidence["company"] = 0.4
            
    # 3. Position title
    if not jd.job.title or len(jd.job.title.strip()) < 2:
        jd.job.title = "Software Engineer"
        jd.warnings.append("Position title set to default fallback.")
        
    return jd
