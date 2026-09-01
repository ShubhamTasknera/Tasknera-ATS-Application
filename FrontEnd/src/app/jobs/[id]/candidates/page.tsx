'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export interface CandidateEducation {
  degree: string;
  field?: string;
  institution: string;
  year?: string;
  details?: string;
}

export interface CandidateExperience {
  title: string;
  company: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
  highlights?: string[];
}

export interface CandidateProject {
  name: string;
  description: string;
  technologies?: string[];
  role?: string;
}

export interface CandidateCareerGap {
  fromCompany?: string;
  toCompany?: string;
  startDate: string;
  endDate: string;
  gapMonths: number;
  gapLabel: string;
}

export interface CandidateGapAnalysis {
  hasGap: boolean;
  totalGapMonths: number;
  gaps: CandidateCareerGap[];
  statusText: string;
}

export interface CandidateRecord {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalExperience: string;
  totalExperienceMonths?: number;
  totalExperienceYears?: number;
  currentTitle: string;
  currentCompany: string;
  summary?: string;
  professionalSummary?: string;
  skills: string[];
  education: CandidateEducation[];
  certifications: string[];
  experience: CandidateExperience[];
  gapAnalysis?: CandidateGapAnalysis;
  projects: CandidateProject[];
  languages: string[];
  rawText: string;
  parsingStatus: 'PARSED' | 'FAILED' | 'PROCESSING' | 'UPLOADED' | 'UPLOADING';
  parsingMetadata: {
    fileName: string;
    fileType: string;
    pageCount: number;
    extractionMethod: string;
    ocrUsed: boolean;
    characterCount: number;
    wordCount: number;
  };
  errorMessage?: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'UPLOADING' | 'UPLOADED' | 'PROCESSING' | 'PARSED' | 'FAILED';
  progress: number;
  error?: string;
  candidateId?: string;
}

interface JobInfo {
  id: string;
  position: string;
  client: string;
  location?: string;
  work_mode?: string;
  requirementsCount: number;
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Recently';
  }
};

const parseMonthsFromText = (text?: string | null): number => {
  if (!text) return 0;
  const t = text.trim();

  // Pattern 1: "X years Y months" or "X.Y years" or "X yrs"
  const yrMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
  const moMatch = t.match(/(\d+)\s*(?:months?|mos?)/i);

  if (yrMatch || moMatch) {
    let total = 0;
    if (yrMatch) total += parseFloat(yrMatch[1]) * 12;
    if (moMatch) total += parseInt(moMatch[1], 10);
    return Math.round(total);
  }

  // Pattern 2: Date range like "Apr 2025 – Nov 2025" or "2021 – 2023"
  const dateRangePattern = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*(?:[–—\-]|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|Current|Now|Ongoing)\b/i;
  const match = t.match(dateRangePattern);
  if (match) {
    const parseYM = (str: string) => {
      const s = str.trim().toLowerCase();
      if (s === 'present' || s === 'current' || s === 'now' || s === 'till date' || s === 'ongoing') {
        const d = new Date();
        return { y: d.getFullYear(), m: d.getMonth() };
      }
      const mMap: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
      const m = s.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/i);
      if (m) {
        return { y: parseInt(m[2], 10), m: mMap[m[1].toLowerCase()] ?? 0 };
      }
      const y = s.match(/\b(19\d\d|20\d\d)\b/);
      if (y) return { y: parseInt(y[1], 10), m: 0 };
      return null;
    };
    const start = parseYM(match[1]);
    const end = parseYM(match[2]);
    if (start && end) {
      const diff = (end.y - start.y) * 12 + (end.m - start.m) + 1;
      return diff > 0 ? diff : 1;
    }
  }

  return 0;
};

const getNumericExperienceDetails = (cand: { totalExperience?: string | null; totalExperienceMonths?: number; totalExperienceYears?: number; experience?: CandidateExperience[] }) => {
  let months = cand.totalExperienceMonths || 0;
  if (!months && cand.totalExperienceYears) {
    months = Math.round(cand.totalExperienceYears * 12);
  }
  if (!months && cand.totalExperience) {
    months = parseMonthsFromText(cand.totalExperience);
  }
  if (!months && cand.experience && cand.experience.length > 0) {
    let sum = 0;
    for (const exp of cand.experience) {
      sum += parseMonthsFromText(exp.duration || (exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : ''));
    }
    months = sum;
  }

  const years = parseFloat((months / 12).toFixed(1));

  const badgeText = `${years} yrs`;
  const subText = `${months} ${months === 1 ? 'mo' : 'mos'}`;
  const fullLabel = months > 0 
    ? (months < 12 ? `${years} Years (${months} ${months === 1 ? 'month' : 'months'})` : `${years} Years (${Math.floor(months / 12)}y ${months % 12}m)`)
    : (cand.totalExperience || '0 Years');

  return {
    months,
    years,
    badgeText,
    subText,
    fullLabel,
  };
};

const parseDateToYMClient = (str: string) => {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s === 'present' || s === 'current' || s === 'now' || s === 'till date' || s === 'ongoing') {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  }
  const mMap: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
  const mMatch = s.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/i);
  if (mMatch) return { y: parseInt(mMatch[2], 10), m: mMap[mMatch[1].toLowerCase()] ?? 0 };
  const yMatch = s.match(/\b(19\d\d|20\d\d)\b/);
  if (yMatch) return { y: parseInt(yMatch[1], 10), m: 0 };
  return null;
};

