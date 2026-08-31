import re
from typing import Dict, Any

def analyze_document_quality(text: str, page_count: int = 1) -> Dict[str, Any]:
    """
    Validates whether extracted text is legible and CV-like.
    Detects and rejects HTML documents, source code, and corrupted binary streams.
    """
    cleaned = (text or "").strip()
    words = [w for w in cleaned.split() if w]
    lines = [l.strip() for l in cleaned.split('\n') if l.strip()]

    char_count = len(cleaned)
    word_count = len(words)
    line_count = len(lines)

    # Detect obvious HTML or web markup indicators
    html_pattern = re.compile(r'(?:<!doctype\s+html|<html|<body|<div|<head|<script|<style)', re.IGNORECASE)
    is_html = bool(html_pattern.search(text or ""))

    # Detect source code indicators
    code_pattern = re.compile(r'(?:import\s+React|from\s+[\'"]react|export\s+default\s+function|const\s+\w+\s*=\s*\(\)\s*=>)', re.IGNORECASE)
    is_source_code = bool(code_pattern.search(text or ""))

    # Check for CV-like keywords/sections
    cv_keywords = re.compile(
        r'\b(?:experience|education|skills|summary|profile|projects|certifications|employment|work history|contact|languages|technologies|objective|qualification)\b',
        re.IGNORECASE
    )
    has_cv_sections = bool(cv_keywords.search(cleaned))

    if is_html or is_source_code:
        quality = "FAILED"
    elif char_count < 25 or word_count < 6:
        quality = "FAILED"
    elif char_count < 60 or word_count < 12:
        quality = "INSUFFICIENT"
    elif not has_cv_sections and (char_count < 100 or word_count < 20):
        quality = "INSUFFICIENT"
    else:
        quality = "GOOD"

    return {
        "textQuality": quality,
        "characterCount": char_count,
        "wordCount": word_count,
        "lineCount": line_count,
        "pageCount": page_count,
        "hasCvSections": has_cv_sections,
        "isHtml": is_html,
        "isSourceCode": is_source_code
    }
