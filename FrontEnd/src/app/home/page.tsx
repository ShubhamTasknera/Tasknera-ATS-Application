'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';

export default function HomePage() {
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
        
        {/* Features Section with 3D cards and better colors */}
        <section id="features" className="relative py-32 overflow-hidden">
          {/* Background elements with colorful gradients */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-primary-500/10 to-primary-700/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-500/10 to-primary-700/10 border border-primary-400/20 mb-8">
                <svg className="w-4 h-4 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span className="text-sm font-semibold bg-gradient-to-r from-primary-300 to-primary-700 bg-clip-text text-transparent">Powerful Features</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Everything You Need to
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary-400 via-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Hire Smarter
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Powerful tools designed to transform your recruitment process with style
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="group relative"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Card glow effect with feature-specific colors */}
                  <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 rounded-3xl`} />
                  
                  {/* Card */}
                  <div className="relative h-full bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-3 cursor-pointer">
                    {/* Icon with individual gradient */}
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.iconGradient} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                      <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform ring-2 ring-white/20`}>
                        {feature.icon}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-primary-100 group-hover:to-primary-700 group-hover:bg-clip-text transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed text-base">
                      {feature.description}
                    </p>

                    {/* Decorative gradient line */}
                    <div className={`mt-6 h-1 w-0 group-hover:w-full transition-all duration-500 rounded-full bg-gradient-to-r ${feature.gradient}`} />

                    {/* Arrow indicator */}
                    <div className="mt-6 flex items-center text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">Explore feature</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Job Description & CV Upload Section */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/20 mb-8">
                <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Upload & Match</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Get Started in
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Two Simple Steps
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                Upload your job description and candidate resumes. Our AI will do the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Job Description Upload Card */}
              <div className="group relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 rounded-3xl" />
                
                <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-3xl p-10 border border-white/10 hover:border-cyan-400/50 transition-all duration-500 h-full">
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 group-hover:scale-110 transition-transform">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:to-blue-300 group-hover:bg-clip-text transition-all">
                    Job Description
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                    Upload your job posting or paste the description. Our AI will extract requirements, skills, and qualifications automatically.
                  </p>

                  {/* Upload Area */}
                  <div className="relative group/upload cursor-pointer">
                    <input type="file" className="hidden" id="jd-upload" accept=".pdf,.doc,.docx,.txt" />
                    <label htmlFor="jd-upload" className="block">
                      <div className="border-2 border-dashed border-cyan-400/30 hover:border-cyan-400/60 rounded-2xl p-8 text-center transition-all duration-300 bg-cyan-400/5 hover:bg-cyan-400/10 group-hover/upload:scale-105">
                        <svg className="w-12 h-12 mx-auto mb-4 text-cyan-400 group-hover/upload:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-white font-semibold mb-2">Drop JD file here or click to browse</p>
                        <p className="text-slate-400 text-sm">PDF, DOC, DOCX, TXT • Max 10MB</p>
                      </div>
                    </label>
                  </div>

                  {/* Or Paste Text */}
                  <div className="mt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 h-px bg-white/10"></div>
                      <span className="text-slate-500 text-sm font-medium">OR</span>
                      <div className="flex-1 h-px bg-white/10"></div>
                    </div>
                    <textarea
                      placeholder="Paste job description here..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all resize-none"
                    />
                  </div>

                  {/* Features */}
                  <div className="mt-8 space-y-3">
                    {[
                      'AI-powered requirement extraction',
                      'Skills & qualifications parsing',
                      'Auto-categorization',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-300">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CV/Resume Upload Card */}
              <div className="group relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 rounded-3xl" />
                
                <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-3xl p-10 border border-white/10 hover:border-emerald-400/50 transition-all duration-500 h-full">
                  {/* Icon */}
                  <div className="mb-8">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 group-hover:scale-110 transition-transform">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-300 group-hover:to-teal-300 group-hover:bg-clip-text transition-all">
                    Candidate Resumes
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-8 text-lg">
                    Upload single or multiple CVs. Bulk upload supported for processing hundreds of candidates at once.
                  </p>

                  {/* Upload Area */}
                  <div className="relative group/upload cursor-pointer">
                    <input type="file" className="hidden" id="cv-upload" accept=".pdf,.doc,.docx" multiple />
                    <label htmlFor="cv-upload" className="block">
                      <div className="border-2 border-dashed border-emerald-400/30 hover:border-emerald-400/60 rounded-2xl p-8 text-center transition-all duration-300 bg-emerald-400/5 hover:bg-emerald-400/10 group-hover/upload:scale-105">
                        <svg className="w-12 h-12 mx-auto mb-4 text-emerald-400 group-hover/upload:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-white font-semibold mb-2">Drop CV files here or click to browse</p>
                        <p className="text-slate-400 text-sm">PDF, DOC, DOCX • Multiple files supported</p>
                      </div>
                    </label>
                  </div>

                  {/* Bulk Upload Info */}
                  <div className="mt-6 bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-emerald-300 font-semibold text-sm mb-1">Bulk Upload Enabled</p>
                        <p className="text-slate-400 text-sm">Upload up to 1,000 resumes at once. Zip files supported.</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mt-8 space-y-3">
                    {[
                      'Automatic candidate profiling',
                      'Skills & experience extraction',
                      'Instant match scoring',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-300">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <div className="text-center mt-12">
              <button className="group relative px-12 py-5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white text-lg font-bold rounded-2xl overflow-hidden hover:scale-110 transition-all duration-300 shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70">
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Process & Match Candidates
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-blue-400/50 to-indigo-400/0 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
              </button>
              <p className="mt-4 text-slate-400 text-sm">
                Average processing time: <span className="text-cyan-400 font-semibold">4.2 seconds</span> per resume
              </p>
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

        {/* CTA Section with colorful gradient */}
        <section className="relative py-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950/50 via-primary-600/30 to-slate-950" />
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-primary-500/30 to-primary-700/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
            <div className="absolute bottom-1/3 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-primary-700/20 to-rose-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-500/10 to-primary-700/10 border border-primary-400/30 mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-primary-400 to-primary-700"></span>
              </span>
              <span className="text-sm font-semibold bg-gradient-to-r from-primary-200 to-primary-700 bg-clip-text text-transparent">
                Limited Time Offer
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-slate-100 via-primary-100 to-primary-700 bg-clip-text text-transparent drop-shadow-2xl">
                Ready to Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary-400 via-primary-600 to-primary-800 bg-clip-text text-transparent">
                Your Hiring?
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join <span className="text-primary-300 font-semibold">thousands of companies</span> using Tasknera to find and hire 
              <span className="text-primary-600 font-semibold"> exceptional talent</span> faster than ever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button className="group relative px-12 py-5 bg-gradient-to-r from-primary-600 via-primary-600 to-primary-800 text-white text-lg font-bold rounded-2xl overflow-hidden hover:scale-110 transition-all duration-300 shadow-2xl shadow-primary-600/50 hover:shadow-primary-600/70">
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Start Free Trial
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-600/50 to-primary-800/0 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
              </button>
              <button className="px-12 py-5 bg-white/5 backdrop-blur-2xl text-white text-lg font-semibold rounded-2xl border-2 border-white/20 hover:bg-white/10 hover:scale-110 hover:border-primary-400/50 transition-all duration-300 shadow-xl hover:shadow-primary-500/30">
                <span className="flex items-center gap-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Schedule Demo
                </span>
              </button>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8 flex-wrap text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
