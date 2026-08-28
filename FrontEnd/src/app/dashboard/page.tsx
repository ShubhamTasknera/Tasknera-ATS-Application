'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const stats = [
    {
      label: 'Active Jobs',
      value: '24',
      change: '+3 this week',
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      badgeBg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Candidates Evaluated',
      value: '1,847',
      change: '+127 candidates',
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badgeBg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      label: 'Mandatory Requirements Met',
      value: '92.4%',
      change: 'Deterministic Match',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badgeBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Pending Submissions',
      value: '14',
      change: 'Ready for Review',
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badgeBg: 'bg-amber-500/10 border-amber-500/20',
    },
  ];

  const activeJobsList = [
    {
      id: 'job-1',
      title: 'Senior SAP CO Consultant',
      client: 'TechCorp Industries',
      location: 'New York, NY',
      workMode: 'Hybrid',
      candidates: 42,
      topMatch: 94,
      status: 'Active',
      updated: '2 hours ago',
    },
    {
      id: 'job-2',
      title: 'Lead S/4HANA Architect',
      client: 'Global Logistics Inc',
      location: 'Chicago, IL',
      workMode: 'Remote',
      candidates: 28,
      topMatch: 88,
      status: 'Active',
      updated: '5 hours ago',
    },
    {
      id: 'job-3',
      title: 'Financial Systems Analyst',
      client: 'Pinnacle Financial',
      location: 'San Francisco, CA',
      workMode: 'Onsite',
      candidates: 19,
      topMatch: 76,
      status: 'Active',
      updated: '1 day ago',
    },
  ];

  const recentCandidates = [
    { name: 'Sarah Mitchell', role: 'SAP CO Consultant', match: 94, decision: 'SUBMIT', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', time: '2h ago' },
    { name: 'Michael Chen', role: 'SAP Consultant', match: 76, decision: 'REVIEW', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', time: '5h ago' },
    { name: 'Jennifer Lopez', role: 'Junior SAP Analyst', match: 52, decision: 'REJECT', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', time: '1d ago' },
  ];

  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      {/* Global Unified Navigation */}
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16 flex-1 w-full">
        {/* Dashboard Title & Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Recruiter Dashboard</h1>
            <p className="text-gray-400 text-sm">Real-time candidate evaluation, job pipelines, and submission intelligence.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/jobs/create"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Job
            </Link>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2 rounded-xl border ${stat.badgeBg}`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Job Pipelines (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <h2 className="text-lg font-semibold text-white">Active Job Pipelines</h2>
                </div>
                <Link href="/jobs" className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1">
                  View All Jobs
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <div className="space-y-4">
                {activeJobsList.map((job) => (
                  <div key={job.id} className="p-4 rounded-xl bg-[#070B14] border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1">
                        <h3 className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                          <Link href={`/jobs/${job.id}/requirements`}>{job.title}</Link>
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {job.workMode}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        <span>{job.client}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="text-white font-semibold block">{job.candidates} Candidates</span>
                        <span className="text-gray-400 text-[11px]">Top Match: {job.topMatch}%</span>
                      </div>
                      <Link
                        href={`/jobs/${job.id}/requirements`}
                        className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium transition-colors border border-gray-700"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Evaluations Side Panel (1 col) */}
          <div className="space-y-6">
            <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold text-white">Recent Match Decisions</h2>
                <Link href="/candidates" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {recentCandidates.map((c, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#070B14] border border-gray-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 text-gray-300 font-bold text-xs flex items-center justify-center">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.role}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${c.color} mb-0.5`}>
                        {c.decision} ({c.match}%)
                      </span>
                      <span className="text-[10px] text-gray-500 block">{c.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Create Job Card */}
            <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20 rounded-2xl p-6 text-center">
              <h3 className="text-base font-semibold text-white mb-1">Need to Post a Position?</h3>
              <p className="text-xs text-gray-400 mb-4">Create a new job specification to extract evidence-based criteria.</p>
              <Link
                href="/jobs/create"
                className="inline-flex items-center justify-center w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
              >
                + Post New Job
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
