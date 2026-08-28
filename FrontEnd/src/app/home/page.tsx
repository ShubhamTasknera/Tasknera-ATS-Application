'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleCtaClick = (targetPath: string) => {
    if (isAuthenticated) {
      router.push(targetPath);
    } else {
      setAuthModalOpen(true);
    }
  };
  const features = [
    {
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms analyze resumes and match candidates with unprecedented accuracy.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      gradient: 'from-primary-500 via-purple-500 to-primary-700',
      iconGradient: 'from-primary-400 to-primary-700',
    },
    {
      title: 'Smart Pipeline',
      description: 'Automated workflows that move candidates through stages intelligently.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      iconGradient: 'from-cyan-400 to-blue-400',
    },
    {
      title: 'Team Collaboration',
      description: 'Real-time collaboration tools for seamless hiring team coordination.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      iconGradient: 'from-emerald-400 to-teal-400',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Deep insights into your hiring metrics with beautiful visualizations.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      iconGradient: 'from-amber-400 to-orange-400',
    },
    {
      title: 'Automated Screening',
      description: 'Let AI handle initial screening while you focus on top candidates.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-primary-700 via-rose-500 to-red-500',
      iconGradient: 'from-primary-700 to-rose-400',
    },
    {
      title: 'Global Integration',
      description: 'Connect with 100+ tools including Slack, LinkedIn, and email platforms.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      gradient: 'from-blue-500 via-indigo-500 to-primary-500',
      iconGradient: 'from-blue-400 to-indigo-400',
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950">
      <Header />
      
      <main>
        <HeroSection />
        
        {/* Enterprise Features Section */}
        <section id="features" className="relative py-20 md:py-24 overflow-hidden border-b border-slate-800/50">
          {/* Subtle Ambient Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Built for Modern Recruiting</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
                Everything You Need to <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Hire Better</span>
              </h2>

              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Powerful tools designed to streamline your recruitment process from sourcing to offer.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* 1. AI-Powered Matching */}
              <div className="group relative flex flex-col justify-between bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 rounded-2xl p-6 lg:p-8 transition-all duration-200 ease-out hover:-translate-y-1.5 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/5">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-2 group-hover:text-blue-300 transition-colors">
                    AI-Powered Matching
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Analyze resumes against job requirements and surface the strongest candidates automatically.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Match Accuracy</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">94.8% Score</span>
                </div>
              </div>

              {/* 2. Smart Pipeline */}
              <div className="group relative flex flex-col justify-between bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 rounded-2xl p-6 lg:p-8 transition-all duration-200 ease-out hover:-translate-y-1.5 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/5">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-2 group-hover:text-cyan-300 transition-colors">
                    Smart Pipeline
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Automated workflows that move candidates through screening stages intelligently.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                    <span>Pipeline Progress</span>
                    <span className="text-cyan-400 font-normal">Automated</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    <div className="h-1.5 rounded-full bg-cyan-500" />
                    <div className="h-1.5 rounded-full bg-cyan-500" />
                    <div className="h-1.5 rounded-full bg-cyan-500/60" />
                    <div className="h-1.5 rounded-full bg-slate-800" />
                  </div>
                </div>
              </div>

              {/* 3. Team Collaboration */}
              <div className="group relative flex flex-col justify-between bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 rounded-2xl p-6 lg:p-8 transition-all duration-200 ease-out hover:-translate-y-1.5 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/5">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-2 group-hover:text-purple-300 transition-colors">
                    Team Collaboration
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Real-time feedback and scorecards for seamless hiring team coordination.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">JD</div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-purple-600 text-[10px] font-bold text-white flex items-center justify-center">SK</div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-indigo-600 text-[10px] font-bold text-white flex items-center justify-center">+3</div>
                  </div>
                  <span className="text-xs font-medium text-purple-300">Live Team Sync</span>
                </div>
              </div>

              {/* 4. Analytics Dashboard */}
              <div className="group relative flex flex-col justify-between bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 rounded-2xl p-6 lg:p-8 transition-all duration-200 ease-out hover:-translate-y-1.5 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/5">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-2 group-hover:text-amber-300 transition-colors">
                    Analytics Dashboard
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Deep insights into your hiring metrics with clean visualizations.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Time-To-Hire</span>
                  <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">-62% Reduction</span>
                </div>
              </div>

              {/* 5. Automated Screening */}
              <div className="group relative flex flex-col justify-between bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 rounded-2xl p-6 lg:p-8 transition-all duration-200 ease-out hover:-translate-y-1.5 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/5">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-2 group-hover:text-emerald-300 transition-colors">
                    Automated Screening
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Let AI handle initial screening while you focus on top candidates.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Bias Guard</span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Audit Passed</span>
                </div>
              </div>

              {/* 6. Global Integration */}
              <div className="group relative flex flex-col justify-between bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 rounded-2xl p-6 lg:p-8 transition-all duration-200 ease-out hover:-translate-y-1.5 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-blue-500/5">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-2 group-hover:text-blue-300 transition-colors">
                    Global Integration
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Connect with 100+ recruitment tools including Slack, LinkedIn, and email platforms.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">Connectors</span>
                  <span className="text-xs font-semibold text-slate-300">100+ Ecosystem</span>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Testimonial Section with parallax */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/20 to-slate-950" />
          
          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Trusted by Leading Companies
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote: "Tasknera reduced our time-to-hire by 60%. The AI matching is incredibly accurate.",
                  author: "Sarah Mitchell",
                  role: "Head of HR, TechCorp",
                  avatar: "S"
                },
                {
                  quote: "Best ATS we've used. The interface is intuitive and the automation saves us hours daily.",
                  author: "James Chen",
                  role: "Talent Acquisition Lead, StartupXYZ",
                  avatar: "J"
                }
              ].map((testimonial, i) => (
                <div
                  key={i}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                  <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{testimonial.author}</div>
                        <div className="text-gray-400 text-sm">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Refined Enterprise Conversion CTA Section */}
        <section className="relative py-20 md:py-24 overflow-hidden">
          {/* Extremely Soft Ambient Backdrop Light (reduced glow by 70%) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6">
            {/* Premium CTA Card Panel */}
            <div className="relative bg-[#0F172A]/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700/80 rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-2xl shadow-black/40 transition-all duration-300">
              
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                  Ready When You Are
                </span>
              </div>

              {/* Headline */}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                Ready to Transform <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Your Hiring?</span>
              </h2>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
                Join <span className="text-white font-medium">thousands of companies</span> using Tasknera to find, evaluate, and hire exceptional talent faster.
              </p>

              {/* CTA Buttons - Matching heights & clean hierarchy */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                {/* Primary CTA */}
                <button
                  onClick={() => handleCtaClick('/jobs/create')}
                  className="w-full sm:w-auto h-12 md:h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 text-base"
                >
                  Start Free Trial
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                {/* Secondary CTA */}
                <button
                  onClick={() => handleCtaClick('/dashboard')}
                  className="w-full sm:w-auto h-12 md:h-14 px-8 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 text-base"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Demo
                </button>
              </div>

              {/* Trust / Benefits Row */}
              <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap pt-6 border-t border-slate-800/80 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  No credit card required
                </span>
                <span className="hidden sm:inline text-slate-700">•</span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  14-day free trial
                </span>
                <span className="hidden sm:inline text-slate-700">•</span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Cancel anytime
                </span>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signin"
      />

      <Footer />
    </div>
  );
}
