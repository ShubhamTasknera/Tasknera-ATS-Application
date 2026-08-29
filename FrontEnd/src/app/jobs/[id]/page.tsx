'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

interface Requirement {
  id: string;
  requirement: string;
  category: string;
  is_mandatory: boolean;
  weight: number;
}

interface Job {
  id: string;
  client: string;
  position: string;
  location?: string;
  work_mode?: string;
  salary?: string;
  jd_text?: string;
  jd_file_url?: string;
  status: string;
  created_at: string;
  requirements: Requirement[];
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const authToken = token || localStorage.getItem('tasknera_token');

        const res = await fetch(`${backendUrl}/jobs/${jobId}`, {
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          }
        });

        const data = await res.json();
        if (!res.ok || !data.job) {
          throw new Error(data.error || 'Job not found');
        }

        setJob(data.job);
      } catch (err: any) {
        console.error('Error fetching job details:', err);
        setErrorMsg(err.message || 'Failed to load job details');
      } finally {
        setLoading(false);
      }
    }

    if (jobId) {
      fetchJob();
    }
  }, [jobId, token]);

  const mandatoryCount = job?.requirements.filter(r => r.is_mandatory).length || 0;
  const preferredCount = job?.requirements.filter(r => !r.is_mandatory).length || 0;

  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16 w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs List
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/jobs/${jobId}/requirements`}
              className="px-4 py-2 bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition-colors"
            >
              ⚙ Edit Requirements
            </Link>
            <Link
              href={`/jobs/${jobId}/upload-cvs`}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
            >
              <span>📄 Upload Candidate CVs</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center text-gray-400 animate-pulse">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading job details & requirement specifications...</span>
          </div>
        )}

        {/* Error State */}
        {errorMsg && !loading && (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm mb-8">
            <span className="font-bold block mb-1">Error Loading Job</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Job Details Card */}
        {job && !loading && (
          <div className="space-y-6">
            {/* Header Header Info */}
            <div className="bg-[#0F172A]/90 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-800">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-xs font-semibold">
                      {job.work_mode || 'Hybrid'}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold uppercase">
                      {job.status}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{job.position}</h1>
                  <p className="text-gray-400 text-sm mt-1">Client: <span className="text-white font-medium">{job.client}</span> • Location: <span className="text-gray-300">{job.location || 'Remote / Unspecified'}</span></p>
                </div>

                <div className="text-left md:text-right bg-[#070B14] p-4 rounded-xl border border-gray-800">
                  <span className="text-xs text-gray-500 uppercase tracking-wider block mb-1 font-semibold">Salary Range</span>
                  <span className="text-lg font-bold text-emerald-400">{job.salary || 'Competitive / Not Disclosed'}</span>
                </div>
              </div>

              {/* Requirement Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#070B14] border border-gray-800">
                  <span className="text-xs text-gray-500 uppercase block mb-1">Total Requirements</span>
                  <span className="text-2xl font-bold text-white">{job.requirements.length}</span>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <span className="text-xs text-rose-300 uppercase block mb-1">Mandatory Criteria</span>
                  <span className="text-2xl font-bold text-rose-400">{mandatoryCount}</span>
                </div>
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-xs text-blue-300 uppercase block mb-1">Preferred Criteria</span>
                  <span className="text-2xl font-bold text-blue-400">{preferredCount}</span>
                </div>
              </div>
            </div>

            {/* Extracted Requirements List */}
            <div className="bg-[#0F172A]/90 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Candidate Evaluation Requirements ({job.requirements.length})
                </h2>
                <Link
                  href={`/jobs/${jobId}/requirements`}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Edit Criteria →
                </Link>
              </div>

              <div className="space-y-3">
                {job.requirements.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">No requirement criteria extracted for this job.</p>
                ) : (
                  job.requirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-[#070B14] border border-gray-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          req.is_mandatory
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}>
                          {req.is_mandatory ? 'Mandatory' : 'Preferred'}
                        </span>
                        <span className="text-sm text-gray-200">{req.requirement}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-800/80 px-2.5 py-1 rounded-md border border-gray-700">
                        {req.category || 'General'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions Footer Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white">Ready to evaluate candidates against this JD?</h3>
                <p className="text-xs text-gray-400">Upload candidate resumes/CVs to run AI matching against the mandatory & preferred requirements.</p>
              </div>
              <Link
                href={`/jobs/${jobId}/upload-cvs`}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/40 whitespace-nowrap"
              >
                Go to Candidate CV Upload →
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
