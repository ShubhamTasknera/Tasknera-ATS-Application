'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import Logo from './Logo';

const Header: React.FC = () => {
  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [authOpen, setAuthOpen]       = useState(false);
  const [authMode, setAuthMode]       = useState<'signin' | 'signup'>('signin');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname   = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-dropdown]')) setDropdownOpen(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const nav = [
    { label: 'Dashboard',       href: '/dashboard',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Jobs',            href: '/jobs',        icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: 'Evaluations',     href: '/evaluations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { label: 'Reports',         href: '/reports',     icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  const active = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href + '/'));

  // Unified sleek glassmorphic header across all pages
  const isAuth = mounted && Boolean(isAuthenticated && user);
  const currentUser = isAuth ? user : null;
  const navBg = 'bg-white/90 backdrop-blur-xl';
  const navBorder = 'border-slate-200/80';
  const shadow = scrolled ? 'shadow-[0_4px_20px_rgba(30,41,59,0.06)]' : '';

  return (
    <>
      <nav className={`fixed top-0 w-full z-[150] transition-all duration-300 ${navBg} border-b ${navBorder} ${shadow}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-[64px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Logo
            href={currentUser ? '/dashboard' : '/home'}
            size="sm"
            variant="dark"
          />

          {/* Nav links */}
          {currentUser && (
            <div className="hidden lg:flex items-center justify-center gap-1 flex-1 overflow-x-auto mx-4">
              {nav.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
                    active(item.href)
                      ? 'bg-brand-orange text-white shadow-orange'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {currentUser ? (
              <>
                <div className="relative" data-dropdown>
                  <button
                    onClick={e => { e.stopPropagation(); setDropdownOpen(v => !v); }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-orange text-white text-xs font-bold flex items-center justify-center">
                      {(currentUser.name || currentUser.email)[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                      {currentUser.name || currentUser.email.split('@')[0]}
                    </span>
                    <svg className={`w-3 h-3 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div
                      data-dropdown
                      onClick={e => e.stopPropagation()}
                      className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-[200]"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                        <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser.email}</p>
                      </div>
                      <button
                        onClick={() => { setDropdownOpen(false); logout(); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => { setAuthMode('signin'); setAuthOpen(true); }}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-brand-orange transition-colors cursor-pointer">
                  Sign In
                </button>
                <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); }}
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg cursor-pointer">
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors text-slate-700 hover:bg-slate-100"
            onClick={() => setMobileOpen(v => !v)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t px-4 py-3 space-y-1 bg-white/95 backdrop-blur-md border-slate-200/90 shadow-xl">
            {currentUser && nav.map(item => (
              <Link key={item.href} href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active(item.href)
                    ? 'bg-brand-orange text-white shadow-orange'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
                }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 pt-3 mt-2 space-y-2">
              {currentUser ? (
                <button onClick={() => { setMobileOpen(false); logout(); }}
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              ) : (
                <>
                  <button onClick={() => { setMobileOpen(false); setAuthMode('signin'); setAuthOpen(true); }}
                    className="block w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                    Sign In
                  </button>
                  <button onClick={() => { setMobileOpen(false); setAuthMode('signup'); setAuthOpen(true); }}
                    className="block w-full text-center px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-xs font-bold shadow-orange transition-all cursor-pointer">
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode={authMode} />
    </>
  );
};


export default Header;
