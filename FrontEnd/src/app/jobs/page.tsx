'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function JobsPage() {
  const jobs = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      candidates: 145,
      newCandidates: 12,
      status: 'Active',
      postedDate: '2 days ago',
      gradient: 'from-primary-500 to-primary-700',
      salary: '$120k - $180k',
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      candidates: 89,
      newCandidates: 8,
      status: 'Active',
      postedDate: '5 days ago',
      gradient: 'from-cyan-500 to-blue-500',
      salary: '$140k - $200k',
    },
    {
      id: 3,
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      candidates: 67,
      newCandidates: 5,
      status: 'Active',
      postedDate: '1 week ago',
      gradient: 'from-emerald-500 to-teal-500',
      salary: '$90k - $130k',
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Austin, TX',
      type: 'Full-time',
      candidates: 52,
      newCandidates: 3,
      status: 'Active',
      postedDate: '3 days ago',
      gradient: 'from-amber-500 to-orange-500',
      salary: '$110k - $160k',
    },
    {
      id: 5,
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Los Angeles, CA',
      type: 'Contract',
      candidates: 34,
      newCandidates: 7,
      status: 'Paused',
      postedDate: '2 weeks ago',
      gradient: 'from-primary-700 to-rose-500',
      salary: '$80k - $120k',
    },
    {
      id: 6,
      title: 'Data Scientist',
      department: 'Analytics',
      location: 'Boston, MA',
      type: 'Full-time',
      candidates: 78,
      newCandidates: 15,
      status: 'Active',
      postedDate: '4 days ago',
      gradient: 'from-blue-500 to-indigo-500',
      salary: '$130k - $190k',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/home" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-white">Tasknera</span>
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
                <Link href="/candidates" className="text-slate-400 hover:text-white transition-colors">Candidates</Link>
                <Link href="/jobs" className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                  Jobs
                </Link>
                <Link href="/analytics" className="text-slate-400 hover:text-white transition-colors">Analytics</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center cursor-pointer">
                <span className="text-white font-semibold">JD</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Job Openings</h1>
            <p className="text-slate-400 text-lg">Manage all your open positions and track applications</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/50">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Post New Job
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Jobs', value: '24', icon: '📋', color: 'from-primary-500 to-primary-700' },
            { label: 'Total Applicants', value: '1,847', icon: '👥', color: 'from-cyan-500 to-blue-500' },
            { label: 'Avg. Time to Hire', value: '18 days', icon: '⏱️', color: 'from-emerald-500 to-teal-500' },
            { label: 'Acceptance Rate', value: '87%', icon: '✅', color: 'from-amber-500 to-orange-500' },
          ].map((stat, i) => (
            <div key={i} className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity rounded-2xl`} />
              <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="group relative">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${job.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity rounded-2xl`} />
              <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all p-6 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${job.gradient} rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/10 flex-shrink-0`}>
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.salary}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-white">{job.candidates}</div>
                        <div className="text-slate-400 text-sm">Candidates</div>
                      </div>
                      {job.newCandidates > 0 && (
                        <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-sm font-medium border border-emerald-500/30">
                          +{job.newCandidates} new
                        </div>
                      )}
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        job.status === 'Active' 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {job.status}
                      </span>
                      <span className="text-slate-500 text-sm ml-auto">Posted {job.postedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-6">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
