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
  const pathname   = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
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
    { label: 'Candidates',      href: '/candidates',  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Evaluations',     href: '/evaluations', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { label: 'Clients',         href: '/clients',     icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { label: 'Reports',         href: '/reports',     icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Settings',        href: '/settings',    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  const active = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href + '/'));

  // Unified sleek glassmorphic header across all pages
  const isAuth = isAuthenticated && user;
  const navBg = 'bg-white/90 backdrop-blur-xl';
  const navBorder = 'border-slate-200/80';
  const shadow = scrolled ? 'shadow-[0_4px_20px_rgba(30,41,59,0.06)]' : '';

  return (
    <>
      <nav className={`fixed top-0 w-full z-[150] transition-all duration-300 ${navBg} border-b ${navBorder} ${shadow}`}>
        <div className="max-w-screen-xl mx-auto px-6 h-[64px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Logo
            href={isAuth ? '/dashboard' : '/home'}
            size="sm"
            variant="dark"
          />

          {/* Nav links */}
          {isAuth && (
            <div className="hidden lg:flex items-center gap-1 flex-1 overflow-x-auto mx-2">
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
            {isAuth ? (
              <>
                <Link
                  href="/jobs/create"
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange hover:shadow-orange-lg hover:-translate-y-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  New Job
                </Link>

                <div className="relative" data-dropdown>
                  <button
                    onClick={e => { e.stopPropagation(); setDropdownOpen(v => !v); }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-orange text-white text-xs font-bold flex items-center justify-center">
                      {(user.name || user.email)[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                      {user.name || user.email.split('@')[0]}
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
                        <p className="text-sm font-bold text-slate-800 truncate">{user.name || 'User'}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      {[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Settings',  href: '/settings'  },
                      ].map(l => (
                        <Link key={l.href} href={l.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-orange transition-colors">
                          {l.label}
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 mt-1">
                        <button
                          onClick={() => { setDropdownOpen(false); logout(); }}
                          className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
                          Sign Out
                        </button>
                      </div>
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
          <div className={`lg:hidden border-t px-4 py-3 space-y-0.5 ${isAuth ? 'bg-brand-charcoal border-white/10' : 'bg-white border-brand-border'}`}>
            {isAuth && nav.map(item => (
              <Link key={item.href} href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active(item.href)
                    ? 'bg-brand-orange text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            ))}
            <div className={`border-t pt-3 mt-2 space-y-2 ${isAuth ? 'border-white/10' : 'border-brand-border'}`}>
              {isAuth ? (
                <button onClick={() => { setMobileOpen(false); logout(); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 font-medium">
                  Sign Out
                </button>
              ) : (
                <>
                  <button onClick={() => { setMobileOpen(false); setAuthMode('signin'); setAuthOpen(true); }}
                    className="block w-full text-left px-3 py-2 text-sm text-brand-charcoal-2 font-medium">
                    Sign In
                  </button>
                  <button onClick={() => { setMobileOpen(false); setAuthMode('signup'); setAuthOpen(true); }}
                    className="block w-full text-center px-4 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold">
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
