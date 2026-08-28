'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      <Header />
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Reports</h1>
          <p className="text-gray-400 text-sm">Recruitment velocity, bias audit reports, and candidate pipeline exports.</p>
        </div>
        <div className="bg-[#0F172A]/70 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Reports Module</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Custom reporting tools and data export utilities will be accessible here.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
