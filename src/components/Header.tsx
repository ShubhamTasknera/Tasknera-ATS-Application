'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Candidates', href: '/candidates' },
    { label: 'Analytics', href: '/analytics' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-[150] transition-all duration-300 ${
      scrolled
        ? 'bg-[#0A0F1E]/95 backdrop-blur-xl border-b border-gray-800 shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
            <span className="text-white font-black text-base">T</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-base tracking-tight">Tasknera</span>
            <span className="text-[9px] text-gray-500 tracking-widest uppercase">Candidate Intelligence</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg font-medium transition-all duration-150"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors font-medium">
            Sign In
          </button>
          <Link
            href="/jobs/create"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-blue-900/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Evaluation
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-400 p-2 hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0F1E] border-t border-gray-800 px-6 py-4 space-y-1">
          {navLinks.map((item) => (
            <Link key={item.label} href={item.href} className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-medium">
              {item.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-gray-800 mt-3">
            <Link href="/jobs/create" className="block w-full text-center px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold">
              New Evaluation
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
