'use client';

import React from 'react';
import CompareGrid from './CompareGrid';

const PARSE_ROWS = [
  {
    metric: 'Fields extracted',
    manual: { value: '6 fields',   bar: 12, note: 'Name, email, title, dates, school, skills' },
    ai:     { value: '47 signals', bar: 94, note: 'Semantic context, soft skills, tenure patterns, career arc' },
  },
  {
    metric: 'Time per résumé',
    manual: { value: '4–7 min',  bar: 70, note: 'Per trained recruiter, no interruptions' },
    ai:     { value: '0.4 sec',  bar: 1,  note: 'Constant regardless of volume' },
  },
  {
    metric: 'Error rate',
    manual: { value: '23%',  bar: 46, note: 'Missed qualifications, cognitive fatigue' },
    ai:     { value: '0.9%', bar: 2,  note: 'Consistent signal extraction on every pass' },
  },
  {
    metric: 'Keyword-only matching',
    manual: { value: 'Yes',  bar: 100, note: 'Rejects "Python" résumé missing exact string' },
    ai:     { value: 'No',   bar: 0,   note: 'Semantic understanding — "ML Engineer" ≡ "ML Eng."' },
  },
];

const ParsingSection: React.FC = () => {
  return (
    <section
      id="parsing"
      className="py-20 md:py-28 scroll-mt-32"
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0D1E38 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mb-14">
          <p className="section-label mb-3">01 · Parsing</p>
          <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-700 text-ui-white leading-tight mb-4">
            Reading résumés the way{' '}
            <span className="text-cyan-DEFAULT italic">recruiters can't.</span>
          </h2>
          <p className="text-[1rem] text-ui-muted leading-relaxed">
            Manual screening extracts 6 surface fields. Screen extracts 47 semantic signals — career trajectory, implicit skills, cultural fit markers — on every single résumé, in under half a second.
          </p>
        </div>

        <CompareGrid rows={PARSE_ROWS} />

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

export default ParsingSection;