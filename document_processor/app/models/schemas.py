# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import Optional

class DocumentParseResponse(BaseModel):
    success: bool
    fileName: str
    fileType: str
    pageCount: int
    extractionMethod: str
    ocrUsed: bool
    textQuality: str
    characterCount: int
    wordCount: int
    text: str
    layoutText: Optional[str] = ""
    normalizedText: Optional[str] = ""
    error: Optional[str] = None
