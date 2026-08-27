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
  gradient = 'from-cyan to-cyan/80',
  icon,
  description,
}: ScoreCardProps) {
  const displayPercentage = percentage ?? Math.round((score / maxScore) * 100);

  return (
    <div className="relative group">
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 rounded-2xl`} />
      
      <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all duration-500">
        {icon && (
          <div className="mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              {icon}
            </div>
          </div>
        )}
        
        <div className="flex items-end justify-between mb-2">
          <div className="text-3xl font-bold text-white">
            {score}
            <span className="text-slate-400 text-xl">/{maxScore}</span>
          </div>
          <div className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {displayPercentage}%
          </div>
        </div>
        
        <div className="text-sm font-medium text-slate-300 mb-3">{label}</div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-1000 rounded-full`}
            style={{ width: `${displayPercentage}%` }}
          />
        </div>
        
        {description && (
          <div className="mt-3 text-xs text-slate-400">{description}</div>
        )}
      </div>
    </div>
  );
}
