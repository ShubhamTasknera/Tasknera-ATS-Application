'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface CandidateItem {
  id: string;
  name: string;
  role: string;
  email: string;
  location: string;
  exp: string;
  companyCount: number;
  match: number;
  decision: string;
  jobs: number;
  skills: string[];
  rawCandidate?: any;
}

const defaultInitialCandidates: CandidateItem[] = [
  { id: 'cv-1', name: 'Sarah Mitchell',  role: 'SAP CO Consultant',     email: 'sarah.m@email.com',    location: 'New York, NY',      exp: '8 yrs', companyCount: 3, match: 94, decision: 'SUBMIT',        jobs: 2, skills: ['SAP CO', 'S/4HANA', 'Manufacturing'] },
  { id: 'cv-2', name: 'Michael Chen',    role: 'SAP Consultant',         email: 'michael.c@email.com',  location: 'San Francisco, CA', exp: '7 yrs', companyCount: 2, match: 76, decision: 'REVIEW',        jobs: 1, skills: ['SAP FI', 'SAP CO', 'S/4HANA'] },
  { id: 'cv-3', name: 'Emily Rodriguez', role: 'UX Designer',            email: 'emily.r@email.com',    location: 'Austin, TX',        exp: '5 yrs', companyCount: 2, match: 92, decision: 'SUBMIT',        jobs: 1, skills: ['Figma', 'UI/UX', 'Design Systems'] },
  { id: 'cv-4', name: 'David Park',      role: 'Senior Full Stack Dev',  email: 'david.p@email.com',    location: 'Seattle, WA',       exp: '7 yrs', companyCount: 3, match: 88, decision: 'SUBMIT',        jobs: 1, skills: ['React', 'Node.js', 'AWS'] },
  { id: 'cv-5', name: 'Jennifer Lopez',  role: 'Junior SAP Analyst',     email: 'jennifer.l@email.com', location: 'Chicago, IL',       exp: '2 yrs', companyCount: 1, match: 52, decision: 'DO NOT SUBMIT', jobs: 1, skills: ['SAP CO', 'Excel'] },
  { id: 'cv-6', name: 'Priya Sharma',    role: 'Full Stack Developer',   email: 'priya.s@email.com',    location: 'Remote',            exp: '5 yrs', companyCount: 2, match: 81, decision: 'SUBMIT',        jobs: 1, skills: ['React', 'TypeScript', 'Node.js'] },
  { id: 'cv-7', name: 'James Wilson',    role: 'DevOps Engineer',        email: 'james.w@email.com',    location: 'Austin, TX',        exp: '6 yrs', companyCount: 2, match: 79, decision: 'REVIEW',        jobs: 1, skills: ['Docker', 'Kubernetes', 'AWS'] },
];

const decisionStyle = (d: string) =>
  d === 'SUBMIT'
    ? 'bg-status-submit-bg text-status-submit-text border-status-submit-border'
    : d === 'REVIEW'
    ? 'bg-status-review-bg text-status-review-text border-status-review-border'
    : 'bg-status-reject-bg text-status-reject-text border-status-reject-border';

const avatarColor = (name: string) => {
  const colors = [
    'bg-brand-orange-pale text-brand-orange border-brand-orange-border',
    'bg-blue-50 text-blue-600 border-blue-200',
    'bg-emerald-50 text-emerald-600 border-emerald-200',
    'bg-purple-50 text-purple-600 border-purple-200',
    'bg-amber-50 text-amber-600 border-amber-200',
    'bg-rose-50 text-rose-600 border-rose-200',
    'bg-teal-50 text-teal-600 border-teal-200',
  ];
  return colors[Math.abs((name || 'A').charCodeAt(0)) % colors.length];
};

