import os
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.parsers.document_parser import parse_document
from app.extractors.cv_extractor import extract_cv
from app.extractors.jd_extractor import extract_jd
from app.validators.cv_validator import validate_cv_data
from app.validators.jd_validator import validate_jd_data
from app.utils.logging_utils import log_info_safe, log_error_safe

router = APIRouter()

@router.post("/parse")
async def parse_any_document(
    file: UploadFile = File(...),
    document_type: Optional[str] = Form(None)
):
    """
    Unified production document parsing endpoint.
    Accepts PDF, DOCX, DOC, TXT, PNG, JPG, JPEG files.
    Extracts structured CV or JD schema based on content & layout.
    """
    try:
        content = await file.read()
        filename = file.filename or "uploaded_document.pdf"
        
        # 1. Parse document layout & blocks
        doc = parse_document(content, filename, forced_type=document_type)
        
        # 2. Extract & Validate structured data
        if doc.document_type.value == "JOB_DESCRIPTION":
            extracted_jd = extract_jd(doc)
            validated_jd = validate_jd_data(extracted_jd)
            
            return {
                "success": True,
                "document_type": "JOB_DESCRIPTION",
                "parser": doc.parser_engine,
                "ocr_used": doc.ocr_used,
                "data": validated_jd.dict(),
                "confidence": validated_jd.confidence,
                "warnings": doc.warnings + validated_jd.warnings,
                # Backward-compatibility flat text fields
                "text": doc.raw_text,
                "layout_text": doc.layout_text,
                "characterCount": doc.character_count,
                "wordCount": doc.word_count,
                "pageCount": doc.page_count
            }
        else: # CV
            extracted_cv = extract_cv(doc)
            validated_cv = validate_cv_data(extracted_cv)
            
            return {
                "success": True,
                "document_type": "CV",
                "parser": doc.parser_engine,
                "ocr_used": doc.ocr_used,
                "data": validated_cv.dict(),
                "confidence": validated_cv.confidence,
                "warnings": doc.warnings + validated_cv.warnings,
                # Backward-compatibility flat text fields
                "text": doc.raw_text,
                "layout_text": doc.layout_text,
                "characterCount": doc.character_count,
                "wordCount": doc.word_count,
                "pageCount": doc.page_count
            }
            
    except Exception as e:
        log_error_safe(f"Error in /parse: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse-document")
async def parse_document_legacy(
    file: UploadFile = File(...)
):
    """
    Backward-compatible endpoint matching existing Node.js requests.
    """
    return await parse_any_document(file=file)

@router.post("/parse/cv")
async def parse_cv_endpoint(file: UploadFile = File(...)):
    """Specialized endpoint for CV parsing."""
    return await parse_any_document(file=file, document_type="CV")

@router.post("/parse/jd")
async def parse_jd_endpoint(file: UploadFile = File(...)):
    """Specialized endpoint for JD parsing."""
    return await parse_any_document(file=file, document_type="JOB_DESCRIPTION")
