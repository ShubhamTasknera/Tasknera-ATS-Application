'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const candidates = [
    { id: 1, name: 'Sarah Mitchell', role: 'SAP CO Consultant', email: 'sarah.m@email.com', phone: '+1 234 567 890', status: 'Submitted', match: 94, location: 'New York, NY', experience: '8 years', avatar: 'S', skills: ['SAP CO', 'S/4HANA', 'Manufacturing'] },
    { id: 2, name: 'Michael Chen', role: 'SAP Consultant', email: 'michael.c@email.com', phone: '+1 234 567 891', status: 'Review', match: 76, location: 'Chicago, IL', experience: '6 years', avatar: 'M', skills: ['SAP FI', 'SAP CO', 'S/4HANA'] },
    { id: 3, name: 'Emily Rodriguez', role: 'UX Designer', email: 'emily.r@email.com', phone: '+1 234 567 892', status: 'Shortlisted', match: 92, location: 'Austin, TX', experience: '5 years', avatar: 'E', skills: ['Figma', 'UI/UX', 'Design Systems'] },
    { id: 4, name: 'David Kim', role: 'Backend Engineer', email: 'david.k@email.com', phone: '+1 234 567 893', status: 'New', match: 89, location: 'Seattle, WA', experience: '7 years', avatar: 'D', skills: ['Node.js', 'PostgreSQL', 'Docker'] },
    { id: 5, name: 'Jennifer Lopez', role: 'Junior SAP Analyst', email: 'jennifer.l@email.com', phone: '+1 234 567 894', status: 'Do Not Submit', match: 52, location: 'Los Angeles, CA', experience: '2 years', avatar: 'J', skills: ['SAP CO', 'Excel'] },
  ];

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      {/* Global Unified Navigation Header */}
      <Header />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16 flex-1 w-full">
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Candidate Intelligence Directory</h1>
            <p className="text-gray-400 text-sm">Deterministic candidate scoring, CV evidence extractions, and submission decisions.</p>
          </div>
          <Link
            href="/jobs/create"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            + Evaluate New CVs
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-4 mb-8 shadow-xl">
          <div className="relative w-full max-w-md">
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidates by name or role..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#070B14] border border-gray-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Candidate List */}
        <div className="space-y-4">
          {filteredCandidates.map((c) => (
            <div
              key={c.id}
              className="bg-[#0F172A]/80 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-6 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800 text-white font-bold text-base flex items-center justify-center border border-gray-700">
                  {c.avatar}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-0.5">{c.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">{c.role} • {c.location} ({c.experience})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-gray-800/80 text-gray-300 text-[11px] border border-gray-700/60">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end md:self-auto">
                <div className="text-right">
                  <div className={`text-xl font-bold ${c.match >= 80 ? 'text-emerald-400' : c.match >= 65 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {c.match}% Match
                  </div>
                  <div className="text-[11px] text-gray-400">Evidence Verified</div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  c.match >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  c.match >= 65 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
