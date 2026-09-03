import os
from pydantic import BaseModel

class Settings(BaseModel):
    HOST: str = os.getenv("PARSER_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PARSER_PORT", "8000"))
    DEBUG: bool = os.getenv("PARSER_DEBUG", "False").lower() in ("true", "1", "yes")
    
    # OCR Settings
    OCR_MIN_CHARS_THRESHOLD: int = int(os.getenv("OCR_MIN_CHARS_THRESHOLD", "40"))
    OCR_MIN_WORDS_THRESHOLD: int = int(os.getenv("OCR_MIN_WORDS_THRESHOLD", "8"))
    OCR_LANGUAGE: str = os.getenv("OCR_LANGUAGE", "en")
    
    # File Limits
    MAX_FILE_SIZE_BYTES: int = int(os.getenv("MAX_FILE_SIZE_BYTES", str(30 * 1024 * 1024))) # 30MB
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx", ".doc", ".txt", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
    
    # Parser Version
    PARSER_VERSION: str = "2.0.0-docling-local"

settings = Settings()
