'use client';

import React from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
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
                <Link href="/jobs" className="text-slate-400 hover:text-white transition-colors">Jobs</Link>
                <Link href="/analytics" className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm font-medium transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Last 30 Days
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400 text-lg">Track your recruitment metrics and performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Hires', 
              value: '142', 
              change: '+23%', 
              trend: 'up',
              icon: '✅',
              gradient: 'from-emerald-500 to-teal-500'
            },
            { 
              label: 'Time to Hire', 
              value: '18 days', 
              change: '-12%', 
              trend: 'up',
              icon: '⚡',
              gradient: 'from-cyan-500 to-blue-500'
            },
            { 
              label: 'Acceptance Rate', 
              value: '87%', 
              change: '+5%', 
              trend: 'up',
              icon: '🎯',
              gradient: 'from-primary-500 to-primary-700'
            },
            { 
              label: 'Cost per Hire', 
              value: '$2.4k', 
              change: '-8%', 
              trend: 'up',
              icon: '💰',
              gradient: 'from-amber-500 to-orange-500'
            },
          ].map((metric, i) => (
            <div key={i} className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${metric.gradient} opacity-0 group-hover:opacity-30 blur-xl transition-opacity rounded-2xl`} />
              <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{metric.icon}</div>
                  <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {metric.change}
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-slate-400 text-sm">{metric.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hiring Funnel */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Hiring Funnel</h2>
            <div className="space-y-4">
              {[
                { stage: 'Applications', count: 1847, percentage: 100, color: 'from-primary-500 to-primary-700' },
                { stage: 'Screening', count: 892, percentage: 48, color: 'from-cyan-500 to-blue-500' },
                { stage: 'Interviews', count: 234, percentage: 13, color: 'from-emerald-500 to-teal-500' },
                { stage: 'Offers', count: 67, percentage: 4, color: 'from-amber-500 to-orange-500' },
                { stage: 'Hired', count: 52, percentage: 3, color: 'from-primary-700 to-rose-500' },
              ].map((stage, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{stage.stage}</span>
                    <span className="text-slate-400 text-sm">{stage.count} ({stage.percentage}%)</span>
                  </div>
                  <div className="h-10 bg-white/5 rounded-xl overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stage.color} transition-all duration-1000 flex items-center justify-end px-4`}
                      style={{ width: `${stage.percentage}%` }}
                    >
                      <span className="text-white text-sm font-semibold">{stage.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Performance */}
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Top Sources</h2>
            <div className="space-y-4">
              {[
                { source: 'LinkedIn', candidates: 687, hires: 34, color: 'from-blue-500 to-indigo-500' },
                { source: 'Indeed', candidates: 423, hires: 21, color: 'from-emerald-500 to-teal-500' },
                { source: 'Referrals', candidates: 312, hires: 45, color: 'from-primary-500 to-primary-700' },
                { source: 'Company Website', candidates: 267, hires: 18, color: 'from-amber-500 to-orange-500' },
                { source: 'Glassdoor', candidates: 158, hires: 12, color: 'from-cyan-500 to-blue-500' },
              ].map((source, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${source.color} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{source.source}</span>
                      <span className="text-slate-400 text-sm">{source.candidates} candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${source.color}`}
                          style={{ width: `${(source.hires / source.candidates) * 100}%` }}
                        />
                      </div>
                      <span className="text-emerald-400 text-sm font-semibold">{source.hires} hires</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Department Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { dept: 'Engineering', openings: 12, hires: 45, avgTime: '16d', color: 'from-primary-500 to-primary-700' },
              { dept: 'Product', openings: 5, hires: 18, avgTime: '22d', color: 'from-cyan-500 to-blue-500' },
              { dept: 'Design', openings: 3, hires: 12, avgTime: '19d', color: 'from-emerald-500 to-teal-500' },
              { dept: 'Marketing', openings: 7, hires: 24, avgTime: '15d', color: 'from-amber-500 to-orange-500' },
              { dept: 'Sales', openings: 8, hires: 32, avgTime: '12d', color: 'from-primary-700 to-rose-500' },
            ].map((dept, i) => (
              <div key={i} className="relative group">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${dept.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity rounded-2xl`} />
                <div className="relative bg-white/[0.02] rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${dept.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{dept.hires}</span>
                  </div>
                  <h3 className="text-white font-semibold mb-3">{dept.dept}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Open:</span>
                      <span className="text-white font-medium">{dept.openings}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Avg Time:</span>
                      <span className="text-white font-medium">{dept.avgTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
