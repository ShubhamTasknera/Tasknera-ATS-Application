'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ClientProfilesPage() {
  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      <Header />
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Client Profiles</h1>
          <p className="text-gray-400 text-sm">View client company profiles, job requirements, and hiring preferences.</p>
        </div>
        <div className="bg-[#0F172A]/70 border border-gray-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Client Profiles Module</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Client directories and organizational profile management will be accessible here.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
