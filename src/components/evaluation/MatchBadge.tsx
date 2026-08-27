import React from 'react';
import { MatchLevel, SubmissionDecision } from '@/types';

interface MatchBadgeProps {
  matchLevel?: MatchLevel;
  submissionDecision?: SubmissionDecision;
  size?: 'sm' | 'md' | 'lg';
}

export default function MatchBadge({ matchLevel, submissionDecision, size = 'md' }: MatchBadgeProps) {
  const getMatchStyles = () => {
    if (matchLevel === MatchLevel.STRONG_MATCH) {
      return {
        bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
        border: 'border-emerald-400/50',
        text: 'text-emerald-300',
        icon: '✓',
      };
    }
    if (matchLevel === MatchLevel.GOOD_MATCH) {
      return {
        bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20',
        border: 'border-cyan-400/50',
        text: 'text-cyan-300',
        icon: '✓',
      };
    }
    if (matchLevel === MatchLevel.REVIEW) {
      return {
        bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
        border: 'border-amber-400/50',
        text: 'text-amber-300',
        icon: '◐',
      };
    }
    if (matchLevel === MatchLevel.WEAK_MATCH) {
      return {
        bg: 'bg-gradient-to-r from-orange-500/20 to-red-500/20',
        border: 'border-orange-400/50',
        text: 'text-orange-300',
        icon: '◒',
      };
    }
    if (matchLevel === MatchLevel.NOT_RECOMMENDED) {
      return {
        bg: 'bg-gradient-to-r from-red-500/20 to-primary-800/20',
        border: 'border-red-400/50',
        text: 'text-red-300',
        icon: '✗',
      };
    }
    return {
      bg: 'bg-white/5',
      border: 'border-white/20',
      text: 'text-white',
      icon: '?',
    };
  };

  const getDecisionStyles = () => {
    if (submissionDecision === SubmissionDecision.SUBMIT) {
      return {
        bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
        border: 'border-emerald-400/50',
        text: 'text-emerald-300',
        icon: '→',
      };
    }
    if (submissionDecision === SubmissionDecision.REVIEW) {
      return {
        bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
        border: 'border-amber-400/50',
        text: 'text-amber-300',
        icon: '⊙',
      };
    }
    if (submissionDecision === SubmissionDecision.DO_NOT_SUBMIT) {
      return {
        bg: 'bg-gradient-to-r from-red-500/20 to-primary-800/20',
        border: 'border-red-400/50',
        text: 'text-red-300',
        icon: '⊗',
      };
    }
    return {
      bg: 'bg-white/5',
      border: 'border-white/20',
      text: 'text-white',
      icon: '?',
    };
  };

  const styles = matchLevel ? getMatchStyles() : getDecisionStyles();
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
    lg: 'px-5 py-2 text-base',
  };

  const displayText = matchLevel || submissionDecision || 'Unknown';

  return (
    <div
      className={`inline-flex items-center gap-2 ${sizeClasses[size]} rounded-full ${styles.bg} border ${styles.border} ${styles.text} font-semibold backdrop-blur-xl`}
    >
      <span>{styles.icon}</span>
      <span>{displayText}</span>
    </div>
  );
}
