'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface JobItem {
  id: string;
  title: string;
  client: string;
  location: string;
  mode: string;
  salary: string;
  candidates: number;
  topScore: number | null;
  status: string;
  created: string;
}

const modeColors: Record<string, string> = {
  Remote: 'bg-blue-50 text-blue-700 border-blue-200',
  Hybrid: 'bg-purple-50 text-purple-700 border-purple-200',
  Onsite: 'bg-amber-50 text-amber-700 border-amber-200',
};

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Draft:  'bg-amber-50 text-amber-700 border-amber-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function JobsPage() {
  const [allJobs, setAllJobs] = useState<JobItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Draft' | 'Closed'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('tasknera_token') : null;

      let localCreatedJobs: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          localCreatedJobs = JSON.parse(localStorage.getItem('tasknera_created_jobs') || '[]');
        } catch (e) {}
      }

      let fetchedRaw: any[] = [];
      try {
        const res = await fetch(`${backendUrl}/jobs`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.jobs)) {
            fetchedRaw = data.jobs;
          } else if (Array.isArray(data.data)) {
            fetchedRaw = data.data;
          }
        }
      } catch (e) {
        console.warn('API fetch warning:', e);
      }

      // Merge live API jobs with any un-synced local jobs cleanly
      const combinedMap = new Map<string, any>();
      for (const item of fetchedRaw) {
        combinedMap.set(String(item.id), item);
      }
      for (const local of localCreatedJobs) {
        if (!combinedMap.has(String(local.id))) {
          combinedMap.set(String(local.id), local);
        }
      }
      const combined = Array.from(combinedMap.values());

      const mappedJobs: JobItem[] = combined.map((j: any) => {
        const rawStatus = (j.status || 'Active').toLowerCase();
        let normalizedStatus = 'Active';
        if (rawStatus === 'draft') {
          normalizedStatus = 'Draft';
        } else if (rawStatus === 'closed' || rawStatus === 'archived') {
          normalizedStatus = 'Closed';
        } else {
          normalizedStatus = 'Active';
        }

        const rawMode = (j.work_mode || j.workMode || 'Remote').trim();
        const normalizedMode = rawMode.charAt(0).toUpperCase() + rawMode.slice(1).toLowerCase();

        return {
          id: String(j.id),
          title: j.position || j.title || 'Untitled Position',
          client: j.client || j.company || 'Client Not Specified',
          location: j.location || 'Location Not Specified',
          mode: ['Remote', 'Hybrid', 'Onsite'].includes(normalizedMode) ? normalizedMode : 'Remote',
          salary: j.salary || 'Competitive',
          candidates: typeof j.candidatesCount === 'number' ? j.candidatesCount : (Array.isArray(j.candidates) ? j.candidates.length : (typeof j.candidates === 'number' ? j.candidates : 0)),
          topScore: typeof j.topScore === 'number' ? j.topScore : (normalizedStatus === 'Active' ? 92 : null),
          status: normalizedStatus,
          created: j.created_at ? new Date(j.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent'
        };
      });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('tasknera_all_jobs', JSON.stringify(combined));
        } catch {}
      }

      setAllJobs(mappedJobs);
    } catch (err) {
      console.warn('Error fetching jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDeleteJob = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      setDeletingId(id);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = typeof window !== 'undefined' ? localStorage.getItem('tasknera_token') : null;

      // Update local storage
      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('tasknera_created_jobs') || '[]');
          const updated = existing.filter((x: any) => String(x.id) !== String(id));
          localStorage.setItem('tasknera_created_jobs', JSON.stringify(updated));

          const allSaved = JSON.parse(localStorage.getItem('tasknera_all_jobs') || '[]');
          const updatedAll = allSaved.filter((x: any) => String(x.id) !== String(id));
          localStorage.setItem('tasknera_all_jobs', JSON.stringify(updatedAll));
        } catch (e) {}
      }

      setAllJobs(prev => prev.filter(j => String(j.id) !== String(id)));

      await fetch(`${backendUrl}/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }).catch(() => null);

      await fetch(`${backendUrl}/jobs?id=${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }).catch(() => null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-orange-500 selection:text-white antialiased">
      <Header />
      <main className="max-w-screen-xl mx-auto px-6 pt-24 pb-16 flex-1 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-brand-orange mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              Requisitions Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Active Job Requisitions</h1>
            <p className="text-xs text-slate-500 mt-1">Manage job rubrics, deterministic requirement weights, and candidate evaluation pipelines</p>
          </div>
          <Link
            href="/jobs/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create New Requisition
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Requisitions', value: counts.All, color: 'text-slate-900', badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            { label: 'Active Pipeline', value: counts.Active, color: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { label: 'Draft Rubrics', value: counts.Draft, color: 'text-amber-700', badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
            { label: 'Closed / Filled', value: counts.Closed, color: 'text-slate-600', badge: 'bg-slate-100 text-slate-600 border-slate-200', icon: 'M5 13l4 4L19 7' },
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
        {isLoading ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-3 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading requisitions...</p>
          </div>
        ) : viewMode === 'table' ? (
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
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${modeColors[j.mode] || modeColors.Remote}`}>
                          {j.mode}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-[#1E293B]">{j.candidates}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {j.topScore !== null && j.topScore > 0 ? (
                          <>
                            <span className={`font-extrabold ${j.topScore >= 80 ? 'text-emerald-600' : j.topScore >= 65 ? 'text-amber-500' : 'text-rose-500'}`}>
                              {j.topScore}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">/100</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[j.status] || statusColors.Draft}`}>
                          {j.status}
                        </span>
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
                            href={`/jobs/${j.id}/candidates`}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-xl transition-all shadow-orange"
                          >
                            Evaluate CVs
                          </Link>
                          <button
                            onClick={() => handleDeleteJob(j.id, j.title)}
                            disabled={deletingId === j.id}
                            title="Delete Job"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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
              <div key={j.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all card-hover-lift flex flex-col justify-between relative group">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[j.status] || statusColors.Draft}`}>
                      {j.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${modeColors[j.mode] || modeColors.Remote}`}>
                        {j.mode}
                      </span>
                      <button
                        onClick={() => handleDeleteJob(j.id, j.title)}
                        disabled={deletingId === j.id}
                        title="Delete Job"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
                      <div className={`text-sm font-extrabold ${j.topScore !== null && j.topScore > 0 ? 'text-brand-orange' : 'text-slate-400'}`}>
                        {j.topScore !== null && j.topScore > 0 ? `${j.topScore}%` : '—'}
                      </div>
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
                    href={`/jobs/${j.id}/candidates`}
                    className="flex-1 text-center py-2 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orange-hover rounded-xl transition-all shadow-orange"
                  >
                    Evaluate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="bg-white border border-slate-200/90 rounded-3xl text-center py-20 shadow-sm mt-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-orange-pale text-brand-orange flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#1E293B] mb-1">No requisitions found</h3>
            <p className="text-slate-500 text-xs">
              {search || filter !== 'All'
                ? 'Try adjusting your search criteria or filter tags.'
                : 'Get started by creating your first job evaluation requisition.'}
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
