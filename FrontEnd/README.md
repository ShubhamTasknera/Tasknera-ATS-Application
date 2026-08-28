# ATS Tasknera Frontend Application

Next.js 15 + React 19 + TypeScript + Tailwind CSS application for **ATS Tasknera**.

---

## 🎨 Features & Pages Implemented

- **Landing & Product Showcase (`/home`)**:
  - Hero Section with evidence-based scoring preview & search filter.
  - Anonymized Bias Guard feature showcase.
  - Candidate Compare Grid & Ranking showcase.
  - Recruiter stats and proof metrics.

- **Recruiter Dashboard (`/dashboard`)**:
  - High-level metric overview cards (Active Jobs, Total Applicants, Shortlisted, Avg Time-to-Hire).
  - Quick action links for creating jobs and reviewing candidates.
  - Live activity feed stream.

- **Job Openings Management (`/jobs`)**:
  - Job vacancy list with search and filter tags (Status, Client, Location, Work Mode).
  - Quick links to applicant pipelines and requirements management.

- **Job Posting Workflow (`/jobs/create`)**:
  - Multi-step job posting UI.
  - File upload drag & drop and raw text area for Job Descriptions (JD).
  - Client detail input, compensation range, location, and work mode toggles.

- **JD Requirement Breakdown & Audit (`/jobs/[id]/requirements`)**:
  - Granular criteria breakdown table extracted from Job Descriptions.
  - Interactive weightage adjustment (1.0x - 3.0x).
  - Mandatory requirement toggles & evidence requirement flags.
  - Manual recruiter audit confirmation status.

- **Candidate Evaluation Directory (`/candidates`)**:
  - Detailed candidate evaluation cards with evidence-based match scoring (`MatchBadge`, `ScoreCard`).
  - Breakdown against required vs optional criteria.
  - Candidate resume download links and decision action tags.

- **Analytics Dashboard (`/analytics`)**:
  - Visual recruitment funnel (Applied → Parsed → Evaluated → Shortlisted → Offered).
  - Bias audit monitoring & time-to-hire velocity analytics.

---

## 🛠️ Getting Started

### Installation
```bash
npm install
```

### Running Development Server
```bash
npm run dev
```
The application will start on **`http://localhost:4028`** (or `http://localhost:3000`).

### Production Build
```bash
npm run build
npm start
```
