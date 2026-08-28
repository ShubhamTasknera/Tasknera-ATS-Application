'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';

const HeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleActionClick = (targetPath: string) => {
    if (isAuthenticated) {
      router.push(targetPath);
    } else {
      setAuthModalOpen(true);
    }
  };

  const candidates = [
    {
      name: 'Sarah Mitchell',
      role: 'SAP CO Consultant',
      match: 94,
      decision: 'SUBMIT',
      decisionColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      skills: ['SAP CO', 'S/4HANA', 'Manufacturing'],
      mandatory: '5/5',
    },
    {
      name: 'Michael Chen',
      role: 'SAP Consultant',
      match: 76,
      decision: 'REVIEW',
      decisionColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      skills: ['SAP FI', 'SAP CO', 'S/4HANA'],
      mandatory: '4/5',
    },
    {
      name: 'Jennifer Lopez',
      role: 'Junior SAP Analyst',
      match: 52,
      decision: 'DO NOT SUBMIT',
      decisionColor: 'text-red-400 bg-red-400/10 border-red-400/30',
      skills: ['SAP CO', 'Excel'],
      mandatory: '1/5',
    },
  ];

  const steps = [
    { num: '01', title: 'Upload JD', desc: 'Paste or upload your job description', color: 'text-blue-400', border: 'border-blue-400/30 bg-blue-400/5' },
    { num: '02', title: 'Review Requirements', desc: 'Confirm mandatory vs preferred', color: 'text-indigo-400', border: 'border-indigo-400/30 bg-indigo-400/5' },
    { num: '03', title: 'Upload CVs', desc: 'Single or bulk upload', color: 'text-gray-400', border: 'border-gray-600/40 bg-gray-700/20' },
    { num: '04', title: 'Get Scores', desc: 'Evidence-based, deterministic', color: 'text-gray-400', border: 'border-gray-600/40 bg-gray-700/20' },
  ];

  return (
    <section className="relative min-h-screen bg-[#060C1A] overflow-hidden">

      {/* Subtle background grid */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Single subtle blue glow — top left only */}
      <div className="absolute top-0 left-0 w-[600px] h-[400px] bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-24">

        {/* Top badge */}
        <div className={`flex justify-center mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-800/80 border border-gray-700 text-gray-300 text-xs font-medium tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Standardized Candidate–JD Matching & Submission Evaluation
          </div>
        </div>

        {/* Main headline */}
        <div className={`text-center mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            <span className="text-white">Evaluate Candidates</span>
            <br />
            <span className="text-white">With </span>
            <span className="text-blue-400">Evidence.</span>
            <span className="text-gray-500"> Not Guesswork.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            A fixed scoring framework that produces the same result every time.
            Every score is backed by evidence extracted directly from the CV.
          </p>
        </div>

        {/* CTAs */}
        <div className={`flex items-center justify-center gap-4 mb-20 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => handleActionClick('/jobs/create')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-900/40 text-sm"
          >
            Start Evaluating
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button
            onClick={() => handleActionClick('/dashboard')}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg transition-colors border border-gray-700 text-sm"
          >
            View Dashboard
          </button>
        </div>

        {/* Workflow Steps */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-20 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {steps.map((step, i) => (
            <div key={i} className={`rounded-xl p-4 border ${step.border}`}>
              <div className={`text-xs font-bold mb-2 ${step.color}`}>{step.num}</div>
              <div className="text-white text-sm font-semibold mb-1">{step.title}</div>
              <div className="text-gray-500 text-xs leading-relaxed">{step.desc}</div>
            </div>
          ))}
        </div>

        {/* Candidate Cards — demo output */}
        <div className={`transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Section label */}
          <div className="flex items-center gap-3 mb-5 max-w-5xl mx-auto">
            <div className="h-px flex-1 bg-gray-800" />
            <span className="text-gray-600 text-xs font-medium tracking-widest uppercase">Live Evaluation Output</span>
            <div className="h-px flex-1 bg-gray-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {candidates.map((c, i) => (
              <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">

                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300 font-bold text-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">{c.name}</div>
                      <div className="text-gray-500 text-xs">{c.role}</div>
                    </div>
                  </div>
                  {/* Score circle */}
                  <div className="text-right">
                    <div className={`text-xl font-bold ${c.match >= 80 ? 'text-white' : c.match >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
                      {c.match}
                    </div>
                    <div className="text-gray-600 text-xs">/100</div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="w-full h-1.5 bg-gray-800 rounded-full mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      c.match >= 80 ? 'bg-blue-500' : c.match >= 65 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${c.match}%` }}
                  />
                </div>

                {/* Mandatory */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 text-xs">Mandatory</span>
                  <span className="text-gray-300 text-xs font-semibold">{c.mandatory}</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.skills.map((s, j) => (
                    <span key={j} className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-gray-400 text-xs">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Decision */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${c.decisionColor}`}>
                  {c.decision}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className={`mt-20 flex flex-wrap items-center justify-center gap-12 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {[
            { value: '100%', label: 'Deterministic Scoring' },
            { value: 'Evidence-Based', label: 'Every match explained' },
            { value: 'No AI Guessing', label: 'Fixed framework always' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-white font-bold text-xl mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signin"
      />
    </section>
  );
};

export default HeroSection;
