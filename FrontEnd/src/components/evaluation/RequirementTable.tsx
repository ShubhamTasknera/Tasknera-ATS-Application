import React, { useState } from 'react';
import { RequirementEvaluation, RequirementStatus, ConfidenceLevel } from '@/types';

interface RequirementTableProps {
  evaluations: RequirementEvaluation[];
  showEvidence?: boolean;
}

export default function RequirementTable({ evaluations, showEvidence = true }: RequirementTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: RequirementStatus) => {
    switch (status) {
      case RequirementStatus.FULLY_MET:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-extrabold whitespace-nowrap shadow-2xs">
            <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Fully Met
          </span>
        );
      case RequirementStatus.PARTIALLY_MET:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 text-xs sm:text-sm font-extrabold whitespace-nowrap shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
            Partially Met
          </span>
        );
      case RequirementStatus.NOT_MET:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-900 border border-rose-300 text-xs sm:text-sm font-extrabold whitespace-nowrap shadow-2xs">
            <svg className="w-4 h-4 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Not Met
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const getConfidenceText = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case ConfidenceLevel.HIGH:
        return 'High Confidence';
      case ConfidenceLevel.MEDIUM:
        return 'Medium Confidence';
      case ConfidenceLevel.LOW:
        return 'Low Confidence';
      default:
        return String(confidence);
    }
  };

  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs font-semibold">
        No specific requirement criteria loaded for this evaluation audit.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {evaluations.map((evalItem) => {
        const isExpanded = Boolean(expandedRows[evalItem.id]);
        const hasEvidenceItems = evalItem.hasEvidence && evalItem.evidence && evalItem.evidence.length > 0;

        return (
          <div
            key={evalItem.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 hover:border-slate-300 transition-all shadow-[0_2px_8px_rgba(15,23,42,0.04)]"
          >
            {/* Top row: Priority, Category, Confidence tags + Score pts */}
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {evalItem.requirement.isMandatory ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                    Mandatory
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    Preferred
                  </span>
                )}
                <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  {evalItem.requirement.category || 'Technical Skill'}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  • {getConfidenceText(evalItem.confidence)}
                </span>
              </div>

              {/* Large Score Metric on Right */}
              <div className="flex items-center gap-2.5 font-mono text-sm sm:text-base font-black text-slate-900">
                <span>{evalItem.pointsAwarded} / {evalItem.maxPoints} pts</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-extrabold ${
                  evalItem.matchPercentage >= 75
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    : evalItem.matchPercentage >= 50
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-rose-100 text-rose-900 border border-rose-200'
                }`}>
                  {evalItem.matchPercentage}%
                </span>
              </div>
            </div>

            {/* Middle row: Large Prominent Requirement text + Status Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-2">
              <div className="flex-1 pr-2">
                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug tracking-tight">
                  {evalItem.requirement.text}
                </h4>
              </div>

              <div className="flex-shrink-0 self-start sm:self-center">
                {getStatusBadge(evalItem.status)}
              </div>
            </div>

            {/* Evidence toggle bar & Progress Bar */}
            {hasEvidenceItems && showEvidence && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <button
                  onClick={() => toggleRow(evalItem.id)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-orange hover:text-orange-700 cursor-pointer transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>{isExpanded ? 'Hide Verified Resume Evidence' : `▸ ${evalItem.evidence.length} Verified Evidence Snippet in CV`}</span>
                </button>

                <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      evalItem.matchPercentage >= 75
                        ? 'bg-emerald-600'
                        : evalItem.matchPercentage >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${evalItem.matchPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Expanded Verified Evidence Drawer */}
            {isExpanded && hasEvidenceItems && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-fadeIn">
                <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                  Extracted CV Verification & Context:
                </div>
                {evalItem.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {ev.type || 'Direct Match'}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          {ev.source || 'Candidate Resume Text'}
                        </span>
                      </div>
                      <p className="text-slate-900 font-serif italic text-xs sm:text-sm leading-relaxed mt-1">
                        &ldquo;{ev.text}&rdquo;
                      </p>
                    </div>
                    {typeof ev.matchStrength === 'number' && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                        {ev.matchStrength}% Match
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
