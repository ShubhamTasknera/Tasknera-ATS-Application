'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const allCandidates = [
  { id: 'cv-1', name: 'Sarah Mitchell',  role: 'SAP CO Consultant',     email: 'sarah.m@email.com',    location: 'New York, NY',      exp: '8 yrs', match: 94, decision: 'SUBMIT',        jobs: 2, skills: ['SAP CO', 'S/4HANA', 'Manufacturing'] },
  { id: 'cv-2', name: 'Michael Chen',    role: 'SAP Consultant',         email: 'michael.c@email.com',  location: 'San Francisco, CA', exp: '7 yrs', match: 76, decision: 'REVIEW',        jobs: 1, skills: ['SAP FI', 'SAP CO', 'S/4HANA'] },
  { id: 'cv-3', name: 'Emily Rodriguez', role: 'UX Designer',            email: 'emily.r@email.com',    location: 'Austin, TX',        exp: '5 yrs', match: 92, decision: 'SUBMIT',        jobs: 1, skills: ['Figma', 'UI/UX', 'Design Systems'] },
  { id: 'cv-4', name: 'David Park',      role: 'Senior Full Stack Dev',  email: 'david.p@email.com',    location: 'Seattle, WA',       exp: '7 yrs', match: 88, decision: 'SUBMIT',        jobs: 1, skills: ['React', 'Node.js', 'AWS'] },
  { id: 'cv-5', name: 'Jennifer Lopez',  role: 'Junior SAP Analyst',     email: 'jennifer.l@email.com', location: 'Chicago, IL',       exp: '2 yrs', match: 52, decision: 'DO NOT SUBMIT', jobs: 1, skills: ['SAP CO', 'Excel'] },
  { id: 'cv-6', name: 'Priya Sharma',    role: 'Full Stack Developer',   email: 'priya.s@email.com',    location: 'Remote',            exp: '5 yrs', match: 81, decision: 'SUBMIT',        jobs: 1, skills: ['React', 'TypeScript', 'Node.js'] },
  { id: 'cv-7', name: 'James Wilson',    role: 'DevOps Engineer',        email: 'james.w@email.com',    location: 'Austin, TX',        exp: '6 yrs', match: 79, decision: 'REVIEW',        jobs: 1, skills: ['Docker', 'Kubernetes', 'AWS'] },
];

const decisionStyle = (d: string) =>
  d === 'SUBMIT'
    ? 'bg-status-submit-bg text-status-submit-text border-status-submit-border'
    : d === 'REVIEW'
    ? 'bg-status-review-bg text-status-review-text border-status-review-border'
    : 'bg-status-reject-bg text-status-reject-text border-status-reject-border';

// Unique avatar background per initial
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

export default function CandidatesPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filtered = allCandidates.filter(c => {
    const q = search.toLowerCase();
    const matchQ = c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q));
    const matchF = filter === 'All' || c.decision === filter;
    return matchQ && matchF;
  });

  const counts = {
    All:            allCandidates.length,
    SUBMIT:         allCandidates.filter(c => c.decision === 'SUBMIT').length,
    REVIEW:         allCandidates.filter(c => c.decision === 'REVIEW').length,
    'DO NOT SUBMIT':allCandidates.filter(c => c.decision === 'DO NOT SUBMIT').length,
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-[#1E293B] flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />
      <main className="max-w-screen-xl mx-auto px-6 pt-24 pb-16 flex-1 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange-pale border border-brand-orange-border rounded-full text-xs font-bold text-brand-orange mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-orange" />
              Talent Pool & Evaluated Profiles
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">Candidate Directory</h1>
            <p className="text-sm text-slate-500 mt-1">Cross-position candidate database with evidence citations and deterministic scores</p>
          </div>
          <Link
            href="/jobs/create"
            className="flex items-center gap-2 px-5 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Batch Evaluate Resumes
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Candidates', value: counts.All, color: 'text-[#1E293B]', bg: 'bg-brand-orange-pale text-brand-orange', border: 'border-slate-200' },
            { label: 'Submit Recommended', value: counts.SUBMIT, color: 'text-emerald-600', bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200' },
            { label: 'Manual Review', value: counts.REVIEW, color: 'text-amber-600', bg: 'bg-amber-50 text-amber-600', border: 'border-amber-200' },
            { label: 'Do Not Submit', value: counts['DO NOT SUBMIT'], color: 'text-rose-600', bg: 'bg-rose-50 text-rose-600', border: 'border-rose-200' },
          ].map((s, i) => (
            <div key={i} className={`bg-white border ${s.border} rounded-2xl p-5 shadow-sm card-hover-lift`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                <span className={`w-6 h-6 rounded-lg ${s.bg} flex items-center justify-center font-bold text-xs`}>
                  {i === 0 ? '∑' : i === 1 ? '✓' : i === 2 ? '!' : '×'}
                </span>
              </div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
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
              placeholder="Search by candidate name, role, or specific skills..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Filter Pills */}
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

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500'}`}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500'}`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        {viewMode === 'table' ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F1F5F9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Candidate Profile</th>
                    <th className="px-4 py-4 hidden md:table-cell">Location</th>
                    <th className="px-4 py-4 hidden lg:table-cell">Key Skills</th>
                    <th className="px-4 py-4 text-center">Match Index</th>
                    <th className="px-4 py-4 text-center">Active Jobs</th>
                    <th className="px-4 py-4 text-center">Decision</th>
                    <th className="px-6 py-4 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center flex-shrink-0 ${avatarColor(c.name)} shadow-xs`}>
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#1E293B] group-hover:text-brand-orange transition-colors">{c.name}</div>
                            <div className="text-xs text-slate-500">{c.role} • {c.exp}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell text-xs text-slate-600 font-medium">
                        {c.location}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {c.skills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className={`text-base font-extrabold ${c.match >= 80 ? 'text-emerald-600' : c.match >= 65 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {c.match}%
                        </div>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.match >= 80 ? 'bg-emerald-500' : c.match >= 65 ? 'bg-amber-400' : 'bg-rose-500'}`}
                            style={{ width: `${c.match}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs font-bold text-[#1E293B]">{c.jobs} reqs</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${decisionStyle(c.decision)}`}>
                          {c.decision === 'DO NOT SUBMIT' ? 'REJECT' : c.decision}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href="/evaluations"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-orange-pale hover:bg-brand-orange hover:text-white text-brand-orange text-xs font-bold rounded-xl transition-all"
                        >
                          View Breakdown →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(c => (
              <div key={c.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all card-hover-lift flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl font-extrabold text-base flex items-center justify-center ${avatarColor(c.name)} shadow-xs`}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1E293B] text-base">{c.name}</h3>
                        <p className="text-xs text-slate-500">{c.role} • {c.exp}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${decisionStyle(c.decision)}`}>
                      {c.decision === 'DO NOT SUBMIT' ? 'REJECT' : c.decision}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Deterministic Match</span>
                      <span className={`text-base font-extrabold ${c.match >= 80 ? 'text-emerald-600' : c.match >= 65 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {c.match}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.match >= 80 ? 'bg-emerald-500' : c.match >= 65 ? 'bg-amber-400' : 'bg-rose-500'}`}
                        style={{ width: `${c.match}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Demonstrated Competencies</div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.skills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{c.location}</span>
                  <Link
                    href="/evaluations"
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange"
                  >
                    Audit Evidence
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div className="bg-white border border-slate-200/90 rounded-3xl text-center py-20 shadow-sm mt-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange-pale text-brand-orange flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#1E293B] mb-1">No matching candidate profiles</h3>
            <p className="text-slate-500 text-xs">Try adjusting your search terms or filter criteria.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
