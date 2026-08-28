# pyrefly: ignore [missing-import]
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.schemas import DocumentParseResponse
from app.utils.file_utils import detect_file_type
from app.services.pdf_parser import parse_pdf_bytes
from app.services.docx_parser import parse_docx_bytes
from app.services.txt_parser import parse_txt_bytes

router = APIRouter()

@router.post("/parse-document", response_model=DocumentParseResponse)
async def parse_document(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided in request.")

    filename = file.filename
    content_type = file.content_type
    ext, category = detect_file_type(filename, content_type)

    try:
        file_bytes = await file.read()
        if not file_bytes or len(file_bytes) == 0:
            return DocumentParseResponse(
                success=False,
                fileName=filename,
                fileType=content_type or category,
                pageCount=0,
                extractionMethod="none",
                ocrUsed=False,
                textQuality="FAILED",
                characterCount=0,
                wordCount=0,
                text="",
                layoutText="",
                normalizedText="",
                error="Uploaded file is empty (0 bytes)."
            )

        if category == 'pdf':
            parsed = parse_pdf_bytes(file_bytes)
        elif category == 'docx':
            parsed = parse_docx_bytes(file_bytes)
        else:
            parsed = parse_txt_bytes(file_bytes)

        layout_txt = parsed.get("layoutText", parsed.get("text", ""))
        norm_txt = parsed.get("normalizedText", parsed.get("text", ""))

        success = parsed["textQuality"] != "FAILED" and len(norm_txt.strip()) > 0
        error_msg = None if success else "Unable to extract readable text from document. Text extraction was insufficient."

        return DocumentParseResponse(
            success=success,
            fileName=filename,
            fileType=content_type or f"application/{category}",
            pageCount=parsed["pageCount"],
            extractionMethod=parsed["extractionMethod"],
            ocrUsed=parsed["ocrUsed"],
            textQuality=parsed["textQuality"],
            characterCount=parsed["characterCount"],
            wordCount=parsed["wordCount"],
            text=parsed["text"],
            layoutText=layout_txt,
            normalizedText=norm_txt,
            error=error_msg
        )
    except Exception as e:
        return DocumentParseResponse(
            success=False,
            fileName=filename,
            fileType=content_type or "unknown",
            pageCount=0,
            extractionMethod="failed",
            ocrUsed=False,
            textQuality="FAILED",
            characterCount=0,
            wordCount=0,
            text="",
            layoutText="",
            normalizedText="",
            error=f"Document processing error: {str(e)}"
        )
