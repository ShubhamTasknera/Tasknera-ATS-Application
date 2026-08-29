'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const allEvals = [
  { id: 'eval-1', candidate: 'Sarah Mitchell',  role: 'SAP CO Consultant',     job: 'SAP CO Consultant',     company: 'TechCorp Industries', date: '20 Jan 2024', score: 94, ats: 96, mandatory: '5/5', mandatoryFailed: false, decision: 'SUBMIT',        by: 'John R.' },
  { id: 'eval-2', candidate: 'Michael Chen',    role: 'SAP Consultant',         job: 'SAP CO Consultant',     company: 'TechCorp Industries', date: '21 Jan 2024', score: 76, ats: 78, mandatory: '4/5', mandatoryFailed: true,  decision: 'REVIEW',        by: 'John R.' },
  { id: 'eval-3', candidate: 'Jennifer Lopez',  role: 'Junior SAP Analyst',     job: 'SAP CO Consultant',     company: 'TechCorp Industries', date: '22 Jan 2024', score: 52, ats: 62, mandatory: '1/5', mandatoryFailed: true,  decision: 'DO NOT SUBMIT', by: 'John R.' },
  { id: 'eval-4', candidate: 'David Park',      role: 'Senior Full Stack Dev',  job: 'Senior Full Stack Dev', company: 'InnovateTech',         date: '25 Jan 2024', score: 88, ats: 91, mandatory: '3/3', mandatoryFailed: false, decision: 'SUBMIT',        by: 'Sarah K.' },
  { id: 'eval-5', candidate: 'Priya Sharma',    role: 'Full Stack Developer',   job: 'Senior Full Stack Dev', company: 'InnovateTech',         date: '26 Jan 2024', score: 81, ats: 85, mandatory: '3/3', mandatoryFailed: false, decision: 'SUBMIT',        by: 'Sarah K.' },
  { id: 'eval-6', candidate: 'James Wilson',    role: 'DevOps Engineer',        job: 'DevOps Engineer',       company: 'CloudSystems Ltd',     date: '28 Jan 2024', score: 79, ats: 83, mandatory: '4/5', mandatoryFailed: false, decision: 'REVIEW',        by: 'John R.' },
  { id: 'eval-7', candidate: 'Emily Rodriguez', role: 'UX Designer',            job: 'UX Designer',           company: 'DesignCo',             date: '30 Jan 2024', score: 92, ats: 94, mandatory: '4/4', mandatoryFailed: false, decision: 'SUBMIT',        by: 'Sarah K.' },
];

const decisionStyle = (d: string) =>
  d === 'SUBMIT'          ? 'bg-status-submit-bg text-status-submit-text border-status-submit-border' :
  d === 'REVIEW'          ? 'bg-status-review-bg text-status-review-text border-status-review-border' :
                            'bg-status-reject-bg text-status-reject-text border-status-reject-border';

const scoreColor = (n: number) =>
  n >= 80 ? 'text-emerald-600' : n >= 65 ? 'text-amber-500' : 'text-red-500';

const scoreBg = (n: number) =>
  n >= 80 ? 'bg-emerald-500' : n >= 65 ? 'bg-amber-400' : 'bg-red-400';

