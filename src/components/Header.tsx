'use client';

import React, { useState, useEffect } from 'react';
import AppLogo from '@/components/ui/AppLogo';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-[150] transition-all duration-300 ${
        scrolled ? 'anchor-nav shadow-card' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <AppLogo
            size={28}
            text="Screen"
            iconName="CpuChipIcon"
            className="text-cyan-DEFAULT"
          />
        </div>

        {/* Right CTA */}
        <a
          href="#hero-cta"
          className="btn-cyan px-5 py-2.5 text-sm font-bold hidden md:inline-flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('demo-cta')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span>See Your Candidate Stack</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </nav>
  );
};

export default Header;