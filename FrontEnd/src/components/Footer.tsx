import React from 'react';
import Link from 'next/link';
import Logo from './Logo';

const Footer: React.FC = () => (
  <footer className="bg-[#E2E8F0]/60 border-t border-slate-200 mt-auto">
    <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-col items-center md:items-start gap-1">
        <Logo href="/home" size="sm" variant="dark" />
        <p className="text-xs text-slate-500 mt-1">Autonomous Talent Evaluation & Bias-Guard Engine</p>
      </div>
      <div className="flex items-center gap-5 flex-wrap justify-center">
        {['Dashboard','Jobs','Candidates','Evaluations','Reports','Settings'].map(l => (
          <Link key={l} href={`/${l.toLowerCase()}`} className="text-xs font-semibold text-slate-600 hover:text-brand-orange transition-colors">{l}</Link>
        ))}
      </div>
      <p className="text-xs text-slate-400">© {new Date().getFullYear()} TaskNera ATS • All Rights Reserved</p>
    </div>
  </footer>
);

export default Footer;
