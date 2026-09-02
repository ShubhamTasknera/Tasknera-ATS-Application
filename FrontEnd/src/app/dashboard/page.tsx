'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const scoreColor = (n: number) =>
  n >= 80 ? 'text-green-600' : n >= 65 ? 'text-amber-500' : 'text-red-500';

const decisionStyle = (d: string) =>
  d === 'SUBMIT'
    ? 'bg-status-submit-bg text-status-submit-text border-status-submit-border'
    : d === 'REVIEW'
    ? 'bg-status-review-bg text-status-review-text border-status-review-border'
    : 'bg-status-reject-bg text-status-reject-text border-status-reject-border';

const kpis = [
  {
    label: 'Active Jobs',
    value: '24',
    sub: '+3 this week',
    accent: 'bg-brand-orange',
    textAccent: 'text-brand-orange',
    bgAccent: 'bg-brand-orange-pale',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Candidates Evaluated',
    value: '1,847',
    sub: '+127 this month',
    accent: 'bg-violet-500',
    textAccent: 'text-violet-600',
    bgAccent: 'bg-violet-50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Avg Mandatory Compliance',
    value: '92.4%',
    sub: 'Across all jobs',
    accent: 'bg-emerald-500',
    textAccent: 'text-emerald-600',
    bgAccent: 'bg-emerald-50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Pending Submissions',
    value: '14',
    sub: 'Awaiting review',
    accent: 'bg-amber-500',
    textAccent: 'text-amber-600',
    bgAccent: 'bg-amber-50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const pipeline = [
  { stage: 'Total Evaluated', value: 1847, color: 'bg-brand-charcoal' },
  { stage: 'Submit',          value: 776,  color: 'bg-emerald-500'    },
  { stage: 'Review',          value: 572,  color: 'bg-amber-400'      },
  { stage: 'Do Not Submit',   value: 499,  color: 'bg-red-400'        },
  { stage: 'Submitted',       value: 53,   color: 'bg-blue-500'       },
  { stage: 'Interviewing',    value: 28,   color: 'bg-violet-500'     },
  { stage: 'Selected',        value: 12,   color: 'bg-teal-500'       },
];

const jobs = [
  { id: 'jd-1', title: 'SAP CO Consultant',         client: 'TechCorp Industries',  location: 'New York, NY',      mode: 'Hybrid',  candidates: 42, topScore: 94, status: 'Active' },
  { id: 'jd-2', title: 'Lead S/4HANA Architect',    client: 'Global Logistics Inc', location: 'Chicago, IL',       mode: 'Remote',  candidates: 28, topScore: 88, status: 'Active' },
  { id: 'jd-3', title: 'Financial Systems Analyst',  client: 'Pinnacle Financial',   location: 'San Francisco, CA', mode: 'Onsite',  candidates: 19, topScore: 76, status: 'Active' },
  { id: 'jd-4', title: 'Senior Backend Engineer',    client: 'TaskNera Enterprise',  location: 'Remote',            mode: 'Remote',  candidates: 65, topScore: 91, status: 'Active' },
];

const recent = [
  { name: 'Sarah Mitchell',  role: 'SAP CO Consultant',   match: 94, decision: 'SUBMIT',        time: '2h ago' },
  { name: 'Michael Chen',    role: 'SAP Consultant',       match: 76, decision: 'REVIEW',        time: '5h ago' },
  { name: 'Jennifer Lopez',  role: 'Junior SAP Analyst',  match: 52, decision: 'DO NOT SUBMIT', time: '1d ago' },
  { name: 'David Park',      role: 'Full Stack Developer', match: 88, decision: 'SUBMIT',        time: '1d ago' },
  { name: 'Priya Sharma',    role: 'Full Stack Developer', match: 81, decision: 'SUBMIT',        time: '2d ago' },
];

export default function DashboardPage() {
  const [jobSearch, setJobSearch] = React.useState('');

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.client.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.location.toLowerCase().includes(jobSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-[#1E293B] flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />

      <main className="max-w-screen-xl mx-auto px-6 pt-24 pb-16 flex-1 w-full">

        {/* Page header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange-pale border border-brand-orange-border rounded-full text-xs font-bold text-brand-orange mb-2">
            <span className="w-2 h-2 rounded-full bg-brand-orange" />
            Recruiter Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time candidate intelligence, active requisitions, and submission pipeline</p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {kpis.map((k, i) => (
            <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all card-hover-lift relative overflow-hidden group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${k.bgAccent} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <div className={k.textAccent}>{k.icon}</div>
                </div>
                <span className="text-xs font-bold text-slate-500 text-right leading-tight">{k.label}</span>
              </div>
              <div className="text-3xl font-extrabold text-[#1E293B] tracking-tight">{k.value}</div>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>{k.sub}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                  ↑ 12%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* High-Impact Performance Metrics Bar */}
        <div className="bg-[#1E293B] rounded-3xl p-6 mb-8 shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="text-xs uppercase tracking-widest text-brand-orange font-bold mb-1">Key Performance Ratios</div>
              <div className="text-sm text-slate-300">Deterministic evaluation analytics across all active requisitions</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {[
                { label: 'Submit Rate', value: '42.0%', color: 'text-emerald-400' },
                { label: 'Review Rate', value: '31.0%', color: 'text-amber-400' },
                { label: 'Reject Rate', value: '27.0%', color: 'text-rose-400' },
                { label: 'Avg Match Score', value: '79.2', color: 'text-brand-orange' },
                { label: 'Median Turnaround', value: '3.2 min', color: 'text-blue-400' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className={`text-xl font-extrabold ${s.color}`}>{s.value}</span>
                  <span className="text-[11px] font-medium text-slate-300 mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Active jobs table */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 sm:px-6 sm:py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">Active Requisitions & JDs</h2>
                <p className="text-xs text-slate-500 mt-0.5">Click a position to review requirements or batch evaluate CVs</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Filter positions..."
                  value={jobSearch}
                  onChange={e => setJobSearch(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 w-44"
                />
                <Link href="/jobs" className="text-xs text-brand-orange font-bold hover:underline whitespace-nowrap">
                  All ({jobs.length}) →
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F1F5F9] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Position & Client</th>
                    <th className="px-4 py-3.5 text-center">Applicants</th>
                    <th className="px-4 py-3.5 text-center">Top Match</th>
                    <th className="px-4 py-3.5 text-center">Mode</th>
                    <th className="px-6 py-3.5 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredJobs.map(j => (
                    <tr key={j.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/jobs/${j.id}/requirements`} className="text-sm font-bold text-[#1E293B] group-hover:text-brand-orange transition-colors">
                          {j.title}
                        </Link>
                        <div className="text-xs text-slate-500 mt-0.5">{j.client} • {j.location}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-[#1E293B]">{j.candidates}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`font-extrabold ${scoreColor(j.topScore)}`}>{j.topScore}</span>
                        <span className="text-xs text-slate-400 font-semibold">/100</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
                          {j.mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/jobs/${j.id}/candidates`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-orange-pale hover:bg-brand-orange hover:text-white text-brand-orange text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          Evaluate CVs →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Recent evaluations */}
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
                <h2 className="text-sm font-bold text-[#1E293B]">Recent Evaluations</h2>
                <Link href="/evaluations" className="text-xs text-brand-orange font-bold hover:underline">View All →</Link>
              </div>
              <div className="divide-y divide-slate-100">
                {recent.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-orange-pale text-brand-orange font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#1E293B] truncate">{r.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{r.role}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${decisionStyle(r.decision)}`}>
                        {r.decision === 'DO NOT SUBMIT' ? 'REJECT' : r.decision}
                      </span>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">{r.match}% • {r.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline funnel */}
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#1E293B]">Recruitment Pipeline</h2>
                <span className="text-xs text-slate-500">1,847 total</span>
              </div>
              <div className="space-y-3.5">
                {pipeline.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-semibold text-slate-600">{p.stage}</span>
                      <span className="font-bold text-[#1E293B]">{p.value.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.color} transition-all duration-700`}
                        style={{ width: `${Math.min((p.value / 1847) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