// ── Company Breakdown Helper (Extracts unique companies & counts) ─────────────
const getCompanyBreakdown = (cand: CandidateRecord) => {
  const experiences = cand.experience || [];
  const rawCompanies = new Set<string>();
  
  for (const exp of experiences) {
    if (exp.company && exp.company.trim() && exp.company.trim().toLowerCase() !== 'company') {
      rawCompanies.add(exp.company.trim());
    }
  }

  if (rawCompanies.size === 0 && cand.currentCompany && cand.currentCompany.trim() && cand.currentCompany.trim().toLowerCase() !== 'company') {
    rawCompanies.add(cand.currentCompany.trim());
  }

  const count = rawCompanies.size || (experiences.length > 0 ? experiences.length : 1);
  const companyList = Array.from(rawCompanies);
  const bracketLabel = `(${count} ${count === 1 ? 'Company' : 'Companies'})`;
  const countNumberOnly = `(${count})`;

  return {
    count,
    companyList,
    bracketLabel,
    countNumberOnly,
    hasMultipleCompanies: count > 1,
  };
};

// ── Timeline with Gaps Between Companies Helper ───────────────────────────────
interface TimelineItem {
  type: 'COMPANY' | 'GAP';
  company?: CandidateExperience;
  companyIndex?: number;
  gap?: {
    gapMonths: number;
    gapLabel: string;
    fromCompany: string;
    toCompany: string;
    startDate: string;
    endDate: string;
  };
}

const getTimelineWithGaps = (cand: CandidateRecord): TimelineItem[] => {
  const exps = [...(cand.experience || [])];
  if (exps.length === 0) {
    if (cand.currentTitle || cand.currentCompany) {
      return [{
        type: 'COMPANY',
        company: {
          title: cand.currentTitle || 'Professional Role',
          company: cand.currentCompany || 'Organization',
          duration: cand.totalExperience || 'Current Role',
          description: cand.summary || cand.professionalSummary || 'Primary professional experience profile extracted from resume.',
        },
        companyIndex: 1,
      }];
    }
    return [];
  }

  // Parse dated experiences
  const dated = exps.map(exp => {
    const s = exp.startDate ? parseDateToYMClient(exp.startDate) : null;
    const e = exp.endDate ? parseDateToYMClient(exp.endDate) : (exp.startDate ? parseDateToYMClient('Present') : null);
    return { exp, start: s, end: e };
  });

  // Sort newest first (reverse chronological order)
  dated.sort((a, b) => {
    const aVal = a.start ? a.start.y * 12 + a.start.m : 0;
    const bVal = b.start ? b.start.y * 12 + b.start.m : 0;
    return bVal - aVal;
  });

  const timelineItems: TimelineItem[] = [];
  let compCounter = 1;

  for (let i = 0; i < dated.length; i++) {
    const current = dated[i];
    timelineItems.push({
      type: 'COMPANY',
      company: current.exp,
      companyIndex: compCounter++,
    });

    // Check if there is an older job following this one (since sorted newest to oldest)
    if (i < dated.length - 1) {
      const nextOlder = dated[i + 1];
      if (current.start && nextOlder.end) {
        const newerJobStartMonths = current.start.y * 12 + current.start.m;
        const olderJobEndMonths = nextOlder.end.y * 12 + nextOlder.end.m;
        const gap = newerJobStartMonths - olderJobEndMonths;

        if (gap >= 2) {
          const gapYears = (gap / 12).toFixed(1);
          const gapText = gap >= 12
            ? `${gapYears} yrs (${gap} mos)`
            : `${gap} mos`;

          timelineItems.push({
            type: 'GAP',
            gap: {
              gapMonths: gap,
              gapLabel: `${gapText} Career Gap`,
              fromCompany: nextOlder.exp.company || 'Previous Organization',
              toCompany: current.exp.company || 'Subsequent Organization',
              startDate: nextOlder.exp.endDate || `${nextOlder.end.y}`,
              endDate: current.exp.startDate || `${current.start.y}`,
            }
          });
        }
      }
    }
  }

  return timelineItems;
};

const getCandidateCareerGaps = (cand: CandidateRecord): CandidateGapAnalysis => {
  if (cand.gapAnalysis && cand.gapAnalysis.statusText) {
    return cand.gapAnalysis;
  }
  const exps = cand.experience || [];
  if (exps.length <= 1) {
    return {
      hasGap: false,
      totalGapMonths: 0,
      gaps: [],
      statusText: 'Continuous Employment (No Career Gaps Detected)'
    };
  }

  const dated: { exp: CandidateExperience; start: { y: number; m: number }; end: { y: number; m: number } }[] = [];
  for (const exp of exps) {
    if (exp.startDate) {
      const s = parseDateToYMClient(exp.startDate);
      const e = parseDateToYMClient(exp.endDate || 'Present');
      if (s && e) dated.push({ exp, start: s, end: e });
    }
  }

  if (dated.length <= 1) {
    return {
      hasGap: false,
      totalGapMonths: 0,
      gaps: [],
      statusText: 'Continuous Employment'
    };
  }

  dated.sort((a, b) => (a.start.y * 12 + a.start.m) - (b.start.y * 12 + b.start.m));

  const foundGaps: CandidateCareerGap[] = [];
  let totalGapMonths = 0;

  for (let i = 0; i < dated.length - 1; i++) {
    const prev = dated[i];
    const next = dated[i + 1];
    const prevEnd = prev.end.y * 12 + prev.end.m;
    const nextStart = next.start.y * 12 + next.start.m;
    const diff = nextStart - prevEnd;

    if (diff >= 2) {
      const gapYears = (diff / 12).toFixed(1);
      const gapLabel = diff >= 12
        ? `${gapYears} yrs (${diff} mos) gap between ${prev.exp.company || 'Job'} and ${next.exp.company || 'Job'}`
        : `${diff} mos gap between ${prev.exp.company || 'Job'} and ${next.exp.company || 'Job'}`;

      foundGaps.push({
        fromCompany: prev.exp.company,
        toCompany: next.exp.company,
        startDate: prev.exp.endDate || `${prev.end.y}`,
        endDate: next.exp.startDate || `${next.start.y}`,
        gapMonths: diff,
        gapLabel
      });
      totalGapMonths += diff;
    }
  }

  if (foundGaps.length === 0) {
    return {
      hasGap: false,
      totalGapMonths: 0,
      gaps: [],
      statusText: 'Continuous Employment (No Career Gaps Detected)'
    };
  }

  return {
    hasGap: true,
    totalGapMonths,
    gaps: foundGaps,
    statusText: `${foundGaps.length} career gap${foundGaps.length > 1 ? 's' : ''} identified (${totalGapMonths} mos total)`
  };
};

