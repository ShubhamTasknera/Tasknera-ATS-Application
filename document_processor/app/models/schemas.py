from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class EducationItem(BaseModel):
    degree: str
    institution: Optional[str] = None
    year: Optional[str] = None

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
    # Structured CV Fields
    candidateName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    yearsOfExperience: Optional[str] = None
    education: List[Dict[str, Any]] = []
    pastCompanies: List[str] = []
    summary: Optional[str] = None
    rawTextSummary: Optional[str] = None
    error: Optional[str] = None

class BatchDocumentParseResponse(BaseModel):
    success: bool
    totalFiles: int
    successfulCount: int
    failedCount: int
    results: List[DocumentParseResponse]

