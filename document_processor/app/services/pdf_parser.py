import fitz  # PyMuPDF
from typing import Tuple, Dict, Any
from app.services.text_cleaner import clean_extracted_text
from app.services.document_analyzer import analyze_document_quality
from app.services.ocr import perform_pdf_ocr

def extract_layout_aware_page(page) -> str:
    """
    Extracts text from a PyMuPDF page preserving visual reading order and paragraph/bullet boundaries.
    Uses sorted block structures from PyMuPDF.
    """
    blocks = page.get_text("blocks")
    if not blocks:
        return page.get_text("text") or ""

    # Sort blocks by vertical position, then horizontal
    sorted_blocks = sorted(blocks, key=lambda b: (b[1], b[0]))
    block_texts = []
    for b in sorted_blocks:
        b_text = b[4].strip()
        if b_text:
            block_texts.append(b_text)

    return "\n\n".join(block_texts)

def parse_pdf_bytes(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Parses PDF using PyMuPDF (fitz) text extraction across all pages.
    Uses layout-aware word coordinate extraction to generate rawText, layoutText, and normalizedText.
    Triggers OCR fallback if text extraction quality is INSUFFICIENT.
    """
    page_count = 1
    extracted_raw = ""
    extracted_layout = ""
    extraction_method = "pymupdf-layout"
    ocr_used = False

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        page_count = len(doc)
        
        raw_texts = []
        layout_texts = []
        for page_num in range(page_count):
            page = doc[page_num]
            raw_txt = page.get_text("text") or ""
            layout_txt = extract_layout_aware_page(page)

            if raw_txt:
                raw_texts.append(raw_txt)
            if layout_txt:
                layout_texts.append(layout_txt)
        
        extracted_raw = "\n".join(raw_texts)
        extracted_layout = "\n".join(layout_texts)
    except Exception as e:
        extraction_method = "pdf-stream-fallback"
        extracted_raw = ""
        extracted_layout = ""

    cleaned_normalized = clean_extracted_text(extracted_layout or extracted_raw)
    metrics = analyze_document_quality(cleaned_normalized, page_count)

    # Trigger OCR fallback if text is INSUFFICIENT or FAILED
    if metrics["textQuality"] in ["INSUFFICIENT", "FAILED"]:
        ocr_text = perform_pdf_ocr(pdf_bytes)
        cleaned_ocr = clean_extracted_text(ocr_text)
        ocr_metrics = analyze_document_quality(cleaned_ocr, page_count)

        if ocr_metrics["characterCount"] > metrics["characterCount"]:
            cleaned_normalized = cleaned_ocr
            extracted_layout = cleaned_ocr
            metrics = ocr_metrics
            extraction_method = "pymupdf+ocr"
            ocr_used = True

    return {
        "text": clean_extracted_text(extracted_raw),
        "layoutText": extracted_layout or cleaned_normalized,
        "normalizedText": cleaned_normalized,
        "pageCount": page_count,
        "extractionMethod": extraction_method,
        "ocrUsed": ocr_used,
        "textQuality": metrics["textQuality"],
        "characterCount": metrics["characterCount"],
        "wordCount": metrics["wordCount"]
    }
