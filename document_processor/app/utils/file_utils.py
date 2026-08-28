import os
from typing import Tuple, Optional

def detect_file_type(filename: str, content_type: Optional[str] = None) -> Tuple[str, str]:
    """
    Returns normalized extension and file category ('pdf', 'docx', 'txt', 'unknown')
    """
    lower_name = (filename or "").lower()
    
    if lower_name.endswith('.pdf') or content_type == 'application/pdf':
        return '.pdf', 'pdf'
    elif lower_name.endswith('.docx') or lower_name.endswith('.doc') or 'word' in (content_type or ""):
        return '.docx', 'docx'
    elif lower_name.endswith('.txt') or 'text/plain' in (content_type or ""):
        return '.txt', 'txt'
    
    ext = os.path.splitext(lower_name)[1]
    return ext, 'unknown'
