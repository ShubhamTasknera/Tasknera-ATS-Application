'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// ── Mock evaluation data ──────────────────────────────────────────────────────
const evaluation = {
  id: 'eval-1',
  candidate: {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@email.com',
    phone: '+1 234 567 8901',
    location: 'New York, NY',
    currentRole: 'Senior SAP CO Consultant',
    currentCompany: 'Global Solutions Inc',
    totalExperience: '5 years 11 months',
  },
  job: {
    title: 'SAP CO Consultant',
    company: 'TechCorp Industries',
    location: 'New York, NY',
    workMode: 'Hybrid',
  },
  overallScore: 94,
  atsScore: 96,
  matchLevel: 'STRONG MATCH',
  decision: 'SUBMIT',
  decisionReason:
    'Candidate exceeds all mandatory requirements with strong evidence. 5 years 11 months SAP CO experience, direct S/4HANA implementations, manufacturing domain exposure, and SAP certification present.',
  evaluatedAt: '20 Jan 2024, 10:30 AM',
  evaluatedBy: 'John R.',
  scoreBreakdown: {
    mandatory: { score: 48, max: 50, pct: 96, label: 'Mandatory Compliance' },
    skills: { score: 19, max: 20, pct: 95, label: 'Core Skills' },
    experience: { score: 14, max: 15, pct: 93, label: 'Relevant Experience' },
    responsibilities: { score: 9, max: 10, pct: 90, label: 'Responsibilities' },
    preferred: { score: 4, max: 5, pct: 80, label: 'Preferred Requirements' },
  },
  atsBreakdown: {
    keywords: { score: 29, max: 30, label: 'Keywords Present' },
    titleAlignment: { score: 15, max: 15, label: 'Job Title Alignment' },
    skillsVisibility: { score: 19, max: 20, label: 'Skills Visibility' },
    experienceVisibility: { score: 15, max: 15, label: 'Experience Visibility' },
    educationVisibility: { score: 10, max: 10, label: 'Education Visibility' },
    formatting: { score: 8, max: 10, label: 'Formatting / Structure' },
  },
  requirements: [
    {
      id: 'r1',
      text: '5+ years SAP CO experience',
      category: 'Experience',
      mandatory: true,
      status: 'FULLY MET',
      confidence: 'High',
      matchPct: 100,
      pointsAwarded: 15,
      maxPoints: 15,
      evidence: {
        type: 'Explicit',
        source: 'Work Experience — Global Solutions Inc & TechConsult Partners',
        text: '"Senior SAP CO Consultant (Mar 2020–present) + SAP CO Consultant (Jan 2018–Feb 2020) = 5 years 11 months direct SAP CO experience."',
        matchStrength: 98,
        explanation: 'Candidate has 5 years 11 months of direct SAP CO experience, exceeding the 5+ year requirement.',
      },
      overriddenBy: null,
    },
    {
      id: 'r2',
      text: '4+ years SAP S/4HANA experience',
      category: 'Technical',
      mandatory: true,
      status: 'FULLY MET',
      confidence: 'High',
      matchPct: 100,
      pointsAwarded: 10,
      maxPoints: 10,
      evidence: {
        type: 'Explicit',
        source: 'Work Experience — Global Solutions Inc',
        text: '"Led S/4HANA CO module implementation for 3 manufacturing clients (2020–present)."',
        matchStrength: 95,
        explanation: '3+ years hands-on S/4HANA implementation experience clearly documented.',
      },
      overriddenBy: null,
    },
    {
      id: 'r3',
      text: 'Manufacturing industry experience',
      category: 'Domain',
      mandatory: true,
      status: 'FULLY MET',
      confidence: 'High',
      matchPct: 100,
      pointsAwarded: 10,
      maxPoints: 10,
      evidence: {
        type: 'Explicit',
        source: 'Industries section',
        text: '"Industries: Manufacturing, Automotive, Consumer Goods."',
        matchStrength: 100,
        explanation: 'Direct manufacturing industry experience clearly stated.',
      },
      overriddenBy: null,
    },
    {
      id: 'r4',
      text: 'SAP implementation project experience',
      category: 'Experience',
      mandatory: true,
      status: 'FULLY MET',
      confidence: 'High',
      matchPct: 100,
      pointsAwarded: 8,
      maxPoints: 8,
      evidence: {
        type: 'Explicit',
        source: 'Work Experience — Global Solutions Inc',
        text: '"Led S/4HANA CO module implementation for 3 manufacturing clients."',
        matchStrength: 100,
        explanation: 'Multiple SAP implementation projects documented with client details.',
      },
      overriddenBy: null,
    },
    {
      id: 'r5',
      text: "Bachelor's degree in Finance or Accounting",
      category: 'Education',
      mandatory: true,
      status: 'FULLY MET',
      confidence: 'High',
      matchPct: 100,
      pointsAwarded: 7,
      maxPoints: 7,
      evidence: {
        type: 'Explicit',
        source: 'Education',
        text: '"Bachelor\'s degree in Finance — NYU Stern School of Business (2017)."',
        matchStrength: 100,
        explanation: "Bachelor's degree in Finance from a reputable institution.",
      },
      overriddenBy: null,
    },
    {
      id: 'r6',
      text: 'SAP Certification',
      category: 'Certification',
      mandatory: false,
      status: 'FULLY MET',
      confidence: 'High',
      matchPct: 100,
      pointsAwarded: 3,
      maxPoints: 3,
      evidence: {
        type: 'Explicit',
        source: 'Certifications',
        text: '"SAP Certified Application Associate — SAP S/4HANA for Management Accounting (2021)."',
        matchStrength: 100,
        explanation: 'SAP certification present.',
      },
      overriddenBy: null,
    },
    {
      id: 'r7',
      text: 'Power BI experience',
      category: 'Tool',
      mandatory: false,
      status: 'PARTIALLY MET',
      confidence: 'Medium',
      matchPct: 60,
      pointsAwarded: 1,
      maxPoints: 2,
      evidence: {
        type: 'Semantic',
        source: 'Work Experience — Global Solutions Inc',
        text: '"Developed custom reports using SAP BW and Power BI."',
        matchStrength: 70,
        explanation: 'Power BI mentioned but depth of experience not clearly quantified.',
      },
      overriddenBy: null,
    },
  ],
  deductions: [
    { reason: 'Azure platform not mentioned in CV', points: 1, category: 'Skills' },
    { reason: 'International client experience not documented', points: 1, category: 'Experience' },
  ],
  strengths: [
    { title: '5 yrs 11 months SAP CO experience', desc: 'Exceeds the 5+ year requirement with direct, evidenced experience.' },
    { title: 'Led 3 S/4HANA implementations', desc: 'Active S/4HANA project leadership for manufacturing clients.' },
    { title: 'Manufacturing domain expert', desc: 'Experience across Manufacturing, Automotive, and Consumer Goods.' },
    { title: 'SAP Certified Professional', desc: 'SAP Certified Associate — S/4HANA Management Accounting.' },
    { title: 'Power BI reporting', desc: 'Developed custom reports using SAP BW and Power BI.' },
  ],
  gaps: [
    { title: 'Azure platform not mentioned', severity: 'Low', desc: 'Azure cloud experience would be beneficial but not required.' },
    { title: 'International project exposure unclear', severity: 'Low', desc: 'All documented projects appear to be US-based.' },
    { title: 'Power BI depth not quantified', severity: 'Low', desc: 'Power BI mentioned but years/depth not specified.' },
  ],
  scoreExplanation:
    'The candidate scored 94/100 because all five mandatory requirements were fully satisfied with strong, explicit evidence. SAP CO experience of 5 years 11 months exceeds the requirement, S/4HANA implementation leadership is directly documented across 3 client projects, manufacturing domain experience is explicitly stated, and SAP certification is present. Two points were deducted due to the absence of Azure platform experience and undocumented international project exposure. Power BI experience is mentioned but not fully quantified, resulting in a partial score for that preferred requirement.',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusStyles: Record<string, string> = {
  'FULLY MET': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'PARTIALLY MET': 'bg-blue-50 text-blue-700 border-blue-200',
  'NOT MET': 'bg-rose-50 text-rose-700 border-rose-200',
  'NOT FOUND': 'bg-orange-50 text-orange-700 border-orange-200',
  'NEEDS VERIFICATION': 'bg-amber-50 text-amber-700 border-amber-200',
};

const confidenceStyles: Record<string, string> = {
  High: 'text-emerald-600',
  Medium: 'text-amber-600',
  Low: 'text-rose-600',
};

const evidenceTypeStyles: Record<string, string> = {
  Explicit: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Semantic: 'bg-blue-50 text-blue-700 border border-blue-200',
  Inferred: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const severityStyles: Record<string, string> = {
  Critical: 'text-rose-600',
  High: 'text-orange-600',
  Medium: 'text-amber-600',
  Low: 'text-slate-500',
};

const decisionStyles: Record<string, { bg: string; text: string; border: string }> = {
  SUBMIT: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  REVIEW: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'DO NOT SUBMIT': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

function ScoreBar({ score, max, color = 'bg-blue-500' }: { score: number; max: number; color?: string }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-500 w-14 text-right">{score}/{max}</span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function EvaluationDetailPage() {
  const [showExplanation, setShowExplanation] = useState(false);
  const [expandedReq, setExpandedReq] = useState<string | null>('r1');
  const [overrideReqId, setOverrideReqId] = useState<string | null>(null);
  const [overrideNote, setOverrideNote] = useState('');

  const ds = decisionStyles[evaluation.decision] ?? decisionStyles['REVIEW'];
  const totalDeductions = evaluation.deductions.reduce((s, d) => s + d.points, 0);

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-[#1E293B] flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 flex-1 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
          <Link href="/evaluations" className="hover:text-brand-orange transition-colors">Evaluations</Link>
          <span>/</span>
          <span className="text-slate-800">{evaluation.candidate.name}</span>
        </div>

        {/* ── TOP HEADER CARD ── */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">

            {/* Candidate info */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-orange-pale text-brand-orange flex items-center justify-center font-extrabold text-2xl flex-shrink-0 shadow-xs">
                {evaluation.candidate.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#1E293B] mb-0.5">{evaluation.candidate.name}</h1>
                <p className="text-slate-500 text-sm font-medium">{evaluation.candidate.currentRole} · {evaluation.candidate.currentCompany}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                  <span>{evaluation.candidate.email}</span>
                  <span>•</span>
                  <span>{evaluation.candidate.location}</span>
                  <span>•</span>
                  <span>Exp: {evaluation.candidate.totalExperience}</span>
                </div>
              </div>
            </div>

            {/* Key scores */}
            <div className="flex items-center gap-6 flex-wrap">
              {/* Match score */}
              <div className="text-center">
                <div className={`text-4xl font-extrabold ${evaluation.overallScore >= 80 ? 'text-emerald-600' : evaluation.overallScore >= 65 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {evaluation.overallScore}
                </div>
                <div className="text-slate-500 text-xs mt-0.5 font-bold uppercase tracking-wider">Match Score</div>
                <div className="text-slate-400 text-[10px]">/100</div>
              </div>

              <div className="w-px h-12 bg-slate-200" />

              {/* ATS score */}
              <div className="text-center">
                <div className="text-4xl font-extrabold text-slate-700">{evaluation.atsScore}</div>
                <div className="text-slate-500 text-xs mt-0.5 font-bold uppercase tracking-wider">ATS Score</div>
                <div className="text-slate-400 text-[10px]">/100</div>
              </div>

              <div className="w-px h-12 bg-slate-200" />

              {/* Mandatory */}
              <div className="text-center">
                <div className="text-4xl font-extrabold text-emerald-600">
                  {evaluation.requirements.filter(r => r.mandatory && r.status === 'FULLY MET').length}/
                  {evaluation.requirements.filter(r => r.mandatory).length}
                </div>
                <div className="text-slate-500 text-xs mt-0.5 font-bold uppercase tracking-wider">Mandatory Met</div>
              </div>

              <div className="w-px h-12 bg-slate-200" />

              {/* Decision */}
              <div className={`px-5 py-3 rounded-2xl border ${ds.bg} ${ds.border}`}>
                <div className={`text-xl font-black ${ds.text}`}>{evaluation.decision}</div>
                <div className="text-slate-500 text-xs mt-0.5 font-bold uppercase tracking-wider">Recommendation</div>
              </div>
            </div>
          </div>

          {/* Job info strip */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 flex-wrap">
              <span className="font-bold text-slate-400">Position:</span>
              <span className="text-slate-900 font-bold">{evaluation.job.title}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">{evaluation.job.company}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{evaluation.job.workMode}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Evaluated {evaluation.evaluatedAt}</span>
              <span>•</span>
              <span>by {evaluation.evaluatedBy}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Decision Reason */}
            <div className={`rounded-2xl border p-5 ${ds.bg} ${ds.border}`}>
              <div className="flex items-start gap-3">
                <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ds.text}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className={`text-sm font-bold ${ds.text} mb-1`}>Submission Decision: {evaluation.decision}</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{evaluation.decisionReason}</p>
                </div>
              </div>
            </div>

            {/* Score Explanation */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[#1E293B] text-sm font-bold">Explain Score & Deterministic Factors</span>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${showExplanation ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showExplanation && (
                <div className="px-5 pb-5 border-t border-slate-100">
                  <p className="text-slate-600 text-sm leading-relaxed mt-4">{evaluation.scoreExplanation}</p>
                </div>
              )}
            </div>

            {/* Requirement-by-Requirement Analysis */}
            <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 bg-[#F1F5F9]/60 flex items-center justify-between">
                <div>
                  <h2 className="text-[#1E293B] font-bold text-sm">Requirement-by-Requirement Breakdown</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Click any criterion to inspect evidence citation extracted from resume</p>
                </div>
                <span className="text-xs font-bold text-slate-400">{evaluation.requirements.length} Criteria</span>
              </div>

              <div className="divide-y divide-slate-100">
                {evaluation.requirements.map(req => (
                  <div key={req.id}>
                    {/* Row */}
                    <button
                      onClick={() => setExpandedReq(expandedReq === req.id ? null : req.id)}
                      className="w-full text-left px-6 py-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="grid grid-cols-12 items-center gap-3">
                        {/* Requirement text */}
                        <div className="col-span-5">
                          <div className="text-[#1E293B] text-sm font-bold">{req.text}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{req.category}</div>
                        </div>

                        {/* Mandatory */}
                        <div className="col-span-2 text-center">
                          {req.mandatory ? (
                            <span className="inline-flex px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-bold">MANDATORY</span>
                          ) : (
                            <span className="text-slate-400 text-xs font-medium">Preferred</span>
                          )}
                        </div>

                        {/* Status */}
                        <div className="col-span-3 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusStyles[req.status] ?? ''}`}>
                            {req.status}
                          </span>
                        </div>

                        {/* Score */}
                        <div className="col-span-2 text-right">
                          <span className="text-[#1E293B] text-sm font-extrabold">{req.pointsAwarded}</span>
                          <span className="text-slate-400 text-xs font-semibold">/{req.maxPoints}</span>
                          <div className="text-slate-400 text-[10px]">{req.matchPct}% match</div>
                        </div>
                      </div>
                    </button>

                    {/* Evidence drawer */}
                    {expandedReq === req.id && req.evidence && (
                      <div className="px-6 pb-5 bg-slate-50/70 border-t border-slate-100">
                        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${evidenceTypeStyles[req.evidence.type] ?? ''}`}>
                                {req.evidence.type} Evidence
                              </span>
                              <span className="text-slate-500 text-xs font-medium">{req.evidence.source}</span>
                            </div>
                            <span className="text-brand-orange text-xs font-bold">{req.evidence.matchStrength}% strength</span>
                          </div>
                          <p className="text-slate-800 text-sm italic mb-2 bg-slate-50 p-3 rounded-xl border border-slate-100">{req.evidence.text}</p>
                          <p className="text-slate-500 text-xs">{req.evidence.explanation}</p>

                          {/* Override button */}
                          {overrideReqId !== req.id ? (
                            <button
                              onClick={() => setOverrideReqId(req.id)}
                              className="mt-3 text-xs text-slate-600 hover:text-brand-orange font-bold border border-slate-200 hover:border-brand-orange px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                            >
                              Recruiter Override
                            </button>
                          ) : (
                            <div className="mt-3 bg-amber-50/60 border border-amber-200 rounded-xl p-3">
                              <p className="text-xs text-amber-800 font-bold mb-2">Override — original AI deterministic evaluation will be preserved in audit log</p>
                              <select className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 mb-2 focus:outline-none">
                                <option>Verified directly with candidate</option>
                                <option>Confirmed via technical assessment</option>
                                <option>Manually verified from portfolio</option>
                              </select>
                              <textarea
                                rows={2}
                                placeholder="Add explanation note..."
                                value={overrideNote}
                                onChange={e => setOverrideNote(e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 resize-none focus:outline-none mb-2"
                              />
                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-lg transition-colors cursor-pointer">
                                  Save Override
                                </button>
                                <button
                                  onClick={() => setOverrideReqId(null)}
                                  className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Score Deductions */}
            {evaluation.deductions.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <h2 className="text-[#1E293B] font-bold text-sm mb-4">Score Deductions & Reasoning</h2>
                <div className="space-y-2.5">
                  {evaluation.deductions.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-rose-500 font-bold">–</span>
                        {d.reason}
                        <span className="text-slate-400 text-xs">({d.category})</span>
                      </div>
                      <span className="text-rose-600 font-bold">−{d.points}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-bold">Total deduction</span>
                    <span className="text-rose-600 font-extrabold">−{totalDeductions} pts</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6">

            {/* Score Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
              <h2 className="text-[#1E293B] font-bold text-sm mb-5">Match Weight Breakdown</h2>
              <div className="space-y-4">
                {Object.values(evaluation.scoreBreakdown).map((s, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-500 text-xs font-semibold">{s.label}</span>
                      <span className="text-[#1E293B] text-xs font-bold">{s.pct}%</span>
                    </div>
                    <ScoreBar
                      score={s.score}
                      max={s.max}
                      color={
                        s.pct >= 90 ? 'bg-emerald-500' :
                        s.pct >= 70 ? 'bg-blue-500' :
                        s.pct >= 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Breakdown */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-[#1E293B] font-bold text-sm">ATS Format Compatibility</h2>
                <span className="text-2xl font-extrabold text-slate-700">{evaluation.atsScore}</span>
              </div>
              <p className="text-slate-400 text-xs mb-4">Parser readability & section structure</p>
              <div className="space-y-3">
                {Object.values(evaluation.atsBreakdown).map((a, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500 text-xs">{a.label}</span>
                      <span className="text-slate-700 text-xs font-semibold">{a.score}/{a.max}</span>
                    </div>
                    <ScoreBar score={a.score} max={a.max} color="bg-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
              <h2 className="text-[#1E293B] font-bold text-sm mb-4">Demonstrated Strengths</h2>
              <div className="space-y-3">
                {evaluation.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                    <div>
                      <p className="text-[#1E293B] text-sm font-bold">{s.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
              <h2 className="text-[#1E293B] font-bold text-sm mb-4">Identified Skill Gaps</h2>
              <div className="space-y-3">
                {evaluation.gaps.map((g, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                      g.severity === 'Critical' ? 'bg-rose-500' :
                      g.severity === 'High' ? 'bg-orange-500' :
                      g.severity === 'Medium' ? 'bg-amber-500' :
                      'bg-slate-400'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[#1E293B] text-sm font-bold">{g.title}</p>
                        <span className={`text-[10px] font-bold uppercase ${severityStyles[g.severity]}`}>{g.severity}</span>
                      </div>
                      <p className="text-slate-500 text-xs mt-0.5">{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-3 shadow-sm">
              <h2 className="text-[#1E293B] font-bold text-sm mb-2">Executive Actions</h2>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Generate Client Submission
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-evaluate Profile
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Candidate Audit PDF
              </button>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
