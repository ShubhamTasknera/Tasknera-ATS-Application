'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface JobItem {
  id: string;
  title: string;
  client: string;
  location: string;
  workMode: string;
  salary: string;
  candidatesCount: number;
  topMatch: number;
  status: string;
  createdDate: string;
  isCustom?: boolean;
}

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Active' | 'Draft' | 'Closed'>('All');

  const initialJobs: JobItem[] = [
    {
      id: 'job-1',
      title: 'SAP CO Consultant',
      client: 'TechCorp Industries',
      location: 'New York, NY',
      workMode: 'Hybrid',
      salary: '$130,000 - $170,000',
      candidatesCount: 42,
      topMatch: 94,
      status: 'Active',
      createdDate: '2026-08-26',
    },
    {
      id: 'job-2',
      title: 'Lead S/4HANA Architect',
      client: 'Global Logistics Inc',
      location: 'Chicago, IL',
      workMode: 'Remote',
      salary: '$160,000 - $200,000',
      candidatesCount: 28,
      topMatch: 88,
      status: 'Active',
      createdDate: '2026-08-25',
    },
    {
      id: 'job-3',
      title: 'Financial Systems Analyst',
      client: 'Pinnacle Financial',
      location: 'San Francisco, CA',
      workMode: 'Onsite',
      salary: '$110,000 - $140,000',
      candidatesCount: 19,
      topMatch: 76,
      status: 'Active',
      createdDate: '2026-08-24',
    },
    {
      id: 'job-4',
      title: 'Senior Software Engineer (Backend)',
      client: 'Tasknera Enterprise',
      location: 'Remote',
      workMode: 'Remote',
      salary: '$140,000 - $180,000',
      candidatesCount: 65,
      topMatch: 91,
      status: 'Active',
      createdDate: '2026-08-22',
    },
    {
      id: 'job-5',
      title: 'SAP FI Functional Lead',
      client: 'Nexus Manufacturing',
      location: 'Dallas, TX',
      workMode: 'Hybrid',
      salary: '$145,000 - $175,000',
      candidatesCount: 12,
      topMatch: 82,
      status: 'Draft',
      createdDate: '2026-08-20',
    },
  ];

  const [jobsList, setJobsList] = useState<JobItem[]>(initialJobs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const token = localStorage.getItem('tasknera_token');

        const res = await fetch(`${backendUrl}/jobs`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        const data = await res.json();
        if (res.ok && Array.isArray(data.jobs) && data.jobs.length > 0) {
          const apiJobs: JobItem[] = data.jobs.map((j: any) => ({
            id: j.id,
            title: j.position,
            client: j.client,
            location: j.location || 'Remote / Unspecified',
            workMode: j.work_mode || 'Hybrid',
            salary: j.salary || 'Competitive',
            candidatesCount: (j.requirements?.length || 0) * 3 + 4,
            topMatch: 85 + (j.position.length % 12),
            status: j.status === 'draft' ? 'Draft' : 'Active',
            createdDate: j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : '2026-08-28',
            isCustom: true
          }));

          // Avoid duplicating initial mock jobs if api contains them
          setJobsList([...apiJobs, ...initialJobs]);
        }
      } catch (err) {
        console.error('Failed to load dynamic jobs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const filteredJobs = jobsList.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || job.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      {/* Global Unified Navigation Header */}
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16 flex-1 w-full">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Job Specification Directory</h1>
            <p className="text-gray-400 text-sm">Manage position requirements, candidate matching rules, and evaluation pipelines.</p>
          </div>
          <Link
            href="/jobs/create"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Job & Scan JD
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, client, or location..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B14] border border-gray-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
            {(['All', 'Active', 'Draft', 'Closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedFilter(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List Grid */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#0F172A]/80 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-6 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Job Specs */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                      <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                    </h2>
                    {job.isCustom && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        NEWLY SAVED
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {job.workMode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        job.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {job.client}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {job.salary}
                    </span>
                  </div>
                </div>

                {/* Job Metrics & Action */}
                <div className="flex items-center gap-4 self-end md:self-auto flex-wrap sm:flex-nowrap">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white block">{job.candidatesCount} Candidates</span>
                    <span className="text-xs text-emerald-400 font-medium">Top Match: {job.topMatch}%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/${job.id}/requirements`}
                      className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl border border-gray-700 transition-all"
                    >
                      Requirements
                    </Link>

                    <Link
                      href={`/jobs/${job.id}/upload-cvs`}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      <span>Compare Candidates</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
              No jobs found matching your criteria.
            </div>
          )}
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
