import re

def clean_extracted_text(raw_text: str) -> str:
    """
    Normalizes extracted text without destroying line breaks or requirement bullet points.
    Strips PDF metadata dictionary tags.
    """
    if not raw_text:
        return ""

    text = raw_text

    # Strip PDF metadata dictionary artifacts & producer strings
    text = re.sub(r'%PDF-[\d.]+', '', text, flags=re.IGNORECASE)
    text = re.sub(r'ReportLab Generated PDF document', '', text, flags=re.IGNORECASE)
    text = re.sub(r'/Producer\s*\([^)]*\)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'/Creator\s*\([^)]*\)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'/Title\s*\([^)]*\)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'obj[\s\S]*?endobj', '', text, flags=re.IGNORECASE)

    # Strip zero-width spaces, non-breaking spaces, and invisible unicode artifacts
    text = re.sub(r'[\u200B\u200C\u200D\uFEFF\u00A0]', ' ', text)

    # Normalize line breaks and horizontal spaces
    text = text.replace('\r\n', '\n').replace('\r', '\n')

    # Reattach lone bullet characters on their own line to the following bullet line
    text = re.sub(r'([●•*\-–—▪▫➢✓✔]|\d+[\.\)])[ \t]*\n+', r'\1 ', text)

    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()
