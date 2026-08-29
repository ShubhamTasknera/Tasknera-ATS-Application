'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ReportsPage() {
  const [period, setPeriod] = useState('30');

  const stats = [
    { label: 'Total Evaluated', value: '1,847', sub: 'Across 24 jobs', color: 'text-brand-charcoal' },
    { label: 'Submit Rate', value: '42.0%', sub: '776 candidates', color: 'text-emerald-600' },
    { label: 'Review Rate', value: '31.0%', sub: '572 candidates', color: 'text-amber-600' },
    { label: 'Rejection Rate', value: '27.0%', sub: '499 candidates', color: 'text-red-500' },
    { label: 'Avg Match Score', value: '79.2%', sub: 'Deterministic mean', color: 'text-brand-orange' },
    { label: 'Mandatory Met', value: '92.4%', sub: 'Hard rules compliance', color: 'text-purple-600' },
  ];

  const pipeline = [
    { stage: 'Submitted to Client', count: 776, color: 'bg-emerald-500', max: 776 },
    { stage: 'Client Interview Stage', count: 312, color: 'bg-blue-500', max: 776 },
    { stage: 'Technical Assessment', count: 184, color: 'bg-indigo-500', max: 776 },
    { stage: 'Final Offers Issued', count: 142, color: 'bg-teal-500', max: 776 },
  ];

  const topJobs = [
    { title: 'SAP CO Lead Consultant', company: 'TechCorp Industries', evaluated: 42, avgScore: 84, submitted: 18 },
    { title: 'Lead S/4HANA Architect', company: 'Global Logistics Inc', evaluated: 28, avgScore: 81, submitted: 12 },
    { title: 'Senior Backend Engineer', company: 'TaskNera Enterprise', evaluated: 65, avgScore: 88, submitted: 26 },
    { title: 'Financial Systems Analyst', company: 'Pinnacle Financial', evaluated: 19, avgScore: 76, submitted: 7 },
  ];

  const exports = [
    { label: 'Candidate Ranking Matrix (CSV)', desc: 'Full candidate cohort sorted by deterministic match index and mandatory status', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'Executive Evaluation Dossier (PDF)', desc: 'Client-ready summary with direct CV citations and confidence breakdown', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { label: 'Submission Recommendation Pack', desc: 'SUBMIT decisions packaged with verified evidence for hiring manager review', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Mandatory Compliance & Disqualification Log', desc: 'Full audit of candidates failing hard requirements with exact reason codes', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { label: 'EEOC & Bias Guard Audit Trail', desc: 'Statistical parity logs and anonymized screening audit for compliance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Cross-Requisition Talent Pool (Excel)', desc: 'Complete database of all evaluated profiles with contact and skill indexes', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />
      <main className="max-w-screen-xl mx-auto px-6 pt-24 pb-16 flex-1 w-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange-pale rounded-full text-xs font-bold text-brand-orange mb-2">
              <span className="w-2 h-2 rounded-full bg-brand-orange" />
              Reporting & Export Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">Recruitment Reports</h1>
            <p className="text-sm text-brand-charcoal-3 mt-1">Generate client submission dossiers, ranking matrices, and regulatory compliance audits</p>
          </div>
          
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white border border-brand-border rounded-xl text-xs font-bold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange/30 shadow-xs"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time records</option>
          </select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white border border-brand-border rounded-2xl p-4 shadow-sm card-hover-lift">
              <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-brand-charcoal text-xs font-bold">{s.label}</div>
              <div className="text-brand-charcoal-3 text-[11px] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

          {/* Pipeline Funnel */}
          <div className="lg:col-span-4 bg-white border border-brand-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-brand-charcoal font-bold text-sm mb-4">Submission Conversion Funnel</h2>
            <div className="space-y-4">
              {pipeline.map((p, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="text-brand-charcoal-2 font-medium">{p.stage}</span>
                    <span className="text-brand-charcoal font-bold">{p.count}</span>
                  </div>
                  <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${p.color} transition-all duration-700`} style={{ width: `${(p.count / p.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Jobs */}
          <div className="lg:col-span-8 bg-white border border-brand-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-brand-charcoal font-bold text-sm mb-4">Top Position Pipelines</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-[11px] font-bold text-brand-charcoal-3 uppercase tracking-wider">
                    <th className="pb-3">Requisition</th>
                    <th className="text-center pb-3">Evaluated</th>
                    <th className="text-center pb-3">Mean Score</th>
                    <th className="text-right pb-3">Submitted to Client</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {topJobs.map((j, i) => (
                    <tr key={i} className="hover:bg-brand-bg/50 transition-colors">
                      <td className="py-3.5">
                        <div className="text-brand-charcoal font-bold text-xs sm:text-sm">{j.title}</div>
                        <div className="text-brand-charcoal-3 text-xs">{j.company}</div>
                      </td>
                      <td className="py-3.5 text-center text-brand-charcoal font-semibold">{j.evaluated}</td>
                      <td className="py-3.5 text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          j.avgScore >= 80 ? 'bg-emerald-50 text-emerald-700' : j.avgScore >= 65 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {j.avgScore}%
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-600">{j.submitted} profiles</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Export Tools */}
        <div className="bg-white border border-brand-border rounded-3xl p-7 shadow-sm">
          <div className="mb-6 pb-4 border-b border-brand-border">
            <h2 className="text-base font-bold text-brand-charcoal">One-Click Client & Compliance Export Tools</h2>
            <p className="text-xs text-brand-charcoal-3 mt-0.5">Download formatted CSV rankings, PDF evidence dossiers, and auditable spreadsheets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exports.map((e, i) => (
              <button
                key={i}
                className="flex items-start gap-4 p-5 bg-brand-bg hover:bg-brand-orange-pale/40 border border-brand-border hover:border-brand-orange-border rounded-2xl transition-all text-left group card-hover-lift"
              >
                <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-brand-orange text-brand-orange group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={e.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-brand-charcoal text-xs font-bold group-hover:text-brand-orange transition-colors leading-tight mb-1">{e.label}</p>
                  <p className="text-brand-charcoal-3 text-[11px] leading-relaxed">{e.desc}</p>
                </div>
                <svg className="w-4 h-4 text-brand-charcoal-3 group-hover:text-brand-orange transition-colors flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

