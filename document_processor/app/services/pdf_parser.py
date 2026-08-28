import fitz  # PyMuPDF
from typing import Tuple, Dict, Any
from app.services.text_cleaner import clean_extracted_text
from app.services.document_analyzer import analyze_document_quality
from app.services.ocr import perform_pdf_ocr

def extract_layout_aware_page(page) -> str:
    """
    Extracts text from a PyMuPDF page using word bounding coordinates.
    Sorts words into visual lines by Y-coordinate clustering,
    handles two-column layouts, and orders words left-to-right.
    """
    words = page.get_text("words")
    # Each word tuple: (x0, y0, x1, y1, word, block_no, line_no, word_no)
    if not words:
        return page.get_text("text") or ""

    rect = page.rect
    page_width = rect.width
    mid_x = page_width / 2.0

    left_words = [w for w in words if w[0] < mid_x]
    right_words = [w for w in words if w[0] >= mid_x]

    is_two_column = len(left_words) > 10 and len(right_words) > 10 and len(right_words) > len(words) * 0.2

    def process_words_into_lines(word_list):
        if not word_list:
            return []
        sorted_words = sorted(word_list, key=lambda w: (w[1], w[0]))
        lines = []
        current_line = []
        current_y = None

        for w in sorted_words:
            x0, y0, x1, y1, word_text = w[0], w[1], w[2], w[3], w[4]
            if current_y is None:
                current_y = y0
                current_line.append((x0, word_text))
            elif abs(y0 - current_y) <= 4.0:
                current_line.append((x0, word_text))
            else:
                current_line_sorted = sorted(current_line, key=lambda item: item[0])
                lines.append(" ".join(item[1] for item in current_line_sorted))
                current_line = [(x0, word_text)]
                current_y = y0

        if current_line:
            current_line_sorted = sorted(current_line, key=lambda item: item[0])
            lines.append(" ".join(item[1] for item in current_line_sorted))

        return lines

    if is_two_column:
        left_lines = process_words_into_lines(left_words)
        right_lines = process_words_into_lines(right_words)
        return "\n".join(left_lines) + "\n\n" + "\n".join(right_lines)
    else:
        page_lines = process_words_into_lines(words)
        return "\n".join(page_lines)

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
