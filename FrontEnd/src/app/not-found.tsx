'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-md w-full text-center bg-white border border-slate-200/90 rounded-3xl p-10 shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl mb-6 shadow-xs border border-amber-100">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              style={{ width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px' }}
              className="flex-shrink-0"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-[#1E293B] mb-2 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-slate-700 mb-2">Page Not Found</h2>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed">
            The page you are looking for might have been moved, renamed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/jobs"
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl transition-all shadow-orange text-center"
            >
              View Active Jobs
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors text-center"
            >
              Go to Workspace
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

