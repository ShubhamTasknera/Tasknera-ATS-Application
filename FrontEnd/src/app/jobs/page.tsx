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
  Hybrid: 'bg-violet-50 text-violet-700 border-violet-200',
  Onsite: 'bg-brand-orange-pale text-brand-orange border-brand-orange-border',
};

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Draft:  'bg-amber-50 text-amber-700 border-amber-200',
  Closed: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Draft' | 'Closed'>('All');

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
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Header />
      <main className="max-w-screen-xl mx-auto px-6 pt-20 pb-16 flex-1 w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal">Jobs</h1>
            <p className="text-sm text-brand-charcoal-3 mt-0.5">Manage job descriptions, requirements, and candidate pipelines</p>
          </div>
          <Link href="/jobs/create"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-orange">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Job
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Jobs',    value: counts.All,    color: 'text-brand-charcoal', border: 'border-brand-border',  dot: 'bg-brand-charcoal' },
            { label: 'Active',        value: counts.Active, color: 'text-emerald-600',    border: 'border-emerald-200',   dot: 'bg-emerald-500' },
            { label: 'Draft',         value: counts.Draft,  color: 'text-amber-600',      border: 'border-amber-200',     dot: 'bg-amber-500' },
            { label: 'Closed',        value: counts.Closed, color: 'text-gray-500',       border: 'border-gray-200',      dot: 'bg-gray-400' },
          ].map((s, i) => (
            <div key={i} className={`bg-white border ${s.border} rounded-2xl p-4 shadow-card`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                <span className="text-xs text-brand-charcoal-3">{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 mb-5 shadow-card flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, client or location..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-brand-bg border border-brand-border rounded-xl text-brand-charcoal placeholder-brand-charcoal-3 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/10 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {(['All', 'Active', 'Draft', 'Closed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  filter === f
                    ? 'bg-brand-orange text-white shadow-sm'
                    : 'bg-brand-bg text-brand-charcoal-2 border border-brand-border hover:border-brand-orange'
                }`}>
                {f} <span className="ml-0.5 opacity-60">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Jobs table */}
        <div className="bg-white border border-brand-border rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg">
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Position</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide hidden lg:table-cell">Salary</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Mode</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">CVs</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Top Score</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Status</th>
                <th className="text-right px-6 py-3.5 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.map(j => (
                <tr key={j.id} className="hover:bg-brand-bg transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/jobs/${j.id}`} className="text-sm font-semibold text-brand-charcoal group-hover:text-brand-orange transition-colors">
                      {j.title}
                    </Link>
                    <div className="text-xs text-brand-charcoal-3 mt-0.5">{j.client} · {j.location}</div>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="text-sm text-brand-charcoal-2 font-medium">{j.salary}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${modeColors[j.mode]}`}>{j.mode}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm font-semibold text-brand-charcoal">{j.candidates}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`text-sm font-bold ${j.topScore >= 80 ? 'text-emerald-600' : j.topScore >= 65 ? 'text-amber-500' : 'text-red-500'}`}>
                      {j.topScore}
                    </span>
                    <span className="text-xs text-brand-charcoal-3">/100</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[j.status]}`}>{j.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/jobs/${j.id}/requirements`}
                        className="px-3 py-1.5 text-xs font-medium text-brand-charcoal-2 bg-brand-bg border border-brand-border hover:border-brand-orange rounded-lg transition-colors">
                        Requirements
                      </Link>
                      <Link href={`/jobs/${j.id}/upload-cvs`}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-lg transition-colors">
                        Evaluate
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <svg className="w-10 h-10 text-brand-charcoal-3 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-brand-charcoal-3 text-sm">No jobs match your search.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
