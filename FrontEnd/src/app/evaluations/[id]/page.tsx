'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export type EvaluationStatus =
  | 'FULLY MET'
  | 'PARTIALLY MET'
  | 'NOT MET'
  | 'NOT FOUND'
  | 'NEEDS VERIFICATION';

export interface RequirementEvaluation {
  id: string;
  requirement: string;
  category: string;
  isMandatory: boolean;
  evidence: string;
  status: EvaluationStatus;
  confidence: 'High' | 'Medium' | 'Low';
  weight: number;
  failureReason?: string;
  verificationNote?: string;
}

export interface EvaluationData {
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  candidateCompany: string;
  candidateEmail: string;
  candidatePhone: string;
  candidateLocation: string;
  jobId: string;
  jobTitle: string;
  jobClient: string;
  overallMatch: number;
  atsScore: number;
  mandatoryCompliance: {
    total: number;
    met: number;
    failed: number;
    passed: boolean;
  };
  recommendation: 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT';
  recommendationReason: string;
  scoreBreakdown: {
    mandatory: { score: number; max: number; pct: number; label: string };
    skills: { score: number; max: number; pct: number; label: string };
    experience: { score: number; max: number; pct: number; label: string };
    responsibilities: { score: number; max: number; pct: number; label: string };
    preferred: { score: number; max: number; pct: number; label: string };
  };
  summaryCounts: {
    mandatoryTotal: number;
    preferredTotal: number;
    fullyMet: number;
    partiallyMet: number;
    notMet: number;
    needsVerification: number;
    notFound: number;
  };
  requirements: RequirementEvaluation[];
  explanation: {
    summary: string;
    strengths: string[];
    gaps: string[];
    mandatoryStatus: string;
  };
  evaluatedAt: string;
  evaluator: string;
}

