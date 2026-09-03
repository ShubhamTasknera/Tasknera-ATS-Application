import os
from typing import Optional
from app.config import settings
from app.models.document_schema import StructuredDocument, DocumentType
from app.parsers.docling_parser import parse_with_docling
from app.parsers.paddleocr_parser import parse_with_paddleocr
from app.parsers.document_classifier import classify_document
from app.utils.file_utils import validate_and_save_temp_file, cleanup_temp_file
from app.utils.logging_utils import log_info_safe, log_warning_safe

def parse_document(file_bytes: bytes, filename: str, forced_type: Optional[str] = None) -> StructuredDocument:
    """
    Master document parsing pipeline:
    1. Ingestion & Validation
    2. Docling Primary Parsing
    3. Text Quality Evaluation
    4. PaddleOCR Fallback if needed
    5. Automatic Classification
    """
    temp_path, ext = validate_and_save_temp_file(file_bytes, filename)
    
    try:
        # Check if direct image file
        if ext.lower() in (".png", ".jpg", ".jpeg", ".tiff", ".bmp"):
            log_info_safe(f"[Parser Router] Direct image format detected ({ext}). Routing to OCR engine.")
            doc = parse_with_paddleocr(temp_path, filename, ext)
        else:
            # 1. Try Docling Primary Parser
            doc = parse_with_docling(temp_path, filename, ext)
            
            # 2. Evaluate Text Quality
            is_scanned_or_empty = (
                doc.character_count < settings.OCR_MIN_CHARS_THRESHOLD or
                doc.word_count < settings.OCR_MIN_WORDS_THRESHOLD
            )
            
            if is_scanned_or_empty:
                log_warning_safe(f"[Parser Quality Check] Low text quality ({doc.character_count} chars, {doc.word_count} words). Triggering OCR fallback for {filename}.")
                doc = parse_with_paddleocr(temp_path, filename, ext)
                
        # 3. Classify document type
        if forced_type and forced_type.upper() in ("CV", "JOB_DESCRIPTION"):
            doc.document_type = DocumentType(forced_type.upper())
        else:
            doc.document_type = classify_document(doc.raw_text, filename)
            
        log_info_safe(f"[Parser Complete] {filename} successfully parsed as {doc.document_type.value} using {doc.parser_engine} (OCR: {doc.ocr_used}).")
        return doc
        
    finally:
        cleanup_temp_file(temp_path)
