import re
import unicodedata

def normalize_text(text: str) -> str:
    """
    Deterministic text normalizer for CVs and JDs:
    1. Unicode normalization (NFKC decomposes ligatures e.g. fi -> fi, standardizes characters).
    2. Normalize smart quotes, dashes, bullets, and currency symbols.
    3. Reattach broken hyphenated line-breaks (e.g. 'implemen-\\ntation' -> 'implementation').
    4. Reattach split bullet lines.
    5. Clean repeating spaces while preserving paragraph and line structures.
    """
    if not text:
        return ""

    # 1. Unicode NFKC normalization
    text = unicodedata.normalize("NFKC", text)

    # 2. Convert smart quotes and apostrophes
    text = text.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'").replace("`", "'")

    # 3. Standardize dashes and hyphens
    text = re.sub(r'[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]', '-', text)

    # 4. Standardize bullet characters to a uniform symbol '•'
    text = re.sub(r'[\u2022\u2023\u25E6\u2043\u2219\u25AA\u25AB\u25CF\u25CB\u25A0\u25A1▪▫●o*]\s+', '• ', text)

    # 5. Fix hyphenation at line breaks (e.g., 'archi-\ntecture' -> 'architecture')
    text = re.sub(r'(\b[a-zA-Z]{2,})-\s*\n\s*([a-zA-Z]{2,}\b)', r'\1\2', text)

    # 6. Reattach broken bullet points: if line does not start with bullet, capital, or section keyword,
    # and previous line was a bullet item without terminating period, merge with single space.
    lines = text.split('\n')
    merged_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            merged_lines.append("")
            continue

        if merged_lines and merged_lines[-1].startswith('•') and not stripped.startswith('•') and not stripped.startswith('#'):
            # Check if previous bullet did not end with punctuation (. or ; or :)
            prev_line = merged_lines[-1].rstrip()
            if prev_line and prev_line[-1] not in ('.', ';', ':', '!', '?') and len(stripped) > 0 and stripped[0].islower():
                merged_lines[-1] = f"{prev_line} {stripped}"
                continue

        merged_lines.append(stripped)

    normalized = '\n'.join(merged_lines)

    # 7. Collapse multiple blank lines to max 2
    normalized = re.sub(r'\n{3,}', '\n\n', normalized)

    # 8. Collapse inline horizontal spaces (tabs, multiple spaces) to single space
    normalized = re.sub(r'[^\S\n]+', ' ', normalized)

    return normalized.strip()
