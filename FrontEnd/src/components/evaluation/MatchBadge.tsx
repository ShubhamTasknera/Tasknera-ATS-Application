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
      if (score >= 80) {
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
          border: 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
          text: 'text-emerald-700 dark:text-emerald-300',
          icon: '✓',
          label: matchLevel || 'STRONG MATCH',
        };
      }
      if (score >= 50) {
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20',
          border: 'border-amber-500/40 text-amber-700 dark:text-amber-300',
          text: 'text-amber-700 dark:text-amber-300',
          icon: '◐',
          label: matchLevel || 'MODERATE MATCH',
        };
      }
      return {
        bg: 'bg-red-500/10 dark:bg-red-500/20',
        border: 'border-red-500/40 text-red-700 dark:text-red-300',
        text: 'text-red-700 dark:text-red-300',
        icon: '✗',
        label: matchLevel || 'LOW FIT',
      };
    }

    if (matchLevel === MatchLevel.STRONG_MATCH || matchLevel === 'STRONG MATCH') {
      return {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-400/50',
        text: 'text-emerald-300',
        icon: '✓',
        label: 'STRONG MATCH',
      };
    }
    if (matchLevel === MatchLevel.GOOD_MATCH || matchLevel === 'GOOD MATCH') {
      return {
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-400/50',
        text: 'text-cyan-300',
        icon: '✓',
        label: 'GOOD MATCH',
      };
    }
    if (matchLevel === MatchLevel.REVIEW || matchLevel === 'REVIEW' || matchLevel === 'MODERATE MATCH') {
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-400/50',
        text: 'text-amber-300',
        icon: '◐',
        label: matchLevel,
      };
    }
    if (matchLevel === MatchLevel.WEAK_MATCH || matchLevel === 'WEAK MATCH' || matchLevel === 'LOW FIT') {
      return {
        bg: 'bg-orange-500/20',
        border: 'border-orange-400/50',
        text: 'text-orange-300',
        icon: '◒',
        label: matchLevel,
      };
    }
    if (matchLevel === MatchLevel.NOT_RECOMMENDED || matchLevel === 'NOT RECOMMENDED') {
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-400/50',
        text: 'text-red-300',
        icon: '✗',
        label: 'NOT RECOMMENDED',
      };
    }

    if (submissionDecision === SubmissionDecision.SUBMIT || submissionDecision === 'SUBMIT') {
      return {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-400/50',
        text: 'text-emerald-300',
        icon: '→',
        label: 'SUBMIT',
      };
    }
    if (submissionDecision === SubmissionDecision.REVIEW || submissionDecision === 'REVIEW') {
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-400/50',
        text: 'text-amber-300',
        icon: '⊙',
        label: 'REVIEW',
      };
    }
    if (submissionDecision === SubmissionDecision.DO_NOT_SUBMIT || submissionDecision === 'DO NOT SUBMIT') {
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-400/50',
        text: 'text-red-300',
        icon: '⊗',
        label: 'DO NOT SUBMIT',
      };
    }

    return {
      bg: 'bg-white/5',
      border: 'border-white/20',
      text: 'text-slate-300',
      icon: '?',
      label: 'EVALUATION',
    };
  };

  const styles = getStyles();

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1 text-xs sm:text-sm',
    lg: 'px-5 py-2 text-base',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} rounded-full ${styles.bg} border ${styles.border} ${styles.text} font-bold backdrop-blur-xl shadow-sm`}
    >
      <span>{styles.icon}</span>
      <span>{styles.label}</span>
      {typeof score === 'number' && showPercentage && (
        <span className="ml-1 opacity-90">({score}%)</span>
      )}
    </div>
  );
}

