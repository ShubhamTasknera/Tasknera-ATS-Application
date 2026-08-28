# ATS Tasknera — AI-Powered Applicant Tracking System

An end-to-end modern Applicant Tracking System (ATS) tailored for recruiters, hiring managers, and enterprise talent acquisition teams. **ATS Tasknera** provides evidence-based candidate scoring, automated Job Description (JD) requirement extraction, candidate ranking, bias guard, and real-time recruitment analytics.

---

## 🌟 Key Accomplishments & Features Built

### 🎨 1. Frontend Application (`/FrontEnd`)
Built with **Next.js 15 (App Router)**, **TypeScript**, **React**, and **Tailwind CSS**. Designed with a professional dark theme background (`#060C1A`), high-contrast typography, and intuitive evaluation indicators.

- 🏠 **Landing & Product Showcase (`/home`)**:
  - **Hero Section**: Value proposition with interactive search, evidence-based candidate evaluation preview, and status indicators.
  - **Bias Guard Section**: Showcase of anonymized screening to eliminate hiring bias.
  - **Candidate Compare Grid**: Side-by-side candidate comparison matrix.
  - **Proof & Stats Interstitial**: Metrics on candidate retention, recruiter efficiency, and match precision.
  - **Integrations & Parsing Showcase**: Interactive resume parser workflow overview.
  
- 📊 **Recruiter Dashboard (`/dashboard`)**:
  - High-level metric overview (Active Jobs, Total Applicants, Shortlisted Candidates, Avg. Time-to-Hire).
  - Quick action shortcuts for posting jobs, reviewing JD requirements, and searching candidates.
  - Real-time recruitment activity stream.

- 💼 **Job Openings Management (`/jobs`)**:
  - Comprehensive job directory with search and multi-tag filtering (Status, Client, Location, Work Mode).
  - Candidate application counts and direct access to candidate pipelines.

- ➕ **Job Creation Workflow (`/jobs/create`)**:
  - Multi-step job posting interface.
  - File upload drag-and-drop & raw text paste support for Job Descriptions (JD).
  - Client detail specification, compensation ranges, work mode (Remote/Hybrid/Onsite), and office locations.

- 📋 **JD Requirement Extraction & Audit (`/jobs/[id]/requirements`)**:
  - Granular criteria breakdown table extracted from Job Descriptions.
  - Custom weightage controls (1.0x to 3.0x importance).
  - Mandatory requirement toggles & evidence requirement flags.
  - Recruiter manual confirmation controls.

- 👤 **Candidates Directory (`/candidates`)**:
  - Candidate evaluation cards with match scores (`MatchBadge` & `ScoreCard`).
  - Evidence breakdown matching candidates against required vs. nice-to-have skills.
  - Direct resume download links and recruiter decision tags.

- 📈 **Analytics & Auditing (`/analytics`)**:
  - Recruitment funnel breakdown (Applied → Parsed → Evaluated → Shortlisted → Offered).
  - Bias audit monitoring and time-to-hire velocity analytics.

- 🧱 **Reusable Component Architecture**:
  - `MatchBadge`: Displays candidate fit (High / Medium / Low) with evidence scores.
  - `RequirementTable`: Interactive table component for JD requirement management.
  - `ScoreCard`: Modular evaluation card displaying match percentages and breakdown.
  - UI Primitives: `Header`, `Footer`, `AppIcon`, `AppLogo`, `AppImage`.

---

### ⚙️ 2. Backend API & Database Infrastructure (`/backend`)
Built with **Node.js**, **Express**, **TypeScript**, and **Prisma ORM** targeting **PostgreSQL / Supabase**.

- 🔑 **Authentication System**:
  - **User Registration & Login**: Endpoint routes (`/api/auth/register`, `/api/auth/login`).
  - **Security**: Password hashing via `bcryptjs`.
  - **Authorization**: JSON Web Token (JWT) verification middleware (`authMiddleware`).

- 🗄️ **Database Schema & Models (`prisma/schema.prisma`)**:
  - **User Model**: Recruiter profile management (`id`, `email`, `password`, `name`, timestamps).
  - **Job Model**: Job vacancy records (`id`, `client`, `position`, `jd_file_url`, `jd_text`, `location`, `work_mode`, `salary`, `status`, `created_by`, timestamps) with indexed fields for high-speed queries (`created_by`, `status`).
  - **Requirement Model**: Detailed job requirements (`id`, `job_id`, `requirement`, `category`, `weight`, `is_mandatory`, `evidence_required`, `recruiter_confirmed`, timestamps) linked with cascade delete constraints.

---

## 📁 Repository Structure

```
ATS_Tasknera/
├── FrontEnd/                 # Next.js 15 TypeScript Frontend Application
│   ├── src/
│   │   ├── app/              # App router pages (home, jobs, candidates, analytics, dashboard)
│   │   ├── components/       # UI & candidate evaluation components
│   │   ├── data/             # Mock data service & evaluation datasets
│   │   ├── styles/           # Tailwind CSS & custom dark theme styling
│   │   └── types/            # TypeScript type definitions for ATS domain
│   ├── public/               # Static assets & brand media
│   └── next.config.mjs       # Next.js configuration
│
├── backend/                  # Node.js + Express + TypeScript API Server
│   ├── prisma/               # Database schema & Prisma client configuration
│   └── src/
│       ├── config/           # Database & environment configuration
│       ├── controllers/      # Auth & business logic controllers
│       ├── middleware/       # JWT auth verification middleware
│       ├── routes/           # REST API endpoints
│       └── server.ts         # Express app entry point
│
├── package.json              # Root scripts for full-stack workspace execution
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL Database** (or Supabase instance)

---

### 1. Installation

From the project root, install all dependencies for both frontend and backend:

```bash
npm run install:all
```

Alternatively, install individually:

```bash
# Frontend
cd FrontEnd
npm install

# Backend
cd ../backend
npm install
```

---

### 2. Environment Setup

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/ats_tasknera?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/ats_tasknera?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
```

---

### 3. Database Migration (Backend)

Generate Prisma client and run migrations:

```bash
cd backend
npx prisma generate
npx prisma db push
```

---

### 4. Running the Project

#### Run Frontend & Backend Simultaneously (from Root):
```bash
# Terminal 1: Frontend (http://localhost:4028)
npm run dev:frontend

# Terminal 2: Backend (http://localhost:5000)
npm run dev:backend
```

#### Run Individually:
```bash
# Frontend
cd FrontEnd
npm run dev

# Backend
cd backend
npm run dev
```

---

## 🛠️ Tech Stack Overview

| Domain | Technology |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling & UI** | Tailwind CSS, Lucide Icons, Custom Dark Theme (`#060C1A`) |
| **Backend Runtime** | Node.js, Express, TypeScript |
| **Database & ORM** | PostgreSQL, Prisma ORM |
| **Security & Auth** | JWT (JSON Web Tokens), bcryptjs |

---

## 📄 License

This repository is maintained by the **Tasknera Engineering Team**. All rights reserved.
