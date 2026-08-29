'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const allJobs = [
  { id: 'jd-1', title: 'SAP CO Consultant',         client: 'TechCorp Industries',  location: 'New York, NY',      mode: 'Hybrid',  salary: '$130k–$170k', candidates: 42, topScore: 94, status: 'Active',  created: '26 Aug 2026' },
  { id: 'jd-2', title: 'Lead S/4HANA Architect',    client: 'Global Logistics Inc', location: 'Chicago, IL',       mode: 'Remote',  salary: '$160k–$200k', candidates: 28, topScore: 88, status: 'Active',  created: '25 Aug 2026' },
  { id: 'jd-3', title: 'Financial Systems Analyst',  client: 'Pinnacle Financial',   location: 'San Francisco, CA', mode: 'Onsite',  salary: '$110k–$140k', candidates: 19, topScore: 76, status: 'Active',  created: '24 Aug 2026' },
  { id: 'jd-4', title: 'Senior Backend Engineer',    client: 'TaskNera Enterprise',  location: 'Remote',            mode: 'Remote',  salary: '$140k–$180k', candidates: 65, topScore: 91, status: 'Active',  created: '22 Aug 2026' },
  { id: 'jd-5', title: 'SAP FI Functional Lead',    client: 'Nexus Manufacturing',  location: 'Dallas, TX',        mode: 'Hybrid',  salary: '$145k–$175k', candidates: 12, topScore: 82, status: 'Draft',   created: '20 Aug 2026' },
  { id: 'jd-6', title: 'DevOps Engineer',            client: 'CloudSystems Ltd',     location: 'Austin, TX',        mode: 'Remote',  salary: '$130k–$160k', candidates: 8,  topScore: 79, status: 'Closed',  created: '15 Aug 2026' },
];

const modeColors: Record<string, string> = {
  Remote: 'bg-blue-50 text-blue-700 border-blue-200',
  Hybrid: 'bg-purple-50 text-purple-700 border-purple-200',
  Onsite: 'bg-brand-orange-pale text-brand-orange border-brand-orange-border',
};

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Draft:  'bg-amber-50 text-amber-700 border-amber-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Draft' | 'Closed'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filtered = allJobs.filter(j => {
    const q = search.toLowerCase();
    const matchQ = j.title.toLowerCase().includes(q) || j.client.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    const matchF = filter === 'All' || j.status === filter;
    return matchQ && matchF;
  });

  const counts = {
    All:    allJobs.length,
    Active: allJobs.filter(j => j.status === 'Active').length,
    Draft:  allJobs.filter(j => j.status === 'Draft').length,
    Closed: allJobs.filter(j => j.status === 'Closed').length,
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
              Requisitions Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">Active Job Profiles</h1>
            <p className="text-sm text-slate-500 mt-1">Manage job descriptions, deterministic criteria weights, and candidate pipelines</p>
          </div>
          <Link
            href="/jobs/create"
            className="flex items-center gap-2 px-5 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create New Job Evaluation
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Requisitions', value: counts.All, color: 'text-[#1E293B]', border: 'border-slate-200', dot: 'bg-slate-700' },
            { label: 'Active Pipeline', value: counts.Active, color: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
            { label: 'Draft Rubrics', value: counts.Draft, color: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500' },
            { label: 'Closed / Filled', value: counts.Closed, color: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400' },
          ].map((s, i) => (
            <div key={i} className={`bg-white border ${s.border} rounded-2xl p-5 shadow-sm card-hover-lift`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
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
              placeholder="Search by position title, client, or location..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['All', 'Active', 'Draft', 'Closed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filter === f
                      ? 'bg-brand-orange text-white shadow-orange'
                      : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/70'
                  }`}
                >
                  {f} <span className="ml-1 opacity-70">({counts[f]})</span>
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
                    <th className="px-6 py-4">Position Title</th>
                    <th className="px-4 py-4 hidden lg:table-cell">Comp Range</th>
                    <th className="px-4 py-4 text-center">Work Mode</th>
                    <th className="px-4 py-4 text-center">Applicants</th>
                    <th className="px-4 py-4 text-center">Top Match</th>
                    <th className="px-4 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filtered.map(j => (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/jobs/${j.id}/requirements`} className="text-sm font-bold text-[#1E293B] group-hover:text-brand-orange transition-colors">
                          {j.title}
                        </Link>
                        <div className="text-xs text-slate-500 mt-0.5">{j.client} • {j.location}</div>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-xs font-semibold text-slate-700">{j.salary}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${modeColors[j.mode]}`}>{j.mode}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-[#1E293B]">{j.candidates}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-extrabold ${j.topScore >= 80 ? 'text-emerald-600' : j.topScore >= 65 ? 'text-amber-500' : 'text-rose-500'}`}>
                          {j.topScore}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">/100</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[j.status]}`}>{j.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/jobs/${j.id}/requirements`}
                            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:border-brand-orange hover:text-brand-orange rounded-xl transition-all"
                          >
                            Rubric
                          </Link>
                          <Link
                            href={`/jobs/${j.id}/upload-cvs`}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-xl transition-all shadow-orange"
                          >
                            Evaluate CVs
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(j => (
              <div key={j.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all card-hover-lift flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[j.status]}`}>
                      {j.status}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${modeColors[j.mode]}`}>
                      {j.mode}
                    </span>
                  </div>

                  <Link href={`/jobs/${j.id}/requirements`} className="text-base font-bold text-[#1E293B] hover:text-brand-orange transition-colors">
                    {j.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1 mb-4">{j.client} • {j.location}</p>

                  <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between text-xs mb-5">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">Applicants</div>
                      <div className="text-sm font-extrabold text-[#1E293B]">{j.candidates}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Top Match</div>
                      <div className="text-sm font-extrabold text-brand-orange">{j.topScore}%</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <Link
                    href={`/jobs/${j.id}/requirements`}
                    className="flex-1 text-center py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl transition-all"
                  >
                    View Rubric
                  </Link>
                  <Link
                    href={`/jobs/${j.id}/upload-cvs`}
                    className="flex-1 text-center py-2 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-xl transition-all shadow-orange"
                  >
                    Evaluate
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#1E293B] mb-1">No matching requisitions</h3>
            <p className="text-slate-500 text-xs">Try adjusting your search criteria or filter tags.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
