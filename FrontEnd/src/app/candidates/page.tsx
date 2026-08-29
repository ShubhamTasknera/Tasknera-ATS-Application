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

  const filtered = allCandidates.filter(c => {
    const q = search.toLowerCase();
    const matchQ = c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
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
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Header />
      <main className="max-w-screen-xl mx-auto px-6 pt-20 pb-16 flex-1 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal">Candidates</h1>
            <p className="text-sm text-brand-charcoal-3 mt-0.5">All candidates evaluated across all active jobs</p>
          </div>
          <Link href="/jobs/create"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-orange">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Evaluate CVs
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Candidates', value: counts.All,               color: 'text-brand-charcoal', bg: 'bg-brand-bg-2',  border: 'border-brand-border',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Submit',           value: counts.SUBMIT,            color: 'text-emerald-600',    bg: 'bg-emerald-50',  border: 'border-emerald-200',   icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Review',           value: counts.REVIEW,            color: 'text-amber-600',      bg: 'bg-amber-50',    border: 'border-amber-200',     icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Do Not Submit',    value: counts['DO NOT SUBMIT'],  color: 'text-red-500',        bg: 'bg-red-50',      border: 'border-red-200',       icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((s, i) => (
            <div key={i} className={`bg-white border ${s.border} rounded-2xl p-4 shadow-card`}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <svg className={`w-4 h-4 ${s.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.icon} />
                </svg>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-brand-charcoal-3 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 mb-5 shadow-card flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or role..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-brand-bg border border-brand-border rounded-xl text-brand-charcoal placeholder-brand-charcoal-3 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-colors" />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {(['All', 'SUBMIT', 'REVIEW', 'DO NOT SUBMIT'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filter === f
                    ? 'bg-brand-orange text-white shadow-sm'
                    : 'bg-brand-bg text-brand-charcoal-2 border border-brand-border hover:border-brand-orange'
                }`}>
                {f === 'DO NOT SUBMIT' ? 'REJECT' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-brand-border rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Candidate</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide hidden lg:table-cell">Skills</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Match</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Jobs</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Decision</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-brand-bg transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl font-bold text-sm flex items-center justify-center flex-shrink-0 ${avatarColor(c.name)}`}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-brand-charcoal">{c.name}</div>
                        <div className="text-xs text-brand-charcoal-3">{c.role} · {c.exp}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-brand-charcoal-2">
                      <svg className="w-3.5 h-3.5 text-brand-charcoal-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {c.location}
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {c.skills.slice(0, 3).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-brand-bg border border-brand-border rounded-full text-[11px] text-brand-charcoal-2 font-medium">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className={`text-base font-bold ${c.match >= 80 ? 'text-emerald-600' : c.match >= 65 ? 'text-amber-500' : 'text-red-500'}`}>
                      {c.match}
                    </div>
                    <div className="w-14 h-1.5 bg-brand-bg-2 rounded-full mx-auto mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.match >= 80 ? 'bg-emerald-500' : c.match >= 65 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${c.match}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-semibold text-brand-charcoal">{c.jobs}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${decisionStyle(c.decision)}`}>
                      {c.decision === 'DO NOT SUBMIT' ? 'REJECT' : c.decision}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href="/evaluations" className="text-xs text-brand-orange hover:underline font-medium">
                      View Eval →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-10 h-10 text-brand-charcoal-3 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-brand-charcoal-3 text-sm">No candidates match your search.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
