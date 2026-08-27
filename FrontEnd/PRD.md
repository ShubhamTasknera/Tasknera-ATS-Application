# Product Requirement Document (PRD)
## Tasknera — Frontend Application (Candidate Intelligence ATS)

---

## 1. Executive Summary & Document Control

| Attribute | Details |
| :--- | :--- |
| **Product Name** | Tasknera Candidate Intelligence (Frontend) |
| **Document Version** | 1.0.0 |
| **Target Audience** | Enterprise Recruiters, HR Leaders, Hiring Managers, Talent Acquisition Teams |
| **Framework & Core Tech** | Next.js 15 (App Router), React 19, TypeScript, Vanilla Tailwind CSS |
| **UI Libraries & Styling** | GSAP Animations, Recharts Data Visualization, Heroicons |
| **State & API Architecture** | React Auth Context, RESTful API Client with Bearer JWT Auth |

---

## 2. Product Vision & Objectives

Tasknera is a state-of-the-art **Candidate Intelligence & Modern Applicant Tracking System (ATS)**. The frontend interface delivers a ultra-fast, modern, dark-themed user experience that transforms resume screening from a manual task into an automated, explainable, and unbiased evaluation workflow.

### Primary Objectives
1. **Visual & Experience Excellence**: Wow recruiters with a glassmorphic, ultra-modern dark interface (`#070B14` slate background, vibrant `#2563EB` blue accents, subtle micro-animations).
2. **Instant Authentication**: Provide frictionless user registration and sign-in via dedicated pages (`/signin`, `/signup`) and global popup modals (`AuthModal`).
3. **Structured Requirement & Job Management**: Enable recruiters to define job vacancies, set custom requirement criteria, assign importance weights, and require evidence verification.
4. **Candidate Matching & Scoring**: Display semantic match percentages (0–100%), skill breakdown pills, and candidate status funnels.
5. **Talent Analytics**: Offer real-time visual charts for recruitment performance, department hiring rates, and time-to-hire trends.

---

## 3. Information Architecture & Navigation

```
Tasknera Frontend Root/
├── /home                       # Marketing & Platform Landing Page
├── /signin                     # Full-Page User Authentication (Sign In)
├── /signup                     # Full-Page Account Registration (Sign Up)
├── /dashboard                  # Main Recruiter Dashboard & Active Metrics
├── /jobs                       # Job Vacancies List & Management
│   ├── /jobs/create            # New Job Evaluation Setup
│   └── /jobs/[id]/requirements  # Requirement Builder & Weight Adjustment
├── /candidates                 # Candidate Pipeline & CV Database
└── /analytics                  # Talent Acquisition Analytics & Reports
```

---

## 4. Feature Specifications & UI Components

### 4.1 Global Navigation Header (`Header.tsx`)
- **Branding**: Tasknera logo with gradient icon badge and subtitle *Candidate Intelligence*.
- **Navigation Links**: Direct routes to Dashboard, Jobs, Candidates, and Analytics.
- **Unauthenticated State**:
  - `Sign In` button (triggers `AuthModal` or redirects to `/signin`).
  - `Sign Up` button (triggers `AuthModal` or redirects to `/signup`).
- **Authenticated State**:
  - User Avatar badge with initial letter avatar.
  - User name/email dropdown menu.
  - `Sign Out` action button clearing cached session JWT tokens.
- **Primary CTA**: `+ New Evaluation` button linking directly to `/jobs/create`.

---

### 4.2 Authentication Subsystem (`AuthContext.tsx`, `/signin`, `/signup`, `AuthModal.tsx`)
- **JWT Token Management**: Caches session tokens in `localStorage` (`tasknera_token`).
- **Automatic Session Restoration**: Verifies saved token on page load via `GET /api/auth/me`.
- **Form Controls**:
  - Email format regex validation.
  - Password visibility toggle (Show/Hide).
  - Minimum password length enforcement (6+ characters).
  - Inline error alert banners with clear feedback for invalid credentials or duplicate emails.
  - Submitting state spinner animations.

---

### 4.3 Candidate Intelligence & Landing Page (`/home`)
- **Hero Section**: Headline emphasizing 10x screening speed and semantic context extraction.
- **Parsing Section Component (`ParsingSection.tsx`)**: Comparison breakdown between surface field extraction (6 fields) vs 47+ semantic signals.
- **Bias Guard Section (`BiasGuardSection.tsx`)**: Explainable AI scoring breakdown demonstrating EEOC-aligned demographic stripping.
- **Interactive Elements**: Testimonial cards, feature highlight grid, and ROI calculators.

