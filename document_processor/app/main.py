from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.parse import router as parse_router

app = FastAPI(
    title="ATS Tasknera Document Processing Service",
    description="Python microservice for PDF (PyMuPDF), DOCX, TXT document extraction and OCR fallback",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parse_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "document_processor",
        "engine": "PyMuPDF (fitz) + python-docx + Tesseract OCR"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
