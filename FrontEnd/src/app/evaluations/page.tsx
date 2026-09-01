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
  const [sort, setSort] = useState<'score' | 'date'>('score');

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
    <div className="min-h-screen bg-[#EEF2F6] text-[#1E293B] flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />
      <main className="max-w-screen-xl mx-auto px-6 pt-24 pb-16 flex-1 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange-pale border border-brand-orange-border rounded-full text-xs font-bold text-brand-orange mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-orange" />
              Evaluation Audit Log
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">Evaluations & Citations</h1>
            <p className="text-sm text-slate-500 mt-1">Deterministic matching breakdown, candidate-to-JD evidence verification, and submission decisions</p>
          </div>
          <Link
            href="/jobs/create"
            className="flex items-center gap-2 px-5 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Evaluation
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Evaluations', value: counts.All, color: 'text-slate-900', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Submit Ready', value: counts.SUBMIT, color: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Needs Review', value: counts.REVIEW, color: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Rejected', value: counts['DO NOT SUBMIT'], color: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'M6 18L18 6M6 6l12 12' },
            { label: 'Mean Score', value: `${avgScore}%`, color: 'text-brand-orange', badge: 'bg-brand-orange-pale text-brand-orange border-brand-orange-border', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
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

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full md:max-w-md">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by candidate name, job title, or client..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['All', 'SUBMIT', 'REVIEW', 'DO NOT SUBMIT'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-brand-orange text-white shadow-orange'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                }`}
              >
                {f === 'DO NOT SUBMIT' ? 'REJECT' : f} <span className="ml-1 opacity-70">({counts[f]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Evaluations Table */}
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F1F5F9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Candidate & Requisition</th>
                  <th className="px-4 py-4 text-center">JD Match</th>
                  <th className="px-4 py-4 text-center">ATS Format</th>
                  <th className="px-4 py-4 text-center">Mandatory Met</th>
                  <th className="px-4 py-4 text-center">Decision</th>
                  <th className="px-4 py-4 hidden md:table-cell">Evaluator</th>
                  <th className="px-6 py-4 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center flex-shrink-0 ${avatarColor(e.candidate)} shadow-xs`}>
                          {e.candidate.charAt(0)}
                        </div>
                        <div>
                          <Link href={`/evaluations/${e.id}`} className="font-bold text-[#1E293B] group-hover:text-brand-orange transition-colors">
                            {e.candidate}
                          </Link>
                          <div className="text-xs text-slate-500">{e.job} • {e.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className={`text-base font-extrabold ${scoreColor(e.score)}`}>
                        {e.score}%
                      </div>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreBg(e.score)}`}
                          style={{ width: `${e.score}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-xs font-bold text-slate-700">{e.ats}%</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${
                        !e.mandatoryFailed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {e.mandatory}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${decisionStyle(e.decision)}`}>
                        {e.decision === 'DO NOT SUBMIT' ? 'REJECT' : e.decision}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-xs text-slate-500 font-medium">
                      {e.by} • {e.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/evaluations/${e.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-brand-orange-pale hover:bg-brand-orange hover:text-white text-brand-orange text-xs font-bold rounded-xl transition-all shadow-xs"
                      >
                        Evidence Audit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="bg-white border border-slate-200/90 rounded-3xl text-center py-20 shadow-sm mt-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange-pale text-brand-orange flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#1E293B] mb-1">No matching evaluations</h3>
            <p className="text-slate-500 text-xs">Try adjusting your search criteria or filter tags.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
