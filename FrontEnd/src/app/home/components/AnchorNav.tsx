'use client';

import React, { useState, useEffect, useCallback } from 'react';

const SPOKES = [
  { id: 'parsing',      label: 'Parsing' },
  { id: 'ranking',      label: 'Ranking' },
  { id: 'bias-guard',   label: 'Bias Guard' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'proof',        label: 'Proof' },
];

const AnchorNav: React.FC = () => {
  const [active, setActive] = useState('');
  const [visible, setVisible] = useState(false);

  const onScroll = useCallback(() => {
    // Show after hero
    const hero = document.getElementById('hero');
    if (hero) {
      setVisible(window.scrollY > hero.offsetHeight * 0.6);
    }

    // Determine active spoke
    for (const spoke of [...SPOKES].reverse()) {
      const el = document.getElementById(spoke.id);
      if (el && window.scrollY >= el.offsetTop - 120) {
        setActive(spoke.id);
        return;
      }
    }
    setActive('');
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className={`fixed top-16 left-0 right-0 z-[140] anchor-nav transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-1 py-1 overflow-x-auto scrollbar-hide">
          {SPOKES.map((spoke) => (
            <button
              key={spoke.id}
              onClick={() => scrollTo(spoke.id)}
              className={`anchor-pill flex-shrink-0 ${active === spoke.id ? 'active' : ''}`}
            >
              {spoke.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnchorNav;

