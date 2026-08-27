'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StatInterstitialProps {
  value: string;
  label: string;
  sublabel?: string;
  prefix?: string;
  suffix?: string;
}

const StatInterstitial: React.FC<StatInterstitialProps> = ({
  value,
  label,
  sublabel,
  prefix = '',
  suffix = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="stat-interstitial py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div
          className={`transition-all duration-700 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="counter-num mb-3">
            {prefix}
            <span className="text-glow">{value}</span>
            {suffix}
          </p>
          <p className="text-[1.1rem] font-500 text-ui-white mb-2">{label}</p>
          {sublabel && (
            <p className="text-[13px] text-ui-muted max-w-md mx-auto">{sublabel}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatInterstitial;
