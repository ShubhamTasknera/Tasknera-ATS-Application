import React from 'react';

interface ScoreCardProps {
  score: number;
  maxScore: number;
  label: string;
  percentage?: number;
  gradient?: string;
  icon?: React.ReactNode;
  description?: string;
}

export default function ScoreCard({
  score,
  maxScore,
  label,
  percentage,
  icon,
  description,
}: ScoreCardProps) {
  const displayPercentage = percentage ?? Math.round((score / maxScore) * 100);

  // Determine score color & status badge
  const isHigh = displayPercentage >= 75;
  const isMid = displayPercentage >= 50 && displayPercentage < 75;

  const accentColor = isHigh
    ? 'text-emerald-700'
    : isMid
    ? 'text-amber-700'
    : 'text-rose-700';

  const badgeBg = isHigh
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : isMid
    ? 'bg-amber-50 border-amber-200 text-amber-800'
    : 'bg-rose-50 border-rose-200 text-rose-800';

  const progressBarColor = isHigh
    ? 'bg-emerald-600'
    : isMid
    ? 'bg-amber-500'
    : 'bg-rose-500';

  return (
    <div className="relative bg-white border border-slate-200/90 rounded-xl p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
      {/* Top row: Label & Percentage Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[12px] font-bold tracking-tight text-slate-700 uppercase">
          {label}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${badgeBg}`}>
          {displayPercentage}%
        </span>
      </div>

      {/* Main Score Metrics */}
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono">
            {score}
          </span>
          <span className="text-xs font-semibold text-slate-400 font-mono">
            /{maxScore}
          </span>
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      {/* Sleek Progress Bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${progressBarColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, displayPercentage))}%` }}
        />
      </div>

      {/* Description / Subtext */}
      {description && (
        <div className="text-[11px] font-medium text-slate-500 truncate pt-1 border-t border-slate-100/80">
          {description}
        </div>
      )}
    </div>
  );
}
