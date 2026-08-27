'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const stats = [
    {
      label: 'Active Jobs',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      label: 'Total Candidates',
      value: '1,847',
      change: '+127',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      label: 'Interviews Today',
      value: '18',
      change: '+5',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      label: 'Offers Pending',
      value: '7',
      change: '+2',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  const recentCandidates = [
    { name: 'Sarah Johnson', role: 'Senior Developer', status: 'Interview', match: 98, time: '2h ago', avatar: 'S', color: 'from-primary-500 to-primary-700' },
    { name: 'Michael Chen', role: 'Product Manager', status: 'Review', match: 95, time: '5h ago', avatar: 'M', color: 'from-cyan-500 to-blue-500' },
    { name: 'Emily Rodriguez', role: 'UX Designer', status: 'Shortlisted', match: 92, time: '1d ago', avatar: 'E', color: 'from-emerald-500 to-teal-500' },
    { name: 'David Kim', role: 'Backend Engineer', status: 'New', match: 89, time: '2d ago', avatar: 'D', color: 'from-amber-500 to-orange-500' },
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
                <Link href="/dashboard" className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Dashboard
                </Link>
                <Link href="/candidates" className="text-slate-400 hover:text-white transition-colors">Candidates</Link>
                <Link href="/jobs" className="text-slate-400 hover:text-white transition-colors">Jobs</Link>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, John! 👋</h1>
          <p className="text-slate-400 text-lg">Here's what's happening with your recruitment today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="group relative">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-30 blur-xl transition-opacity rounded-2xl`} />
              <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    {stat.icon}
                  </div>
                  <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {stat.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Candidates */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Recent Candidates</h2>
                <Link href="/candidates" className="text-primary-400 hover:text-primary-300 text-sm font-medium flex items-center gap-1">
                  View all
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="divide-y divide-white/5">
                {recentCandidates.map((candidate, i) => (
                  <div key={i} className="p-6 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`relative w-14 h-14 bg-gradient-to-br ${candidate.color} rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/10`}>
                          <span className="text-white font-bold text-lg">{candidate.avatar}</span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold group-hover:text-primary-300 transition-colors">{candidate.name}</h3>
                          <p className="text-slate-400 text-sm">{candidate.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{candidate.match}%</div>
                          <div className="text-slate-500 text-xs">Match</div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          candidate.status === 'Interview' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          candidate.status === 'Review' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          candidate.status === 'Shortlisted' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                        }`}>
                          {candidate.status}
                        </span>
                        <span className="text-slate-500 text-sm">{candidate.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full p-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-700 text-white font-semibold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Post New Job
                </button>
                <button className="w-full p-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Resumes
                </button>
                <button className="w-full p-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Analytics
                </button>
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Today's Interviews</h2>
              <div className="space-y-4">
                {[
                  { time: '10:00 AM', name: 'Sarah Johnson', role: 'Senior Developer' },
                  { time: '2:00 PM', name: 'Michael Chen', role: 'Product Manager' },
                  { time: '4:30 PM', name: 'Emily Rodriguez', role: 'UX Designer' },
                ].map((interview, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl hover:bg-white/[0.05] transition-colors">
                    <div className="text-primary-400 font-bold text-sm">{interview.time}</div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{interview.name}</div>
                      <div className="text-slate-500 text-xs">{interview.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
