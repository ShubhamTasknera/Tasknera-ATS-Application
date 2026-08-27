'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const candidates = [
    { id: 1, name: 'Sarah Johnson', role: 'Senior Developer', email: 'sarah.j@email.com', phone: '+1 234 567 890', status: 'Interview', match: 98, location: 'San Francisco, CA', experience: '8 years', avatar: 'S', color: 'from-primary-500 to-primary-700', skills: ['React', 'Node.js', 'TypeScript', 'AWS'] },
    { id: 2, name: 'Michael Chen', role: 'Product Manager', email: 'michael.c@email.com', phone: '+1 234 567 891', status: 'Review', match: 95, location: 'New York, NY', experience: '6 years', avatar: 'M', color: 'from-cyan-500 to-blue-500', skills: ['Strategy', 'Analytics', 'Agile', 'Roadmapping'] },
    { id: 3, name: 'Emily Rodriguez', role: 'UX Designer', email: 'emily.r@email.com', phone: '+1 234 567 892', status: 'Shortlisted', match: 92, location: 'Austin, TX', experience: '5 years', avatar: 'E', color: 'from-emerald-500 to-teal-500', skills: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'] },
    { id: 4, name: 'David Kim', role: 'Backend Engineer', email: 'david.k@email.com', phone: '+1 234 567 893', status: 'New', match: 89, location: 'Seattle, WA', experience: '7 years', avatar: 'D', color: 'from-amber-500 to-orange-500', skills: ['Python', 'Django', 'PostgreSQL', 'Docker'] },
    { id: 5, name: 'Lisa Wang', role: 'Frontend Developer', email: 'lisa.w@email.com', phone: '+1 234 567 894', status: 'Offer', match: 96, location: 'Los Angeles, CA', experience: '4 years', avatar: 'L', color: 'from-primary-700 to-rose-500', skills: ['Vue.js', 'CSS', 'JavaScript', 'Tailwind'] },
    { id: 6, name: 'James Wilson', role: 'Data Scientist', email: 'james.w@email.com', phone: '+1 234 567 895', status: 'Interview', match: 91, location: 'Boston, MA', experience: '5 years', avatar: 'J', color: 'from-blue-500 to-indigo-500', skills: ['Python', 'ML', 'TensorFlow', 'SQL'] },
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
                <Link href="/candidates" className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  Candidates
                </Link>
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Candidates</h1>
          <p className="text-slate-400 text-lg">Manage and review all candidate applications</p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search candidates by name, role, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'new', 'review', 'interview', 'offer'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all capitalize ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Upload Button */}
            <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:scale-105 transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload
            </button>
          </div>
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="group relative">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${candidate.color} opacity-0 group-hover:opacity-30 blur-xl transition-opacity rounded-2xl`} />
              <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all p-6 cursor-pointer h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 bg-gradient-to-br ${candidate.color} rounded-xl flex items-center justify-center shadow-lg ring-2 ring-white/10`}>
                      <span className="text-white font-bold text-xl">{candidate.avatar}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg group-hover:text-primary-300 transition-colors">{candidate.name}</h3>
                      <p className="text-slate-400 text-sm">{candidate.role}</p>
                    </div>
                  </div>
                </div>

                {/* Match Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm">Match Score</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{candidate.match}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${candidate.color} transition-all duration-1000`}
                      style={{ width: `${candidate.match}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {candidate.location}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {candidate.experience}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-white/10 text-slate-300 rounded-lg text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 3 && (
                      <span className="px-2 py-1 bg-white/5 text-slate-500 rounded-lg text-xs font-medium">
                        +{candidate.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    candidate.status === 'Interview' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    candidate.status === 'Review' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    candidate.status === 'Shortlisted' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    candidate.status === 'Offer' ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' :
                    'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}>
                    {candidate.status}
                  </span>
                  <button className="text-primary-400 hover:text-primary-300 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