// Unique avatar color per name
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
  const [filter, setFilter] = useState<'All' | 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT'>('All');
  const [sort, setSort] = useState<'score' | 'date'>('date');

  const counts = {
    All:            allEvals.length,
    SUBMIT:         allEvals.filter(e => e.decision === 'SUBMIT').length,
    REVIEW:         allEvals.filter(e => e.decision === 'REVIEW').length,
    'DO NOT SUBMIT':allEvals.filter(e => e.decision === 'DO NOT SUBMIT').length,
  };

  const filtered = allEvals
    .filter(e => {
      const q = search.toLowerCase();
      return (
        (e.candidate.toLowerCase().includes(q) || e.job.toLowerCase().includes(q) || e.company.toLowerCase().includes(q)) &&
        (filter === 'All' || e.decision === filter)
      );
    })
    .sort((a, b) => sort === 'score' ? b.score - a.score : 0);

  const avgScore = Math.round(allEvals.reduce((a, e) => a + e.score, 0) / allEvals.length);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Header />
      <main className="max-w-screen-xl mx-auto px-6 pt-20 pb-16 flex-1 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal">Evaluations</h1>
            <p className="text-sm text-brand-charcoal-3 mt-0.5">All candidate evaluations with scores, evidence and submission decisions</p>
          </div>
          <Link href="/jobs/create"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-orange">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Evaluation
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
          {[
            { label: 'Total',       value: counts.All,              color: 'text-brand-charcoal', border: 'border-brand-border',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', iconColor: 'text-brand-charcoal-2', bg: 'bg-brand-bg-2' },
            { label: 'Submit',      value: counts.SUBMIT,           color: 'text-emerald-600',    border: 'border-emerald-200',   icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',          iconColor: 'text-emerald-600',      bg: 'bg-emerald-50' },
            { label: 'Review',      value: counts.REVIEW,           color: 'text-amber-600',      border: 'border-amber-200',     icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',                       iconColor: 'text-amber-600',        bg: 'bg-amber-50' },
            { label: 'Rejected',    value: counts['DO NOT SUBMIT'], color: 'text-red-500',        border: 'border-red-200',       icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636', iconColor: 'text-red-500', bg: 'bg-red-50' },
            { label: 'Avg Score',   value: `${avgScore}`,           color: 'text-brand-orange',   border: 'border-orange-200',    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',                         iconColor: 'text-brand-orange',     bg: 'bg-brand-orange-pale' },
          ].map((s, i) => (
            <div key={i} className={`bg-white border ${s.border} rounded-2xl p-4 shadow-card`}>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <svg className={`w-4 h-4 ${s.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} />
                </svg>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-brand-charcoal-3 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 mb-5 shadow-card flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search candidate, job or company..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-brand-bg border border-brand-border rounded-xl text-brand-charcoal placeholder-brand-charcoal-3 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10" />
          </div>
          <div className="flex items-center gap-1.5">
            {(['All', 'SUBMIT', 'REVIEW', 'DO NOT SUBMIT'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filter === f ? 'bg-brand-orange text-white' : 'bg-brand-bg text-brand-charcoal-2 border border-brand-border hover:border-brand-orange'
                }`}>
                {f === 'DO NOT SUBMIT' ? 'REJECT' : f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-brand-charcoal-3">Sort:</span>
            <button onClick={() => setSort(sort === 'score' ? 'date' : 'score')}
              className="px-3 py-1.5 text-xs font-medium text-brand-charcoal-2 bg-brand-bg border border-brand-border rounded-xl hover:border-brand-orange transition-colors">
              {sort === 'score' ? 'By Score' : 'By Date'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-brand-border rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Candidate</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide hidden md:table-cell">Job</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Match</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide hidden lg:table-cell">ATS</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Mandatory</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Decision</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-right px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-brand-bg transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center flex-shrink-0 ${avatarColor(e.candidate)}`}>
                        {e.candidate.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-brand-charcoal">{e.candidate}</div>
                        <div className="text-xs text-brand-charcoal-3">{e.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="text-sm font-medium text-brand-charcoal-2">{e.job}</div>
                    <div className="text-xs text-brand-charcoal-3">{e.company}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`text-base font-bold ${scoreColor(e.score)}`}>{e.score}</div>
                    <div className="w-10 h-1.5 bg-brand-bg-2 rounded-full mx-auto mt-1 overflow-hidden">
                      <div className={`h-full rounded-full ${scoreBg(e.score)}`} style={{ width: `${e.score}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center hidden lg:table-cell">
                    <span className="text-sm font-medium text-brand-charcoal-2">{e.ats}</span>
                    <div className="text-[11px] text-brand-charcoal-3">/100</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-sm font-semibold ${e.mandatoryFailed ? 'text-red-500' : 'text-emerald-600'}`}>
                      {e.mandatory}
                    </span>
                    {e.mandatoryFailed && (
                      <div className="text-[10px] text-red-400 font-semibold mt-0.5 uppercase tracking-wide">Failed</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${decisionStyle(e.decision)}`}>
                      {e.decision === 'DO NOT SUBMIT' ? 'REJECT' : e.decision}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="text-xs text-brand-charcoal-3">{e.date}</div>
                    <div className="text-[11px] text-brand-charcoal-3 mt-0.5">by {e.by}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/evaluations/${e.id}`} className="text-xs text-brand-orange hover:underline font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-10 h-10 text-brand-charcoal-3 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-brand-charcoal-3 text-sm">No evaluations match your search.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
