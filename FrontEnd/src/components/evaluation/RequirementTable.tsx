import React from 'react';
import { RequirementEvaluation, RequirementStatus, ConfidenceLevel } from '@/types';

interface RequirementTableProps {
  evaluations: RequirementEvaluation[];
  showEvidence?: boolean;
}

export default function RequirementTable({ evaluations, showEvidence = false }: RequirementTableProps) {
  const getStatusBadge = (status: RequirementStatus) => {
    const styles: Record<RequirementStatus, { bg: string; text: string; icon: string }> = {
      [RequirementStatus.FULLY_MET]: {
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-300',
        icon: '✓',
      },
      [RequirementStatus.PARTIALLY_MET]: {
        bg: 'bg-cyan-500/20',
        text: 'text-cyan-300',
        icon: '◐',
      },
      [RequirementStatus.NOT_MET]: {
        bg: 'bg-red-500/20',
        text: 'text-red-300',
        icon: '✗',
      },
      [RequirementStatus.NOT_FOUND]: {
        bg: 'bg-orange-500/20',
        text: 'text-orange-300',
        icon: '?',
      },
      [RequirementStatus.NEEDS_VERIFICATION]: {
        bg: 'bg-amber-500/20',
        text: 'text-amber-300',
        icon: '⊙',
      },
    };

    const style = styles[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${style.bg} ${style.text} text-xs font-semibold`}>
        <span>{style.icon}</span>
        {status}
      </span>
    );
  };

  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    const styles: Record<ConfidenceLevel, { bg: string; text: string }> = {
      [ConfidenceLevel.HIGH]: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
      },
      [ConfidenceLevel.MEDIUM]: {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
      },
      [ConfidenceLevel.LOW]: {
        bg: 'bg-red-500/10',
        text: 'text-red-400',
      },
    };

    const style = styles[confidence];
    return (
      <span className={`inline-flex px-2 py-0.5 rounded ${style.bg} ${style.text} text-xs font-medium`}>
        {confidence}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-300">Requirement</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-300">Category</th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">Mandatory</th>
            <th className="text-left py-4 px-4 text-sm font-semibold text-slate-300">Status</th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">Confidence</th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">Score</th>
            <th className="text-center py-4 px-4 text-sm font-semibold text-slate-300">Match</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.map((evalItem, index) => (
            <React.Fragment key={evalItem.id}>
              <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-4 px-4">
                  <div className="text-white font-medium">{evalItem.requirement.text}</div>
                  {showEvidence && evalItem.hasEvidence && (
                    <div className="text-xs text-slate-400 mt-1">
                      {evalItem.evidence.length} evidence item(s)
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex px-2 py-1 rounded bg-white/5 text-slate-300 text-xs">
                    {evalItem.requirement.category}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  {evalItem.requirement.isMandatory ? (
                    <span className="inline-flex items-center gap-1 text-red-300 text-xs font-semibold">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      YES
                    </span>
                  ) : (
                    <span className="text-slate-500 text-xs">Optional</span>
                  )}
                </td>
                <td className="py-4 px-4">{getStatusBadge(evalItem.status)}</td>
                <td className="py-4 px-4 text-center">{getConfidenceBadge(evalItem.confidence)}</td>
                <td className="py-4 px-4 text-center">
                  <span className="text-white font-semibold">
                    {evalItem.pointsAwarded}/{evalItem.maxPoints}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-sm font-bold ${
                      evalItem.matchPercentage >= 90 ? 'text-emerald-400' :
                      evalItem.matchPercentage >= 70 ? 'text-cyan-400' :
                      evalItem.matchPercentage >= 50 ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                      {evalItem.matchPercentage}%
                    </span>
                    <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          evalItem.matchPercentage >= 90 ? 'bg-emerald-400' :
                          evalItem.matchPercentage >= 70 ? 'bg-cyan-400' :
                          evalItem.matchPercentage >= 50 ? 'bg-amber-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${evalItem.matchPercentage}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
              {showEvidence && evalItem.hasEvidence && (
                <tr className="bg-white/[0.02]">
                  <td colSpan={7} className="py-3 px-4">
                    <div className="pl-4">
                      <div className="text-xs font-semibold text-slate-400 mb-2">Evidence:</div>
                      <div className="space-y-2">
                        {evalItem.evidence.map((evidence) => (
                          <div
                            key={evidence.id}
                            className="bg-white/5 border border-white/10 rounded-lg p-3"
                          >
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  evidence.type === 'Explicit' ? 'bg-emerald-500/20 text-emerald-300' :
                                  evidence.type === 'Semantic' ? 'bg-cyan-500/20 text-cyan-300' :
                                  'bg-amber-500/20 text-amber-300'
                                }`}>
                                  {evidence.type}
                                </span>
                                <span className="text-xs text-slate-400">{evidence.source}</span>
                              </div>
                              <div className="text-xs font-semibold text-cyan-400">
                                {evidence.matchStrength}% match
                              </div>
                            </div>
                            <div className="text-sm text-slate-300 italic">"{evidence.text}"</div>
                            {evidence.explanation && (
                              <div className="text-xs text-slate-400 mt-2">
                                {evidence.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
