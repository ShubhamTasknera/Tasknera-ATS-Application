'use client';

import React, { useEffect, useRef } from 'react';

/* ── Floating candidate card data ── */
const FLOATING_CARDS = [
  {
    id: 1,
    name: 'Jordan Malik',
    role: 'Sr. Product Manager',
    match: 97,
    skills: ['Roadmapping', 'SQL', 'Agile'],
    yoe: '8 yrs',
    style: { top: '18%', left: '6%', '--rot': '-4deg', animationDelay: '0s' } as React.CSSProperties,
  },
  {
    id: 2,
    name: 'Priya Nair',
    role: 'Growth Engineer',
    match: 94,
    skills: ['Python', 'A/B Testing'],
    yoe: '5 yrs',
    style: { top: '12%', right: '8%', '--rot': '3deg', animationDelay: '1.2s' } as React.CSSProperties,
  },
  {
    id: 3,
    name: 'Marcus Chen',
    role: 'Revenue Operations',
    match: 91,
    skills: ['Salesforce', 'HubSpot'],
    yoe: '6 yrs',
    style: { bottom: '28%', left: '4%', '--rot': '-2deg', animationDelay: '2.1s' } as React.CSSProperties,
  },
  {
    id: 4,
    name: 'Aaliya Osei',
    role: 'Customer Success Lead',
    match: 89,
    skills: ['NPS', 'Churn Analysis', 'Gainsight'],
    yoe: '4 yrs',
    style: { bottom: '22%', right: '5%', '--rot': '5deg', animationDelay: '0.7s' } as React.CSSProperties,
  },
  {
    id: 5,
    name: 'Tomás Rivera',
    role: 'Backend Engineer',
    match: 88,
    skills: ['Go', 'Kubernetes', 'gRPC'],
    yoe: '7 yrs',
    style: { top: '52%', left: '2%', '--rot': '-6deg', animationDelay: '3.0s' } as React.CSSProperties,
  },
];

/* ── Mini résumé fragment cards ── */
const FRAGMENT_CARDS = [
  {
    id: 'f1',
    label: 'PARSED IN',
    value: '0.4s',
    sub: '47 signal types extracted',
    style: { top: '38%', right: '3%', '--rot': '2deg', animationDelay: '1.6s' } as React.CSSProperties,
  },
  {
    id: 'f2',
    label: 'QUEUE',
    value: '10,247',
    sub: 'résumés screened today',
    style: { top: '68%', left: '10%', '--rot': '-3deg', animationDelay: '2.5s' } as React.CSSProperties,
  },
];

const HeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let gsap: typeof import('gsap').gsap;
    const init = async () => {
      const mod = await import('gsap');
      gsap = mod.gsap;

      // Hero entrance
      gsap.fromTo(
        '.hero-card',
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.4, stagger: 0.15, ease: 'elastic.out(1, 0.75)', delay: 0.3 }
      );
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power4.out', delay: 0.6 }
      );
      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 1 }
      );
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 1.3 }
      );
    };
    init();
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--navy)' }}
    >
      {/* Radial glow */}
      <div className="hero-glow" aria-hidden="true" />

      {/* Secondary ambient glow rings */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          border: '1px solid rgba(0,212,255,0.06)',
          animation: 'pulse-glow 6s ease-in-out infinite 1s',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          transform: 'translate(-50%, -50%)',
          width: 380,
          height: 380,
          borderRadius: '50%',
          border: '1px solid rgba(0,212,255,0.1)',
          animation: 'pulse-glow 6s ease-in-out infinite 0.5s',
        }}
        aria-hidden="true"
      />

      {/* Floating candidate cards */}
      {FLOATING_CARDS.map((card) => (
        <div
          key={card.id}
          className="candidate-card hero-card hidden lg:block"
          style={card.style}
          aria-hidden="true"
        >
          <div className="flex items-start justify-between gap-8 mb-2">
            <div>
              <p className="text-[13px] font-600 text-ui-white leading-tight">{card.name}</p>
              <p className="text-[11px] text-ui-muted mt-0.5">{card.role}</p>
            </div>
            <span className="match-badge flex-shrink-0">{card.match}%</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-3">
            {card.skills.map((s) => (
              <span key={s} className="skill-tag">{s}</span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="micro-bar flex-1">
              <div className="micro-bar-fill good" style={{ width: `${card.match}%` }} />
            </div>
            <span className="text-[10px] text-ui-faint">{card.yoe}</span>
          </div>
        </div>
      ))}

      {/* Fragment cards */}
      {FRAGMENT_CARDS.map((card) => (
        <div
          key={card.id}
          className="candidate-card hero-card hidden lg:block"
          style={card.style}
          aria-hidden="true"
        >
          <p className="section-label mb-1">{card.label}</p>
          <p className="text-[22px] font-800 text-cyan-DEFAULT leading-none">{card.value}</p>
          <p className="text-[10px] text-ui-muted mt-1">{card.sub}</p>
        </div>
      ))}

      {/* Streaming data line */}
      <div
        className="absolute bottom-8 left-0 right-0 overflow-hidden opacity-40"
        ref={streamRef}
        aria-hidden="true"
      >
        <div className="stream-line">
          PARSING · candidate_0x4F2A · SKILLS_EXTRACTED[47] · MATCH_SCORE:94.2 · BIAS_AUDIT:PASS · RANK_POSITION:3 · PARSING · candidate_0x3B1C · SKILLS_EXTRACTED[39] · MATCH_SCORE:88.7 · BIAS_AUDIT:PASS · RANK_POSITION:5 ·
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-cyan-DEFAULT/20 bg-gunmetal/40 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-DEFAULT animate-pulse" />
          <span className="text-[12px] font-600 text-ui-muted tracking-widest uppercase">
            AI Screening · Live
          </span>
        </div>

        <h1
          ref={headlineRef}
          className="font-display text-[clamp(2.6rem,7vw,5.5rem)] font-900 leading-[1.05] tracking-[-0.03em] text-ui-white mb-6"
          style={{ opacity: 1 }}
        >
          Ten thousand applicants.{' '}
          <span className="text-cyan-DEFAULT text-glow italic">Five perfect fits.</span>
          <br />
          One click.
        </h1>

        <p
          ref={subRef}
          className="text-[1.15rem] md:text-[1.3rem] text-ui-muted font-400 max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ opacity: 1 }}
        >
          Screen reads every résumé before the hiring manager finishes their morning coffee — surfacing the candidates who actually fit the role, not just the keywords.
        </p>

        <div
          ref={ctaRef}
          id="demo-cta"
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ opacity: 1 }}
        >
          <button className="btn-cyan px-8 py-4 text-[15px] font-700 flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6.5 6.5l5 2.5-5 2.5V6.5z" fill="currentColor"/>
            </svg>
            See Your Candidate Stack
          </button>
          <button className="btn-ghost px-6 py-4 text-[14px] font-500">
            Watch 90-second demo
          </button>
        </div>

        {/* Social proof micro */}
        <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
          {[
            { v: '500+', l: 'TA teams' },
            { v: '4.2s', l: 'avg time-to-rank' },
            { v: '99.1%', l: 'audit pass rate' },
          ].map((item) => (
            <div key={item.l} className="flex items-center gap-2">
              <span className="text-[15px] font-700 text-cyan-DEFAULT">{item.v}</span>
              <span className="text-[12px] text-ui-faint">{item.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;