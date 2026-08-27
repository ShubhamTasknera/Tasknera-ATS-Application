'use client';

import React, { useEffect, useState } from 'react';

const HeroSection: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const candidates = [
    { name: 'Sarah Johnson', role: 'Senior Developer', match: 98, skills: ['React', 'Node.js', 'TypeScript'], color: 'from-emerald-400 to-cyan-400' },
    { name: 'Michael Chen', role: 'Product Manager', match: 95, skills: ['Strategy', 'Analytics', 'Agile'], color: 'from-primary-400 to-primary-700' },
    { name: 'Emily Rodriguez', role: 'UX Designer', match: 92, skills: ['Figma', 'UI/UX', 'Design Systems'], color: 'from-amber-400 to-rose-400' },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
      {/* Animated gradient orbs with better colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[500px] h-[500px] bg-gradient-to-r from-primary-500/30 via-primary-600/30 to-primary-800/30 rounded-full blur-3xl animate-float opacity-60"
          style={{ top: '5%', left: '5%', animationDelay: '0s' }}
        />
        <div 
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-indigo-500/25 rounded-full blur-3xl animate-float opacity-50"
          style={{ top: '40%', right: '5%', animationDelay: '2s' }}
        />
        <div 
          className="absolute w-[450px] h-[450px] bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float opacity-60"
          style={{ bottom: '5%', left: '25%', animationDelay: '4s' }}
        />
        <div 
          className="absolute w-[400px] h-[400px] bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 rounded-full blur-3xl animate-float opacity-50"
          style={{ top: '60%', right: '30%', animationDelay: '3s' }}
        />
      </div>

      {/* Animated grid with better visibility */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.15]" />

      {/* Mouse follower gradient with rainbow effect */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none transition-all duration-500 ease-out blur-3xl opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(167,139,250,0.6) 0%, rgba(236,72,153,0.4) 50%, transparent 70%)',
          left: mousePosition.x - 250,
          top: mousePosition.y - 250,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Badge with shimmer effect - better colors */}
        <div className={`flex justify-center mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary-500/10 via-primary-600/10 to-primary-800/10 border border-primary-400/30 backdrop-blur-xl group hover:scale-105 transition-transform cursor-pointer shadow-lg shadow-primary-500/20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-r from-primary-400 to-primary-700"></span>
            </span>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary-200 via-primary-600 to-primary-800 bg-clip-text text-transparent">
              AI-Powered Recruitment Platform
            </span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400/0 via-primary-600/20 to-primary-800/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          </div>
        </div>

        {/* Main headline with better gradient */}
        <div className={`text-center mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1]">
            <span className="inline-block bg-gradient-to-r from-slate-100 via-primary-100 to-primary-700 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
              Find Perfect Candidates
            </span>
            <br />
            <span className="inline-block bg-gradient-to-r from-primary-400 via-primary-600 to-primary-800 bg-clip-text text-transparent animate-gradient-slow mt-2">
              10x Faster
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
            Tasknera uses <span className="text-primary-300 font-medium">advanced AI</span> to match, rank, and manage candidates with 
            <span className="text-primary-600 font-medium"> unprecedented accuracy</span>.
          </p>
        </div>

        {/* CTA Buttons with better effects */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button className="group relative px-8 py-4 bg-gradient-to-r from-primary-600 via-primary-600 to-primary-800 text-white font-semibold rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 shadow-2xl shadow-primary-600/50 hover:shadow-primary-600/70">
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              Start Free Trial
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-600/50 to-primary-800/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
          </button>
          <button className="px-8 py-4 bg-white/5 backdrop-blur-xl text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/10 hover:scale-105 transition-all duration-300 hover:border-primary-400/50 shadow-lg hover:shadow-primary-500/30">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </span>
          </button>
        </div>

        {/* Floating candidate cards with individual color schemes */}
        <div className={`relative transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {candidates.map((candidate, i) => (
              <div
                key={i}
                className="group relative bg-white/[0.03] backdrop-blur-2xl rounded-3xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-105 hover:-translate-y-3 cursor-pointer"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                {/* Colorful glow effect on hover */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${candidate.color} rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-2xl -z-10`} />
                
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`relative w-14 h-14 bg-gradient-to-br ${candidate.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl ring-2 ring-white/20`}>
                      {candidate.name.charAt(0)}
                      <div className={`absolute inset-0 bg-gradient-to-br ${candidate.color} rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity -z-10`} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{candidate.name}</h3>
                      <p className="text-slate-400 text-sm">{candidate.role}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <defs>
                        <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" className="text-emerald-400" style={{ stopColor: 'currentColor' }} />
                          <stop offset="50%" className="text-cyan-400" style={{ stopColor: 'currentColor' }} />
                          <stop offset="100%" className="text-blue-400" style={{ stopColor: 'currentColor' }} />
                        </linearGradient>
                      </defs>
                      <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
                      <circle 
                        cx="32" 
                        cy="32" 
                        r="28" 
                        stroke={`url(#gradient-${i})`}
                        strokeWidth="5" 
                        fill="none"
                        strokeDasharray={`${candidate.match * 1.76}, 176`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 filter drop-shadow-lg"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-base">
                      {candidate.match}%
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-5">
                  {candidate.skills.map((skill, j) => (
                    <span 
                      key={j} 
                      className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-white/10 to-white/5 text-slate-200 rounded-lg border border-white/10 hover:border-white/30 transition-colors backdrop-blur-xl"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  <span>Perfect Match</span>
                </div>

                {/* Hover arrow */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Stats bar with colorful gradients */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-16">
            {[
              { value: '10,000+', label: 'Candidates Screened', color: 'from-primary-400 to-primary-700' },
              { value: '4.2s', label: 'Avg. Processing Time', color: 'from-cyan-400 to-blue-400' },
              { value: '98%', label: 'Match Accuracy', color: 'from-emerald-400 to-teal-400' },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-pointer">
                <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent group-hover:scale-110 transition-transform drop-shadow-lg`}>
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm mt-2 font-medium">{stat.label}</div>
                <div className={`h-1 w-0 group-hover:w-full transition-all duration-500 mx-auto mt-2 rounded-full bg-gradient-to-r ${stat.color}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-30px) rotate(2deg); }
          66% { transform: translateY(15px) rotate(-2deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s linear infinite;
        }
        .animate-gradient-slow {
          background-size: 200% auto;
          animation: gradient 6s linear infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(167, 139, 250, 0.1) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(167, 139, 250, 0.1) 1.5px, transparent 1.5px);
          background-size: 60px 60px;
          background-position: center center;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
