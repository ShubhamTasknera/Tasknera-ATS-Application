'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'scoring' | 'account' | 'notifications'>('scoring');

  const [scoring, setScoring] = useState({
    mandatoryWeight: 50,
    skillsWeight: 20,
    experienceWeight: 15,
    responsibilitiesWeight: 10,
    preferredWeight: 5,
    strictMandatory: true,
    autoRejectOnFailure: true,
    semanticMatching: true,
    minConfidence: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW',
  });

  const [saved, setSaved] = useState(false);
  const totalWeight = scoring.mandatoryWeight + scoring.skillsWeight + scoring.experienceWeight + scoring.responsibilitiesWeight + scoring.preferredWeight;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 'scoring', label: 'Scoring Defaults & Rules' },
    { id: 'account', label: 'Recruiter Profile' },
    { id: 'notifications', label: 'Alerts & Webhooks' },
  ] as const;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />
      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16 flex-1 w-full">

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-orange-pale rounded-full text-xs font-bold text-brand-orange mb-2">
            <span className="w-2 h-2 rounded-full bg-brand-orange" />
            System Governance & ATS Configuration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-charcoal tracking-tight">System Settings</h1>
          <p className="text-sm text-brand-charcoal-3 mt-1">Configure evaluation algorithms, default rule weights, bias guard thresholds, and integrations</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-white border border-brand-border rounded-2xl p-1.5 w-fit mb-8 shadow-xs">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-brand-orange text-white shadow-orange'
                  : 'text-brand-charcoal-2 hover:text-brand-charcoal hover:bg-brand-bg'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* SCORING TAB */}
        {activeTab === 'scoring' && (
          <div className="space-y-6">

            {/* Default Scoring Weights */}
            <div className="bg-white border border-brand-border rounded-3xl p-7 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-brand-charcoal font-bold text-base">Default Category Weights</h2>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${totalWeight === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  Total: {totalWeight}/100 pts
                </span>
              </div>
              <p className="text-brand-charcoal-3 text-xs mb-6">These weights apply to all evaluations unless specifically overridden by a Client Profile.</p>

              <div className="space-y-4">
                {[
                  { label: 'Mandatory Requirements Compliance', key: 'mandatoryWeight', desc: 'Did candidate meet all hard requirements?', color: 'bg-emerald-500' },
                  { label: 'Core Technical Skills Match', key: 'skillsWeight', desc: 'Frameworks, programming languages, and cloud tools', color: 'bg-brand-orange' },
                  { label: 'Relevant Domain Experience', key: 'experienceWeight', desc: 'Years in target industry and seniority depth', color: 'bg-blue-500' },
                  { label: 'Responsibilities Alignment', key: 'responsibilitiesWeight', desc: 'Daily duties and system ownership proof', color: 'bg-purple-500' },
                  { label: 'Preferred & Nice-to-Have Skills', key: 'preferredWeight', desc: 'Secondary bonus qualifications and certs', color: 'bg-amber-500' },
                ].map(row => (
                  <div key={row.key} className="flex items-center gap-4 bg-brand-bg/70 p-4 rounded-2xl border border-brand-border/60">
                    <div className="flex-1">
                      <div className="text-brand-charcoal text-xs font-bold">{row.label}</div>
                      <div className="text-brand-charcoal-3 text-[11px] mt-0.5">{row.desc}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0" max="100"
                        value={scoring[row.key as keyof typeof scoring] as number}
                        onChange={e => setScoring({ ...scoring, [row.key]: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-white border border-brand-border rounded-xl px-2 py-1.5 text-xs font-bold text-brand-charcoal text-center focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                      />
                      <span className="text-brand-charcoal-3 text-xs font-semibold">pts</span>
                    </div>
                    <div className="w-24">
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.color}`}
                          style={{ width: `${Math.min(100, (scoring[row.key as keyof typeof scoring] as number))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalWeight !== 100 && (
                <div className="mt-4 text-red-700 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-semibold">
                  ⚠️ Category weights must total exactly 100 points. Currently: {totalWeight} points.
                </div>
              )}
            </div>

            {/* Evaluation Rules */}
            <div className="bg-white border border-brand-border rounded-3xl p-7 shadow-sm">
              <h2 className="text-brand-charcoal font-bold text-base mb-4">Algorithm & Rule Engine Controls</h2>
              <div className="space-y-4">
                {[
                  { label: 'Strict Mandatory Enforcement', key: 'strictMandatory', desc: 'Any failed mandatory requirement caps candidate match score at 40%' },
                  { label: 'Auto-Disqualify on Mandatory Failure', key: 'autoRejectOnFailure', desc: 'Automatically set candidate decision to DO NOT SUBMIT' },
                  { label: 'Contextual Semantic Matching', key: 'semanticMatching', desc: 'Resolve synonyms (e.g., "GCP" = "Google Cloud Platform", "K8s" = "Kubernetes")' },
                ].map(row => (
                  <div key={row.key} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-brand-bg/70 border border-brand-border/60">
                    <div>
                      <p className="text-brand-charcoal text-xs font-bold">{row.label}</p>
                      <p className="text-brand-charcoal-3 text-[11px] mt-0.5">{row.desc}</p>
                    </div>
                    <button
                      onClick={() => setScoring({ ...scoring, [row.key]: !scoring[row.key as keyof typeof scoring] })}
                      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        scoring[row.key as keyof typeof scoring] ? 'bg-brand-orange' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                        scoring[row.key as keyof typeof scoring] ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-brand-bg/70 border border-brand-border/60">
                  <div>
                    <p className="text-brand-charcoal text-xs font-bold">Evidence Minimum Confidence Filter</p>
                    <p className="text-brand-charcoal-3 text-[11px] mt-0.5">Extracted citations below this threshold will require human recruiter confirmation</p>
                  </div>
                  <select
                    value={scoring.minConfidence}
                    onChange={e => setScoring({ ...scoring, minConfidence: e.target.value as any })}
                    className="bg-white border border-brand-border text-brand-charcoal font-bold text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 cursor-pointer shadow-xs"
                  >
                    <option value="HIGH">High Confidence Only (90%+)</option>
                    <option value="MEDIUM">Medium & Above (75%+)</option>
                    <option value="LOW">All Discovered Evidence</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Match Level Thresholds */}
            <div className="bg-white border border-brand-border rounded-3xl p-7 shadow-sm">
              <h2 className="text-brand-charcoal font-bold text-base mb-1">Standardized Decision Bands</h2>
              <p className="text-brand-charcoal-3 text-xs mb-5">Calibrated candidate recommendation bands</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { range: '90–100%', label: 'STRONG MATCH (SUBMIT)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { range: '80–89%', label: 'GOOD MATCH (SUBMIT)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                  { range: '70–79%', label: 'MANUAL REVIEW', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                  { range: '60–69%', label: 'MARGINAL FIT', color: 'text-orange-700 bg-orange-50 border-orange-200' },
                  { range: 'Below 60%', label: 'DISQUALIFIED', color: 'text-red-700 bg-red-50 border-red-200' },
                ].map((t, i) => (
                  <div key={i} className={`p-3.5 rounded-2xl border ${t.color} flex items-center justify-between text-xs`}>
                    <span className="font-extrabold">{t.range}</span>
                    <span className="font-bold text-[11px]">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={totalWeight !== 100}
                className="flex items-center gap-2 px-7 py-3.5 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg cursor-pointer"
              >
                {saved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Settings Successfully Saved
                  </>
                ) : 'Save System Settings'}
              </button>
            </div>
          </div>
        )}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div className="bg-white border border-brand-border rounded-3xl p-7 shadow-sm space-y-5">
            <h2 className="text-brand-charcoal font-bold text-base mb-4">Recruiter Profile & Organization</h2>
            {[
              { label: 'Full Recruiter Name', placeholder: 'Saksham Recruiter', type: 'text', defaultVal: 'Saksham Recruiter' },
              { label: 'Enterprise Email', placeholder: 'recruiting@tasknera.com', type: 'email', defaultVal: 'recruiting@tasknera.com' },
              { label: 'Company / Agency Name', placeholder: 'TaskNera Talent Acquisition Group', type: 'text', defaultVal: 'TaskNera Talent Group' },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-xs font-bold text-brand-charcoal mb-1.5">{f.label}</label>
                <input type={f.type} defaultValue={f.defaultVal} placeholder={f.placeholder}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange/30" />
              </div>
            ))}
            <div className="pt-5 border-t border-brand-border">
              <h3 className="text-brand-charcoal text-xs font-bold mb-3 uppercase tracking-wider">Security & Access Key</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••••••"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••••••"
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-xs font-semibold text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-orange/30" />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <button className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange cursor-pointer">
                Update Profile & Credentials
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-brand-border rounded-3xl p-7 shadow-sm">
            <h2 className="text-brand-charcoal font-bold text-base mb-5">Automated Alert Dispatch Rules</h2>
            <div className="space-y-4">
              {[
                { label: 'Evaluation Batch Complete', desc: 'Receive instant ping when multi-CV batch finishes scoring' },
                { label: 'Mandatory Requirement Failure Alert', desc: 'Instant flag when a top-tier candidate fails a hard constraint' },
                { label: 'High Match Candidate Discovered (90%+)', desc: 'Highlight top 1% candidates directly to hiring manager' },
                { label: 'Weekly EEOC & Bias Guard Report', desc: 'Aggregated statistical parity audit emailed every Monday' },
                { label: 'Recruiter Decision Override Log', desc: 'Alert when a recruiter changes automated SUBMIT/REJECT status' },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-brand-bg/70 border border-brand-border/60">
                  <div>
                    <p className="text-brand-charcoal text-xs font-bold">{n.label}</p>
                    <p className="text-brand-charcoal-3 text-[11px] mt-0.5">{n.desc}</p>
                  </div>
                  <button className="relative flex-shrink-0 w-11 h-6 rounded-full bg-brand-orange cursor-pointer">
                    <span className="absolute top-0.5 translate-x-5 w-5 h-5 bg-white rounded-full shadow-xs" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange cursor-pointer">
                Save Alert Settings
              </button>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}


