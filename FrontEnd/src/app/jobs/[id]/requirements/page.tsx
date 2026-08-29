'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';

export const SUPPORTED_CATEGORIES = [
  'Experience',
  'Technical Skill',
  'Functional Skill',
  'Technology',
  'Tool',
  'Education',
  'Certification',
  'Industry',
  'Language',
  'Other'
] as const;

export interface RequirementItem {
  id: string;
  jobId: string;
  requirement: string;
  category: string;
  weight: number; // 1.0 - 3.0
  isMandatory: boolean;
  evidenceRequired: boolean;
  recruiterConfirmed: boolean;
  sourceEvidence: string;
  needsVerification?: boolean;
  isRecruiterAdded?: boolean;
}

export default function RequirementsReviewPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const jobId = params.id as string;

  // Job Info
  const [jobTitle, setJobTitle] = useState<string>('Job Specification');
  const [clientName, setClientName] = useState<string>('');

  // Requirement List State
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Status Banners & Warnings
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  // Add Requirement Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Technical Skill');
  const [newIsMandatory, setNewIsMandatory] = useState(true);
  const [newWeight, setNewWeight] = useState(1.0);
  const [newEvidenceRequired, setNewEvidenceRequired] = useState(true);
  const [addFieldError, setAddFieldError] = useState('');

  // Fetch job & requirements from backend API on mount
  useEffect(() => {
    async function loadData() {
      if (!jobId) return;

      try {
        setLoading(true);
        setErrorMsg('');
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const authToken = token || localStorage.getItem('tasknera_token');

        const headers = {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        };

        // 1. Fetch Job Metadata
        const jobRes = await fetch(`${backendUrl}/jobs/${jobId}`, { headers });
        const jobData = await jobRes.json();

        if (jobRes.ok && jobData.job) {
          setJobTitle(jobData.job.position || 'Job Specification');
          setClientName(jobData.job.client || '');
        }

        // 2. Fetch Requirements from Backend API
        const reqRes = await fetch(`${backendUrl}/jobs/${jobId}/requirements`, { headers });
        const reqData = await reqRes.json();

        if (reqRes.ok && reqData.success && Array.isArray(reqData.requirements)) {
          const apiReqs: RequirementItem[] = reqData.requirements.map((r: any) => ({
            id: r.id,
            jobId: r.jobId || jobId,
            requirement: r.requirement,
            category: r.category || 'Other',
            weight: typeof r.weight === 'number' ? r.weight : 1.0,
            isMandatory: Boolean(r.isMandatory),
            evidenceRequired: Boolean(r.evidenceRequired),
            recruiterConfirmed: Boolean(r.recruiterConfirmed),
            sourceEvidence: r.sourceEvidence || r.requirement,
            needsVerification: Boolean(r.needsVerification)
          }));

          setRequirements(apiReqs);
          if (Array.isArray(reqData.warnings)) {
            setWarnings(reqData.warnings);
          }
        } else if (jobData.job?.requirements && Array.isArray(jobData.job.requirements)) {
          // Fallback to job nested requirements if GET /requirements endpoint returned empty
          const fallbackReqs: RequirementItem[] = jobData.job.requirements.map((r: any, idx: number) => ({
            id: r.id || `req-${idx}`,
            jobId: jobId,
            requirement: r.requirement,
            category: r.category || 'Other',
            weight: typeof r.weight === 'number' ? r.weight : 1.0,
            isMandatory: Boolean(r.is_mandatory ?? r.isMandatory),
            evidenceRequired: Boolean(r.evidence_required ?? r.evidenceRequired),
            recruiterConfirmed: Boolean(r.recruiter_confirmed ?? r.recruiterConfirmed),
            sourceEvidence: r.source_evidence || r.sourceEvidence || r.requirement,
            needsVerification: Boolean(r.needs_verification ?? r.needsVerification)
          }));
          setRequirements(fallbackReqs);
        }
      } catch (err: any) {
        console.error('Error fetching job requirements:', err);
        setErrorMsg(err.message || 'Failed to load requirements from backend API.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [jobId, token]);

  // Recruiter Action: Update Single Requirement Field
  const handleUpdateField = (id: string, updates: Partial<RequirementItem>) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  // Recruiter Action: Delete Requirement
  const handleDeleteRequirement = async (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id));

    // Optional API call to delete single item if exists on backend
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const authToken = token || localStorage.getItem('tasknera_token');
      await fetch(`${backendUrl}/jobs/${jobId}/requirements/${id}`, {
        method: 'DELETE',
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
    } catch (e) {
      // Ignored for unsaved local items
    }
  };

  // Recruiter Action: Toggle Mandatory / Preferred
  const handleToggleMandatory = (id: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isMandatory: !r.isMandatory, needsVerification: false } : r))
    );
  };

  // Recruiter Action: Toggle Confirmation
  const handleToggleConfirmed = (id: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, recruiterConfirmed: !r.recruiterConfirmed } : r))
    );
  };

  // Recruiter Action: Add Requirement
  const handleAddRequirement = () => {
    if (!newText || !newText.trim()) {
      setAddFieldError('Requirement text cannot be empty.');
      return;
    }

    if (newWeight < 1.0 || newWeight > 3.0) {
      setAddFieldError('Weight must be between 1.0x and 3.0x.');
      return;
    }

    const newItem: RequirementItem = {
      id: `req-custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      jobId: jobId,
      requirement: newText.trim(),
      category: newCategory,
      weight: newWeight,
      isMandatory: newIsMandatory,
      evidenceRequired: newEvidenceRequired,
      recruiterConfirmed: true,
      sourceEvidence: 'User added requirement by recruiter',
      isRecruiterAdded: true
    };

    setRequirements((prev) => [...prev, newItem]);
    setNewText('');
    setAddFieldError('');
    setShowAddForm(false);
  };

  // Recruiter Action: Save & Confirm Requirements API Call
  const handleSaveAndConfirm = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    // Validation 1: Check empty requirements
    const emptyItem = requirements.find((r) => !r.requirement || !r.requirement.trim());
    if (emptyItem) {
      setErrorMsg('Requirement text cannot be empty. Please remove or fix blank items.');
      return;
    }

    // Validation 2: Check weight range (1.0x - 3.0x)
    const invalidWeightItem = requirements.find((r) => r.weight < 1.0 || r.weight > 3.0);
    if (invalidWeightItem) {
      setErrorMsg(`Invalid weight for "${invalidWeightItem.requirement}". Weight must be between 1.0x and 3.0x.`);
      return;
    }

    setIsSaving(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const authToken = token || localStorage.getItem('tasknera_token');

      const payload = {
        requirements: requirements.map((r) => ({
          id: r.id.startsWith('req-custom') ? undefined : r.id,
          jobId: jobId,
          requirement: r.requirement.trim(),
          category: r.category,
          weight: r.weight,
          isMandatory: r.isMandatory,
          evidenceRequired: r.evidenceRequired,
          recruiterConfirmed: true,
          sourceEvidence: r.sourceEvidence || r.requirement.trim(),
          needsVerification: false
        }))
      };

      const res = await fetch(`${backendUrl}/jobs/${jobId}/requirements/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to confirm requirements on server.');
      }

      setSuccessMsg(data.message || 'Requirements confirmed successfully.');

      // Update UI state with persisted items from backend API
      if (Array.isArray(data.requirements)) {
        const confirmedList: RequirementItem[] = data.requirements.map((r: any) => ({
          id: r.id,
          jobId: r.jobId || jobId,
          requirement: r.requirement,
          category: r.category || 'Other',
          weight: typeof r.weight === 'number' ? r.weight : 1.0,
          isMandatory: Boolean(r.isMandatory),
          evidenceRequired: Boolean(r.evidenceRequired),
          recruiterConfirmed: true,
          sourceEvidence: r.sourceEvidence || r.requirement,
          needsVerification: false
        }));
        setRequirements(confirmedList);
      }

      setTimeout(() => {
        router.push('/jobs');
      }, 1200);
    } catch (err: any) {
      console.error('Save & Confirm Error:', err);
      setErrorMsg(err.message || 'An error occurred while saving requirements.');
    } finally {
      setIsSaving(false);
    }
  };

  const mandatoryReqs = requirements.filter((r) => r.isMandatory);
  const preferredReqs = requirements.filter((r) => !r.isMandatory);

  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      {/* Global Navigation Header */}
      <Header />

      <main className="max-w-6xl mx-auto px-6 pt-28 pb-16 w-full flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs Directory
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-semibold">
              Stage 2: Review Extracted Criteria
            </span>
          </div>
        </div>

        {/* Page Title & Header Banner */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">{jobTitle}</h1>
              {clientName && <p className="text-gray-400 text-sm">Client / Company: <span className="text-gray-200 font-medium">{clientName}</span></p>}
            </div>

            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 self-start md:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Requirement
            </button>
          </div>

          {/* Workflow Steps Indicator */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-800/80">
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center justify-center">
                ✓
              </div>
              <span className="text-sm font-semibold">1. Upload & Scan JD</span>
            </div>
            <div className="flex-1 h-px bg-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow">
                2
              </div>
              <span className="text-sm font-semibold text-white">2. Review & Confirm Requirements</span>
            </div>
            <div className="flex-1 h-px bg-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <span className="text-sm text-gray-500">3. Candidate Matching</span>
            </div>
          </div>
        </div>

        {/* Global Success / Error Banners */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-semibold block mb-0.5">Validation / API Warning</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
            <span className="font-semibold block text-amber-400 text-xs">Duplicate Requirement Warnings:</span>
            {warnings.map((w, idx) => (
              <p key={idx}>• {w}</p>
            ))}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="p-12 text-center text-gray-400 animate-pulse bg-[#0F172A]/80 border border-gray-800 rounded-2xl">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span className="text-sm font-medium">Fetching extracted requirements from backend API...</span>
          </div>
        )}

        {/* Add Requirement Form Modal / Inline Box */}
        {showAddForm && (
          <div className="mb-8 p-6 rounded-2xl bg-[#0F172A] border border-blue-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Add New Recruiter Requirement
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                ✕ Cancel
              </button>
            </div>

            {addFieldError && (
              <p className="text-rose-400 text-xs font-semibold">{addFieldError}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                  Requirement Text <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g. 3+ years experience with React.js and Next.js"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#070B14] border border-gray-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Category <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070B14] border border-gray-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    {SUPPORTED_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Classification
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewIsMandatory(!newIsMandatory)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      newIsMandatory
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}
                  >
                    {newIsMandatory ? '⚠ Mandatory' : '○ Preferred'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                    Weight (1.0x – 3.0x)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    value={newWeight}
                    onChange={(e) => setNewWeight(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070B14] border border-gray-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newEvidenceRequired}
                    onChange={(e) => setNewEvidenceRequired(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-0"
                  />
                  <span>Evidence Required in Candidate CV</span>
                </label>

                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
                >
                  Add Requirement to List
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && requirements.length === 0 && (
          <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-12 text-center text-gray-400 mb-8">
            <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-white font-semibold text-base mb-1">No requirements were extracted from this JD.</p>
            <p className="text-xs text-gray-400 mb-4">Click "+ Add Requirement" to manually define requirements for candidate evaluation.</p>
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all"
            >
              + Manually Add Requirement
            </button>
          </div>
        )}

        {!loading && requirements.length > 0 && (
          <div className="space-y-8">
            {/* Section 1: Mandatory Requirements */}
            <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                  <h2 className="text-xl font-bold text-white">
                    Mandatory Requirements ({mandatoryReqs.length})
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold">
                  Strictly Enforced
                </span>
              </div>

              <div className="space-y-4">
                {mandatoryReqs.length === 0 ? (
                  <p className="text-gray-500 text-xs italic">No mandatory requirements set.</p>
                ) : (
                  mandatoryReqs.map((req) => (
                    <RequirementCard
                      key={req.id}
                      item={req}
                      onUpdateField={handleUpdateField}
                      onToggleMandatory={handleToggleMandatory}
                      onToggleConfirmed={handleToggleConfirmed}
                      onDelete={handleDeleteRequirement}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Section 2: Preferred Requirements */}
            <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <h2 className="text-xl font-bold text-white">
                    Preferred Requirements ({preferredReqs.length})
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold">
                  Bonus Points
                </span>
              </div>

              <div className="space-y-4">
                {preferredReqs.length === 0 ? (
                  <p className="text-gray-500 text-xs italic">No preferred requirements set.</p>
                ) : (
                  preferredReqs.map((req) => (
                    <RequirementCard
                      key={req.id}
                      item={req}
                      onUpdateField={handleUpdateField}
                      onToggleMandatory={handleToggleMandatory}
                      onToggleConfirmed={handleToggleConfirmed}
                      onDelete={handleDeleteRequirement}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-4">
              <Link
                href="/jobs"
                className="px-6 py-3 bg-gray-800/80 hover:bg-gray-800 text-gray-300 text-sm font-semibold rounded-xl transition-colors border border-gray-700/60"
              >
                Back to Jobs
              </Link>

              <button
                type="button"
                onClick={handleSaveAndConfirm}
                disabled={isSaving || requirements.length === 0}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving & Confirming Requirements...</span>
                  </>
                ) : (
                  <>
                    <span>Save & Confirm Requirements</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

// Requirement Card Component matching Section 2 of Task 2
function RequirementCard({
  item,
  onUpdateField,
  onToggleMandatory,
  onToggleConfirmed,
  onDelete
}: {
  item: RequirementItem;
  onUpdateField: (id: string, updates: Partial<RequirementItem>) => void;
  onToggleMandatory: (id: string) => void;
  onToggleConfirmed: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showSource, setShowSource] = useState(false);

  return (
    <div className="p-5 rounded-2xl bg-[#070B14] border border-gray-800 hover:border-gray-700/80 transition-all space-y-3">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mandatory / Preferred Status Button */}
          <button
            type="button"
            onClick={() => onToggleMandatory(item.id)}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              item.isMandatory
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
            }`}
          >
            {item.isMandatory ? '⚠ Mandatory' : '○ Preferred'}
          </button>

          {/* Unclear Classification Flag */}
          {item.needsVerification && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
              Needs Verification
            </span>
          )}

          {/* Recruiter Added Flag */}
          {item.isRecruiterAdded && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              Recruiter Added
            </span>
          )}

          {/* Recruiter Confirmed Toggle Badge */}
          <button
            type="button"
            onClick={() => onToggleConfirmed(item.id)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-colors cursor-pointer ${
              item.recruiterConfirmed
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
            }`}
          >
            Recruiter Confirmed: {item.recruiterConfirmed ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Delete Action Button */}
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="text-gray-500 hover:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1 self-end sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete</span>
        </button>
      </div>

      {/* Requirement Text Input */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
          Requirement
        </label>
        <input
          type="text"
          value={item.requirement}
          onChange={(e) => onUpdateField(item.id, { requirement: e.target.value })}
          className="w-full px-3.5 py-2 rounded-xl bg-[#0A0F1E] border border-gray-800 text-white text-xs font-medium focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Grid Controls: Category, Weight, Evidence Required */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Category Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Category
          </label>
          <select
            value={item.category}
            onChange={(e) => onUpdateField(item.id, { category: e.target.value })}
            className="w-full px-3 py-1.5 rounded-xl bg-[#0A0F1E] border border-gray-800 text-white text-xs focus:outline-none focus:border-blue-500"
          >
            {SUPPORTED_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Weight Selector */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Weight ({item.weight.toFixed(1)}x)
          </label>
          <input
            type="number"
            step="0.1"
            min="1.0"
            max="3.0"
            value={item.weight}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) {
                onUpdateField(item.id, { weight: val });
              }
            }}
            className="w-full px-3 py-1.5 rounded-xl bg-[#0A0F1E] border border-gray-800 text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Evidence Required Checkbox */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
            Evidence Required
          </label>
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A0F1E] border border-gray-800 text-xs text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={item.evidenceRequired}
              onChange={(e) => onUpdateField(item.id, { evidenceRequired: e.target.checked })}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-blue-600 focus:ring-0"
            />
            <span>{item.evidenceRequired ? 'ON (Required)' : 'OFF (Optional)'}</span>
          </label>
        </div>
      </div>

      {/* Read-Only Informational Source Evidence Block */}
      <div className="pt-2 border-t border-gray-800/60">
        <button
          type="button"
          onClick={() => setShowSource(!showSource)}
          className="text-[11px] text-gray-400 hover:text-blue-400 font-mono flex items-center gap-1"
        >
          <span>{showSource ? '▼ Hide Source Evidence' : '▶ View Verbatim Source Evidence'}</span>
        </button>

        {showSource && (
          <div className="mt-2 p-3 rounded-xl bg-[#0A0F1E] border border-gray-800 text-xs font-mono text-gray-300">
            <span className="text-gray-500 block text-[10px] uppercase font-bold mb-1">Verbatim Source Evidence (Informational — Non-Editable):</span>
            <p className="italic text-gray-300">"{item.sourceEvidence || item.requirement}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