const getEffectiveSkills = (cand: CandidateRecord): string[] => {
  if (cand.skills && cand.skills.length > 0) return cand.skills;
  const text = `${cand.summary || ''} ${cand.professionalSummary || ''} ${cand.rawText || ''}`;
  const catalog = [
    'React', 'React.js', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'HTML', 'CSS3', 'CSS', 'Tailwind CSS',
    'Tailwind', 'Redux', 'Node.js', 'Express', 'Express.js', 'Python', 'Java', 'FastAPI', 'Django', 'Flask',
    'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Supabase', 'Firebase', 'AWS', 'Docker', 'Git', 'GitHub',
    'REST APIs', 'REST API', 'Prisma ORM', 'Prisma', 'GraphQL', 'Microservices', 'Postman', 'Vercel', 'Figma'
  ];
  const matched = new Set<string>();
  for (const s of catalog) {
    const esc = s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    if (new RegExp(`(?:^|[^a-zA-Z0-9_])${esc}(?:[^a-zA-Z0-9_]|$)`, 'i').test(text)) {
      matched.add(s);
    }
  }
  return Array.from(matched);
};

const avatarColor = (name: string) => {
  const colors = [
    'bg-brand-orange-pale text-brand-orange border-brand-orange-border',
    'bg-blue-50 text-blue-600 border-blue-200',
    'bg-emerald-50 text-emerald-600 border-emerald-200',
    'bg-purple-50 text-purple-600 border-purple-200',
    'bg-amber-50 text-amber-600 border-amber-200',
    'bg-rose-50 text-rose-600 border-rose-200',
    'bg-teal-50 text-teal-600 border-teal-200',
  ];
  return colors[Math.abs(name.charCodeAt(0) || 0) % colors.length];
};

const statusBadge = (status: string) => {
  switch (status) {
    case 'PARSED':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'PARSED',
      };
    case 'PROCESSING':
    case 'UPLOADING':
    case 'UPLOADED':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500 animate-pulse',
        label: status,
      };
    case 'FAILED':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'FAILED',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: status,
      };
  }
};

/**
 * Deep text sanitizer to remove unprintable unicode box glyphs (e.g. 􀀀, □, ),
 * null characters, and normalize bullets into clean readable text arrays.
 */
const sanitizeBulletText = (text: string): string[] => {
  if (!text) return [];
  const clean = text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uE000-\uF8FF\uFFF0-\uFFFF\uFFFD\uF0B7\uF0A7\uF000-\uF0FF]/g, '')
    .replace(/[􀀀□■▫▪◇◆⯀⯁\u25A0\u25A1\u25AA\u25AB\u25CF\u25CB\u25E6\u25BA]/g, '');

  return clean
    .split('\n')
    .map(line => line.replace(/^[•*\-–—▪▫➢✓✔\d\.\)]\s*/, '').trim())
    .filter(line => line.length > 2);
};

