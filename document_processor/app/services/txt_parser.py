from typing import Dict, Any
from app.services.text_cleaner import clean_extracted_text
from app.services.document_analyzer import analyze_document_quality

def parse_txt_bytes(txt_bytes: bytes, filename: str = "") -> Dict[str, Any]:
    """
    Parses plain text (.txt) files with UTF-8 and Latin-1 encoding fallbacks.
    """
    try:
        raw_text = txt_bytes.decode('utf-8')
    except UnicodeDecodeError:
        try:
            raw_text = txt_bytes.decode('latin1')
        except Exception:
            raw_text = txt_bytes.decode('utf-8', errors='ignore')

    cleaned_text = clean_extracted_text(raw_text)
    metrics = analyze_document_quality(cleaned_text, 1, filename)

    return {
        "text": cleaned_text,
        "pageCount": 1,
        "extractionMethod": "utf-8",
        "ocrUsed": False,
        "textQuality": metrics["textQuality"],
        "characterCount": metrics["characterCount"],
        "wordCount": metrics["wordCount"],
        # Structured Fields
        "candidateName": metrics["candidateName"],
        "email": metrics["email"],
        "phone": metrics["phone"],
        "skills": metrics["skills"],
        "yearsOfExperience": metrics["yearsOfExperience"],
        "education": metrics["education"],
        "pastCompanies": metrics["pastCompanies"],
        "summary": metrics["summary"],
        "rawTextSummary": metrics["rawTextSummary"],
    }

