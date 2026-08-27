'use client';

import React, { useEffect, useRef, useState } from 'react';
import CompareGrid from './CompareGrid';

const RANK_ROWS = [
  {
    metric: 'Time to first ranked list',
    manual: { value: '3–5 days', bar: 100, note: 'After posting closes, team reviews stack' },
    ai:     { value: '4.2 sec',  bar: 1,   note: 'Ranked list ready as applications arrive' },
  },
  {
    metric: 'Shortlist accuracy',
    manual: { value: '61%', bar: 61, note: 'Of manual shortlists advance past first interview' },
    ai:     { value: '89%', bar: 89, note: 'Validated across 500+ hiring cycles' },
  },
  {
    metric: 'Ranking consistency',
    manual: { value: 'Variable', bar: 55, note: 'Varies by reviewer, day, caffeine intake' },
    ai:     { value: '99.1%',   bar: 99, note: 'Same score for same résumé, every time' },
  },
];

const CANDIDATE_RANKS = [
  { rank: 1, name: 'Jordan Malik',  role: 'Sr. Product Manager', score: 97, status: 'TOP MATCH' },
  { rank: 2, name: 'Priya Nair',    role: 'Growth Engineer',     score: 94, status: 'STRONG FIT' },
  { rank: 3, name: 'Marcus Chen',   role: 'Revenue Operations',  score: 91, status: 'STRONG FIT' },
  { rank: 4, name: 'Aaliya Osei',   role: 'Customer Success Lead', score: 89, status: 'GOOD FIT' },
  { rank: 5, name: 'Tomás Rivera',  role: 'Backend Engineer',    score: 88, status: 'GOOD FIT' },
];

const RankingSection: React.FC = () => {
  const listRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="ranking"
      className="py-20 md:py-28 scroll-mt-32"
      style={{ background: '#0D1E38' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mb-14">
          <p className="section-label mb-3">02 · Ranking</p>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-700 text-ui-white leading-tight mb-4">
            Your shortlist,{' '}
            <span className="text-cyan-DEFAULT italic">ready before you ask.</span>
          </h2>
          <p className="text-[1rem] text-ui-muted leading-relaxed">
            Screen doesn't wait for the application window to close. The ranked list is live the moment the first résumé arrives — and it stays accurate as 10,000 more come in.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Compare grid */}
          <CompareGrid rows={RANK_ROWS} />

          {/* Right: Live ranked list */}
          <div ref={listRef}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-700 text-ui-faint uppercase tracking-widest">
                Live Candidate Stack — VP Engineering · Posted 2h ago
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-ui-success animate-pulse" />
                <span className="text-[11px] text-ui-success font-600">LIVE</span>
              </div>
            </div>

            <div className="space-y-2">
              {CANDIDATE_RANKS.map((c, i) => (
                <div
                  key={c.rank}
                  className="rank-row px-4 py-3 flex items-center gap-4"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? 'translateX(0)' : 'translateX(24px)',
                    transition: `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
                  }}
                >
                  <span className="text-[13px] font-700 text-ui-faint w-5 text-center">{c.rank}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-600 text-ui-white truncate">{c.name}</p>
                    <p className="text-[11px] text-ui-muted">{c.role}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[15px] font-800 text-cyan-DEFAULT">{c.score}%</p>
                    </div>
                    <span
                      className="text-[9px] font-700 tracking-widest px-2 py-1 rounded"
                      style={{
                        background: c.rank === 1 ? 'rgba(0,229,160,0.12)' : 'rgba(0,212,255,0.08)',
                        color: c.rank === 1 ? '#00E5A0' : 'rgba(0,212,255,0.8)',
                        border: `1px solid ${c.rank === 1 ? 'rgba(0,229,160,0.25)' : 'rgba(0,212,255,0.2)'}`,
                      }}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Processing footer */}
            <div className="mt-4 px-4 py-3 rounded-lg" style={{ background: 'rgba(27,42,74,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-ui-faint font-mono">
                  <span className="text-cyan-DEFAULT">9,995</span> more résumés processing
                  <span className="cursor-blink ml-1">_</span>
                </span>
                <span className="text-[11px] text-ui-faint">avg 0.4s/résumé</span>
              </div>
              <div className="micro-bar mt-2">
                <div className="micro-bar-fill good" style={{ width: '34%', transition: 'width 3s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Spoke CTA */}
        <div className="mt-12 flex items-center gap-4">
          <button className="btn-cyan px-6 py-3 text-[14px] font-700 flex items-center gap-2">
            See Your Candidate Stack
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default RankingSection;