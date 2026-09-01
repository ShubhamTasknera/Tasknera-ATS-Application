'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  /** 'dark' = charcoal text (on light bg), 'light' = white text (on dark bg) */
  variant?: 'dark' | 'light';
  showTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ href = '/home', size = 'md', variant = 'dark', showTagline = true }) => {
  const iconSize  = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const textSize  = size === 'sm' ? 'text-lg sm:text-xl'  : size === 'lg' ? 'text-3xl'  : 'text-2xl';
  const tagSize   = size === 'sm' ? 'text-[8.5px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';
  const taskColor = variant === 'light' ? 'text-white' : 'text-[#1E293B]';
  const tagColor  = variant === 'light' ? 'text-slate-300' : 'text-slate-600';

  const mark = (
    <div className="flex items-center gap-3 select-none group">
      {/* Official TaskNera Logo Icon */}
      <div className={`${iconSize} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/tasknera-logo-symbol.png"
          alt="TaskNera"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col justify-center leading-none">
        <div className={`font-extrabold tracking-tight ${textSize} leading-none`}>
          <span className={taskColor}>Task</span>
          <span className="text-[#FF6E38]">Nera</span>
        </div>
        {showTagline && (
          <span className={`font-semibold tracking-[0.01em] ${tagSize} ${tagColor} mt-1 leading-none`}>
            People. Processes. Performance.
          </span>
        )}
      </div>
    </div>
  );

  return href ? <Link href={href}>{mark}</Link> : mark;
};

export default Logo;
