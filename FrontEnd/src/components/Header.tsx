'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

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

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
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
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {(user.name || user.email)[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-200 max-w-[120px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#0F172A] border border-gray-800 rounded-xl shadow-2xl py-1 z-[160]">
                    <div className="px-4 py-2.5 border-b border-gray-800">
                      <p className="text-xs font-semibold text-white truncate">{user.name || 'User'}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-md shadow-blue-900/40"
                >
                  Sign Up
                </button>
              </>
            )}

            <Link
              href="/jobs/create"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-sm font-semibold rounded-lg transition-colors"
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
          <div className="md:hidden bg-[#0A0F1E] border-t border-gray-800 px-6 py-4 space-y-2">
            {navLinks.map((item) => (
              <Link key={item.label} href={item.href} className="block px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-medium">
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-800 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-lg text-sm font-medium"
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('signin');
                    }}
                    className="block w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('signup');
                    }}
                    className="block w-full text-center px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;
