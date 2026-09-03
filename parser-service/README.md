# ATS Tasknera Document Intelligence Parser Service

A free, local, production-quality document parsing microservice for CVs and Job Descriptions using **Docling**, **PaddleOCR fallback**, and **Pydantic** validation.

---

## 1. Overview
- **Primary Engine**: Docling (hierarchical layout, reading order, sections, tables, multi-column awareness).
- **Fallback Engine**: PaddleOCR for scanned PDFs, images (`.png`, `.jpg`, `.jpeg`), and unreadable text.
- **Normalization**: Synonyms (JS/TS/AWS/ML), annual INR salaries (e.g. `6–10 LPA` → `min: 600000, max: 1000000`), and non-overlapping tenure calculations.
- **No Cloud APIs**: 100% free, local execution without OpenAI, AWS Textract, or Azure Document Intelligence.

---

## 2. Local Setup Instructions

### Prerequisites
- Python 3.11+ (Python 3.11, 3.12, or 3.13)

### Installation
```bash
# 1. Create and activate a virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate

# Linux/macOS:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt
```

### Running the Service
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Health check verification:
```bash
curl http://127.0.0.1:8000/health
```

---

## 3. API Endpoints

### `POST /parse`
Unified document parsing endpoint. Accepts multipart `file` and optional `document_type`.

**Sample Response (Job Description):**
```json
{
  "success": true,
  "document_type": "JOB_DESCRIPTION",
  "parser": "docling",
  "ocr_used": false,
  "data": {
    "job": {
      "title": "Full Stack Developer",
      "company": "TechNova Solutions",
      "location": "Pune, Maharashtra",
      "work_mode": "Hybrid",
      "salary": {
        "min": 600000,
        "max": 1000000,
        "currency": "INR",
        "period": "ANNUAL",
        "formatted_label": "₹6–10 LPA"
      }
    },
    "requirements": [
      {
        "text": "3+ years experience with React and Node.js",
        "category": "Experience",
        "mandatory": true,
        "weight": 1.5
      }
    ]
  },
  "confidence": {
    "title": 0.95,
    "company": 0.95,
    "location": 0.95
  }
}
```

---

## 4. Docker Deployment
```bash
docker build -t ats-parser-service .
docker run -p 8000:8000 ats-parser-service
```
