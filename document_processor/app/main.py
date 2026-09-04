from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.parse import router as parse_router
from app.routes.evaluate import router as evaluate_router

app = FastAPI(
    title="TaskNera Deterministic ATS & Document Processing Service",
    description="Deterministic ATS Scoring Engine v2.1 with PyMuPDF, spaCy, RapidFuzz, and local embeddings",
    version="2.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(parse_router)
app.include_router(evaluate_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "tasknera_ats_engine",
        "rules_version": "2.1.0",
        "engine": "Deterministic ATS (spaCy + RapidFuzz + PyMuPDF + SentenceTransformers)",
        "llm_calls_permitted": False
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