export default function JobCandidatesPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const jobId = (params?.id as string) || 'jd-1';

  const [job, setJob] = useState<JobInfo | null>(null);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Bulk Upload State
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters & Selected Candidate Drawer
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PARSED' | 'PROCESSING' | 'FAILED'>('ALL');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [copiedRawText, setCopiedRawText] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // ── Fetch Job Details & Candidates from Backend ─────────────────────────────
  const fetchJobAndCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Fetch Job
      let jobInfo: JobInfo = {
        id: jobId,
        position: 'Frontend Developer',
        client: 'TechNova Solutions',
        location: 'Pune, Maharashtra',
        work_mode: 'Hybrid',
        requirementsCount: 8,
      };

      try {
        const jobRes = await fetch(`${backendUrl}/jobs/${jobId}`);
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          if (jobData.job) {
            jobInfo = {
              id: jobData.job.id,
              position: jobData.job.position || jobData.job.title || 'Frontend Developer',
              client: jobData.job.client || jobData.job.company || 'TechNova Solutions',
              location: jobData.job.location || 'Pune, Maharashtra',
              work_mode: jobData.job.work_mode || 'Hybrid',
              requirementsCount: jobData.job.requirements?.length || 8,
            };
          }
        }
      } catch (e) {
        console.warn('Could not load specific job record, using context fallback:', e);
      }
      setJob(jobInfo);

      // 2. Fetch Candidates
      const candRes = await fetch(`${backendUrl}/jobs/${jobId}/candidates`);
      if (candRes.ok) {
        const candData = await candRes.json();
        setCandidates(candData.candidates || []);
      } else {
        throw new Error('Failed to retrieve candidate directory from server');
      }
    } catch (err: any) {
      console.error('Error loading candidates:', err);
      setErrorMsg(err.message || 'Unable to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, [backendUrl, jobId]);

  useEffect(() => {
    fetchJobAndCandidates();
  }, [fetchJobAndCandidates]);

  // ── Handle File Selection ───────────────────────────────────────────────────
  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const allowedExts = ['.pdf', '.docx', '.doc', '.txt'];
    const newItems: UploadQueueItem[] = [];

    Array.from(fileList).forEach(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedExts.includes(ext)) {
        alert(`File format "${file.name}" is not supported. Please upload PDF, DOCX, or TXT.`);
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds maximum allowed size of 15MB.`);
        return;
      }

      newItems.push({
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        status: 'UPLOADING',
        progress: 10,
      });
    });

    if (newItems.length > 0) {
      setUploadQueue(prev => [...newItems, ...prev]);
      setShowUploadZone(true);
      processUploadQueue(newItems);
    }
  };

  // ── Process Upload Queue via Backend API ────────────────────────────────────
  const processUploadQueue = async (items: UploadQueueItem[]) => {
    setIsUploading(true);

    const formData = new FormData();
    items.forEach(item => {
      formData.append('files', item.file);
    });

    try {
      setUploadQueue(prev =>
        prev.map(q =>
          items.some(it => it.id === q.id) ? { ...q, status: 'UPLOADING', progress: 45 } : q
        )
      );

      const res = await fetch(`${backendUrl}/jobs/${jobId}/candidates/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with HTTP ${res.status}`);
      }

      const result = await res.json();

      setUploadQueue(prev =>
        prev.map(q => {
          const matchedCandidate = result.candidates?.find(
            (c: CandidateRecord) => c.fileName === q.name
          );
          if (matchedCandidate) {
            return {
              ...q,
              status: matchedCandidate.parsingStatus,
              progress: 100,
              error: matchedCandidate.errorMessage,
              candidateId: matchedCandidate.id,
            };
          }
          return q;
        })
      );

      if (result.allCandidates) {
        setCandidates(result.allCandidates);
      } else {
        await fetchJobAndCandidates();
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadQueue(prev =>
        prev.map(q =>
          items.some(it => it.id === q.id)
            ? { ...q, status: 'FAILED', progress: 100, error: err.message || 'Upload & parsing failed' }
            : q
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ── Retry a Single Failed Candidate / Queue Item ────────────────────────────
  const handleRetryCandidate = async (candidateId: string) => {
    try {
      const res = await fetch(`${backendUrl}/jobs/${jobId}/candidates/${candidateId}/retry`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.candidate) {
          setCandidates(prev =>
            prev.map(c => (c.id === candidateId ? data.candidate : c))
          );
          if (selectedCandidate?.id === candidateId) {
            setSelectedCandidate(data.candidate);
          }
        }
      } else {
        alert('Retry attempt failed. Please check document text readability.');
      }
    } catch (err) {
      console.error('Error retrying candidate:', err);
      alert('Network error while attempting retry.');
    }
  };

  // ── Delete Candidate Handlers ─────────────────────────────────────────────
  const handleDeleteCandidate = async (candidateId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this candidate profile?')) return;
    try {
      const res = await fetch(`${backendUrl}/jobs/${jobId}/candidates/${candidateId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c.id !== candidateId));
        if (selectedCandidate?.id === candidateId) {
          setSelectedCandidate(null);
        }
      } else {
        alert('Could not delete candidate profile from server.');
      }
    } catch (err) {
      console.error('Failed to delete candidate:', err);
      alert('Network error while deleting candidate.');
    }
  };

  const handleClearAllCandidates = async () => {
    if (!confirm('Are you sure you want to delete all uploaded candidate CVs for this job?')) return;
    try {
      const res = await fetch(`${backendUrl}/jobs/${jobId}/candidates`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCandidates([]);
        setSelectedCandidate(null);
      } else {
        alert('Could not clear candidate pipeline.');
      }
    } catch (err) {
      console.error('Failed to clear candidates:', err);
      alert('Network error while clearing candidates.');
    }
  };

  // ── Drag and Drop handlers ──────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  // ── Filtered Candidate List ─────────────────────────────────────────────────
  const filteredCandidates = candidates.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.currentTitle.toLowerCase().includes(q) ||
      c.currentCompany.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || c.parsingStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const parsedCount = candidates.filter(c => c.parsingStatus === 'PARSED').length;
  const processingCount = candidates.filter(
    c => c.parsingStatus === 'PROCESSING' || c.parsingStatus === 'UPLOADING' || c.parsingStatus === 'UPLOADED'
  ).length;
  const failedCount = candidates.filter(c => c.parsingStatus === 'FAILED').length;

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-[#1E293B] flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 flex-1 w-full">

        {/* ── BREADCRUMB & JOB CONTEXT HEADER ── */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/jobs" className="hover:text-brand-orange transition-colors">Jobs</Link>
          <span>/</span>
          <Link href={`/jobs/${jobId}`} className="hover:text-brand-orange transition-colors">
            {job?.position || 'Job Position'}
          </Link>
          <span>/</span>
          <span className="text-slate-800">Candidates & CV Parsing</span>
        </div>

        {/* ── JOB PROFILE BANNER ── */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-orange-pale border border-brand-orange-border rounded-full text-xs font-bold text-brand-orange">
                  <span className="w-2 h-2 rounded-full bg-brand-orange" />
                  Active Job Pipeline
                </span>
                <span className="inline-flex px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
                  {job?.requirementsCount || 8} Confirmed Requirements
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
                {job?.position || 'Frontend Developer'}
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2 flex-wrap">
                <span className="text-slate-900 font-bold">{job?.client || 'TechNova Solutions'}</span>
                <span>•</span>
                <span>{job?.location || 'Pune, Maharashtra'}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">{job?.work_mode || 'Hybrid'}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/jobs/${jobId}/requirements`}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                Review Requirements
              </Link>
              <button
                onClick={() => setShowUploadZone(prev => !prev)}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                {showUploadZone ? 'Hide Upload Zone' : 'Bulk Upload CVs'}
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CVs Uploaded', value: candidates.length, color: 'text-slate-900', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { label: 'Parsed Successfully', value: parsedCount, color: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'M5 13l4 4L19 7' },
            { label: 'Processing Queue', value: processingCount, color: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Parsing Failed', value: failedCount, color: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'M6 18L18 6M6 6l12 12' },
          ].map((st, i) => (
            <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm hover:border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{st.label}</span>
                <span className={`w-7 h-7 rounded-xl border ${st.badge} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={st.icon} />
                  </svg>
                </span>
              </div>
              <div className={`text-2xl font-black ${st.color} tracking-tight`}>{st.value}</div>
            </div>
          ))}
        </div>

        {/* ── BULK CV UPLOAD DROPZONE ── */}
        {showUploadZone && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm transition-all animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">Bulk Candidate CV Upload</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload multiple resumes for <strong className="text-slate-800">{job?.position}</strong>. Resumes will be extracted deterministically with career gap analysis and structured work history.
                </p>
              </div>
              <button
                onClick={() => setShowUploadZone(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-brand-orange bg-brand-orange-pale/40 scale-[0.99]'
                  : 'border-slate-300 hover:border-brand-orange/60 bg-[#F8FAFC]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
                onChange={e => handleFilesSelected(e.target.files)}
              />

              <div className="w-14 h-14 bg-brand-orange-pale text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <h3 className="text-base font-bold text-[#1E293B] mb-1">Drag & Drop Multiple CVs Here</h3>
              <p className="text-xs text-slate-500 mb-4">or click to browse from your computer</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                <span>PDF</span>
                <span>•</span>
                <span>DOCX</span>
                <span>•</span>
                <span>TXT</span>
                <span>(Max 15MB per file)</span>
              </div>
            </div>

            {/* Upload Queue Section */}
            {uploadQueue.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Upload Queue ({uploadQueue.length} items)
                  </h4>
                  {uploadQueue.some(q => q.status === 'PARSED') && (
                    <button
                      onClick={() => setUploadQueue(prev => prev.filter(q => q.status !== 'PARSED'))}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                    >
                      Clear Completed
                    </button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {uploadQueue.map(item => (
                    <div
                      key={item.id}
                      className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                          CV
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1E293B] truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-500">{formatBytes(item.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        {item.status === 'UPLOADING' || item.status === 'PROCESSING' ? (
                          <div className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4 text-brand-orange" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span className="text-xs font-bold text-amber-600">
                              {item.status === 'UPLOADING' ? 'Uploading...' : 'Parsing CV...'}
                            </span>
                          </div>
                        ) : item.status === 'PARSED' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                            ✓ Parsed Successfully
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-rose-600 truncate max-w-xs">
                              {item.error || 'Extraction Failed'}
                            </span>
                            {item.candidateId && (
                              <button
                                onClick={() => handleRetryCandidate(item.candidateId!)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SEARCH & STATUS FILTER BAR ── */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, company, role, or tech skills..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5">
              {(['ALL', 'PARSED', 'PROCESSING', 'FAILED'] as const).map(f => {
                const count = f === 'ALL' ? candidates.length : f === 'PARSED' ? parsedCount : f === 'PROCESSING' ? processingCount : failedCount;
                return (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === f
                        ? 'bg-brand-orange text-white shadow-orange'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                    }`}
                  >
                    <span>{f}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${statusFilter === f ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {candidates.length > 0 && (
              <button
                onClick={handleClearAllCandidates}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0"
                title="Delete all uploaded candidate files"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* ── CANDIDATES TABLE / DIRECTORY ── */}
        {filteredCandidates.length > 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F1F5F9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Candidate Profile</th>
                    <th className="px-4 py-4 hidden md:table-cell">Contact</th>
                    <th className="px-4 py-4">Experience & Companies</th>
                    <th className="px-4 py-4 hidden lg:table-cell">Current Position & Organization</th>
                    <th className="px-4 py-4 text-center">Parsing Status</th>
                    <th className="px-4 py-4 hidden sm:table-cell">Source CV</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredCandidates.map(c => {
                    const badge = statusBadge(c.parsingStatus);
                    const expInfo = getNumericExperienceDetails(c);
                    const compInfo = getCompanyBreakdown(c);
                    const gapInfo = getCandidateCareerGaps(c);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Candidate Name & Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center flex-shrink-0 border ${avatarColor(c.name)} shadow-xs`}>
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedCandidate(c);
                                  setShowRawText(false);
                                }}
                                className="font-bold text-[#1E293B] group-hover:text-brand-orange transition-colors text-left cursor-pointer flex items-center gap-1.5"
                              >
                                <span>{c.name}</span>
                                {gapInfo.hasGap && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold" title={gapInfo.statusText}>
                                    ⚠️ Gap
                                  </span>
                                )}
                              </button>
                              <div className="text-xs text-slate-500 truncate max-w-[180px]">{c.location || 'Location not specified'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-4 hidden md:table-cell text-xs text-slate-600">
                          <div>{c.email || '—'}</div>
                          <div className="text-slate-400">{c.phone || '—'}</div>
                        </td>

                        {/* Experience & Number of Companies in Brackets */}
                        <td className="px-4 py-4 text-xs font-bold text-slate-800">
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs">
                                {expInfo.badgeText}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                                {compInfo.bracketLabel}
                              </span>
                            </div>
                            {expInfo.months > 0 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                {expInfo.subText} total tenure
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Current Title & Company */}
                        <td className="px-4 py-4 hidden lg:table-cell text-xs">
                          <div className="font-semibold text-slate-800">{c.currentTitle || '—'}</div>
                          <div className="text-brand-orange font-medium">{c.currentCompany || '—'}</div>
                        </td>

                        {/* Parsing Status */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        </td>

                        {/* Source CV */}
                        <td className="px-4 py-4 hidden sm:table-cell text-xs text-slate-600">
                          <div className="font-medium truncate max-w-[160px]">{c.fileName}</div>
                          <div className="text-[10px] text-slate-400">{formatBytes(c.fileSize)}</div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {c.parsingStatus === 'FAILED' && (
                              <button
                                onClick={() => handleRetryCandidate(c.id)}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                              >
                                Retry
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedCandidate(c);
                                setShowRawText(false);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg hover:-translate-y-0.5 cursor-pointer"
                            >
                              <span>View Profile</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => handleDeleteCandidate(c.id, e)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                              title="Delete candidate CV"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div className="bg-white border border-slate-200/90 rounded-3xl text-center py-20 px-6 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange-pale text-brand-orange flex items-center justify-center mx-auto mb-4 shadow-xs">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1E293B] mb-1">
              {searchQuery ? 'No matching candidates found' : 'No CVs uploaded for this job yet.'}
            </h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto mb-6">
              {searchQuery
                ? 'Try adjusting your search keywords or clear the active status filter.'
                : 'Upload resumes (PDF, DOCX, TXT) to automatically extract candidate profiles, career timelines, and build your candidate pipeline.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowUploadZone(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Upload Candidate CVs
              </button>
            )}
          </div>
        )}

        {/* ── CANDIDATE PROFILE MODAL / SLIDEOUT DRAWER ── */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fadeIn">
            <div className="w-full max-w-3xl bg-white h-screen max-h-screen overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-slate-200/80 animate-slideLeft">
              <div>
                {/* ── Modal Header ── */}
                <div className="p-6 border-b border-slate-200/80 bg-white sticky top-0 z-30 shadow-xs">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl font-black text-xl flex items-center justify-center flex-shrink-0 border ${avatarColor(selectedCandidate.name)} shadow-xs`}>
                        {selectedCandidate.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="text-xl font-black text-slate-900 tracking-tight truncate">{selectedCandidate.name}</h2>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge(selectedCandidate.parsingStatus).bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusBadge(selectedCandidate.parsingStatus).dot}`} />
                            {selectedCandidate.parsingStatus === 'PARSED' ? 'Profile Verified' : selectedCandidate.parsingStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-1 truncate">
                          {selectedCandidate.currentTitle || 'Applicant'} • <span className="text-slate-900 font-bold">{selectedCandidate.currentCompany || 'Organization'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${selectedCandidate.name} | ${selectedCandidate.email} | ${selectedCandidate.phone}`);
                          setCopiedEmail(true);
                          setTimeout(() => setCopiedEmail(false), 2000);
                        }}
                        className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Copy contact details"
                      >
                        {copiedEmail ? '✓ Copied' : 'Copy Contact'}
                      </button>
                      <button
                        onClick={() => setSelectedCandidate(null)}
                        className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center text-sm cursor-pointer transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Contact Info Pills */}
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex-wrap">
                    {selectedCandidate.email && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-700 font-semibold">{selectedCandidate.email}</span>
                      </span>
                    )}
                    {selectedCandidate.phone && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-slate-700 font-semibold">{selectedCandidate.phone}</span>
                      </span>
                    )}
                    {selectedCandidate.location && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-slate-700 font-semibold">{selectedCandidate.location}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Candidate KPI Stat Cards ── */}
                {(() => {
                  const expInfo = getNumericExperienceDetails(selectedCandidate);
                  const compInfo = getCompanyBreakdown(selectedCandidate);
                  const gapInfo = getCandidateCareerGaps(selectedCandidate);

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-6 bg-slate-50/70 border-b border-slate-200/80">
                      {/* Stat 1: Total Experience */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Total Experience</span>
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-base font-black text-slate-900">
                            {expInfo.badgeText}
                          </span>
                          {expInfo.months > 0 && (
                            <span className="text-[11px] font-semibold text-slate-500">
                              ({expInfo.subText})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stat 2: Number of Companies in Brackets */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Organizations</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black text-slate-900">
                            {compInfo.count}
                          </span>
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-lg">
                            {compInfo.bracketLabel}
                          </span>
                        </div>
                      </div>

                      {/* Stat 3: Career Gap Status */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Career Continuity</span>
                        <div>
                          {gapInfo.hasGap ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                              <span>⚠️</span>
                              <span>{gapInfo.totalGapMonths} mos Gap</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                              <span>✓</span>
                              <span>Continuous</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stat 4: Location */}
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Location</span>
                        <p className="text-xs font-bold text-slate-800 truncate" title={selectedCandidate.location || 'Not Specified'}>
                          {selectedCandidate.location || 'Remote / Unspecified'}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* ── Segmented Tab Switcher ── */}
                <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-200/80 bg-white">
                  <button
                    onClick={() => setShowRawText(false)}
                    className={`px-4 py-2.5 text-xs font-bold transition-all rounded-t-xl cursor-pointer border-b-2 ${
                      !showRawText
                        ? 'text-brand-orange border-brand-orange bg-brand-orange-pale/20'
                        : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    Structured Profile
                  </button>
                  <button
                    onClick={() => setShowRawText(true)}
                    className={`px-4 py-2.5 text-xs font-bold transition-all rounded-t-xl cursor-pointer border-b-2 ${
                      showRawText
                        ? 'text-brand-orange border-brand-orange bg-brand-orange-pale/20'
                        : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    Raw Document & Diagnostics
                  </button>
                </div>

                {/* ── TAB 1: STRUCTURED CANDIDATE PROFILE ── */}
                {!showRawText ? (
                  <div className="p-6 space-y-6">

                    {/* Section: Professional Summary */}
                    {(selectedCandidate.professionalSummary || selectedCandidate.summary) && (
                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                        <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h3>
                        <p className="text-xs text-slate-700 leading-relaxed font-normal">
                          {selectedCandidate.professionalSummary || selectedCandidate.summary}
                        </p>
                      </div>
                    )}

                    {/* Section: Tech Stack & Competencies */}
                    {(() => {
                      const effectiveSkills = getEffectiveSkills(selectedCandidate);
                      if (effectiveSkills.length === 0) return null;
                      return (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Demonstrated Tech Stack & Skills</h3>
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {effectiveSkills.length} Verified
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {effectiveSkills.map((s, i) => (
                              <span key={i} className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:border-brand-orange hover:bg-brand-orange-pale/30 transition-colors">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* ── Section: WORK HISTORY TIMELINE WITH ELEGANT GAPS BETWEEN COMPANIES ── */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                      {(() => {
                        const compInfo = getCompanyBreakdown(selectedCandidate);
                        const expInfo = getNumericExperienceDetails(selectedCandidate);
                        const timelineItems = getTimelineWithGaps(selectedCandidate);

                        return (
                          <div>
                            {/* Work History Header */}
                            <div className="flex items-center justify-between mb-6 flex-wrap gap-2 pb-4 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-slate-900">
                                  Work History & Timeline
                                </h3>
                                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-bold">
                                  {compInfo.bracketLabel}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                Total Tenure: {expInfo.badgeText} {expInfo.months > 0 ? `(${expInfo.subText})` : ''}
                              </span>
                            </div>

                            {/* Elegant Vertical Timeline */}
                            {timelineItems.length > 0 ? (
                              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                                {timelineItems.map((item, idx) => {
                                  if (item.type === 'GAP' && item.gap) {
                                    /* ── ELEGANT CAREER GAP BANNER BETWEEN COMPANIES ── */
                                    return (
                                      <div
                                        key={`gap-${idx}`}
                                        className="relative -ml-6 my-4 pl-6"
                                      >
                                        {/* Timeline Node */}
                                        <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white shadow-xs z-10" />

                                        <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                                          <div className="flex items-center gap-2.5">
                                            <span className="text-sm">⚠️</span>
                                            <div className="text-xs text-amber-950 font-medium">
                                              <span className="font-bold">{item.gap.gapLabel}</span>
                                              <span className="text-slate-500 text-[11px] block sm:inline sm:ml-1">
                                                between <strong className="text-slate-800 font-semibold">{item.gap.fromCompany}</strong> and <strong className="text-slate-800 font-semibold">{item.gap.toCompany}</strong>
                                              </span>
                                            </div>
                                          </div>
                                          <span className="text-[11px] font-bold text-amber-900 bg-white border border-amber-200 px-2.5 py-0.5 rounded-md self-start sm:self-center shadow-2xs">
                                            {item.gap.startDate} → {item.gap.endDate}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }

                                  /* ── COMPANY WORK EXPERIENCE CARD ── */
                                  const exp = item.company!;
                                  const titleText = (exp.title && exp.title.toLowerCase() !== 'role') ? exp.title : (selectedCandidate.currentTitle || 'Professional Role');
                                  const durMonths = parseMonthsFromText(exp.duration || (exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : ''));
                                  const durPill = durMonths > 0 ? (durMonths < 12 ? `${durMonths} mos` : `${parseFloat((durMonths/12).toFixed(1))} yrs`) : null;
                                  const companyName = exp.company || selectedCandidate.currentCompany || 'Organization';

                                  return (
                                    <div
                                      key={`comp-${idx}`}
                                      className="relative bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 transition-all shadow-2xs group"
                                    >
                                      {/* Timeline Node */}
                                      <div className="absolute -left-6 top-5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-white shadow-xs z-10 group-hover:bg-brand-orange transition-colors" />

                                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                        <div>
                                          <h4 className="text-sm font-black text-slate-900">{titleText}</h4>
                                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className="text-xs font-bold text-slate-800">
                                              {companyName}
                                            </span>
                                            {exp.location && (
                                              <>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-[11px] text-slate-500 font-medium">{exp.location}</span>
                                              </>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-start sm:self-center">
                                          <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg shadow-2xs">
                                            {exp.duration || (exp.startDate && exp.endDate ? `${exp.startDate} – ${exp.endDate}` : exp.startDate || exp.endDate || 'Tenure not specified')}
                                          </span>
                                          {durPill && !exp.duration?.includes('•') && (
                                            <span className="px-2 py-1 rounded-md bg-slate-200/70 text-[10px] font-bold text-slate-700">
                                              {durPill}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Highlights & Description with Clean Dot Bullets */}
                                      {(() => {
                                        const rawBulletList = exp.highlights && exp.highlights.length > 0
                                          ? exp.highlights.flatMap(h => sanitizeBulletText(h))
                                          : sanitizeBulletText(exp.description || '');

                                        if (rawBulletList.length === 0) return null;

                                        return (
                                          <ul className="space-y-2 mt-3 pt-3 border-t border-slate-200/60">
                                            {rawBulletList.map((bullet, bi) => (
                                              <li key={bi} className="text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                                                <span className="flex-1">{bullet}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        );
                                      })()}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                                No distinct employment history records could be extracted from this document.
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Section: Education */}
                    {selectedCandidate.education && selectedCandidate.education.length > 0 && (
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                        <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Education & Qualifications</h3>
                        <div className="space-y-2.5">
                          {selectedCandidate.education.map((edu, i) => (
                            <div key={i} className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-2xs">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                                  🎓
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {edu.institution} {edu.year ? `• ${edu.year}` : ''} {edu.details ? `• ${edu.details}` : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section: Key Projects */}
                    {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                        <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Featured Projects</h3>
                        <div className="space-y-3">
                          {selectedCandidate.projects.map((proj, i) => (
                            <div key={i} className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 shadow-2xs">
                              <h4 className="text-xs font-bold text-slate-900">{proj.name}</h4>
                              {proj.technologies && proj.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                                  {proj.technologies.map((t, ti) => (
                                    <span key={ti} className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700 shadow-2xs">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {proj.description && (
                                <ul className="space-y-1.5 mt-2">
                                  {sanitizeBulletText(proj.description).map((b, bi) => (
                                    <li key={bi} className="text-xs text-slate-600 flex items-start gap-2 leading-relaxed">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0" />
                                      <span className="flex-1">{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section: Certifications & Languages */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedCandidate.certifications && selectedCandidate.certifications.length > 0 && (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                          <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Certifications</h3>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {selectedCandidate.certifications.map((c, i) => (
                              <li key={i} className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 p-2.5 rounded-lg shadow-2xs">
                                <span className="text-emerald-600 font-bold">✓</span>
                                <span className="font-semibold text-slate-800 truncate">{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedCandidate.languages && selectedCandidate.languages.length > 0 && (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                          <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5">Languages</h3>
                          <ul className="space-y-1.5 text-xs text-slate-700">
                            {selectedCandidate.languages.map((l, i) => (
                              <li key={i} className="flex items-center gap-2 bg-slate-50/80 border border-slate-200/80 p-2.5 rounded-lg shadow-2xs">
                                <span className="text-slate-400 font-bold">🌐</span>
                                <span className="font-semibold text-slate-800">{l}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ── TAB 2: RAW CV TEXT & PARSER DIAGNOSTICS ── */
                  <div className="p-6 space-y-5">
                    {/* Document Diagnostics */}
                    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 shadow-xs">
                      <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Document Extraction Diagnostics</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">File Name</span>
                          <p className="font-bold text-slate-800 truncate">{selectedCandidate.parsingMetadata?.fileName || selectedCandidate.fileName}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">File Type</span>
                          <p className="font-bold text-slate-800 truncate">{selectedCandidate.parsingMetadata?.fileType || 'PDF'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">Page Count</span>
                          <p className="font-bold text-slate-800">{selectedCandidate.parsingMetadata?.pageCount || 1}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">Extraction Method</span>
                          <p className="font-bold text-slate-800">{selectedCandidate.parsingMetadata?.extractionMethod || 'pymupdf-layout'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">OCR Used</span>
                          <p className="font-bold text-slate-800">{selectedCandidate.parsingMetadata?.ocrUsed ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">Character / Word Count</span>
                          <p className="font-bold text-slate-800">
                            {selectedCandidate.parsingMetadata?.characterCount || 0} / {selectedCandidate.parsingMetadata?.wordCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Raw Text Viewer */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Extracted Document Text</h4>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedCandidate.rawText || '');
                            setCopiedRawText(true);
                            setTimeout(() => setCopiedRawText(false), 2000);
                          }}
                          className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-xs cursor-pointer"
                        >
                          {copiedRawText ? '✓ Copied to Clipboard' : 'Copy Text'}
                        </button>
                      </div>
                      <div className="bg-[#0F172A] text-slate-200 rounded-2xl p-5 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap border border-slate-700 shadow-inner">
                        {selectedCandidate.rawText || 'No raw extracted text available for this candidate record.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Drawer Footer ── */}
              <div className="p-5 border-t border-slate-200 bg-white flex items-center justify-between sticky bottom-0 z-20 shadow-xs">
                <button
                  onClick={() => handleDeleteCandidate(selectedCandidate.id)}
                  className="px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete Candidate</span>
                </button>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
