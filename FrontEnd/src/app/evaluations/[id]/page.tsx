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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-extrabold tracking-wide">
            <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            FULLY MET
          </span>
        );
      case 'PARTIALLY MET':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-extrabold tracking-wide">
            <svg className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            PARTIALLY MET
          </span>
        );
      case 'NOT MET':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 border border-rose-300 rounded-lg text-xs font-extrabold tracking-wide">
            <svg className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            NOT MET
          </span>
        );
      case 'NOT FOUND':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-extrabold tracking-wide">
            <svg className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            NOT FOUND
          </span>
        );
      case 'NEEDS VERIFICATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-800 border border-purple-300 rounded-lg text-xs font-extrabold tracking-wide">
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
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-extrabold tracking-wider uppercase shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            ✓ SUBMIT READY
          </span>
        );
      case 'REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-xl text-xs font-extrabold tracking-wider uppercase shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            ⚠ NEEDS REVIEW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs font-extrabold tracking-wider uppercase shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
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
          <span className="text-slate-900 font-bold">{evaluation?.candidateName || 'Candidate Evaluation'}</span>
        </div>

        {/* ── LOADING STATE ── */}
        {loading && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center shadow-xs animate-pulse my-8">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-extrabold text-slate-900">Evaluating Candidate Profile...</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Executing deterministic criteria matching and verified evidence audit.
            </p>
          </div>
        )}

        {/* ── ERROR STATE ── */}
        {!loading && (errorMsg || !evaluation) && (
          <div className="bg-white border border-rose-200 rounded-2xl p-12 text-center shadow-xs my-8">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-2xs">
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
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
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
            {/* ── 1. TOP EVALUATION HERO BANNER (Executive Dossier Style) ── */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 mb-8 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Candidate & Job Context */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-mono font-extrabold text-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    {(evaluation.candidateName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {evaluation.candidateName}
                      </h1>
                      {renderRecommendationBadge(evaluation.recommendation)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{evaluation.candidateRole}</span>
                      <span>•</span>
                      <span>Requisition: <strong className="text-slate-900">{evaluation.jobTitle}</strong> ({evaluation.jobClient})</span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">Audited: {new Date(evaluation.evaluatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>
                </div>

                {/* Score Indicators Top Metrics */}
                <div className="flex items-center gap-4 sm:gap-6 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 flex-shrink-0">
                  
                  {/* Overall Match */}
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Overall Match</span>
                    <div className={`px-4 py-1.5 rounded-xl font-mono font-black text-lg border ${
                      evaluation.overallMatch >= 75
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : evaluation.overallMatch >= 50
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {evaluation.overallMatch}%
                    </div>
                  </div>

                  {/* Mandatory Compliance */}
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mandatory Compliance</span>
                    <div className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs border ${
                      evaluation.mandatoryCompliance?.passed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {evaluation.mandatoryCompliance?.met ?? 0} / {evaluation.mandatoryCompliance?.total ?? 0} Met
                    </div>
                  </div>

                  {/* Explain Score CTA */}
                  <div>
                    <button
                      onClick={() => setShowExplanationModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <span>Explain Score</span>
                      <span className="text-slate-400">→</span>
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* ── 2. EXECUTIVE MANDATORY REQUIREMENT WARNING (If any failed) ── */}
            {mandatoryFailedList.length > 0 && (
              <div className="bg-rose-50/70 border-l-4 border-rose-600 border border-rose-200 rounded-2xl p-5 sm:p-6 mb-8 shadow-2xs">
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm shadow-2xs">
                    ✕
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-rose-950 uppercase tracking-wide">
                        Mandatory Requirement Deficits Detected ({mandatoryFailedList.length} Failed)
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-200/80 text-rose-900 border border-rose-300">
                        Recommendation Locked to DO NOT SUBMIT
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 mt-0.5">
                      This candidate does not satisfy non-negotiable prerequisites confirmed for this requisition.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {mandatoryFailedList.map((failItem, idx) => (
                    <div key={idx} className="bg-white border border-rose-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-mono font-bold text-[10px] uppercase">
                            Mandatory Deficit
                          </span>
                          <span className="text-[11px] font-bold text-rose-600 font-mono">0 pts / {failItem.weight * 10} max</span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-snug mb-2">
                          {failItem.requirement}
                        </h4>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-rose-100 text-[11px]">
                        <div className="text-slate-600">
                          <span className="font-bold text-slate-800">Resume Evidence: </span>
                          <span className="font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-mono">
                            {failItem.status === 'NOT FOUND' ? 'Not found in document' : failItem.evidence}
                          </span>
                        </div>
                        <div className="text-slate-500">
                          <span className="font-bold text-slate-700">Audit Rule: </span>
                          {failItem.failureReason || 'Candidate does not satisfy minimum verified threshold.'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 3. SCORE BREAKDOWN CARD ── */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 mb-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Score Breakdown (Deterministic Model)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mathematical rubric evaluation across key hiring dimensions
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-mono">
                  Engine v2.0
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {[
                  { ...evaluation.scoreBreakdown.mandatory, label: 'Mandatory Compliance' },
                  { ...evaluation.scoreBreakdown.skills, label: 'Technical Skills' },
                  { ...evaluation.scoreBreakdown.experience, label: 'Relevant Experience' },
                  { ...evaluation.scoreBreakdown.responsibilities, label: 'Responsibilities' },
                  { ...evaluation.scoreBreakdown.preferred, label: 'Preferred Criteria' },
                ].map((b, i) => (
                  <div key={i} className="bg-slate-50/60 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block mb-2 leading-tight">
                        {b.label}
                      </span>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-2xl font-black font-mono text-slate-900">{b.score}</span>
                        <span className="text-xs font-semibold text-slate-400 font-mono">/ {b.max} pts</span>
                      </div>
                    </div>
                    <div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            b.pct >= 75 ? 'bg-emerald-600' : b.pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, b.pct))}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>Performance</span>
                        <span className="font-bold text-slate-700">{b.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 4. REQUIREMENT SUMMARY COUNTERS (Sleek horizontal ribbon) ── */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-8 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider pl-2">
                Audit Summary:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
                  Mandatory Reqs: <strong className="text-slate-900 font-mono ml-1">{evaluation.summaryCounts.mandatoryTotal}</strong>
                </span>
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800">
                  Fully Met: <strong className="text-emerald-900 font-mono ml-1">{evaluation.summaryCounts.fullyMet}</strong>
                </span>
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800">
                  Partially Met: <strong className="text-amber-900 font-mono ml-1">{evaluation.summaryCounts.partiallyMet}</strong>
                </span>
                <span className="px-3 py-1 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-800">
                  Not Met: <strong className="text-rose-900 font-mono ml-1">{evaluation.summaryCounts.notMet}</strong>
                </span>
                <span className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-800">
                  Preferred: <strong className="text-blue-900 font-mono ml-1">{evaluation.summaryCounts.preferredTotal}</strong>
                </span>
              </div>
            </div>

            {/* ── 5. REQUIREMENT-BY-REQUIREMENT ANALYSIS TABLE ── */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden mb-8">
              
              {/* Table Filter / Header Toolbar */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Requirement-by-Requirement Analysis</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
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
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
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
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                      <th className="px-6 py-4 w-1/3">Requirement Criteria</th>
                      <th className="px-4 py-4 w-28">Category</th>
                      <th className="px-6 py-4 flex-1">Verified Candidate Evidence</th>
                      <th className="px-4 py-4 text-center w-36">Compliance Status</th>
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
                            ? 'bg-rose-50/30 hover:bg-rose-50/60'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Requirement */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-1">
                            {r.isMandatory ? (
                              <span className="inline-flex px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded font-black text-[10px] uppercase font-mono">
                                MANDATORY
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded font-bold text-[10px] uppercase font-mono">
                                PREFERRED
                              </span>
                            )}
                          </div>
                          <div className="font-extrabold text-slate-900 text-xs leading-relaxed">
                            {r.requirement}
                          </div>
                          {r.failureReason && (
                            <p className="text-[11px] text-rose-700 font-bold mt-1.5 flex items-center gap-1">
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

                        {/* Candidate Evidence */}
                        <td className="px-6 py-4">
                          {r.status === 'NOT FOUND' ? (
                            <div className="text-slate-400 italic text-[11px] bg-slate-50 border border-slate-200/80 rounded-xl p-3 font-medium">
                              Not found in document
                            </div>
                          ) : r.status === 'NEEDS VERIFICATION' ? (
                            <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-3 text-purple-900">
                              <span className="font-bold block text-[10px] uppercase text-purple-700 mb-0.5 font-mono">
                                Needs Recruiter Verification
                              </span>
                              <span className="font-medium text-xs leading-relaxed">{r.evidence}</span>
                            </div>
                          ) : (
                            <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium leading-relaxed">
                              {r.evidence}
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          {renderStatusBadge(r.status)}
                        </td>

                        {/* Confidence */}
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded font-bold text-[11px] ${
                            r.confidence === 'High' ? 'text-emerald-800 bg-emerald-50 border border-emerald-200' :
                            r.confidence === 'Medium' ? 'text-amber-800 bg-amber-50 border border-amber-200' : 'text-slate-600 bg-slate-100'
                          }`}>
                            {r.confidence}
                          </span>
                        </td>

                        {/* Weight */}
                        <td className="px-4 py-4 text-center font-bold text-slate-700 font-mono">
                          {r.weight.toFixed(1)}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* ── 6. EXPLAIN SCORE MODAL / DRAWER ── */}
            {showExplanationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">Score Explanation & Evidence Audit</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Audit trail explaining the {evaluation.overallMatch}% match score for {evaluation.candidateName}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowExplanationModal(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-5 text-xs">
                    {/* Summary */}
                    <div>
                      <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                        Executive Summary
                      </h4>
                      <p className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-medium">
                        {evaluation.explanation?.summary}
                      </p>
                    </div>

                    {/* Mandatory Status */}
                    <div>
                      <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                        Mandatory Compliance Analysis
                      </h4>
                      <p className={`p-3.5 border rounded-xl font-bold leading-relaxed ${
                        evaluation.mandatoryCompliance?.passed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}>
                        {evaluation.explanation?.mandatoryStatus || 'Status evaluated'}
                      </p>
                    </div>

                    {/* Strengths */}
                    {evaluation.explanation?.strengths && evaluation.explanation.strengths.length > 0 && (
                      <div>
                        <h4 className="font-extrabold text-emerald-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Key Verified Strengths
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.explanation.strengths.map((st, i) => (
                            <li key={i} className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-slate-800 font-medium">
                              {st}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Gaps */}
                    {evaluation.explanation?.gaps && evaluation.explanation.gaps.length > 0 && (
                      <div>
                        <h4 className="font-extrabold text-rose-800 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          Identified Gaps & Missing Evidence
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.explanation.gaps.map((gp, i) => (
                            <li key={i} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl text-slate-800 font-medium">
                              {gp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 text-right">
                    <button
                      onClick={() => setShowExplanationModal(false)}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
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
