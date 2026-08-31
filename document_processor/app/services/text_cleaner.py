import re

def clean_extracted_text(raw_text: str) -> str:
    """
    Normalizes extracted text, strips HTML tags, PDF stream artifacts, and invalid control characters.
    Preserves line breaks, bullet points, and section formatting.
    """
    if not raw_text:
        return ""

    text = raw_text

    # 1. Strip HTML tags, doctype, and markup
    text = re.sub(r'<!DOCTYPE[^>]*>', '', text, flags=re.IGNORECASE)
    text = re.sub(r'</?\w+>', ' ', text, flags=re.IGNORECASE)
    text = re.sub(r'<[^>]+>', ' ', text)  # generic tag cleaner

    # 2. Decode common HTML entities
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"').replace('&#39;', "'")

    # 3. Strip PDF metadata dictionary artifacts & producer strings
    text = re.sub(r'%PDF-[\d.]+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'ReportLab Generated PDF document', '', text, flags=re.IGNORECASE)
    text = re.sub(r'/(?:Producer|Creator|Title|Author|Subject|Keywords)\s*\([^)]*\)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\bobj[\s\S]*?endobj\b', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\bxref[\s\S]*?trailer\b', '', text, flags=re.IGNORECASE)

    # 4. Strip zero-width spaces, non-breaking spaces, and invisible unicode artifacts
    text = re.sub(r'[\u200B\u200C\u200D\uFEFF\u00A0\u0000-\u0008\u000B\u000C\u000E-\u001F]', ' ', text)

    # 5. Normalize line breaks
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # 6. Reattach lone bullet characters on their own line to the following bullet line
    text = re.sub(r'([●•*\-–—▪▫➢✓✔]|\d+[\.\)])[ \t]*\n+', r'\1 ', text)

    # 7. Normalize spaces and excessive blank lines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()
