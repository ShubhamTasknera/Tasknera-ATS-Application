# ATS Tasknera Backend Service

Node.js + Express + TypeScript REST API service for **ATS Tasknera**, integrated with PostgreSQL via Prisma ORM and JWT authentication.

---

## 🚀 Work Accomplished

### 1. Architecture & Setup
- **TypeScript & Express**: Strict TypeScript setup with ESM/CommonJS modules and clean controller-route-middleware architecture.
- **Environment Management**: Configured dotenv for database URLs (`DATABASE_URL`, `DIRECT_URL`) and JWT secrets (`JWT_SECRET`).

### 2. Database Schema (`prisma/schema.prisma`)
- **User Model (`users`)**:
  - `id`: UUID primary key
  - `email`: Unique user email
  - `password`: Hashed password string (`bcryptjs`)
  - `name`: Optional display name
  - `createdAt`, `updatedAt`
- **Job Model (`jobs`)**:
  - `id`: UUID primary key
  - `client`: Client / company name
  - `position`: Job title / position
  - `jd_file_url`, `jd_text`: Uploaded JD document path or raw text
  - `location`, `work_mode` (Remote/Hybrid/Onsite), `salary`, `status` (draft/published)
  - `created_by`: Foreign key to `User` with cascade delete
  - Indexes on `created_by` and `status`
- **Requirement Model (`requirements`)**:
  - `id`: UUID primary key
  - `job_id`: Foreign key to `Job` with cascade delete
  - `requirement`: Requirement criterion description
  - `category`: Category grouping (e.g. Technical Skills, Experience, Education)
  - `weight`: Float weightage (default `1.0`)
  - `is_mandatory`: Boolean flag for strict requirements
  - `evidence_required`: Boolean flag for proof-of-work validation
  - `recruiter_confirmed`: Recruiter audit verification flag
  - Indexes on `job_id` and `category`

### 3. Authentication & Security
- **Endpoints**:
  - `POST /api/auth/register` - Create recruiter user account
  - `POST /api/auth/login` - Authenticate & receive JWT bearer token
- **Security Middleware (`authMiddleware.ts`)**:
  - Verifies JWT Authorization header (`Bearer <token>`)
  - Attaches authenticated user payload to request context

---

## 🛠️ Getting Started

### Installation
```bash
npm install
```

### Database Migration & Client Generation
```bash
npx prisma generate
npx prisma db push
```

### Running Development Server
```bash
npm run dev
```
The backend server runs at **`http://localhost:5000`**.

### Build Production Bundle
```bash
npm run build
npm start
```
