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
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Header />

      <main className="max-w-screen-xl mx-auto px-6 pt-20 pb-16 flex-1 w-full">

        {/* Page header */}
        <div className="flex items-center justify-between mb-7 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-charcoal">Dashboard</h1>
            <p className="text-sm text-brand-charcoal-3 mt-0.5">Candidate evaluation overview and pipeline status</p>
          </div>
          <Link
            href="/jobs/create"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-orange"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Job
          </Link>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((k, i) => (
            <div key={i} className="bg-white border border-brand-border rounded-2xl p-5 shadow-card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${k.bgAccent} flex items-center justify-center flex-shrink-0`}>
                  <div className={k.textAccent}>{k.icon}</div>
                </div>
                <span className="text-xs font-medium text-brand-charcoal-3 text-right leading-tight max-w-[100px]">{k.label}</span>
              </div>
              <div className="text-2xl font-bold text-brand-charcoal">{k.value}</div>
              <div className="text-xs text-brand-charcoal-3 mt-1">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick stats bar */}
        <div className="bg-brand-charcoal rounded-2xl px-6 py-4 mb-6 flex flex-wrap items-center gap-6">
          {[
            { label: 'Submit Rate', value: '42%', color: 'text-emerald-400' },
            { label: 'Review Rate', value: '31%', color: 'text-amber-400' },
            { label: 'Reject Rate', value: '27%', color: 'text-red-400' },
            { label: 'Avg Score',   value: '79.2', color: 'text-brand-orange' },
            { label: 'Time to Eval', value: '3 min', color: 'text-blue-400' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col">
              <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-white/50 mt-0.5">{s.label}</span>
            </div>
          ))}
          <div className="ml-auto hidden md:block">
            <span className="text-xs text-white/30">Last 30 days</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Active jobs table */}
          <div className="lg:col-span-2 bg-white border border-brand-border rounded-2xl shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="text-sm font-semibold text-brand-charcoal">Active Jobs</h2>
              <Link href="/jobs" className="text-xs text-brand-orange hover:underline font-medium">View all →</Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Position</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">CVs</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Top Score</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-brand-charcoal-3 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {jobs.map(j => (
                  <tr key={j.id} className="hover:bg-brand-bg transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-brand-charcoal">{j.title}</div>
                      <div className="text-xs text-brand-charcoal-3 mt-0.5">{j.client} · {j.location}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm font-medium text-brand-charcoal">{j.candidates}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-sm font-bold ${scoreColor(j.topScore)}`}>{j.topScore}</span>
                      <span className="text-xs text-brand-charcoal-3">/100</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                        {j.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/jobs/${j.id}/upload-cvs`}
                        className="text-xs text-brand-orange hover:underline font-medium">
                        Evaluate →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Recent evaluations */}
            <div className="bg-white border border-brand-border rounded-2xl shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
                <h2 className="text-sm font-semibold text-brand-charcoal">Recent Evaluations</h2>
                <Link href="/evaluations" className="text-xs text-brand-orange hover:underline font-medium">View all →</Link>
              </div>
              <div className="divide-y divide-brand-border">
                {recent.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-brand-bg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-orange-pale text-brand-orange font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-brand-charcoal leading-tight">{r.name}</div>
                        <div className="text-xs text-brand-charcoal-3">{r.role}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${decisionStyle(r.decision)}`}>
                        {r.decision === 'DO NOT SUBMIT' ? 'REJECT' : r.decision}
                      </span>
                      <div className="text-[11px] text-brand-charcoal-3 mt-0.5">{r.match}/100 · {r.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline funnel */}
            <div className="bg-white border border-brand-border rounded-2xl shadow-card p-5">
              <h2 className="text-sm font-semibold text-brand-charcoal mb-4">Hiring Pipeline</h2>
              <div className="space-y-3">
                {pipeline.map((p, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-brand-charcoal-2">{p.stage}</span>
                      <span className="text-xs font-semibold text-brand-charcoal">{p.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-brand-bg-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p.color}`}
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