---

### 4.4 Dashboard (`/dashboard`)
- **Key Metrics Overview Cards**: Total Candidates Screened, Shortlisted Candidates, Average Time-to-Shortlist, Active Job Postings.
- **Recent Top Matches**: Quick table showing candidate name, target role, match score bar (e.g. 95%), status pill, and time uploaded.
- **Upcoming Interview Schedule**: Widget displaying scheduled candidate interviews and time slots.
- **Quick Action Bar**: Buttons to create job, upload resume batch, or export analytics.

---

### 4.5 Job Vacancies & Requirements (`/jobs`, `/jobs/create`, `/jobs/[id]/requirements`)
- **Job List View (`/jobs`)**: Filterable grid/list of open roles by department, status (Active, Draft, Closed), and location.
- **Job Creation Form (`/jobs/create`)**:
  - Client / Company Name.
  - Job Position Title.
  - Location & Work Mode (Remote, Hybrid, On-site).
  - Salary Range.
  - Resume / JD Text upload.
- **Requirements Configuration (`/jobs/[id]/requirements`)**:
  - Requirement statement input.
  - Category selector (Experience, Skills, Education, Certifications).
  - Weight multiplier slider (1.0x to 3.0x importance).
  - Mandatory flag checkbox (`is_mandatory`).
  - Evidence required flag checkbox (`evidence_required`).

---

### 4.6 Candidate Database (`/candidates`)
- **Search & Filtering**: Search bar by candidate name, skill, or experience; filter by match score threshold and status (New, Review, Shortlisted, Interview, Offer).
- **Candidate Cards**: Avatar icon, full name, role, email, phone, location, total experience, matching skills tags, and score indicator pill.

---

### 4.7 Analytics Engine (`/analytics`)
- **Interactive Charts (Recharts)**:
  - Department Hires & Openings Bar Chart.
  - Time-to-Hire Trend Area Chart.
  - Candidate Funnel Conversion Bar.
- **Summary Metrics**: Highlighting bottleneck departments and recruitment velocity.

---

## 5. Design System & Aesthetic Standard

| Token | Theme Value | Description |
| :--- | :--- | :--- |
| **Background Main** | `#070B14` | Deep charcoal slate |
| **Card Container** | `#0F172A` / `#0A0F1E` | Glassmorphic dark slate card background |
| **Primary Accent** | `#2563EB` / `#3B82F6` | Electric Blue button & highlight accent |
| **Success State** | `#10B981` / `#059669` | Emerald green pills and indicators |
| **Warning / Alert** | `#F59E0B` / `#EF4444` | Amber and Rose red alert banners |
| **Typography** | Inter / System Sans | Clean, modern sans-serif hierarchy |
| **Borders & Gradients**| `border-gray-800/80` | Subtle 1px borders with backdrop blur |

---

## 6. API Integration Matrix

| Page / Component | Method | Backend Endpoint | Function |
| :--- | :--- | :--- | :--- |
| `AuthContext` / `AuthModal` | `POST` | `/api/auth/signup` | Account registration |
| `AuthContext` / `AuthModal` | `POST` | `/api/auth/signin` | Credentials sign-in & JWT token |
| `AuthContext` | `GET` | `/api/auth/me` | Verify JWT session & load profile |
| `/jobs` | `GET` / `POST` | `/api/jobs` | Fetch or create job postings |
| `/candidates` | `GET` | `/api/candidates` | List candidates & match scores |
| `/api/match` | `POST` | `/api/match` | Execute candidate match scoring |
| `/analytics` | `GET` | `/api/analytics` | Fetch analytics performance metrics |

---

## 7. Performance, Security & Non-Functional Requirements

1. **Performance**:
   - Initial Page Load < 1.5 seconds.
   - Smooth 60 FPS CSS/GSAP transitions and micro-animations.
   - Code splitting via Next.js App Router.
2. **Security**:
   - JWT tokens passed securely via `Authorization: Bearer <token>` headers.
   - Password fields masked with toggle controls.
   - Sanitized user inputs preventing XSS attacks.
3. **Responsiveness**:
   - Mobile-first adaptive layout (Drawer menu for mobile, full top bar for desktop).
   - Optimized for screens from 360px up to 4K resolutions.
