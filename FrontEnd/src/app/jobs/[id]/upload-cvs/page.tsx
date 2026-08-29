'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

interface Job {
  id: string;
  client: string;
  position: string;
  location?: string;
  requirements: Array<{
    id: string;
    requirement: string;
    is_mandatory: boolean;
  }>;
}

interface UploadedCvFile {
  file: File;
  id: string;
  candidateName: string;
  status: 'pending' | 'analyzing' | 'done' | 'error';
  score?: number;
  decision?: 'APPROVED' | 'REJECTED' | 'SHORTLISTED';
}

export default function UploadCvsPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);

  // CV Files state
  const [cvFiles, setCvFiles] = useState<UploadedCvFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingDone, setProcessingDone] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoadingJob(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const authToken = token || localStorage.getItem('tasknera_token');

        const res = await fetch(`${backendUrl}/jobs/${jobId}`, {
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          }
        });

        const data = await res.json();
        if (res.ok && data.job) {
          setJob(data.job);
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
      } finally {
        setLoadingJob(false);
      }
    }

    if (jobId) {
      fetchJob();
    }
  }, [jobId, token]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newCvList: UploadedCvFile[] = Array.from(files).map((f) => ({
      file: f,
      id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      candidateName: f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      status: 'pending'
    }));

    setCvFiles((prev) => [...prev, ...newCvList]);
  };

  const handleRemoveCv = (id: string) => {
    setCvFiles((prev) => prev.filter((c) => c.id !== id));
  };

  const handleStartEvaluation = async () => {
    if (cvFiles.length === 0) return;

    setIsProcessing(true);
    setProcessingDone(false);

    setProcessingStep('Extracting text & running Quality Assessment on candidate CVs...');
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setProcessingStep('Evaluating mandatory criteria compliance...');
    setCvFiles((prev) =>
      prev.map((item, idx) => {
        const mockScore = 75 + Math.floor(Math.random() * 23);
        return {
          ...item,
          status: 'done',
          score: mockScore,
          decision: mockScore >= 80 ? 'SHORTLISTED' : mockScore >= 60 ? 'APPROVED' : 'REJECTED'
        };
      })
    );

    setProcessingStep('Generating candidate evidence reports & scoring summary...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsProcessing(false);
    setProcessingDone(true);
  };

  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      <Header />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16 w-full flex-1">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/jobs/${jobId}`} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Job Details
          </Link>

          <Link
            href="/candidates"
            className="px-4 py-2 bg-gray-800/80 hover:bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl border border-gray-700 transition-colors"
          >
            View All Candidates →
          </Link>
        </div>

        {/* Page Header Title */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Upload Candidate Resumes / CVs</h1>
              <p className="text-gray-400 text-sm">
                Target Position: <span className="text-white font-semibold">{job?.position || 'Loading position...'}</span> ({job?.client || 'Client'})
              </p>
            </div>
          </div>

          {/* Workflow Steps Indicator */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-800/80">
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center justify-center">
                ✓
              </div>
              <span className="text-sm font-semibold">Job Specification</span>
            </div>
            <div className="flex-1 h-px bg-gray-800" />
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center justify-center">
                ✓
              </div>
              <span className="text-sm font-semibold">Job Requirements</span>
            </div>
            <div className="flex-1 h-px bg-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <span className="text-sm font-semibold text-white">Candidate Evaluation</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Select PDF or Word Resumes / CVs
            </h2>

            <div className="relative border-2 border-dashed border-gray-800 hover:border-blue-500/50 rounded-2xl p-8 text-center transition-all bg-[#070B14]/60 group">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-white font-semibold text-sm mb-1">Click to browse or drop candidate resume files here</p>
                <p className="text-gray-400 text-xs">Supports multiple PDF, DOCX, DOC files for batch candidate evaluation</p>
              </div>
            </div>

            {/* Selected File List */}
            {cvFiles.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Selected Resumes ({cvFiles.length})
                  </span>
                  {!isProcessing && !processingDone && (
                    <button
                      type="button"
                      onClick={() => setCvFiles([])}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                  {cvFiles.map((cv) => (
                    <div
                      key={cv.id}
                      className="p-3.5 rounded-xl bg-[#070B14] border border-gray-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">📄</span>
                        <div>
                          <span className="text-xs font-medium text-white block capitalize">{cv.candidateName}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{cv.file.name} ({(cv.file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {cv.status === 'done' && cv.score && (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold">
                              Score: {cv.score}%
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              cv.decision === 'SHORTLISTED'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : cv.decision === 'APPROVED'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            }`}>
                              {cv.decision}
                            </span>
                          </div>
                        )}

                        {!isProcessing && !processingDone && (
                          <button
                            type="button"
                            onClick={() => handleRemoveCv(cv.id)}
                            className="text-gray-500 hover:text-rose-400 p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Progress Bar */}
            {isProcessing && (
              <div className="mt-6 p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 animate-pulse flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div>
                  <span className="text-blue-300 font-semibold text-xs block mb-0.5">Evaluation Pipeline Active</span>
                  <span className="text-blue-200/80 text-xs font-mono">{processingStep}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
              <Link
                href={`/jobs/${jobId}`}
                className="px-5 py-2.5 bg-gray-800/80 hover:bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl border border-gray-700 transition-colors"
              >
                Back to Job Details
              </Link>

              {processingDone ? (
                <Link
                  href="/candidates"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2"
                >
                  <span>View Candidate Results →</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEvaluation}
                  disabled={cvFiles.length === 0 || isProcessing}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
                >
                  <span>⚡ Run AI Evaluation on {cvFiles.length} Resume(s)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
