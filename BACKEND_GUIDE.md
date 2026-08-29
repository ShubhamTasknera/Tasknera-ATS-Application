# 🚀 Tasknera ATS Backend Setup Guide

## 📋 Overview

Your backend is now set up using **Next.js API Routes**. This gives you serverless API endpoints without needing a separate backend server.

---

## 🎯 API Endpoints Created

### 1. **Candidates API** (`/api/candidates`)

**Base URL:** `http://localhost:4028/api/candidates`

#### GET - Fetch all candidates
```bash
GET /api/candidates
GET /api/candidates?status=interview
GET /api/candidates?search=sarah
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "total": 10
}
```

#### POST - Create new candidate
```bash
POST /api/candidates
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@email.com",
  "phone": "+1 234 567 890",
  "role": "Developer",
  "skills": ["React", "Node.js"],
  "location": "New York, NY",
  "experience": "5 years"
}
```

#### PUT - Update candidate
```bash
PUT /api/candidates
Content-Type: application/json

{
  "id": 1,
  "status": "Interview",
  "match": 95
}
```

#### DELETE - Delete candidate
```bash
DELETE /api/candidates?id=1
```

---

### 2. **Jobs API** (`/api/jobs`)

**Base URL:** `http://localhost:4028/api/jobs`

#### GET - Fetch all jobs
```bash
GET /api/jobs
GET /api/jobs?status=active
GET /api/jobs?department=engineering
```

#### POST - Create new job
```bash
POST /api/jobs
Content-Type: application/json

{
  "title": "Senior Developer",
  "department": "Engineering",
  "location": "Remote",
  "type": "Full-time",
  "description": "We are looking for...",
  "requirements": ["5+ years", "React"],
  "salary": { "min": 100000, "max": 150000 }
}
```

#### PUT - Update job
```bash
PUT /api/jobs
Content-Type: application/json

{
  "id": 1,
  "status": "Paused"
}
```

#### DELETE - Delete job
```bash
DELETE /api/jobs?id=1
```

---

### 3. **Upload API** (`/api/upload`)

**Base URL:** `http://localhost:4028/api/upload`

#### POST - Upload file (CV or JD)
```bash
POST /api/upload
Content-Type: multipart/form-data

file: [File]
type: "cv" or "jd"
```

**Supported formats:** PDF, DOC, DOCX, TXT  
**Max size:** 10MB

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "1234567890_resume.pdf",
    "originalName": "resume.pdf",
    "fileUrl": "/uploads/cv/1234567890_resume.pdf",
    "fileSize": 102400,
    "fileType": "application/pdf",
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "aiAnalysis": {
      "name": "John Doe",
      "skills": ["React", "Node.js"],
      "experience": "5 years",
      "matchScore": 85
    }
  }
}
```

---

### 4. **Analytics API** (`/api/analytics`)

**Base URL:** `http://localhost:4028/api/analytics`

#### GET - Fetch analytics data
```bash
GET /api/analytics
GET /api/analytics?period=30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalHires": 142,
      "hiresChange": 23,
      "timeToHire": 18,
      ...
    },
    "hiringFunnel": [...],
    "topSources": [...],
    "departmentPerformance": [...]
  }
}
```

---

### 5. **Match API** (`/api/match`)

**Base URL:** `http://localhost:4028/api/match`

#### POST - Match candidates with JD
```bash
POST /api/match
Content-Type: application/json

{
  "jobDescription": "Looking for React developer with 5+ years...",
  "candidates": [
    {
      "id": 1,
      "name": "John Doe",
      "skills": ["React", "JavaScript"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCandidates": 10,
    "averageMatch": 85,
    "topCandidates": [...],
    "allCandidates": [...]
  }
}
```

---

## 🧪 Testing APIs

### Using Browser (GET requests)

Simply visit in browser:
```
http://localhost:4028/api/candidates
http://localhost:4028/api/jobs
http://localhost:4028/api/analytics
```

### Using PowerShell (POST/PUT/DELETE)

**Fetch candidates:**
```powershell
Invoke-RestMethod -Uri "http://localhost:4028/api/candidates" -Method GET
```

**Create candidate:**
```powershell
$body = @{
    name = "Test User"
    email = "test@email.com"
    role = "Developer"
    skills = @("React", "Node.js")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4028/api/candidates" -Method POST -Body $body -ContentType "application/json"
```

