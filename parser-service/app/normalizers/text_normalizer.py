import re
import unicodedata

def clean_text(text: str) -> str:
    """Cleans unicode artifacts, standardized bullet points, and excess whitespace."""
    if not text:
        return ""
    
    # Normalize unicode
    text = unicodedata.normalize("NFKD", text)
    
    # Replace weird bullet points with clean hyphen
    text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\u25CB\u25CF\u25A0\u25AA\u25AB\uF0B7\uF0A7\uF0D8\u27A2\u279C\u2714\u2713•▪►✓✔★]', '-', text)
    
    # Replace non-breaking spaces and tabs
    text = text.replace('\xa0', ' ').replace('\t', ' ')
    
    # Fix broken line breaks inside words
    text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)
    
    # Replace multiple spaces with single space
    text = re.sub(r'[ ]{2,}', ' ', text)
    
    # Clean excessive newlines (max 2 consecutive)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

def strip_concatenated_headers(text: str) -> str:
    """
    Strips adjacent section headers that often get erroneously concatenated in regex parsers.
    e.g. '6-10 LPAJob SummaryTechNova Solutions' -> 'TechNova Solutions'
    """
    if not text:
        return ""
    
    # Clean known JD header concatenations
    patterns = [
        r'^\d+\s*[-–—]\s*\d+\s*(?:LPA|Lakhs?|Per Annum)?\s*(?:Job Summary|About the Role|About Us)?\s*',
        r'^(?:Job Summary|About the Role|Company Overview|About Us)\s*',
        r'^(?:Location|Work Mode|Salary|Compensation|Requirements|Responsibilities)\s*:\s*',
        r'^(?:Location|Work Mode|Salary|Compensation)\s+',
    ]
    cleaned = text.strip()
    for p in patterns:
        cleaned = re.sub(p, '', cleaned, flags=re.IGNORECASE).strip()
    return cleaned
