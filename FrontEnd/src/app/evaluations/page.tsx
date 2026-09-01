'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MatchBadge from '@/components/evaluation/MatchBadge';
import ScoreCard from '@/components/evaluation/ScoreCard';
import RequirementTable from '@/components/evaluation/RequirementTable';
import { RequirementStatus, ConfidenceLevel } from '@/types';

interface EvaluationItem {
  id: string;
  candidate: string;
  role: string;
  job: string;
  company: string;
  date: string;
  timestamp: number;
  score: number; // 0-100 Overall Match Score
  ats: number;
  mandatory: string;
  mandatoryFailed: boolean;
  decision: 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT';
  by: string;
  breakdown: {
    skills: { score: number; max: number; matched: string[]; missing: string[] };
    experience: { score: number; max: number; candidateYears: number; requiredYears: number };
    education: { score: number; max: number; candidateDeg: string; requiredDeg: string };
    keywords: { score: number; max: number; cosineSim: number; topTerms: string[] };
  };
  requirements: Array<{
    id: string;
    requirement: { id: string; text: string; category: string; isMandatory: boolean; weight: number };
    status: RequirementStatus;
    confidence: ConfidenceLevel;
    pointsAwarded: number;
    maxPoints: number;
    matchPercentage: number;
    hasEvidence: boolean;
    evidence: Array<{ id: string; type: string; source: string; text: string; matchStrength: number; explanation?: string }>;
  }>;
}

