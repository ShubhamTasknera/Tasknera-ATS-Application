from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.config import settings

app = FastAPI(
    title="ATS Tasknera Document Intelligence Service",
    description="Free, Local, Production-Quality CV & JD Parsing Engine (Docling + PaddleOCR fallback)",
    version=settings.PARSER_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ATS Tasknera Parser Service",
        "version": settings.PARSER_VERSION,
        "engine": "Docling + PaddleOCR Fallback + Pydantic"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