**Upload file:**
```powershell
$filePath = "C:\path\to\resume.pdf"
$uri = "http://localhost:4028/api/upload"

$form = @{
    file = Get-Item -Path $filePath
    type = "cv"
}

Invoke-RestMethod -Uri $uri -Method POST -Form $form
```

### Using Postman

1. Download Postman: https://www.postman.com/downloads/
2. Import the API collection
3. Test each endpoint

---

## 📁 Backend File Structure

```
src/app/api/
├── candidates/
│   └── route.ts          # Candidates CRUD operations
├── jobs/
│   └── route.ts          # Jobs CRUD operations
├── upload/
│   └── route.ts          # File upload handling
├── analytics/
│   └── route.ts          # Analytics data
└── match/
    └── route.ts          # AI matching logic
```

---

## 🔧 Current Setup (Mock Data)

**Status:** Using in-memory arrays (data resets on server restart)

**What's included:**
- ✅ Full CRUD operations
- ✅ File upload handling
- ✅ Basic AI simulation
- ✅ Query parameters support
- ✅ Error handling

**What's NOT included yet:**
- ❌ Real database (PostgreSQL, MongoDB, etc.)
- ❌ Authentication/Authorization
- ❌ Real AI/ML models
- ❌ Email notifications
- ❌ Data persistence

---

## 🎯 Next Steps - Adding Real Database

### Option 1: Supabase (Recommended - Easy)

1. **Install Supabase client:**
```bash
npm install @supabase/supabase-js
```

2. **Update .env file:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. **Create Supabase client:**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

4. **Update API routes to use Supabase:**
```typescript
// Example: src/app/api/candidates/route.ts
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('candidates')
    .select('*');
  
  return NextResponse.json({ success: true, data });
}
```

---

### Option 2: Prisma + PostgreSQL (More Control)

1. **Install Prisma:**
```bash
npm install prisma @prisma/client
npx prisma init
```

2. **Define schema:**
```prisma
// prisma/schema.prisma
model Candidate {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  role      String
  status    String
  createdAt DateTime @default(now())
}
```

3. **Generate client:**
```bash
npx prisma generate
npx prisma db push
```

4. **Use in API routes:**
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  const candidates = await prisma.candidate.findMany();
  return NextResponse.json({ success: true, data: candidates });
}
```

---

### Option 3: MongoDB (NoSQL)

1. **Install MongoDB client:**
```bash
npm install mongodb
```

2. **Create connection:**
```typescript
// src/lib/mongodb.ts
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);
export const db = client.db('tasknera');
```

3. **Use in API routes:**
```typescript
import { db } from '@/lib/mongodb';

export async function GET() {
  const candidates = await db.collection('candidates').find().toArray();
  return NextResponse.json({ success: true, data: candidates });
}
```

---

## 🤖 Adding Real AI

### Using OpenAI API

```bash
npm install openai
```

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze resume
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{
    role: "system",
    content: "Extract skills and experience from this resume..."
  }]
});
```

---

## 🔐 Adding Authentication

### Using NextAuth.js

```bash
npm install next-auth
```

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## 📊 File Upload Storage

### Local Storage (Current)
Files saved to: `public/uploads/`

### Cloud Storage (Recommended)

**AWS S3:**
```bash
npm install @aws-sdk/client-s3
```

**Cloudinary:**
```bash
npm install cloudinary
```

---

## ✅ Backend is Ready!

Your APIs are live at:
- http://localhost:4028/api/candidates
- http://localhost:4028/api/jobs
- http://localhost:4028/api/upload
- http://localhost:4028/api/analytics
- http://localhost:4028/api/match

**Test them now using browser or Postman!**

---

## 🆘 Need Help?

### Common Issues:

**1. Cannot POST to API**
- Make sure you're using correct Content-Type header
- Check request body format

**2. File upload fails**
- Verify file size < 10MB
- Check file type is allowed

**3. Data not persisting**
- Currently using mock data (resets on restart)
- Follow "Next Steps" to add real database

---

## 📝 TODO List

- [ ] Connect to real database (Supabase/PostgreSQL)
- [ ] Add authentication
- [ ] Implement real AI matching
- [ ] Add email notifications
- [ ] Set up cloud file storage
- [ ] Add data validation
- [ ] Implement rate limiting
- [ ] Add API documentation (Swagger)
- [ ] Set up error logging
- [ ] Add unit tests

---

**Backend is running and ready for development! 🎉**
