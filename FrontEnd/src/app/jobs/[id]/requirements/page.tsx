'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { sampleJobs } from '@/data/mockData';
import { Requirement, RequirementCategory } from '@/types';

export default function RequirementsReviewPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  // Get job data
  const job = sampleJobs.find(j => j.id === jobId) || sampleJobs[0];
  
  // State for editable requirements
  const [mandatoryReqs, setMandatoryReqs] = useState<Requirement[]>(job.mandatoryRequirements);
  const [preferredReqs, setPreferredReqs] = useState<Requirement[]>(job.preferredRequirements);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateRequirement = (
    id: string,
    isMandatory: boolean,
    updates: Partial<Requirement>
  ) => {
    if (isMandatory) {
      setMandatoryReqs(prev =>
        prev.map(req => (req.id === id ? { ...req, ...updates } : req))
      );
    } else {
      setPreferredReqs(prev =>
        prev.map(req => (req.id === id ? { ...req, ...updates } : req))
      );
    }
  };

  const handleToggleMandatory = (id: string, currentlyMandatory: boolean) => {
    if (currentlyMandatory) {
      // Move from mandatory to preferred
      const req = mandatoryReqs.find(r => r.id === id);
      if (req) {
        setMandatoryReqs(prev => prev.filter(r => r.id !== id));
        setPreferredReqs(prev => [...prev, { ...req, isMandatory: false }]);
      }
    } else {
      // Move from preferred to mandatory
      const req = preferredReqs.find(r => r.id === id);
      if (req) {
        setPreferredReqs(prev => prev.filter(r => r.id !== id));
        setMandatoryReqs(prev => [...prev, { ...req, isMandatory: true }]);
      }
    }
  };

  const handleSaveAndContinue = () => {
    setIsSaving(true);
    // Simulate saving
    setTimeout(() => {
      router.push(`/jobs/${jobId}/upload-cvs`);
    }, 1500);
  };

  const RequirementRow = ({ req, isMandatory }: { req: Requirement; isMandatory: boolean }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Requirement Text */}
        <div className="lg:col-span-4">
          <label className="block text-xs font-medium text-slate-400 mb-2">Requirement</label>
          <input
            type="text"
            value={req.text}
            onChange={(e) =>
              handleUpdateRequirement(req.id, isMandatory, { text: e.target.value })
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        {/* Category */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
          <select
            value={req.category}
            onChange={(e) =>
              handleUpdateRequirement(req.id, isMandatory, {
                category: e.target.value as RequirementCategory,
              })
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            {Object.values(RequirementCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Weight */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Weight (Points)</label>
          <input
            type="number"
            min="1"
            max="20"
            value={req.weight}
            onChange={(e) =>
              handleUpdateRequirement(req.id, isMandatory, { weight: parseInt(e.target.value) })
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>

        {/* Mandatory Toggle */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Type</label>
          <button
            type="button"
            onClick={() => handleToggleMandatory(req.id, isMandatory)}
            className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isMandatory
                ? 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            {isMandatory ? '⚠ Mandatory' : '○ Preferred'}
          </button>
        </div>

        {/* Evidence Required */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-slate-400 mb-2">Evidence</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={req.evidenceRequired}
              onChange={(e) =>
                handleUpdateRequirement(req.id, isMandatory, {
                  evidenceRequired: e.target.checked,
                })
              }
              className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
            />
            <span className="text-sm text-slate-300">Required</span>
          </label>
        </div>
      </div>
    </div>
  );

  const totalMandatoryWeight = mandatoryReqs.reduce((sum, req) => sum + req.weight, 0);
  const totalPreferredWeight = preferredReqs.reduce((sum, req) => sum + req.weight, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan to-gunmetal rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-white">Tasknera</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{job.title}</h1>
              <p className="text-slate-400">
                Review and edit extracted requirements before candidate evaluation
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">Total Weight</div>
              <div className="text-2xl font-bold text-white">
                {totalMandatoryWeight + totalPreferredWeight} points
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                ✓
              </div>
              <span className="text-emerald-300 font-medium">Upload JD</span>
            </div>
            <div className="flex-1 h-px bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan to-cyan/80 rounded-full flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <span className="text-white font-medium">Review Requirements</span>
            </div>
            <div className="flex-1 h-px bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-slate-400 font-bold text-sm">
                3
              </div>
              <span className="text-slate-400">Upload CVs</span>
            </div>
          </div>
        </div>

        {/* Alert Box */}
        <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-primary-300 font-semibold mb-1">Review Carefully</p>
              <p className="text-primary-200/80 text-sm">
                AI has extracted {mandatoryReqs.length} mandatory and {preferredReqs.length} preferred requirements.
                Review each one and adjust categories, weights, or mandatory status as needed.
                Requirements marked as Mandatory will be strictly enforced during candidate evaluation.
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Requirements */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-danger-500/10 to-danger-600/10 border border-danger-500/30 rounded-xl p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h2 className="text-xl font-bold text-white">Mandatory Requirements</h2>
                  <p className="text-sm text-red-200/80">These requirements must be satisfied for candidate submission</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-red-300 mb-1">Total Weight</div>
                <div className="text-2xl font-bold text-white">{totalMandatoryWeight} / 50</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {mandatoryReqs.map(req => (
              <RequirementRow key={req.id} req={req} isMandatory={true} />
            ))}
          </div>
        </div>

        {/* Preferred Requirements */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <h2 className="text-xl font-bold text-white">Preferred Requirements</h2>
                  <p className="text-sm text-cyan-200/80">Nice-to-have qualifications that add bonus points</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-cyan-300 mb-1">Total Weight</div>
                <div className="text-2xl font-bold text-white">{totalPreferredWeight} / 5</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {preferredReqs.map(req => (
              <RequirementRow key={req.id} req={req} isMandatory={false} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-2xl p-6 border border-white/10">
          <Link
            href={`/jobs/create`}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all"
          >
            ← Back
          </Link>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all"
            >
              Save as Draft
            </button>
            <button
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="px-8 py-3 bg-gradient-to-r from-cyan to-gunmetal hover:from-cyan/90 hover:to-gunmetal/90 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-cyan/30 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  Save & Continue to CV Upload
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