const allEvals: EvaluationItem[] = [
  {
    id: 'eval-1',
    candidate: 'Sarah Mitchell',
    role: 'Senior SAP CO Consultant',
    job: 'SAP CO Consultant',
    company: 'TechCorp Industries',
    date: '20 Jan 2024',
    timestamp: 1705728000000,
    score: 94,
    ats: 96,
    mandatory: '5/5',
    mandatoryFailed: false,
    decision: 'SUBMIT',
    by: 'John R.',
    breakdown: {
      skills: { score: 95, max: 100, matched: ['SAP CO', 'S/4HANA', 'Controlling', 'Cost Center Accounting', 'Product Costing'], missing: [] },
      experience: { score: 100, max: 100, candidateYears: 6.0, requiredYears: 5.0 },
      education: { score: 100, max: 100, candidateDeg: 'B.E. Computer Science', requiredDeg: "Bachelor's Degree" },
      keywords: { score: 90, max: 100, cosineSim: 0.72, topTerms: ['sap', 's4hana', 'controlling', 'implementation', 'costing'] },
    },
    requirements: [
      {
        id: 'r1',
        requirement: { id: 'req-1', text: '5+ years direct SAP CO configuration experience', category: 'Experience', isMandatory: true, weight: 1.5 },
        status: RequirementStatus.FULLY_MET,
        confidence: ConfidenceLevel.HIGH,
        pointsAwarded: 15,
        maxPoints: 15,
        matchPercentage: 100,
        hasEvidence: true,
        evidence: [{ id: 'ev-1', type: 'Explicit', source: 'Experience Section', text: '6 years hands-on SAP CO configuration across global deployments.', matchStrength: 98, explanation: 'Exceeds the 5-year minimum requirement.' }]
      },
      {
        id: 'r2',
        requirement: { id: 'req-2', text: 'S/4HANA Finance and Controlling lifecycle implementations', category: 'Technical Skill', isMandatory: true, weight: 1.2 },
        status: RequirementStatus.FULLY_MET,
        confidence: ConfidenceLevel.HIGH,
        pointsAwarded: 12,
        maxPoints: 12,
        matchPercentage: 100,
        hasEvidence: true,
        evidence: [{ id: 'ev-2', type: 'Explicit', source: 'Projects', text: 'Led 3 end-to-end S/4HANA migration projects for Fortune 500 manufacturing clients.', matchStrength: 95 }]
      }
    ]
  },
  {
    id: 'eval-7',
    candidate: 'Emily Rodriguez',
    role: 'Lead UX Designer',
    job: 'Lead UX Designer',
    company: 'DesignCo',
    date: '30 Jan 2024',
    timestamp: 1706592000000,
    score: 92,
    ats: 94,
    mandatory: '4/4',
    mandatoryFailed: false,
    decision: 'SUBMIT',
    by: 'Sarah K.',
    breakdown: {
      skills: { score: 92, max: 100, matched: ['Figma', 'Design Systems', 'User Research', 'Prototyping', 'Usability Testing'], missing: [] },
      experience: { score: 100, max: 100, candidateYears: 7.5, requiredYears: 5.0 },
      education: { score: 100, max: 100, candidateDeg: 'B.Des Interaction Design', requiredDeg: "Bachelor's Degree" },
      keywords: { score: 86, max: 100, cosineSim: 0.65, topTerms: ['figma', 'design systems', 'wireframing', 'user research', 'heuristics'] },
    },
    requirements: [
      {
        id: 'r1',
        requirement: { id: 'req-1', text: '5+ years Product UX & Figma Design Systems', category: 'Technical Skill', isMandatory: true, weight: 1.5 },
        status: RequirementStatus.FULLY_MET,
        confidence: ConfidenceLevel.HIGH,
        pointsAwarded: 15,
        maxPoints: 15,
        matchPercentage: 100,
        hasEvidence: true,
        evidence: [{ id: 'ev-1', type: 'Explicit', source: 'Work Experience', text: 'Built and governed enterprise-wide Figma design systems for 40+ product squads.', matchStrength: 96 }]
      }
    ]
  },
  {
    id: 'eval-4',
    candidate: 'David Park',
    role: 'Senior Full Stack Dev',
    job: 'Senior Full Stack Dev',
    company: 'InnovateTech',
    date: '25 Jan 2024',
    timestamp: 1706160000000,
    score: 88,
    ats: 91,
    mandatory: '3/3',
    mandatoryFailed: false,
    decision: 'SUBMIT',
    by: 'Sarah K.',
    breakdown: {
      skills: { score: 88, max: 100, matched: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'], missing: ['GraphQL'] },
      experience: { score: 100, max: 100, candidateYears: 6.2, requiredYears: 5.0 },
      education: { score: 100, max: 100, candidateDeg: 'B.Tech Information Technology', requiredDeg: "Bachelor's in CS/IT" },
      keywords: { score: 82, max: 100, cosineSim: 0.62, topTerms: ['react', 'typescript', 'microservices', 'aws', 'docker'] },
    },
    requirements: [
      {
        id: 'r1',
        requirement: { id: 'req-1', text: 'Strong TypeScript & React.js architecture', category: 'Technical Skill', isMandatory: true, weight: 1.5 },
        status: RequirementStatus.FULLY_MET,
        confidence: ConfidenceLevel.HIGH,
        pointsAwarded: 15,
        maxPoints: 15,
        matchPercentage: 100,
        hasEvidence: true,
        evidence: [{ id: 'ev-1', type: 'Explicit', source: 'Skills & Experience', text: 'Senior Full Stack Dev building Next.js and TypeScript micro-frontends.', matchStrength: 94 }]
      }
    ]
  },
  {
    id: 'eval-5',
    candidate: 'Priya Sharma',
    role: 'Full Stack Developer',
    job: 'Senior Full Stack Dev',
    company: 'InnovateTech',
    date: '26 Jan 2024',
    timestamp: 1706246400000,
    score: 81,
    ats: 85,
    mandatory: '3/3',
    mandatoryFailed: false,
    decision: 'SUBMIT',
    by: 'Sarah K.',
    breakdown: {
      skills: { score: 82, max: 100, matched: ['React', 'Node.js', 'JavaScript', 'SQL', 'Git'], missing: ['Kubernetes', 'AWS'] },
      experience: { score: 80, max: 100, candidateYears: 4.0, requiredYears: 5.0 },
      education: { score: 100, max: 100, candidateDeg: 'B.E. Computer Engineering', requiredDeg: "Bachelor's Degree" },
      keywords: { score: 78, max: 100, cosineSim: 0.58, topTerms: ['react', 'node', 'express', 'sql', 'rest'] },
    },
    requirements: [
      {
        id: 'r1',
        requirement: { id: 'req-1', text: '4+ years full stack web applications development', category: 'Experience', isMandatory: true, weight: 1.2 },
        status: RequirementStatus.FULLY_MET,
        confidence: ConfidenceLevel.HIGH,
        pointsAwarded: 12,
        maxPoints: 12,
        matchPercentage: 100,
        hasEvidence: true,
        evidence: [{ id: 'ev-1', type: 'Explicit', source: 'Summary', text: '4 years experience developing responsive web applications with React and Node.', matchStrength: 90 }]
      }
    ]
  },
  {
    id: 'eval-6',
    candidate: 'James Wilson',
    role: 'DevOps Engineer',
    job: 'DevOps Engineer',
    company: 'CloudSystems Ltd',
    date: '28 Jan 2024',
    timestamp: 1706419200000,
    score: 79,
    ats: 83,
    mandatory: '4/5',
    mandatoryFailed: false,
    decision: 'REVIEW',
    by: 'John R.',
    breakdown: {
      skills: { score: 76, max: 100, matched: ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'], missing: ['GCP Cloud Architect'] },
      experience: { score: 85, max: 100, candidateYears: 4.2, requiredYears: 5.0 },
      education: { score: 80, max: 100, candidateDeg: 'Diploma Computer Systems', requiredDeg: "Bachelor's Degree" },
      keywords: { score: 75, max: 100, cosineSim: 0.55, topTerms: ['docker', 'k8s', 'terraform', 'jenkins', 'linux'] },
    },
    requirements: [
      {
        id: 'r1',
        requirement: { id: 'req-1', text: 'Kubernetes cluster deployment & Helm charts', category: 'Technology', isMandatory: true, weight: 1.5 },
        status: RequirementStatus.FULLY_MET,
        confidence: ConfidenceLevel.HIGH,
        pointsAwarded: 15,
        maxPoints: 15,
        matchPercentage: 100,
        hasEvidence: true,
        evidence: [{ id: 'ev-1', type: 'Explicit', source: 'Experience', text: 'Configured and scaled EKS Kubernetes clusters handling 50k requests/sec.', matchStrength: 92 }]
      }
    ]
  },
  {
    id: 'eval-2',
    candidate: 'Michael Chen',
    role: 'SAP Consultant',
    job: 'SAP CO Consultant',
    company: 'TechCorp Industries',
    date: '21 Jan 2024',
    timestamp: 1705814400000,
    score: 76,
    ats: 78,
    mandatory: '4/5',
    mandatoryFailed: true,
    decision: 'REVIEW',
    by: 'John R.',
    breakdown: {
      skills: { score: 74, max: 100, matched: ['SAP CO', 'Cost Center', 'Internal Orders'], missing: ['S/4HANA Migration', 'Product Costing'] },
      experience: { score: 70, max: 100, candidateYears: 3.5, requiredYears: 5.0 },
      education: { score: 100, max: 100, candidateDeg: 'B.Sc Computer Applications', requiredDeg: "Bachelor's Degree" },
      keywords: { score: 72, max: 100, cosineSim: 0.51, topTerms: ['sap', 'controlling', 'cost center', 'finance'] },
    },
    requirements: [
      {
        id: 'r1',
        requirement: { id: 'req-1', text: 'S/4HANA Migration hands-on leadership', category: 'Technical Skill', isMandatory: true, weight: 1.5 },
        status: RequirementStatus.PARTIALLY_MET,
        confidence: ConfidenceLevel.MEDIUM,
        pointsAwarded: 6,
        maxPoints: 15,
        matchPercentage: 40,
        hasEvidence: true,
        evidence: [{ id: 'ev-1', type: 'Semantic', source: 'Projects', text: 'Assisted in legacy SAP ECC to S/4HANA data validation.', matchStrength: 50, explanation: 'Partial participation only; not lead architect.' }]
      }
    ]
  },
  {
    id: 'eval-3',
    candidate: 'Jennifer Lopez',
    role: 'Junior SAP Analyst',
    job: 'SAP CO Consultant',
    company: 'TechCorp Industries',
    date: '22 Jan 2024',
    timestamp: 1705900800000,
    score: 48,
    ats: 62,
    mandatory: '1/5',
    mandatoryFailed: true,
    decision: 'DO NOT SUBMIT',
    by: 'John R.',
    breakdown: {
      skills: { score: 45, max: 100, matched: ['SAP Navigation', 'Excel'], missing: ['SAP CO Configuration', 'S/4HANA', 'Product Costing', 'Profitability Analysis'] },
      experience: { score: 30, max: 100, candidateYears: 1.5, requiredYears: 5.0 },
      education: { score: 80, max: 100, candidateDeg: 'Associate Business Admin', requiredDeg: "Bachelor's Degree" },
      keywords: { score: 40, max: 100, cosineSim: 0.31, topTerms: ['sap', 'reports', 'analyst', 'data entry'] },
    },
    requirements: [
      {
        id: 'r1',
        requirement: { id: 'req-1', text: '5+ years direct SAP CO configuration experience', category: 'Experience', isMandatory: true, weight: 1.5 },
        status: RequirementStatus.NOT_MET,
        confidence: ConfidenceLevel.HIGH,
        pointsAwarded: 0,
        maxPoints: 15,
        matchPercentage: 0,
        hasEvidence: false,
        evidence: []
      }
    ]
  }
];

const avatarColor = (name: string) => {
  const colors = [
    'bg-brand-orange-pale text-brand-orange',
    'bg-violet-50 text-violet-600',
    'bg-blue-50 text-blue-600',
    'bg-emerald-50 text-emerald-600',
    'bg-amber-50 text-amber-600',
    'bg-rose-50 text-rose-600',
    'bg-teal-50 text-teal-600',
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

export default function EvaluationsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'STRONG_MATCH' | 'GOOD_MATCH' | 'LOW_FIT' | 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT'>('All');
  const [sortField, setSortField] = useState<'score' | 'date' | 'name' | 'ats'>('score');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedEval, setSelectedEval] = useState<EvaluationItem | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const counts = {
    All: allEvals.length,
    STRONG_MATCH: allEvals.filter(e => e.score >= 80).length,
    GOOD_MATCH: allEvals.filter(e => e.score >= 50 && e.score < 80).length,

    LOW_FIT: allEvals.filter(e => e.score < 50).length,
    SUBMIT: allEvals.filter(e => e.decision === 'SUBMIT').length,
    REVIEW: allEvals.filter(e => e.decision === 'REVIEW').length,
    'DO NOT SUBMIT': allEvals.filter(e => e.decision === 'DO NOT SUBMIT').length,
  };

  // Filter and Rank Candidates
  const filtered = allEvals
    .filter(e => {
      const q = search.toLowerCase();
      const matchesSearch =
        e.candidate.toLowerCase().includes(q) ||
        e.job.toLowerCase().includes(q) ||
        e.company.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (filter === 'All') return true;
      if (filter === 'STRONG_MATCH') return e.score >= 80;
      if (filter === 'GOOD_MATCH') return e.score >= 50 && e.score < 80;
      if (filter === 'LOW_FIT') return e.score < 50;
      return e.decision === filter;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'score') {
        comparison = b.score - a.score;
      } else if (sortField === 'date') {
        comparison = b.timestamp - a.timestamp;
      } else if (sortField === 'name') {
        comparison = a.candidate.localeCompare(b.candidate);
      } else if (sortField === 'ats') {
        comparison = b.ats - a.ats;
      }
      return sortDirection === 'desc' ? comparison : -comparison;
    });

  const avgScore = Math.round(allEvals.reduce((a, e) => a + e.score, 0) / allEvals.length);

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-[#1E293B] flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />
      <main className="max-w-screen-xl mx-auto px-6 pt-24 pb-16 flex-1 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange-pale border border-brand-orange-border rounded-full text-xs font-bold text-brand-orange mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-orange" />
              Ranked Candidate Evaluation Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">Evaluations & Match Rankings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Multi-dimensional candidate rankings (Skills 40%, Experience 30%, Education 15%, Keyword Cosine Similarity 15%)
            </p>
          </div>
          <Link
            href="/jobs/create"
            className="flex items-center gap-2 px-5 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Job Requisition
          </Link>
        </div>

        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Evaluated', value: counts.All, color: 'text-slate-900', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Strong Match (≥80%)', value: counts.STRONG_MATCH, color: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Moderate Match (50-79%)', value: counts.GOOD_MATCH, color: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Low Fit (<50%)', value: counts.LOW_FIT, color: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'M6 18L18 6M6 6l12 12' },
            { label: 'Average Score', value: `${avgScore}%`, color: 'text-brand-orange', badge: 'bg-brand-orange-pale text-brand-orange border-brand-orange-border', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs transition-all hover:shadow-sm hover:border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                <span className={`w-7 h-7 rounded-xl border ${s.badge} flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={s.icon} />
                  </svg>
                </span>
              </div>
              <div className={`text-2xl font-black ${s.color} tracking-tight`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Quick Filter & Sort Toolbar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search candidate name, job title, company, or skills..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-between md:justify-end">
            {/* Status / Match Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'All', label: 'All' },
                { id: 'STRONG_MATCH', label: '≥80% Match' },
                { id: 'GOOD_MATCH', label: '50-79%' },
                { id: 'LOW_FIT', label: '<50%' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filter === f.id
                      ? 'bg-brand-orange text-white shadow-orange'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Sort by:</span>
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="score">Match Score (Ranked)</option>
                <option value="date">Date Added</option>
                <option value="name">Candidate Name</option>
                <option value="ats">ATS Format Score</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => (prev === 'desc' ? 'asc' : 'desc'))}
                title={sortDirection === 'desc' ? 'Descending' : 'Ascending'}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
              >
                {sortDirection === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>

        {/* Ranked Candidates Evaluations Table */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F1F5F9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Rank & Candidate</th>
                  <th className="px-4 py-4 text-center">Overall Match Score</th>
                  <th className="px-4 py-4 text-center">Match Status</th>
                  <th className="px-4 py-4 hidden lg:table-cell">Target Requisition</th>
                  <th className="px-4 py-4 text-center">Mandatory Met</th>
                  <th className="px-4 py-4 hidden md:table-cell">Evaluated</th>
                  <th className="px-6 py-4 text-right">Criteria & Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Rank & Candidate */}
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
                        <div className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center flex-shrink-0 ${avatarColor(e.candidate)} shadow-xs`}>
                          {e.candidate.charAt(0)}
                        </div>
                        <div>
                          <button
                            onClick={() => setSelectedEval(e)}
                            className="font-bold text-[#1E293B] group-hover:text-brand-orange transition-colors text-left cursor-pointer"
                          >
                            {e.candidate}
                          </button>
                          <div className="text-xs text-slate-500">{e.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Match Score with Progress */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-base font-extrabold ${
                          e.score >= 80 ? 'text-emerald-600' : e.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {e.score}%
                        </span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              e.score >= 80 ? 'bg-emerald-500' : e.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${e.score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Match Badge Visual Highlight */}
                    <td className="px-4 py-4 text-center">
                      <MatchBadge score={e.score} size="sm" showPercentage={false} />
                    </td>

                    {/* Target Requisition */}
                    <td className="px-4 py-4 hidden lg:table-cell text-xs">
                      <div className="font-semibold text-slate-800">{e.job}</div>
                      <div className="text-slate-500">{e.company}</div>
                    </td>

                    {/* Mandatory Criteria */}
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${
                        !e.mandatoryFailed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {e.mandatory}
                      </span>
                    </td>

                    {/* Evaluated by */}
                    <td className="px-4 py-4 hidden md:table-cell text-xs text-slate-500 font-medium">
                      {e.by} • {e.date}
                    </td>

                    {/* Criteria & Breakdown Action */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedEval(e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-brand-orange hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          <span>🔍</span>
                          View Breakdown
                        </button>
                        <Link
                          href={`/evaluations/${e.id}`}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                          title="Full Evidence Audit"
                        >
                          →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CRITERIA BREAKDOWN MODAL WITH SCORECARD & REQUIREMENT TABLE ── */}
        {selectedEval && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <MatchBadge score={selectedEval.score} size="md" />
                    <span className="text-xs font-bold text-slate-500">
                      Evaluated for <strong className="text-slate-800">{selectedEval.job}</strong> ({selectedEval.company})
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#1E293B]">{selectedEval.candidate}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedEval.role} • Evaluated by {selectedEval.by} on {selectedEval.date}</p>
                </div>
                <button
                  onClick={() => setSelectedEval(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* 4-Dimension ScoreCards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <ScoreCard
                  score={selectedEval.breakdown.skills.score}
                  maxScore={100}
                  label="Skills Match (40% Weight)"
                  percentage={selectedEval.breakdown.skills.score}
                  gradient="from-emerald-500 to-teal-500"
                  description={`${selectedEval.breakdown.skills.matched.length} matched skills`}
                />
                <ScoreCard
                  score={selectedEval.breakdown.experience.score}
                  maxScore={100}
                  label="Experience (30% Weight)"
                  percentage={selectedEval.breakdown.experience.score}
                  gradient="from-cyan-500 to-blue-500"
                  description={`${selectedEval.breakdown.experience.candidateYears}y / ${selectedEval.breakdown.experience.requiredYears}y required`}
                />
                <ScoreCard
                  score={selectedEval.breakdown.education.score}
                  maxScore={100}
                  label="Education (15% Weight)"
                  percentage={selectedEval.breakdown.education.score}
                  gradient="from-purple-500 to-indigo-500"
                  description={selectedEval.breakdown.education.candidateDeg}
                />
                <ScoreCard
                  score={selectedEval.breakdown.keywords.score}
                  maxScore={100}
                  label="Semantic Overlap (15%)"
                  percentage={selectedEval.breakdown.keywords.score}
                  gradient="from-amber-500 to-orange-500"
                  description={`${Math.round(selectedEval.breakdown.keywords.cosineSim * 100)}% Cosine Similarity`}
                />
              </div>

              {/* Matched vs Missing Skills Breakdown */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-8">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Skills Alignment Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                      <span>✓</span> Matched Required Skills ({selectedEval.breakdown.skills.matched.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEval.breakdown.skills.matched.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1.5">
                      <span>✕</span> Missing / Gap Skills ({selectedEval.breakdown.skills.missing.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEval.breakdown.skills.missing.length > 0 ? (
                        selectedEval.breakdown.skills.missing.map((s, i) => (
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

              {/* Requirement Compliance Table */}
              <div className="mb-6">
                <h3 className="text-sm font-extrabold text-[#1E293B] mb-3">Deterministic Requirement Evidence Audit</h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <RequirementTable evaluations={selectedEval.requirements as any} showEvidence={true} />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedEval(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={`/evaluations/${selectedEval.id}`}
                  className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange"
                >
                  Open Full Audit Page →
                </Link>
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}

