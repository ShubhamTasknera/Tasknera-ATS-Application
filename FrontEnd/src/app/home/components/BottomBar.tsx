'use client';

import React, { useEffect, useState } from 'react';

const BottomBar: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [scrollCount, setScrollCount] = useState(0);

  useEffect(() => {
    let lastY = 0;
    let count = 0;

    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY && y > 200) {
        count++;
        setScrollCount(count);
        if (count >= 2) setVisible(true);
      }
      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`bottom-bar ${visible ? 'visible' : ''}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-[13px] text-ui-muted hidden md:block">
          <span className="text-ui-white font-600">10,247 résumés screened</span> in the last hour.
          Your shortlist is waiting.
        </p>
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
          <button className="btn-cyan px-6 py-2.5 text-[13px] font-700 flex items-center gap-2 whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M5 5l4 2-4 2V5z" fill="currentColor"/>
            </svg>
            See Your Candidate Stack
          </button>
          <span className="text-[12px] text-ui-faint hidden sm:block">No credit card required</span>
        </div>
      </div>
    </div>
  );
};

export default BottomBar;

