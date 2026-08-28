from typing import Dict, Any

def analyze_document_quality(text: str, page_count: int = 1) -> Dict[str, Any]:
    cleaned = (text or "").strip()
    words = [w for w in cleaned.split() if w]
    lines = [l.strip() for l in cleaned.split('\n') if l.strip()]

    char_count = len(cleaned)
    word_count = len(words)
    line_count = len(lines)

    if char_count < 20 or word_count < 5:
        quality = "FAILED"
    elif char_count < 50 or word_count < 10:
        quality = "INSUFFICIENT"
    else:
        quality = "GOOD"

    return {
        "textQuality": quality,
        "characterCount": char_count,
        "wordCount": word_count,
        "lineCount": line_count,
        "pageCount": page_count
    }