export default function CandidatesPage() {
  const [allCandidates, setAllCandidates] = useState<CandidateItem[]>(defaultInitialCandidates);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadCandidatesFromBackend() {
      try {
        setIsLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${backendUrl}/jobs/jd-1/candidates`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.candidates) && data.candidates.length > 0) {
            const mapped: CandidateItem[] = data.candidates.map((c: any) => {
              const uniqueComps = new Set<string>();
              if (Array.isArray(c.experience)) {
                c.experience.forEach((e: any) => {
                  if (e.company && e.company.trim() && e.company.toLowerCase() !== 'company') {
                    uniqueComps.add(e.company.trim());
                  }
                });
              }
              if (uniqueComps.size === 0 && c.currentCompany && c.currentCompany.trim() && c.currentCompany.toLowerCase() !== 'company') {
                uniqueComps.add(c.currentCompany.trim());
              }

              const companyCount = uniqueComps.size || (c.experience?.length ? c.experience.length : 1);

              return {
                id: c.id,
                name: c.name || 'Candidate',
                role: c.currentTitle || 'Applicant',
                email: c.email || 'contact@example.com',
                location: c.location || 'Remote',
                exp: c.totalExperience || '3 yrs',
                companyCount,
                match: c.parsingStatus === 'FAILED' ? 35 : (c.skills?.length ? Math.min(96, 70 + c.skills.length * 3) : 85),
                decision: c.parsingStatus === 'FAILED' ? 'DO NOT SUBMIT' : (c.skills?.length >= 5 ? 'SUBMIT' : 'REVIEW'),
                jobs: 1,
                skills: Array.isArray(c.skills) ? c.skills : [],
                rawCandidate: c,
              };
            });

            // Merge unique
            const existingIds = new Set(mapped.map(c => c.id));
            const merged = [...mapped, ...defaultInitialCandidates.filter(dc => !existingIds.has(dc.id))];
            setAllCandidates(merged);
          }
        }
      } catch (err) {
        console.warn('Backend candidate fetch error, fallback to defaults:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCandidatesFromBackend();
  }, []);

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
            <p className="text-sm text-slate-500 mt-1 font-medium">Cross-position candidate database with evidence citations, company tenures, and deterministic match scores</p>
          </div>
          <Link
            href="/jobs/jd-1/candidates"
            className="flex items-center gap-2 px-5 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Upload & Evaluate CVs
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Candidates', value: counts.All, color: 'text-slate-900', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Submit Recommended', value: counts.SUBMIT, color: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'M5 13l4 4L19 7' },
            { label: 'Manual Review', value: counts.REVIEW, color: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Do Not Submit', value: counts['DO NOT SUBMIT'], color: 'text-rose-700', badge: 'bg-rose-50 text-rose-700 border-rose-200', icon: 'M6 18L18 6M6 6l12 12' },
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
              placeholder="Search by candidate name, role, or tech skills..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['All', 'SUBMIT', 'REVIEW', 'DO NOT SUBMIT'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filter === f
                      ? 'bg-brand-orange text-white shadow-orange'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                  }`}
                >
                  {f === 'DO NOT SUBMIT' ? 'REJECT' : f} ({counts[f]})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500'}`}
                title="Table View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500'}`}
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
                    <th className="px-4 py-4 hidden md:table-cell">Experience & Companies</th>
                    <th className="px-4 py-4 hidden lg:table-cell">Key Competencies</th>
                    <th className="px-4 py-4 text-center">Match Index</th>
                    <th className="px-4 py-4 text-center">Decision</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl font-extrabold text-sm flex items-center justify-center flex-shrink-0 border ${avatarColor(c.name)} shadow-xs`}>
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#1E293B] group-hover:text-brand-orange transition-colors">{c.name}</div>
                            <div className="text-xs text-slate-500">{c.role} • {c.location}</div>
                          </div>
                        </div>
                      </td>

                      {/* Experience & Number of Companies in Brackets */}
                      <td className="px-4 py-4 hidden md:table-cell text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            {c.exp}
                          </span>
                          <span className="font-extrabold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md text-[11px]">
                            ({c.companyCount} {c.companyCount === 1 ? 'Company' : 'Companies'})
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {c.skills.slice(0, 4).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-[#F8FAFC] border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700">
                              {s}
                            </span>
                          ))}
                          {c.skills.length > 4 && (
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500">
                              +{c.skills.length - 4}
                            </span>
                          )}
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
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${decisionStyle(c.decision)}`}>
                          {c.decision === 'DO NOT SUBMIT' ? 'REJECT' : c.decision}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href="/jobs/jd-1/candidates"
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange"
                        >
                          <span>View Profile →</span>
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
                      <div className={`w-12 h-12 rounded-2xl font-extrabold text-base flex items-center justify-center ${avatarColor(c.name)} shadow-xs border`}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1E293B] text-base">{c.name}</h3>
                        <p className="text-xs text-slate-500">{c.role}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${decisionStyle(c.decision)}`}>
                      {c.decision === 'DO NOT SUBMIT' ? 'REJECT' : c.decision}
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200 mb-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Experience & Companies:</span>
                      <span className="font-bold text-slate-800">
                        {c.exp} • ({c.companyCount} {c.companyCount === 1 ? 'Company' : 'Companies'})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                      <span className="text-slate-500 font-medium">Deterministic Match:</span>
                      <span className={`font-extrabold ${c.match >= 80 ? 'text-emerald-600' : c.match >= 65 ? 'text-amber-500' : 'text-rose-500'}`}>
                        {c.match}%
                      </span>
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
                    href="/jobs/jd-1/candidates"
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange"
                  >
                    View Full Profile
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
