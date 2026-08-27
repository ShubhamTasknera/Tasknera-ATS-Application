'use client';

import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-[150] transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-950/70 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-primary-500/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo with colorful gradient */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-600 to-primary-800 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-11 h-11 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">T</span>
            </div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white via-primary-100 to-primary-700 bg-clip-text text-transparent">
            Tasknera
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'Pricing', 'Solutions', 'Resources'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="relative text-slate-300 hover:text-white font-medium transition-colors group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-800 group-hover:w-full transition-all duration-300 rounded-full" />
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button className="px-5 py-2.5 text-slate-300 hover:text-white font-medium transition-colors">
            Sign In
          </button>
          <button className="relative px-6 py-2.5 bg-gradient-to-r from-primary-600 via-primary-600 to-primary-800 text-white font-semibold rounded-xl overflow-hidden group shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 transition-shadow">
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl">
          <div className="px-6 py-6 space-y-4">
            {['Features', 'Pricing', 'Solutions', 'Resources'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block text-slate-300 hover:text-white font-medium transition-colors py-2"
              >
                {item}
              </a>
            ))}
            <div className="pt-4 space-y-3 border-t border-white/10">
              <button className="w-full px-4 py-2.5 text-slate-300 hover:text-white font-medium transition-colors text-left rounded-lg hover:bg-white/5">
                Sign In
              </button>
              <button className="w-full px-6 py-3 bg-gradient-to-r from-primary-600 via-primary-600 to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-600/30">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
