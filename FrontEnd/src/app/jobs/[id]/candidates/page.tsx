'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import MatchBadge from '@/components/evaluation/MatchBadge';
import ScoreCard from '@/components/evaluation/ScoreCard';
import RequirementTable from '@/components/evaluation/RequirementTable';
import {
  computeComprehensiveMatchScore,
  ComprehensiveMatchResult,
} from '@/utils/requirementUtils';
import { RequirementStatus, ConfidenceLevel } from '@/types';


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
  jd_text?: string;
  requirements?: Array<{ id: string; requirement: string; category?: string; weight?: number; is_mandatory?: boolean; source_evidence?: string; needs_verification?: boolean }>;
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
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
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
  const dateRangePattern = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4})\s*(?:[–—\-]|to)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}|\d{4}|Present|Current)\b/i;
  const match = t.match(dateRangePattern);
  if (match) {
    const parseYM = (str: string) => {
      const s = str.trim().toLowerCase();
      if (s === 'present' || s === 'current' || s === 'now') {
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
      statusText: 'No gap identified (Continuous employment)'
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
      statusText: 'No gap identified'
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

    if (diff >= 3) {
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
      statusText: 'No gap identified'
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

const avatarColor = (name?: string | null) => {
  const safeName = (name || 'Candidate').trim();
  const colors = [
    'bg-brand-orange-pale text-brand-orange',
    'bg-blue-50 text-blue-600',
    'bg-emerald-50 text-emerald-600',
    'bg-purple-50 text-purple-600',
    'bg-amber-50 text-amber-600',
    'bg-rose-50 text-rose-600',
    'bg-teal-50 text-teal-600',
  ];
  return colors[Math.abs(safeName.charCodeAt(0) || 0) % colors.length];
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

  // Filters, Sort & Selected Candidate Drawer
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'STRONG_MATCH' | 'GOOD_MATCH' | 'LOW_FIT' | 'PARSED' | 'FAILED'>('ALL');
  const [sortField, setSortField] = useState<'score' | 'date' | 'name' | 'experience'>('score');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'match' | 'profile' | 'raw'>('match');
  const [copiedRawText, setCopiedRawText] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        jd_text: 'Frontend Developer',
        requirements: [],
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
              jd_text: jobData.job.jd_text || jobData.job.position,
              requirements: jobData.job.requirements || [],
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

  // ── Compute Match Scores & Rank Candidates (Highest to Lowest) ──────────────
  const candidatesWithMatch = useMemo(() => {
    return candidates.map(c => {
      const matchResult = computeComprehensiveMatchScore(
        {
          skills: c.skills || [],
          totalExperience: c.totalExperience || c.totalExperienceYears,
          totalExperienceYears: c.totalExperienceYears,
          education: c.education || [],
          rawText: c.rawText || '',
          summary: c.summary || c.professionalSummary || '',
          currentTitle: c.currentTitle || '',
        },
        {
          position: job?.position || 'Job Position',
          jd_text: job?.jd_text || job?.position || '',
          requirements: job?.requirements || [],
        }
      );


      // Build requirement evaluation structure for RequirementTable
      const requirementEvals = (job?.requirements && job.requirements.length > 0)
        ? job.requirements.map(req => {
            const reqLower = req.requirement.toLowerCase();
            const candSkills = (c.skills || []).map(s => s.toLowerCase());
            const hasSkill = candSkills.some(cs => reqLower.includes(cs) || cs.includes(reqLower));
            const status = hasSkill ? RequirementStatus.FULLY_MET : RequirementStatus.PARTIALLY_MET;
            return {
              id: req.id,
              requirement: {
                id: req.id,
                text: req.requirement,
                category: req.category || 'Technical Skill',
                isMandatory: Boolean(req.is_mandatory),
                weight: req.weight || 1.0,
              },
              status,
              confidence: ConfidenceLevel.HIGH,
              pointsAwarded: hasSkill ? 10 : 5,
              maxPoints: 10,
              matchPercentage: hasSkill ? 100 : 50,
              hasEvidence: Boolean(req.source_evidence || hasSkill),
              evidence: [
                {
                  id: `ev-${req.id}`,
                  type: 'Explicit',
                  source: 'Candidate Profile & CV Text',
                  text: hasSkill ? `Candidate profile lists skill / background matching "${req.requirement}".` : `Partial alignment for "${req.requirement}".`,
                  matchStrength: hasSkill ? 95 : 55,
                },
              ],
            };
          })
        : [
            {
              id: 'req-core-skills',
              requirement: { id: 'req-1', text: 'Core Required Technical Stack', category: 'Technical Skill', isMandatory: true, weight: 1.5 },
              status: matchResult.breakdown.skills.score >= 70 ? RequirementStatus.FULLY_MET : RequirementStatus.PARTIALLY_MET,
              confidence: ConfidenceLevel.HIGH,
              pointsAwarded: Math.round(matchResult.breakdown.skills.score / 10),
              maxPoints: 10,
              matchPercentage: matchResult.breakdown.skills.score,
              hasEvidence: true,
              evidence: [{
                id: 'ev-1',
                type: 'Explicit',
                source: 'Extracted Skills',
                text: `Matched ${matchResult.breakdown.skills.matchedSkills.length} competencies (${matchResult.breakdown.skills.matchedSkills.slice(0, 5).join(', ')}).`,
                matchStrength: matchResult.breakdown.skills.score,
              }],
            },
            {
              id: 'req-exp',
              requirement: { id: 'req-2', text: 'Relevant Years of Professional Experience', category: 'Experience', isMandatory: true, weight: 1.2 },
              status: matchResult.breakdown.experience.score >= 80 ? RequirementStatus.FULLY_MET : RequirementStatus.PARTIALLY_MET,
              confidence: ConfidenceLevel.HIGH,
              pointsAwarded: Math.round(matchResult.breakdown.experience.score / 10),
              maxPoints: 10,
              matchPercentage: matchResult.breakdown.experience.score,
              hasEvidence: true,
              evidence: [{
                id: 'ev-2',
                type: 'Explicit',
                source: 'Work History',
                text: `Candidate has ${matchResult.breakdown.experience.candidateYears} years of experience vs ${matchResult.breakdown.experience.requiredYears} years required.`,
                matchStrength: matchResult.breakdown.experience.score,
              }],
            },
          ];

      return {
        ...c,
        matchScore: matchResult.overallScore,
        matchLevel: matchResult.matchLevel,
        matchBreakdown: matchResult.breakdown,
        matchSummary: matchResult.summary,
        requirementEvals,
      };
    });
  }, [candidates, job, jobId]);

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
      processUploadBatch(newItems);
    }
  };

  // ── Process Upload Queue in Batch ───────────────────────────────────────────
  const processUploadBatch = async (items: UploadQueueItem[]) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      items.forEach(item => {
        formData.append('files', item.file);
      });

      setUploadQueue(prev =>
        prev.map(q =>
          items.some(it => it.id === q.id)
            ? { ...q, status: 'PROCESSING', progress: 50 }
            : q
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

  // ── Filtered & Ranked Candidate List ────────────────────────────────────────
  const filteredCandidates = candidatesWithMatch
    .filter(c => {
      const q = (searchQuery || '').trim().toLowerCase();
      if (q) {
        const nameMatches = c.name ? c.name.toLowerCase().includes(q) : false;
        const titleMatches = c.currentTitle ? c.currentTitle.toLowerCase().includes(q) : false;
        const companyMatches = c.currentCompany ? c.currentCompany.toLowerCase().includes(q) : false;
        const emailMatches = c.email ? c.email.toLowerCase().includes(q) : false;
        const skillMatches = c.skills ? c.skills.some(s => s && s.toLowerCase().includes(q)) : false;

        const matchesSearch = nameMatches || titleMatches || companyMatches || emailMatches || skillMatches;
        if (!matchesSearch) return false;
      }

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'STRONG_MATCH') return (c.matchScore ?? 0) >= 80;
      if (statusFilter === 'GOOD_MATCH') return (c.matchScore ?? 0) >= 50 && (c.matchScore ?? 0) < 80;
      if (statusFilter === 'LOW_FIT') return (c.matchScore ?? 0) < 50;
      return c.parsingStatus === statusFilter;
    })

    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        comparison = (b.matchScore ?? 0) - (a.matchScore ?? 0);
      } else if (sortField === 'date') {
        comparison = new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime();
      } else if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'experience') {
        const expA = a.totalExperienceYears || parseMonthsFromText(a.totalExperience) / 12;
        const expB = b.totalExperienceYears || parseMonthsFromText(b.totalExperience) / 12;
        comparison = expB - expA;
      }
      return sortDirection === 'desc' ? comparison : -comparison;
    });


  const parsedCount = candidates.filter(c => c.parsingStatus === 'PARSED').length;
  const strongMatchCount = candidatesWithMatch.filter(c => (c.matchScore ?? 0) >= 80).length;
  const avgMatch = candidatesWithMatch.length > 0
    ? Math.round(candidatesWithMatch.reduce((acc, c) => acc + (c.matchScore ?? 0), 0) / candidatesWithMatch.length)
    : 0;

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
          <span className="text-slate-800">Candidates & Match Rankings</span>
        </div>

        {/* ── JOB PROFILE BANNER ── */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-orange-pale border border-brand-orange-border rounded-full text-xs font-bold text-brand-orange">
                  <span className="w-2 h-2 rounded-full bg-brand-orange" />
                  Active Job Context
                </span>
                <span className="inline-flex px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
                  {job?.requirementsCount || 8} Confirmed Requirements
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
                {job?.position || 'Frontend Developer'}
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2 flex-wrap">
                <span className="text-slate-800 font-bold">{job?.client || 'TechNova Solutions'}</span>
                <span>•</span>
                <span>{job?.location || 'Pune, Maharashtra'}</span>
                <span>•</span>
                <span>{job?.work_mode || 'Hybrid'}</span>
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
                {showUploadZone ? 'Hide Quick Drop' : '+ Quick Drop'}
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS SUMMARY CARDS WITH MATCH METRICS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CVs Uploaded', value: candidates.length, color: 'text-[#1E293B]', bg: 'bg-brand-orange-pale text-brand-orange', border: 'border-slate-200', icon: '∑' },
            { label: 'Strong Matches (≥80%)', value: strongMatchCount, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200', icon: '✓' },
            { label: 'Average Match Score', value: `${avgMatch}%`, color: 'text-brand-orange', bg: 'bg-brand-orange-pale text-brand-orange', border: 'border-orange-200', icon: '★' },
            { label: 'Parsed Successfully', value: parsedCount, color: 'text-slate-800', bg: 'bg-slate-100 text-slate-700', border: 'border-slate-200', icon: '📄' },
          ].map((st, i) => (
            <div key={i} className={`bg-white border ${st.border} rounded-2xl p-5 shadow-sm card-hover-lift`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{st.label}</span>
                <span className={`w-7 h-7 rounded-xl ${st.bg} flex items-center justify-center font-extrabold text-xs`}>
                  {st.icon}
                </span>
              </div>
              <div className={`text-2xl font-extrabold ${st.color}`}>{st.value}</div>
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
                  Upload multiple resumes for <strong className="text-slate-800">{job?.position}</strong>. Resumes will be extracted and scored across 4 dimensions automatically.
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
              <p className="text-xs text-slate-500 mb-4">Supports PDF, DOCX, DOC, and TXT up to 15MB each</p>
              <button
                type="button"
                className="px-5 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-xl shadow-orange hover:bg-brand-orange-hover transition-all"
              >
                Browse Files
              </button>
            </div>

            {uploadQueue.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-700 mb-3">Upload Queue ({uploadQueue.length} files)</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {uploadQueue.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <div className="flex items-center gap-3 truncate">
                        <span className="font-bold text-slate-800 truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{formatBytes(item.size)}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        item.status === 'PARSED' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── QUICK FILTER & SORT TOOLBAR ── */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, role, skills, or email..."
              suppressHydrationWarning
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-between md:justify-end">
            {/* Status & Match Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'STRONG_MATCH', label: '≥80% Match' },
                { id: 'GOOD_MATCH', label: '50-79%' },
                { id: 'LOW_FIT', label: '<50%' },
                { id: 'PARSED', label: 'Parsed' },
                { id: 'FAILED', label: 'Failed' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  suppressHydrationWarning
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === f.id
                      ? 'bg-brand-orange text-white shadow-orange'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Toolbar */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Sort:</span>
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value as any)}
                suppressHydrationWarning
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="score">Match Score (Ranked)</option>
                <option value="date">Date Added</option>
                <option value="name">Candidate Name</option>
                <option value="experience">Total Experience</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                title={sortDirection === 'desc' ? 'Descending' : 'Ascending'}
                suppressHydrationWarning
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
              >
                {sortDirection === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>

        </div>

        {/* ── CANDIDATES RANKED TABLE ── */}
        {filteredCandidates.length > 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F1F5F9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Rank & Candidate</th>
                    <th className="px-4 py-4 text-center">Match Score</th>
                    <th className="px-4 py-4 text-center">Match Badge</th>
                    <th className="px-4 py-4">Experience</th>
                    <th className="px-4 py-4 hidden lg:table-cell">Current Position & Company</th>
                    <th className="px-4 py-4 text-center">Status</th>
                    <th className="px-4 py-4 hidden sm:table-cell">Source CV</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredCandidates.map((c, idx) => {
                    const badge = statusBadge(c.parsingStatus);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Candidate Name & Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold ${
                              idx === 0 ? 'bg-amber-100 text-amber-800' :
                              idx === 1 ? 'bg-slate-200 text-slate-700' :
                              idx === 2 ? 'bg-amber-50 text-amber-700' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              #{idx + 1}
                            </span>
                            <div className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center flex-shrink-0 ${avatarColor(c.name)} shadow-xs`}>
                              {(c.name || 'Candidate').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedCandidate(c);
                                  setActiveModalTab('match');
                                }}
                                className="font-bold text-[#1E293B] group-hover:text-brand-orange transition-colors text-left cursor-pointer"
                              >
                                {c.name || c.fileName || 'Unnamed Candidate'}
                              </button>
                              <div className="text-xs text-slate-500 truncate max-w-[180px]">{c.location || 'Location not specified'}</div>
                            </div>
                          </div>
                        </td>


                        {/* Overall Match Score */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-base font-extrabold ${
                              (c.matchScore ?? 0) >= 80 ? 'text-emerald-600' : (c.matchScore ?? 0) >= 50 ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                              {c.matchScore}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  (c.matchScore ?? 0) >= 80 ? 'bg-emerald-500' : (c.matchScore ?? 0) >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${c.matchScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* MatchBadge Component */}
                        <td className="px-4 py-4 text-center">
                          <MatchBadge score={c.matchScore} size="sm" showPercentage={false} />
                        </td>

                        {/* Experience */}
                        <td className="px-4 py-4 text-xs font-bold text-slate-800">
                          {(() => {
                            const expInfo = getNumericExperienceDetails(c);
                            return (
                              <div className="flex flex-col items-start gap-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs">
                                  {expInfo.badgeText}
                                </span>
                                {expInfo.months > 0 && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {expInfo.subText} total
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        {/* Current Title & Company */}
                        <td className="px-4 py-4 hidden lg:table-cell text-xs">
                          <div className="font-semibold text-slate-800">{c.currentTitle || '—'}</div>
                          <div className="text-slate-500">{c.currentCompany || '—'}</div>
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
                          <div className="font-medium truncate max-w-[140px]">{c.fileName}</div>
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
                                setActiveModalTab('match');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-orange-pale hover:bg-brand-orange hover:text-white text-brand-orange text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              Breakdown →
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
                : 'Upload resumes (PDF, DOCX, TXT) to automatically extract candidate profiles and score them against this job.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowUploadZone(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Upload CVs
              </button>
            )}
          </div>
        )}

        {/* ── CANDIDATE PROFILE & MATCH CRITERIA DETAILS MODAL ── */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fadeIn">
            <div className="w-full max-w-3xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div>
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-[#F8FAFC]">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl font-extrabold text-xl flex items-center justify-center ${avatarColor(selectedCandidate.name)} shadow-xs`}>
                      {(selectedCandidate.name || 'Candidate').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-extrabold text-[#1E293B]">{selectedCandidate.name || selectedCandidate.fileName || 'Candidate Profile'}</h2>
                        <MatchBadge score={selectedCandidate.matchScore} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {selectedCandidate.currentTitle || 'Candidate'} • {selectedCandidate.currentCompany || 'Experience'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm cursor-pointer shadow-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Candidate Overview Bar */}
                <div className="grid grid-cols-3 gap-2 p-6 border-b border-slate-100 bg-white">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Experience</span>
                    {(() => {
                      const expInfo = getNumericExperienceDetails(selectedCandidate);
                      return (
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100/80 text-amber-900 border border-amber-300">
                            {expInfo.badgeText}
                          </span>
                          {expInfo.months > 0 && (
                            <span className="text-xs font-bold text-slate-700">
                              ({expInfo.subText})
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{selectedCandidate.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">{selectedCandidate.location || '—'}</p>
                  </div>
                </div>

                {/* 3-Tab Switcher */}
                <div className="px-6 pt-4 flex items-center gap-3 border-b border-slate-100">
                  <button
                    onClick={() => setActiveModalTab('match')}
                    className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
                      activeModalTab === 'match' ? 'text-brand-orange' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Match & Criteria Breakdown
                    {activeModalTab === 'match' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />}
                  </button>
                  <button
                    onClick={() => setActiveModalTab('profile')}
                    className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
                      activeModalTab === 'profile' ? 'text-brand-orange' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Structured Profile
                    {activeModalTab === 'profile' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />}
                  </button>
                  <button
                    onClick={() => setActiveModalTab('raw')}
                    className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
                      activeModalTab === 'raw' ? 'text-brand-orange' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Raw CV Extraction & Diagnostics
                    {activeModalTab === 'raw' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />}
                  </button>
                </div>

                {/* Tab 1: Match & Criteria Breakdown */}
                {activeModalTab === 'match' && (
                  <div className="p-6 space-y-6">
                    {/* ScoreCards Grid */}
                    {selectedCandidate.matchBreakdown && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <ScoreCard
                          score={selectedCandidate.matchBreakdown.skills.score}
                          maxScore={100}
                          label="Core Skills (40%)"
                          percentage={selectedCandidate.matchBreakdown.skills.score}
                          gradient="from-emerald-500 to-teal-500"
                          description={`${selectedCandidate.matchBreakdown.skills.matchedSkills.length} skills matched`}
                        />
                        <ScoreCard
                          score={selectedCandidate.matchBreakdown.experience.score}
                          maxScore={100}
                          label="Experience (30%)"
                          percentage={selectedCandidate.matchBreakdown.experience.score}
                          gradient="from-cyan-500 to-blue-500"
                          description={`${selectedCandidate.matchBreakdown.experience.candidateYears}y / ${selectedCandidate.matchBreakdown.experience.requiredYears}y required`}
                        />
                        <ScoreCard
                          score={selectedCandidate.matchBreakdown.education.score}
                          maxScore={100}
                          label="Education (15%)"
                          percentage={selectedCandidate.matchBreakdown.education.score}
                          gradient="from-purple-500 to-indigo-500"
                          description={selectedCandidate.matchBreakdown.education.candidateDegrees[0] || 'Degree Match'}
                        />
                        <ScoreCard
                          score={selectedCandidate.matchBreakdown.keywords.score}
                          maxScore={100}
                          label="Semantic Overlap (15%)"
                          percentage={selectedCandidate.matchBreakdown.keywords.score}
                          gradient="from-amber-500 to-orange-500"
                          description={`${Math.round(selectedCandidate.matchBreakdown.keywords.cosineSimilarity * 100)}% Cosine Sim`}
                        />
                      </div>
                    )}

                    {/* Matched vs Missing Skills */}
                    {selectedCandidate.matchBreakdown && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Skills Alignment Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                              <span>✓</span> Matched Skills ({selectedCandidate.matchBreakdown.skills.matchedSkills.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedCandidate.matchBreakdown.skills.matchedSkills.length > 0 ? (
                                selectedCandidate.matchBreakdown.skills.matchedSkills.map((s: string, i: number) => (
                                  <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">No direct required skill matches.</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1.5">
                              <span>✕</span> Missing / Gap Skills ({selectedCandidate.matchBreakdown.skills.missingSkills.length})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedCandidate.matchBreakdown.skills.missingSkills.length > 0 ? (
                                selectedCandidate.matchBreakdown.skills.missingSkills.map((s: string, i: number) => (
                                  <span key={i} className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-400 italic">No critical skill gaps identified.</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Deterministic Requirement Table */}
                    {selectedCandidate.requirementEvals && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Job Requirement Compliance Audit</h3>
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                          <RequirementTable evaluations={selectedCandidate.requirementEvals} showEvidence={true} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Structured Profile View */}
                {activeModalTab === 'profile' && (
                  <div className="p-6 space-y-6">
                    {/* Professional Summary */}
                    {(selectedCandidate.professionalSummary || selectedCandidate.summary) && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Professional Summary</h3>
                        <p className="text-xs text-slate-700 leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200">
                          {selectedCandidate.professionalSummary || selectedCandidate.summary}
                        </p>
                      </div>
                    )}

                    {/* Career Gap Analysis */}
                    {(() => {
                      const gapInfo = getCandidateCareerGaps(selectedCandidate);
                      return (
                        <div className={`border rounded-2xl p-4.5 transition-all ${
                          gapInfo.hasGap 
                            ? 'bg-amber-50/50 border-amber-200' 
                            : 'bg-emerald-50/40 border-emerald-200/80'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                                gapInfo.hasGap ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {gapInfo.hasGap ? '⚠️' : '✓'}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-[#1E293B]">Career Gap Analysis</h4>
                                <p className="text-[11px] text-slate-600 font-medium">{gapInfo.statusText}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                              gapInfo.hasGap
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-emerald-100/80 text-emerald-800 border-emerald-300'
                            }`}>
                              {gapInfo.hasGap ? `${gapInfo.totalGapMonths} mos total gap` : 'No Gap Identified'}
                            </span>
                          </div>
                          {gapInfo.hasGap && gapInfo.gaps.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-2">
                              {gapInfo.gaps.map((g, gi) => (
                                <div key={gi} className="text-xs text-amber-950 bg-white/80 border border-amber-200 px-3 py-2 rounded-xl flex items-center justify-between">
                                  <span className="font-semibold">{g.gapLabel}</span>
                                  <span className="text-[11px] text-slate-500 font-medium">{g.startDate} → {g.endDate}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Extracted Competencies & Tech Stack */}
                    {(() => {
                      const effectiveSkills = getEffectiveSkills(selectedCandidate);
                      if (effectiveSkills.length === 0) return null;
                      return (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tech Stack & Competencies</h3>
                            <span className="text-[11px] font-bold text-slate-500">{effectiveSkills.length} Identified</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {effectiveSkills.map((s, i) => (
                              <span key={i} className="px-2.5 py-1 bg-[#F8FAFC] border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-700 hover:border-brand-orange/40 transition-colors">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Experience Timeline */}
                    {selectedCandidate.experience && selectedCandidate.experience.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Work History</h3>
                          {(() => {
                            const expInfo = getNumericExperienceDetails(selectedCandidate);
                            return (
                              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                                Total: {expInfo.fullLabel}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="space-y-3">
                          {selectedCandidate.experience.map((exp: CandidateExperience, i: number) => {
                            const titleText = (exp.title && exp.title.toLowerCase() !== 'role') ? exp.title : (selectedCandidate.currentTitle || 'Role / Position');
                            const durMonths = parseMonthsFromText(exp.duration || (exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : ''));
                            const durPill = durMonths > 0 ? (durMonths < 12 ? `${durMonths} mos` : `${parseFloat((durMonths/12).toFixed(1))} yrs`) : null;
                            return (
                              <div key={i} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">
                                <div className="flex items-start justify-between">
                                  <h4 className="text-xs font-bold text-[#1E293B]">{titleText}</h4>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500">
                                      {exp.duration || (exp.startDate && exp.endDate ? `${exp.startDate} – ${exp.endDate}` : exp.startDate || exp.endDate || '')}
                                    </span>
                                    {durPill && !exp.duration?.includes('•') && (
                                      <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-[10px] font-bold text-slate-700">
                                        {durPill}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {exp.company && <p className="text-xs text-brand-orange font-semibold mt-0.5">{exp.company}</p>}
                                {exp.description && <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{exp.description}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {selectedCandidate.education && selectedCandidate.education.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Education</h3>
                        <div className="space-y-2.5">
                          {selectedCandidate.education.map((edu: CandidateEducation, i: number) => (
                            <div key={i} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3.5 flex items-start justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{edu.degree}</h4>
                                <p className="text-[11px] text-slate-500">
                                  {edu.institution} {edu.year ? `• ${edu.year}` : ''} {edu.details ? `• ${edu.details}` : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Projects</h3>
                        <div className="space-y-3">
                          {selectedCandidate.projects.map((proj: CandidateProject, i: number) => (
                            <div key={i} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">
                              <div className="flex items-start justify-between">
                                <h4 className="text-xs font-bold text-[#1E293B]">{proj.name}</h4>
                              </div>
                              {proj.technologies && proj.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                                  {proj.technologies.map((t: string, ti: number) => (
                                    <span key={ti} className="px-2 py-0.5 bg-slate-200/70 rounded text-[10px] font-medium text-slate-700">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {proj.description && (
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{proj.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications & Languages */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedCandidate.certifications && selectedCandidate.certifications.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Certifications</h3>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {selectedCandidate.certifications.map((c: string, i: number) => (
                              <li key={i} className="flex items-center gap-1.5 bg-[#F8FAFC] border border-slate-200 p-2 rounded-xl">
                                <span className="text-emerald-500 font-bold">✓</span> <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedCandidate.languages && selectedCandidate.languages.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Languages</h3>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {selectedCandidate.languages.map((l: string, i: number) => (
                              <li key={i} className="flex items-center gap-1.5 bg-[#F8FAFC] border border-slate-200 p-2 rounded-xl">
                                <span className="text-brand-orange">🌐</span> <span>{l}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                )}

                {/* Tab 3: Raw CV Extraction & Diagnostics */}
                {activeModalTab === 'raw' && (
                  <div className="p-6 space-y-5">
                    {/* Metadata Box */}
                    <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">
                      <h3 className="text-xs font-bold text-[#1E293B] mb-3">Document Extraction Diagnostics</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
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
                          <p className="font-bold text-slate-800">{selectedCandidate.parsingMetadata?.extractionMethod || 'python-pdfplumber'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">OCR Used</span>
                          <p className="font-bold text-slate-800">{selectedCandidate.parsingMetadata?.ocrUsed ? 'Yes' : 'No'}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold text-[10px] uppercase">Characters / Words</span>
                          <p className="font-bold text-slate-800">
                            {selectedCandidate.parsingMetadata?.characterCount || 0} / {selectedCandidate.parsingMetadata?.wordCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Raw Text Viewer */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">RAW CV EXTRACTED TEXT</h4>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(selectedCandidate.rawText || '');
                            setCopiedRawText(true);
                            setTimeout(() => setCopiedRawText(false), 2000);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 shadow-xs cursor-pointer"
                        >
                          {copiedRawText ? '✓ Copied' : 'Copy Text'}
                        </button>
                      </div>
                      <div className="bg-[#1E293B] text-slate-200 rounded-2xl p-4 font-mono text-[11px] leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap border border-slate-700 shadow-inner">
                        {selectedCandidate.rawText || 'No raw extracted text available for this candidate record.'}
                      </div>
                    </div>
                  </div>
                )}
              </div>


              {/* Drawer Footer */}
              <div className="p-5 border-t border-slate-100 bg-[#F8FAFC] flex items-center justify-between">
                <span className="text-xs text-slate-500">Candidate ID: <code className="font-mono text-slate-700">{selectedCandidate.id}</code></span>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
