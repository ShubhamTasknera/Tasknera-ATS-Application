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

export interface CandidateRecord {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalExperience: string;
  currentTitle: string;
  currentCompany: string;
  professionalSummary: string;
  skills: string[];
  education: CandidateEducation[];
  certifications: string[];
  experience: CandidateExperience[];
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

const avatarColor = (name: string) => {
  const colors = [
    'bg-brand-orange-pale text-brand-orange',
    'bg-blue-50 text-blue-600',
    'bg-emerald-50 text-emerald-600',
    'bg-purple-50 text-purple-600',
    'bg-amber-50 text-amber-600',
    'bg-rose-50 text-rose-600',
    'bg-teal-50 text-teal-600',
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
      // Step 1: Advance UI queue to UPLOADING -> PROCESSING
      setUploadQueue(prev =>
        prev.map(q =>
          items.some(it => it.id === q.id) ? { ...q, status: 'UPLOADING', progress: 45 } : q
        )
      );

      // Step 2: Call backend POST /api/jobs/:jobId/candidates/upload
      const res = await fetch(`${backendUrl}/jobs/${jobId}/candidates/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with HTTP ${res.status}`);
      }

      const result = await res.json();

      // Step 3: Mark uploaded items as PARSED / FAILED in queue
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

      // Step 4: Refresh candidate list
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
                {showUploadZone ? 'Hide Upload Zone' : '+ Upload CVs'}
              </button>
            </div>
          </div>
        </div>

        {/* ── STATS SUMMARY CARDS (NO MATCH SCORE, NO RANKING) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CVs Uploaded', value: candidates.length, color: 'text-[#1E293B]', bg: 'bg-brand-orange-pale text-brand-orange', border: 'border-slate-200' },
            { label: 'Parsed Successfully', value: parsedCount, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200' },
            { label: 'Processing Queue', value: processingCount, color: 'text-amber-600', bg: 'bg-amber-50 text-amber-600', border: 'border-amber-200' },
            { label: 'Parsing Failed', value: failedCount, color: 'text-rose-600', bg: 'bg-rose-50 text-rose-600', border: 'border-rose-200' },
          ].map((st, i) => (
            <div key={i} className={`bg-white border ${st.border} rounded-2xl p-5 shadow-sm card-hover-lift`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{st.label}</span>
                <span className={`w-7 h-7 rounded-xl ${st.bg} flex items-center justify-center font-extrabold text-xs`}>
                  {i === 0 ? '∑' : i === 1 ? '✓' : i === 2 ? '⏳' : '×'}
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
                  Upload multiple resumes for <strong className="text-slate-800">{job?.position}</strong>. Resumes will be extracted deterministically without hallucinations.
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
              <p className="text-xs text-slate-500 mb-4">or click to browse from your device</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                <span>PDF</span>
                <span>•</span>
                <span>DOCX</span>
                <span>•</span>
                <span>TXT</span>
                <span>(Max 15MB each)</span>
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
              placeholder="Search candidate name, role, skills, or email..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {(['ALL', 'PARSED', 'PROCESSING', 'FAILED'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === f
                    ? 'bg-brand-orange text-white shadow-orange'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── CANDIDATES TABLE / LIST ── */}
        {filteredCandidates.length > 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F1F5F9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-4 py-4 hidden md:table-cell">Contact</th>
                    <th className="px-4 py-4">Experience</th>
                    <th className="px-4 py-4 hidden lg:table-cell">Current Position & Company</th>
                    <th className="px-4 py-4 text-center">Parsing Status</th>
                    <th className="px-4 py-4 hidden sm:table-cell">Source CV</th>
                    <th className="px-4 py-4 hidden xl:table-cell">Uploaded Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredCandidates.map(c => {
                    const badge = statusBadge(c.parsingStatus);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Candidate Name & Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center flex-shrink-0 ${avatarColor(c.name)} shadow-xs`}>
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <button
                                onClick={() => {
                                  setSelectedCandidate(c);
                                  setShowRawText(false);
                                }}
                                className="font-bold text-[#1E293B] group-hover:text-brand-orange transition-colors text-left cursor-pointer"
                              >
                                {c.name}
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

                        {/* Experience */}
                        <td className="px-4 py-4 text-xs font-bold text-slate-800">
                          {c.totalExperience || '—'}
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
                          <div className="font-medium truncate max-w-[160px]">{c.fileName}</div>
                          <div className="text-[10px] text-slate-400">{formatBytes(c.fileSize)}</div>
                        </td>

                        {/* Uploaded Date */}
                        <td className="px-4 py-4 hidden xl:table-cell text-xs text-slate-500">
                          {formatDate(c.uploadedAt)}
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
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-orange-pale hover:bg-brand-orange hover:text-white text-brand-orange text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                              View Profile →
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
                : 'Upload resumes (PDF, DOCX, TXT) to automatically extract candidate profiles and build your talent pool for this job.'}
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

        {/* ── CANDIDATE PROFILE & RAW CV DETAILS DRAWER / MODAL ── */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end animate-fadeIn">
            <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div>
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-[#F8FAFC]">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl font-extrabold text-xl flex items-center justify-center ${avatarColor(selectedCandidate.name)} shadow-xs`}>
                      {selectedCandidate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold text-[#1E293B]">{selectedCandidate.name}</h2>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-extrabold border ${statusBadge(selectedCandidate.parsingStatus).bg}`}>
                          {selectedCandidate.parsingStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {selectedCandidate.currentTitle} • {selectedCandidate.currentCompany}
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
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedCandidate.totalExperience || 'Not specified'}</p>
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

                {/* Tab Switcher: Structured Profile vs Raw CV Text */}
                <div className="px-6 pt-4 flex items-center gap-3 border-b border-slate-100">
                  <button
                    onClick={() => setShowRawText(false)}
                    className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
                      !showRawText ? 'text-brand-orange' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Structured Profile
                    {!showRawText && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />}
                  </button>
                  <button
                    onClick={() => setShowRawText(true)}
                    className={`pb-3 text-xs font-bold transition-colors relative cursor-pointer ${
                      showRawText ? 'text-brand-orange' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Raw CV Extraction & Debug
                    {showRawText && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange rounded-full" />}
                  </button>
                </div>

                {/* Tab 1: Structured Profile View */}
                {!showRawText ? (
                  <div className="p-6 space-y-6">
                    {/* Professional Summary */}
                    {selectedCandidate.professionalSummary && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Professional Summary</h3>
                        <p className="text-xs text-slate-700 leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200">
                          {selectedCandidate.professionalSummary}
                        </p>
                      </div>
                    )}

                    {/* Extracted Skills */}
                    {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Extracted Competencies & Skills</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedCandidate.skills.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience Timeline */}
                    {selectedCandidate.experience && selectedCandidate.experience.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Work History</h3>
                        <div className="space-y-3">
                          {selectedCandidate.experience.map((exp, i) => (
                            <div key={i} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4">
                              <div className="flex items-start justify-between">
                                <h4 className="text-xs font-bold text-[#1E293B]">{exp.title}</h4>
                                <span className="text-[11px] font-semibold text-slate-500">{exp.duration || `${exp.startDate} - ${exp.endDate}`}</span>
                              </div>
                              <p className="text-xs text-brand-orange font-semibold mt-0.5">{exp.company}</p>
                              {exp.description && <p className="text-xs text-slate-600 mt-2 leading-relaxed">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {selectedCandidate.education && selectedCandidate.education.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Education</h3>
                        <div className="space-y-2.5">
                          {selectedCandidate.education.map((edu, i) => (
                            <div key={i} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-3.5 flex items-start justify-between">
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{edu.degree}</h4>
                                <p className="text-[11px] text-slate-500">{edu.institution} {edu.year ? `• ${edu.year}` : ''}</p>
                              </div>
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
                            {selectedCandidate.certifications.map((c, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="text-emerald-500">✓</span> {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedCandidate.languages && selectedCandidate.languages.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Languages</h3>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {selectedCandidate.languages.map((l, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="text-brand-orange">🌐</span> {l}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Tab 2: Raw CV Debugging & Text Quality Viewer */
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