export default function CandidateEvaluationDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const idParam = (params?.id as string) || '';
  const jobIdQuery = searchParams.get('jobId') || 'jd-1';

  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showExplanationModal, setShowExplanationModal] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchEvaluation = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const token = typeof window !== 'undefined' ? localStorage.getItem('tasknera_token') : null;
      const headers: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      // Try fetching evaluation directly from backend endpoint
      let res = await fetch(`${backendUrl}/evaluations/${idParam}?jobId=${jobIdQuery}`, { headers });
      
      if (!res.ok) {
        // Try candidate specific route
        res = await fetch(`${backendUrl}/jobs/${jobIdQuery}/candidates/${idParam}/evaluation`, { headers });
      }

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Evaluation retrieval failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
      } else {
        throw new Error('No evaluation payload returned by server.');
      }
    } catch (err: any) {
      console.error('Error loading evaluation:', err);
      setErrorMsg(err.message || 'Unable to connect to evaluation engine.');
      setEvaluation(null);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, idParam, jobIdQuery]);

  useEffect(() => {
    fetchEvaluation();
  }, [fetchEvaluation]);

  // Status Badge Component with distinct visuals and clear text
  const renderStatusBadge = (status: EvaluationStatus) => {
    switch (status) {
      case 'FULLY MET':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-extrabold tracking-wide">
            <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            FULLY MET
          </span>
        );
      case 'PARTIALLY MET':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-extrabold tracking-wide">
            <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            PARTIALLY MET
          </span>
        );
      case 'NOT MET':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-extrabold tracking-wide">
            <svg className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            NOT MET
          </span>
        );
      case 'NOT FOUND':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-300 rounded-lg text-xs font-extrabold tracking-wide">
            <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            NOT FOUND
          </span>
        );
      case 'NEEDS VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-extrabold tracking-wide">
            <svg className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            NEEDS VERIFICATION
          </span>
        );
      default:
        return null;
    }
  };

  const renderRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'SUBMIT':
        return (
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-status-submit-bg text-status-submit-text border border-status-submit-border rounded-xl text-xs font-black tracking-wider uppercase shadow-xs">
            ✓ SUBMIT
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-status-review-bg text-status-review-text border border-status-review-border rounded-xl text-xs font-black tracking-wider uppercase shadow-xs">
            ⚠ REVIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-status-reject-bg text-status-reject-text border border-status-reject-border rounded-xl text-xs font-black tracking-wider uppercase shadow-xs">
            ✕ DO NOT SUBMIT
          </span>
        );
    }
  };

  // Filter requirements by category if clicked
  const categories = evaluation
    ? ['ALL', ...Array.from(new Set(evaluation.requirements.map(r => r.category)))]
    : ['ALL'];

  const filteredRequirements = evaluation
    ? evaluation.requirements.filter(r => activeCategoryFilter === 'ALL' || r.category === activeCategoryFilter)
    : [];

  const mandatoryFailedList = evaluation
    ? evaluation.requirements.filter(r => r.isMandatory && (r.status === 'NOT MET' || r.status === 'NOT FOUND'))
    : [];

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-[#1E293B] flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 flex-1 w-full">

        {/* ── BREADCRUMB ── */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/evaluations" className="hover:text-brand-orange transition-colors">Evaluations</Link>
          <span>/</span>
          <Link href={`/jobs/${evaluation?.jobId || jobIdQuery}`} className="hover:text-brand-orange transition-colors">
            {evaluation?.jobTitle || 'Job Position'}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">{evaluation?.candidateName || 'Candidate Evaluation'}</span>
        </div>

        {/* ── 11. LOADING STATE ── */}
        {loading && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-16 text-center shadow-sm animate-pulse my-8">
            <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-extrabold text-[#1E293B]">Evaluating Candidate...</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Running deterministic requirement-by-requirement evidence extraction and compliance verification.
            </p>
          </div>
        )}

        {/* ── 11. ERROR STATE ── */}
        {!loading && (errorMsg || !evaluation) && (
          <div className="bg-white border border-rose-200 rounded-3xl p-12 text-center shadow-sm my-8">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-xs">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Evaluation Failed</h2>
            <p className="text-xs text-slate-600 max-w-lg mx-auto mb-6">
              {errorMsg || 'Unable to evaluate candidate against confirmed job requirements. Please ensure the candidate resume is parsed and valid.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={fetchEvaluation}
                className="px-6 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange cursor-pointer"
              >
                Retry Evaluation
              </button>
              <Link
                href="/evaluations"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                Back to Evaluations
              </Link>
            </div>
          </div>
        )}

        {/* ── EVALUATION CONTENT WHEN READY ── */}
        {!loading && evaluation && (
          <>
            {/* ── 1. TOP EVALUATION HERO BANNER ── */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Candidate & Job Context */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-orange-pale border border-brand-orange-border rounded-full text-xs font-bold text-brand-orange">
                      <span className="w-2 h-2 rounded-full bg-brand-orange" />
                      Deterministic Audit Match
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      Evaluated: {new Date(evaluation.evaluatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight truncate">
                    {evaluation.candidateName}
                  </h1>

                  <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-2 flex-wrap">
                    <span className="text-slate-800 font-bold">{evaluation.candidateRole}</span>
                    <span>•</span>
                    <span>Requisition: <strong className="text-slate-900">{evaluation.jobTitle}</strong> ({evaluation.jobClient})</span>
                  </p>
                </div>

                {/* Score Indicators Top Metrics */}
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                  
                  {/* Overall Match */}
                  <div className="text-center sm:text-left">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Overall Match</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black ${
                        evaluation.overallMatch >= 80 ? 'text-emerald-600' : evaluation.overallMatch >= 65 ? 'text-amber-500' : 'text-rose-600'
                      }`}>
                        {evaluation.overallMatch}%
                      </span>
                    </div>
                  </div>

                  {/* Mandatory Compliance */}
                  <div className="text-center sm:text-left">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Mandatory Compliance</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black border ${
                        evaluation.mandatoryCompliance.passed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {evaluation.mandatoryCompliance.met} / {evaluation.mandatoryCompliance.total} Met
                      </span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="text-center sm:text-left">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Recommendation</span>
                    <div>
                      {renderRecommendationBadge(evaluation.recommendation)}
                    </div>
                  </div>

                  {/* 10. Explain Score CTA */}
                  <div>
                    <button
                      onClick={() => setShowExplanationModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Explain Score
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* ── 6. MANDATORY REQUIREMENT WARNING (If any mandatory failed) ── */}
            {mandatoryFailedList.length > 0 && (
              <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs animate-fadeIn">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-black text-rose-900 tracking-wide uppercase">
                      MANDATORY REQUIREMENT FAILED
                    </h3>
                    <p className="text-xs text-rose-800 mt-1 font-medium">
                      This candidate does not satisfy one or more mandatory requirements confirmed for this position. Recommendation is locked to <strong>DO NOT SUBMIT</strong>.
                    </p>

                    <div className="mt-4 space-y-3">
                      {mandatoryFailedList.map((failItem, idx) => (
                        <div key={idx} className="bg-white/90 border border-rose-200 rounded-2xl p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Requirement</span>
                              <span className="font-bold text-slate-900">{failItem.requirement}</span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Candidate Evidence</span>
                              <span className="font-semibold text-rose-800">
                                {failItem.status === 'NOT FOUND' ? 'Not found in CV' : failItem.evidence}
                              </span>
                            </div>
                            <div>
                              <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Reason</span>
                              <span className="text-slate-700">
                                {failItem.failureReason || 'Candidate does not meet the mandatory experience requirement.'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 9. SCORE BREAKDOWN CARD ── */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-wider">
                  Score Breakdown (Deterministic Model)
                </h3>
                <span className="text-xs text-slate-500 font-semibold">
                  Values consumed from backend audit engine
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  evaluation.scoreBreakdown.mandatory,
                  evaluation.scoreBreakdown.skills,
                  evaluation.scoreBreakdown.experience,
                  evaluation.scoreBreakdown.responsibilities,
                  evaluation.scoreBreakdown.preferred,
                ].map((b, i) => (
                  <div key={i} className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 truncate">
                      {b.label}
                    </div>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xl font-black text-slate-900">{b.score}</span>
                      <span className="text-xs font-semibold text-slate-400">/ {b.max} pts</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          b.pct >= 80 ? 'bg-emerald-500' : b.pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, b.pct))}%` }}
                      />
                    </div>
                    <div className="text-right text-[10px] font-bold text-slate-500 mt-1">{b.pct}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 8. REQUIREMENT SUMMARY COUNTERS ── */}
            <div className="mb-4">
              <h3 className="text-sm font-black text-[#1E293B] uppercase tracking-wider mb-3">
                Requirement Summary
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: 'Mandatory Reqs', count: evaluation.summaryCounts.mandatoryTotal, color: 'text-slate-900', bg: 'bg-slate-100' },
                  { label: 'Fully Met', count: evaluation.summaryCounts.fullyMet, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                  { label: 'Partially Met', count: evaluation.summaryCounts.partiallyMet, color: 'text-amber-700', bg: 'bg-amber-50' },
                  { label: 'Not Met', count: evaluation.summaryCounts.notMet, color: 'text-rose-700', bg: 'bg-rose-50' },
                  { label: 'Needs Verification', count: evaluation.summaryCounts.needsVerification, color: 'text-purple-700', bg: 'bg-purple-50' },
                  { label: 'Preferred', count: evaluation.summaryCounts.preferredTotal, color: 'text-blue-700', bg: 'bg-blue-50' },
                  { label: 'Not Found', count: evaluation.summaryCounts.notFound, color: 'text-slate-600', bg: 'bg-slate-200/70' },
                ].map((item, idx) => (
                  <div key={idx} className={`${item.bg} border border-slate-200/80 rounded-2xl p-3 text-center`}>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5 truncate">
                      {item.label}
                    </span>
                    <span className={`text-xl font-black ${item.color}`}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 2. REQUIREMENT-BY-REQUIREMENT ANALYSIS TABLE ── */}
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden mb-8">
              
              {/* Table Filter / Header Toolbar */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#1E293B]">Requirement-by-Requirement Analysis</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Strict evidence alignment between confirmed JD requirements and parsed candidate CV.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeCategoryFilter === cat
                          ? 'bg-brand-orange text-white shadow-orange'
                          : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4 w-1/4">Requirement</th>
                      <th className="px-4 py-4 w-28">Category</th>
                      <th className="px-4 py-4 text-center w-24">Required</th>
                      <th className="px-6 py-4 flex-1">Candidate Evidence</th>
                      <th className="px-4 py-4 text-center w-36">Status</th>
                      <th className="px-4 py-4 text-center w-28">Confidence</th>
                      <th className="px-4 py-4 text-center w-20">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredRequirements.map(r => (
                      <tr
                        key={r.id}
                        className={`transition-colors ${
                          r.isMandatory && (r.status === 'NOT MET' || r.status === 'NOT FOUND')
                            ? 'bg-rose-50/40 hover:bg-rose-50/70'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Requirement */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900 text-xs leading-relaxed">
                            {r.requirement}
                          </div>
                          {r.failureReason && (
                            <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                              <span>⚠</span> {r.failureReason}
                            </p>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                            {r.category}
                          </span>
                        </td>

                        {/* Required (Yes / No) */}
                        <td className="px-4 py-4 text-center">
                          {r.isMandatory ? (
                            <span className="inline-flex px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-black text-[11px]">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-semibold text-[11px]">
                              No
                            </span>
                          )}
                        </td>

                        {/* 4 & 5. Candidate Evidence */}
                        <td className="px-6 py-4">
                          {r.status === 'NOT FOUND' ? (
                            <div className="text-slate-400 italic text-[11px] bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                              Not found in CV
                            </div>
                          ) : r.status === 'NEEDS VERIFICATION' ? (
                            <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-2.5 text-purple-900">
                              <span className="font-bold block text-[10px] uppercase text-purple-700 mb-0.5">
                                Needs Recruiter Verification
                              </span>
                              <span className="font-medium text-xs">{r.evidence}</span>
                            </div>
                          ) : (
                            <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-2.5 text-slate-800 font-medium leading-relaxed">
                              {r.evidence}
                            </div>
                          )}
                        </td>

                        {/* 3. Status Badge */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          {renderStatusBadge(r.status)}
                        </td>

                        {/* Confidence */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded font-bold text-[11px] ${
                            r.confidence === 'High' ? 'text-emerald-700 bg-emerald-50' :
                            r.confidence === 'Medium' ? 'text-amber-700 bg-amber-50' : 'text-slate-500 bg-slate-100'
                          }`}>
                            {r.confidence}
                          </span>
                        </td>

                        {/* Weight */}
                        <td className="px-4 py-4 text-center font-bold text-slate-700">
                          {r.weight.toFixed(1)}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* ── 10. EXPLAIN SCORE MODAL / DRAWER ── */}
            {showExplanationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#1E293B]">Score Explanation & Evidence Audit</h3>
                      <p className="text-xs text-slate-500">
                        Detailed audit trail explaining the {evaluation.overallMatch}% match score
                      </p>
                    </div>
                    <button
                      onClick={() => setShowExplanationModal(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-6 text-xs">
                    {/* Summary */}
                    <div>
                      <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Executive Summary
                      </h4>
                      <p className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 leading-relaxed">
                        {evaluation.explanation.summary}
                      </p>
                    </div>

                    {/* Mandatory Status */}
                    <div>
                      <h4 className="font-black text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                        Mandatory Compliance Analysis
                      </h4>
                      <p className={`p-3.5 border rounded-2xl font-bold leading-relaxed ${
                        evaluation.mandatoryCompliance.passed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        {evaluation.explanation.mandatoryStatus}
                      </p>
                    </div>

                    {/* Strengths */}
                    {evaluation.explanation.strengths.length > 0 && (
                      <div>
                        <h4 className="font-black text-emerald-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Key Verified Strengths
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.explanation.strengths.map((st, i) => (
                            <li key={i} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-slate-800">
                              {st}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Gaps */}
                    {evaluation.explanation.gaps.length > 0 && (
                      <div>
                        <h4 className="font-black text-rose-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Identified Gaps & Missing Evidence
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.explanation.gaps.map((gp, i) => (
                            <li key={i} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800">
                              {gp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setShowExplanationModal(false)}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Close Explanation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </main>

      <Footer />
    </div>
  );
}
