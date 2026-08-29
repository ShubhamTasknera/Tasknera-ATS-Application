'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'dark' = charcoal text (on light bg), 'light' = white text (on dark bg) */
  variant?: 'dark' | 'light';
}

const Logo: React.FC<LogoProps> = ({ href = '/home', size = 'md', variant = 'dark' }) => {
  const iconSize  = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const textSize  = size === 'sm' ? 'text-lg'  : size === 'lg' ? 'text-3xl'  : 'text-xl';
  const tagSize   = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-xs' : 'text-[9px]';
  const wordColor = variant === 'light' ? 'text-white' : 'text-brand-charcoal';
  const tagColor  = variant === 'light' ? 'text-white/50' : 'text-brand-charcoal-3';

  const mark = (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon mark */}
      <div className={`${iconSize} rounded-xl bg-brand-orange flex items-center justify-center flex-shrink-0 shadow-orange`}>
        <svg viewBox="0 0 28 28" fill="none" className="w-[58%] h-[58%]">
          {/* Abstract "T" checkmark form */}
          <rect x="4" y="4" width="20" height="3.5" rx="1.75" fill="white" opacity="0.9" />
          <rect x="11.25" y="4" width="5.5" height="20" rx="2" fill="white" opacity="0.9" />
          <path d="M7 16.5l4.5 4.5 9.5-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-bold tracking-tight ${textSize} ${wordColor}`}>
          Task<span className="text-brand-orange">Nera</span>
        </span>
        <span className={`uppercase tracking-[0.18em] font-semibold ${tagSize} ${tagColor} mt-0.5`}>
          ATS Platform
        </span>
      </div>
    </div>
  );

  return href ? <Link href={href}>{mark}</Link> : mark;
};

export default Logo;
