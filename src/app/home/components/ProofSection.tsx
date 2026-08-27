'use client';

import React, { useEffect, useRef, useState } from 'react';

const TESTIMONIALS = [
  {
    quote: "We were drowning in 800 applications for a single SDR role. Screen had a ranked shortlist of 12 in my inbox before I finished my first coffee. We hired from the top 5.",
    name: 'Rachel Okonkwo',
    title: 'VP Talent Acquisition',
    company: 'Clearbit',
    metric: '68% reduction in time-to-first-interview',
    avatar: 'RO',
  },
  {
    quote: "Running 34 open reqs across 8 clients simultaneously. Screen is the only reason I\'m not working weekends. It\'s like having a junior recruiter who never sleeps and never makes a bias mistake.",
    name: 'Daniel Park',
    title: 'Senior Recruiter',
    company: 'Talentful',
    metric: '34 reqs managed by 1 recruiter',
    avatar: 'DP',
  },
  {
    quote: "In healthcare, an unfilled night shift costs us $3,200 in agency fees. Screen cut our time-to-fill from 19 days to 6. That's a number our CFO understands immediately.",
    name: 'Amara Diallo',
    title: 'HR Director',
    company: 'Ascension Health Network',
    metric: '$3,200/shift saved · 13 days faster',
    avatar: 'AD',
  },
];

const METRICS = [
  { value: '10,247', label: 'Résumés screened today', suffix: '' },
  { value: '4.2',    label: 'Seconds average time-to-rank', suffix: 's' },
  { value: '89',     label: 'Shortlist accuracy rate', suffix: '%' },
  { value: '500',    label: 'TA teams active this month', suffix: '+' },
];

const ProofSection: React.FC = () => {
  const metricsRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (metricsRef.current) observer.observe(metricsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="proof"
      className="py-20 md:py-28 scroll-mt-32"
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #060F1E 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mb-16">
          <p className="section-label mb-3">05 · Proof</p>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-700 text-ui-white leading-tight mb-4">
            The numbers{' '}
            <span className="text-cyan-DEFAULT italic">don't need a deck.</span>
          </h2>
          <p className="text-[1rem] text-ui-muted leading-relaxed">
            Real results from TA teams, agency recruiters, and HR directors who replaced their manual screening workflow with Screen.
          </p>
        </div>

        {/* Metrics bar */}
        <div
          ref={metricsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 pb-16"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              className="text-center"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ease ${i * 100}ms, transform 0.6s ease ${i * 100}ms`,
              }}
            >
              <p className="counter-num mb-2">
                {m.value}
                <span className="text-[1.8rem]">{m.suffix}</span>
              </p>
              <p className="text-[12px] text-ui-muted uppercase tracking-widest font-600">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="testimonial-card p-7 flex flex-col justify-between"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.6s ease ${i * 150 + 300}ms, transform 0.6s ease ${i * 150 + 300}ms`,
              }}
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="12" height="12" viewBox="0 0 12 12" fill="#00D4FF">
                      <path d="M6 1l1.5 3 3.5.5-2.5 2.5.6 3.5L6 9l-3.1 1.5.6-3.5L1 4.5l3.5-.5z"/>
                    </svg>
                  ))}
                </div>

                <p className="text-[14px] text-ui-muted leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
              </div>

              <div>
                {/* Metric callout */}
                <div
                  className="rounded-lg px-3 py-2 mb-5"
                  style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)' }}
                >
                  <p className="text-[11px] font-700 text-cyan-DEFAULT">{t.metric}</p>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-800 flex-shrink-0"
                    style={{
                      background: 'rgba(0,212,255,0.12)',
                      border: '1px solid rgba(0,212,255,0.2)',
                      color: 'var(--cyan)',
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-600 text-ui-white">{t.name}</p>
                    <p className="text-[11px] text-ui-faint">{t.title} · {t.company}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-16 text-center">
          <p className="text-[1.1rem] text-ui-muted mb-6">
            See the ranked shortlist for your open role — no setup, no credit card.
          </p>
          <button className="btn-cyan px-10 py-4 text-[15px] font-700 inline-flex items-center gap-3">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M6.5 6.5l5 2.5-5 2.5V6.5z" fill="currentColor"/>
            </svg>
            See Your Candidate Stack
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProofSection;