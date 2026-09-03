import os
from typing import List, Dict, Any
from app.models.document_schema import StructuredDocument, DocumentBlock, BlockType
from app.normalizers.text_normalizer import clean_text
from app.utils.logging_utils import log_info_safe, log_warning_safe, log_error_safe

def parse_with_paddleocr(file_path: str, file_name: str, ext: str) -> StructuredDocument:
    """
    OCR Fallback Engine using PaddleOCR (or Tesseract / PyMuPDF Pixmap fallback)
    for scanned PDFs, low-quality documents, and image formats (PNG, JPG, TIFF).
    """
    blocks: List[DocumentBlock] = []
    sections: Dict[str, List[str]] = {"OCR_Content": []}
    raw_text_parts: List[str] = []
    page_count = 1
    
    log_info_safe(f"[PaddleOCR Triggered] Running OCR fallback pipeline on {file_name}...")
    
    try:
        # 1. Try PaddleOCR if installed
        try:
            from paddleocr import PaddleOCR
            ocr_engine = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
            
            if ext.lower() == ".pdf":
                import fitz
                doc = fitz.open(file_path)
                page_count = len(doc)
                
                for page_num, page in enumerate(doc, start=1):
                    pix = page.get_pixmap(dpi=200)
                    img_bytes = pix.tobytes("png")
                    
                    import tempfile
                    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_img:
                        tmp_img.write(img_bytes)
                        tmp_img_path = tmp_img.name
                        
                    try:
                        result = ocr_engine.ocr(tmp_img_path, cls=True)
                        if result and len(result) > 0 and result[0]:
                            for line_info in result[0]:
                                text_val = clean_text(line_info[1][0] if len(line_info) > 1 else "")
                                conf = float(line_info[1][1]) if len(line_info) > 1 and len(line_info[1]) > 1 else 0.9
                                if text_val:
                                    block = DocumentBlock(
                                        page=page_num,
                                        section="OCR_Content",
                                        type=BlockType.PARAGRAPH,
                                        text=text_val,
                                        confidence=conf
                                    )
                                    blocks.append(block)
                                    sections["OCR_Content"].append(text_val)
                                    raw_text_parts.append(text_val)
                    finally:
                        if os.path.exists(tmp_img_path):
                            os.remove(tmp_img_path)
                doc.close()
            else: # Image file (.png, .jpg, .jpeg)
                result = ocr_engine.ocr(file_path, cls=True)
                if result and len(result) > 0 and result[0]:
                    for line_info in result[0]:
                        text_val = clean_text(line_info[1][0] if len(line_info) > 1 else "")
                        conf = float(line_info[1][1]) if len(line_info) > 1 and len(line_info[1]) > 1 else 0.9
                        if text_val:
                            block = DocumentBlock(
                                page=1,
                                section="OCR_Content",
                                type=BlockType.PARAGRAPH,
                                text=text_val,
                                confidence=conf
                            )
                            blocks.append(block)
                            sections["OCR_Content"].append(text_val)
                            raw_text_parts.append(text_val)
                            
        except Exception as p_err:
            log_warning_safe(f"[PaddleOCR Notice]: {p_err}. Using PyMuPDF Pixmap / Tesseract Fallback.")
            blocks, raw_text_parts, page_count = _fallback_tesseract_ocr(file_path, ext)
            sections["OCR_Content"] = raw_text_parts
            
    except Exception as e:
        log_error_safe(f"[OCR Error] OCR pipeline failed on {file_name}: {e}", exc_info=True)
        
    full_text = "\n".join(raw_text_parts)
    
    return StructuredDocument(
        file_name=file_name,
        file_type=ext.replace(".", "").upper(),
        page_count=page_count,
        character_count=len(full_text),
        word_count=len(full_text.split()),
        parser_engine="docling+paddleocr",
        ocr_used=True,
        blocks=blocks,
        raw_text=full_text,
        layout_text=full_text,
        sections=sections,
        warnings=["OCR fallback was required due to image/scanned content or low extractable digital text."]
    )

def _fallback_tesseract_ocr(file_path: str, ext: str):
    blocks: List[DocumentBlock] = []
    raw_text_parts: List[str] = []
    page_count = 1
    
    try:
        import pytesseract
        from PIL import Image
        
        if ext.lower() == ".pdf":
            import fitz
            doc = fitz.open(file_path)
            page_count = len(doc)
            for page_num, page in enumerate(doc, start=1):
                pix = page.get_pixmap(dpi=150)
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                text = pytesseract.image_to_string(img)
                lines = [clean_text(l) for l in text.split("\n") if clean_text(l)]
                for ln in lines:
                    blocks.append(DocumentBlock(page=page_num, section="OCR_Content", text=ln))
                    raw_text_parts.append(ln)
            doc.close()
        else:
            img = Image.open(file_path)
            text = pytesseract.image_to_string(img)
            lines = [clean_text(l) for l in text.split("\n") if clean_text(l)]
            for ln in lines:
                blocks.append(DocumentBlock(page=1, section="OCR_Content", text=ln))
                raw_text_parts.append(ln)
    except Exception as ocr_err:
        log_warning_safe(f"[Tesseract Notice]: {ocr_err}")
        
    return blocks, raw_text_parts, page_count
