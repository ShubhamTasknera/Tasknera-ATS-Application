import React from 'react';
import { MatchLevel, SubmissionDecision } from '@/types';

interface MatchBadgeProps {
  matchLevel?: MatchLevel | string;
  submissionDecision?: SubmissionDecision | string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export default function MatchBadge({
  matchLevel,
  submissionDecision,
  score,
  size = 'md',
  showPercentage = true,
}: MatchBadgeProps) {
  const getStyles = () => {
    // If numeric score is provided
    if (typeof score === 'number') {
      if (score >= 75) {
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          label: matchLevel || 'STRONG MATCH',
        };
      }
      if (score >= 50) {
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: matchLevel || 'MODERATE MATCH',
        };
      }
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
        label: matchLevel || 'LOW FIT',
      };
    }

    if (matchLevel === MatchLevel.STRONG_MATCH || matchLevel === 'STRONG MATCH') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
        label: 'STRONG MATCH',
      };
    }
    if (matchLevel === MatchLevel.GOOD_MATCH || matchLevel === 'GOOD MATCH') {
      return {
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        dot: 'bg-teal-600',
        label: 'GOOD MATCH',
      };
    }
    if (matchLevel === MatchLevel.REVIEW || matchLevel === 'REVIEW' || matchLevel === 'MODERATE MATCH') {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: matchLevel || 'REVIEW',
      };
    }
    if (matchLevel === MatchLevel.WEAK_MATCH || matchLevel === 'WEAK MATCH' || matchLevel === 'LOW FIT') {
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-200',
        dot: 'bg-orange-500',
        label: matchLevel || 'LOW FIT',
      };
    }
    if (matchLevel === MatchLevel.NOT_RECOMMENDED || matchLevel === 'NOT RECOMMENDED') {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
        label: 'NOT RECOMMENDED',
      };
    }

    if (submissionDecision === SubmissionDecision.SUBMIT || submissionDecision === 'SUBMIT') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-600',
        label: 'SUBMIT',
      };
    }
    if (submissionDecision === SubmissionDecision.REVIEW || submissionDecision === 'REVIEW') {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'REVIEW',
      };
    }
    if (
      submissionDecision === SubmissionDecision.DO_NOT_SUBMIT ||
      submissionDecision === 'DO NOT SUBMIT' ||
      submissionDecision === 'REJECT'
    ) {
      return {
        bg: 'bg-rose-50 text-rose-800 border-rose-200',
        dot: 'bg-rose-500',
        label: 'DO NOT SUBMIT',
      };
    }

    return {
      bg: 'bg-slate-50 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      label: 'EVALUATED',
    };
  };

  const style = getStyles();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-bold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-black',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-tight uppercase shadow-2xs ${style.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} flex-shrink-0`} />
      <span>{style.label}</span>
      {typeof score === 'number' && showPercentage && (
        <span className="font-mono font-extrabold ml-0.5">
          {score}%
        </span>
      )}
    </span>
  );
}
