'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import AnchorNav from './components/AnchorNav';
import ParsingSection from './components/ParsingSection';
import RankingSection from './components/RankingSection';
import BiasGuardSection from './components/BiasGuardSection';
import IntegrationsSection from './components/IntegrationsSection';
import ProofSection from './components/ProofSection';
import StatInterstitial from './components/StatInterstitial';
import BottomBar from './components/BottomBar';

export default function HomePage() {
  return (
    <div className="relative min-h-screen" style={{ background: 'var(--navy)' }}>
      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Fixed elements */}
      <Header />
      <AnchorNav />
      <BottomBar />

      {/* Page content */}
      <main>
        {/* Hero */}
        <HeroSection />

        {/* ── Spoke 1: Parsing ── */}
        <ParsingSection />

        {/* Interstitial */}
        <StatInterstitial
          value="47"
          label="semantic signals extracted per résumé"
          sublabel="Name, tenure arc, implicit skills, career trajectory, soft skills markers — every one, every time."
        />

        {/* ── Spoke 2: Ranking ── */}
        <RankingSection />

        {/* Interstitial */}
        <StatInterstitial
          value="4.2"
          suffix="s"
          label="average time-to-rank"
          sublabel="From résumé received to ranked position confirmed. At 10,000 résumés or at 1."
        />

        {/* ── Spoke 3: Bias Guard ── */}
        <BiasGuardSection />

        {/* Interstitial */}
        <StatInterstitial
          value="99.1"
          suffix="%"
          label="audit pass rate across 500+ hiring cycles"
          sublabel="Every batch tested for EEOC alignment and statistical parity before results surface."
        />

        {/* ── Spoke 4: Integrations ── */}
        <IntegrationsSection />

        {/* Interstitial */}
        <StatInterstitial
          value="15"
          suffix=" min"
          label="from signup to first ranked shortlist"
          sublabel="Connect your ATS, upload a job description, receive your candidate stack. That's it."
        />

        {/* ── Spoke 5: Proof ── */}
        <ProofSection />
      </main>

      <Footer />
    </div>
  );
}