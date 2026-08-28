'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function EvaluationsPage() {
  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      <Header />
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Evaluations</h1>
          <p className="text-gray-400 text-sm">Manage candidate evaluations and match scorecards.</p>
        </div>
        <div className="bg-[#0F172A]/70 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Evaluations Module</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Evaluation management and automated scoring reviews will be accessible here.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
