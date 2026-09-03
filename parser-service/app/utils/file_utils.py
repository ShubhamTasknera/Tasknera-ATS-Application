import os
import tempfile
from typing import Tuple
from app.config import settings

def validate_and_save_temp_file(file_bytes: bytes, filename: str) -> Tuple[str, str]:
    """
    Validates file size and extension, then saves to a safe temp file.
    Returns (temp_file_path, file_extension).
    """
    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size {len(file_bytes)} bytes exceeds maximum allowed limit {settings.MAX_FILE_SIZE_BYTES} bytes.")
    
    _, ext = os.path.splitext(filename.lower())
    if not ext:
        ext = ".pdf"
        
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file extension '{ext}'. Allowed: {', '.join(sorted(settings.ALLOWED_EXTENSIONS))}")
        
    temp_dir = tempfile.gettempdir()
    safe_prefix = "ats_parse_"
    temp_fd, temp_path = tempfile.mkstemp(suffix=ext, prefix=safe_prefix, dir=temp_dir)
    
    with os.fdopen(temp_fd, "wb") as f:
        f.write(file_bytes)
        
    return temp_path, ext

def cleanup_temp_file(file_path: str):
    """Safely removes temp file after extraction."""
    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass
