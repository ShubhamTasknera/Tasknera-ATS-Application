import io
import logging
from typing import Optional

logger = logging.getLogger("document_processor.ocr")

def perform_ocr_on_images(images: list) -> str:
    """
    OCR abstraction layer over image lists using pytesseract.
    """
    try:
        import pytesseract
        text_chunks = []
        for img in images:
            txt = pytesseract.image_to_string(img)
            if txt:
                text_chunks.append(txt)
        return "\n".join(text_chunks)
    except Exception as e:
        logger.warning(f"Tesseract OCR fallback encountered issue: {e}")
        return ""

def perform_pdf_ocr(pdf_bytes: bytes) -> str:
    """
    Converts PDF pages to images via fitz/pdf2image and performs OCR.
    """
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        ocr_texts = []
        import pytesseract
        from PIL import Image

        for page_index in range(len(doc)):
            page = doc[page_index]
            pix = page.get_pixmap(dpi=150)
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            text = pytesseract.image_to_string(img)
            if text:
                ocr_texts.append(text)
        
        return "\n".join(ocr_texts)
    except Exception as e:
        logger.warning(f"PyMuPDF page rendering for OCR warning: {e}")
        return ""
