'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';

interface ExtractedRequirement {
  id: string;
  requirement: string;
  category: string;
  mandatory: boolean;
  weight: number;
  sourceEvidence?: string;
}

interface DocumentMetrics {
  fileName: string;
  fileType: string;
  pageCount: number;
  extractionMethod: string;
  ocrUsed: boolean;
  textLength: number;
  wordCount: number;
  lineCount: number;
}

export default function CreateJobPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Form State
  const [client, setClient] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<'Remote' | 'Hybrid' | 'Onsite'>('Hybrid');
  const [salary, setSalary] = useState('');
  const [jdText, setJdText] = useState('');

  // Debug & Metrics State
  const [rawText, setRawText] = useState('');
  const [layoutText, setLayoutText] = useState('');
  const [normalizedText, setNormalizedText] = useState('');
  const [docMetrics, setDocMetrics] = useState<DocumentMetrics | null>(null);
  const [showRawTextDrawer, setShowRawTextDrawer] = useState(false);

  // File Upload State
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanComplete, setScanComplete] = useState(false);

  // Scanned Requirements State
  const [requirements, setRequirements] = useState<ExtractedRequirement[]>([]);
  const [newReqText, setNewReqText] = useState('');
  const [newReqMandatory, setNewReqMandatory] = useState(true);

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ client?: string; position?: string }>({});

  // Backend Parsing API Integration
  const sendToBackendParseApi = async (fileOrText: File | string) => {
    setIsScanning(true);
    setScanComplete(false);
    setErrorMsg('');
    setDocMetrics(null);
    setScanStep('Sending document to backend parsing pipeline...');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const authToken = token || localStorage.getItem('tasknera_token');

      let response: Response;

      if (typeof fileOrText === 'string') {
        setScanStep('Executing backend text extraction & section detection...');
        response = await fetch(`${backendUrl}/jobs/parse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          },
          body: JSON.stringify({ text: fileOrText })
        });
      } else {
        setScanStep('Extracting PDF/Word document bytes & running Quality Assessment / OCR...');
        const formData = new FormData();
        formData.append('file', fileOrText);

        response = await fetch(`${backendUrl}/jobs/parse`, {
          method: 'POST',
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
          },
          body: formData
        });
      }

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to parse document on backend server.');
      }

      setScanStep('Validating metadata & extracting individual criteria...');

      const { job, requirements: extractedReqs, document: docInfo } = resData.data;

      if (docInfo) {
        setDocMetrics(docInfo);
      }

      // Populate extracted metadata cleanly
      setPosition(job.jobTitle || '');
      setClient(job.company || '');
      setLocation(job.location || '');
      setSalary(job.salary || '');
      if (job.workMode && ['Remote', 'Hybrid', 'Onsite'].includes(job.workMode)) {
        setWorkMode(job.workMode as any);
      }

      setRawText(resData.rawText || '');
      setLayoutText(resData.layoutText || resData.rawText || '');
      setNormalizedText(resData.normalizedText || resData.rawText || '');
      setJdText(resData.rawText || '');

      // Format requirements
      const formattedReqs: ExtractedRequirement[] = Array.isArray(extractedReqs)
        ? extractedReqs.map((r: any, idx: number) => ({
            id: `req-${Date.now()}-${idx}`,
            requirement: r.requirement,
            category: r.category || 'General',
            mandatory: Boolean(r.mandatory),
            weight: r.weight || (r.mandatory ? 5 : 2),
            sourceEvidence: r.sourceEvidence || r.requirement
          }))
        : [];

      setRequirements(formattedReqs);
      setIsScanning(false);
      setScanComplete(true);
    } catch (err: any) {
      console.error('Backend parse error:', err);
      setIsScanning(false);
      setErrorMsg(err.message || 'Unable to extract structured data from document.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    sendToBackendParseApi(file);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadedFile(null);
    setJdText('');
    setRawText('');
    setLayoutText('');
    setNormalizedText('');
    setDocMetrics(null);
    setScanComplete(false);
    setScanStep('');
    setRequirements([]);
    setClient('');
    setPosition('');
    setLocation('');
    setSalary('');
    setWorkMode('Hybrid');
  };

  const handleAddCustomRequirement = () => {
    if (!newReqText || !newReqText.trim()) return;

    const newReq: ExtractedRequirement = {
      id: `req-custom-${Date.now()}`,
      requirement: newReqText.trim(),
      category: 'General',
      mandatory: newReqMandatory,
      weight: newReqMandatory ? 5 : 2,
      sourceEvidence: 'User added custom requirement'
    };

    setRequirements(prev => [...prev, newReq]);
    setNewReqText('');
  };

  const handleRemoveRequirement = (id: string) => {
    setRequirements(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleMandatory = (id: string) => {
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, mandatory: !r.mandatory } : r));
  };

  const validateForm = () => {
    const errors: { client?: string; position?: string } = {};
    if (!client || !client.trim()) {
      errors.client = 'Client / Company name is required';
    }
    if (!position || !position.trim()) {
      errors.position = 'Position title is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) {
      return;
    }

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const authToken = token || localStorage.getItem('tasknera_token');

      const response = await fetch(`${backendUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          client: client.trim(),
          position: position.trim(),
          location: location.trim() || undefined,
          work_mode: workMode,
          salary: salary.trim() || undefined,
          jd_text: jdText.trim() || undefined,
          jd_file_url: uploadedFile ? uploadedFile.name : undefined,
          status: 'draft',
          requirements: requirements.map(r => ({
            requirement: r.requirement,
            category: r.category,
            is_mandatory: r.mandatory,
            weight: r.weight,
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job');
      }

      const createdJobId = data.job?.id;

      if (!createdJobId) {
        throw new Error('Server response missing Job ID');
      }

      router.push(`/jobs/${createdJobId}/requirements`);
    } catch (err: any) {
      console.error('Job creation error:', err);
      setErrorMsg(err.message || 'An error occurred while creating the job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSampleJD = () => {
    const sampleText = `Job Title: SAP CO Consultant
Company: TechCorp Industries
Location: New York, NY
Work Mode: Hybrid
Salary: $130,000 - $170,000

Overview:
We are seeking an experienced SAP CO Consultant with strong manufacturing domain knowledge.

Requirements:
- 5+ years SAP CO experience (Mandatory)
- 4+ years SAP S/4HANA experience (Mandatory)
- Manufacturing industry experience (Mandatory)
- SAP implementation project experience
- Bachelor's degree in Finance, Accounting or related field
- SAP certification (Preferred)
- Power BI experience (Preferred)

Responsibilities:
- Configure and customize SAP CO modules
- Lead S/4HANA implementation projects`;

    sendToBackendParseApi(sampleText);
  };

  const mandatoryCount = requirements.filter(r => r.mandatory).length;
  const preferredCount = requirements.filter(r => !r.mandatory).length;

  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col justify-between">
      {/* Global Header */}
      <Header />

      <main className="max-w-5xl mx-auto px-6 pt-28 pb-16 w-full flex-1">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Jobs List
          </Link>
          <button
            type="button"
            onClick={loadSampleJD}
            className="px-3.5 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Load SAP CO Sample JD & Scan
          </button>
        </div>

        {/* Page Title Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Create New Job & Scan JD</h1>
              <p className="text-gray-400 text-sm">Upload PDF/Word JD files or paste text to automatically scan & extract candidate requirements</p>
            </div>
          </div>

          {/* Workflow Steps Indicator */}
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <span className="text-sm font-semibold text-white">Upload & Scan JD</span>
            </div>
            <div className="flex-1 h-px bg-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 font-bold text-xs flex items-center justify-center">
                2
              </div>
              <span className="text-sm text-gray-500">Review Extracted Criteria</span>
            </div>
            <div className="flex-1 h-px bg-gray-800" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-800 text-gray-400 font-bold text-xs flex items-center justify-center">
                3
              </div>
              <span className="text-sm text-gray-500">Candidate Pipeline</span>
            </div>
          </div>
        </div>

        {/* Global Error State Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-semibold block mb-0.5">Extraction / Parsing Warning</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Document Upload & Scanner Panel */}
          <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <h2 className="text-lg font-semibold text-white">Job Description File Upload & Scanner (with OCR)</h2>
              </div>

              {/* Mode Tabs */}
              <div className="flex gap-1.5 bg-[#070B14] p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('file')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'file' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📄 Upload PDF / Word File
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'text' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📝 Paste JD Text
                </button>
              </div>
            </div>

            {/* File Upload Zone */}
            {activeTab === 'file' ? (
              <div className="relative border-2 border-dashed border-gray-800 hover:border-blue-500/50 rounded-2xl p-8 text-center transition-all bg-[#070B14]/60 group">
                {!uploadedFile && (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                )}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  {uploadedFile ? (
                    <div className="relative z-20 flex flex-col items-center">
                      <p className="text-white font-semibold text-sm mb-2">Uploaded Document:</p>
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-3">
                        <span>📄 {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer z-30"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white font-semibold text-sm mb-1">Click to browse or drop PDF / Word (.docx, .doc, .txt) file here</p>
                      <p className="text-gray-400 text-xs">Quality Assessment & Tesseract OCR engine will extract candidate criteria</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  rows={6}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste job description text here..."
                  className="w-full px-4 py-3 rounded-xl bg-[#070B14] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all text-xs font-mono resize-none mb-3"
                />
                <button
                  type="button"
                  onClick={() => sendToBackendParseApi(jdText)}
                  disabled={!jdText.trim() || isScanning}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  ⚡ Execute Backend Text Extraction
                </button>
              </div>
            )}

            {/* Live Scanning Progress Indicator */}
            {isScanning && (
              <div className="mt-6 p-4 rounded-xl bg-blue-900/20 border border-blue-500/30 animate-pulse flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <div>
                  <span className="text-blue-300 font-semibold text-xs block mb-0.5">Backend Processing Pipeline</span>
                  <span className="text-blue-200/80 text-xs font-mono">{scanStep}</span>
                </div>
              </div>
            )}

            {/* Scan Success Summary */}
            {scanComplete && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-300">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Extraction Complete:</span>
                  <span>Extracted {mandatoryCount} Mandatory & {preferredCount} Preferred Requirements</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRawTextDrawer(!showRawTextDrawer)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline flex items-center gap-1"
                >
                  {showRawTextDrawer ? 'Hide Debug Drawer' : '🔍 Debug RAW DOCUMENT TEXT'}
                </button>
              </div>
            )}

            {/* Collapsible RAW DOCUMENT TEXT & Diagnostic Drawer */}
            {showRawTextDrawer && (
              <div className="mt-4 p-4 rounded-xl bg-[#070B14] border border-gray-800 text-xs font-mono">
                <div className="flex items-center justify-between mb-3 text-gray-400 text-[11px] uppercase tracking-wider border-b border-gray-800 pb-2">
                  <span className="text-blue-400 font-bold">🔍 Document Diagnostic Summary</span>
                  <button onClick={() => setShowRawTextDrawer(false)} className="hover:text-white">Close [✕]</button>
                </div>

                {docMetrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3 bg-gray-900/60 rounded-lg border border-gray-800/80 text-[11px]">
                    <div>
                      <span className="text-gray-500 block">Document Name:</span>
                      <span className="text-white font-semibold truncate block">{docMetrics.fileName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">File Type:</span>
                      <span className="text-white font-semibold truncate block">{docMetrics.fileType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Page Count:</span>
                      <span className="text-white font-semibold block">{docMetrics.pageCount} page(s)</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Extraction Method:</span>
                      <span className="text-blue-400 font-semibold uppercase block">{docMetrics.extractionMethod}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">OCR Used:</span>
                      <span className={`font-bold block ${docMetrics.ocrUsed ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {docMetrics.ocrUsed ? 'YES (Image OCR Fallback)' : 'NO (Native Text Stream)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Extracted Characters:</span>
                      <span className="text-white font-semibold block">{docMetrics.textLength} chars</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Extracted Words:</span>
                      <span className="text-white font-semibold block">{docMetrics.wordCount} words</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Non-empty Lines:</span>
                      <span className="text-white font-semibold block">{docMetrics.lineCount} lines</span>
                    </div>
                  </div>
                )}

                <div className="text-gray-400 text-[11px] mb-1 font-semibold uppercase">--------------------------------<br />RAW DOCUMENT TEXT<br />--------------------------------</div>
                <pre className="whitespace-pre-wrap text-gray-300 max-h-60 overflow-y-auto leading-relaxed">{rawText || '(No raw text available)'}</pre>
              </div>
            )}
          </div>

          {/* Section 2: Extracted Job Specifications Form */}
          <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-6 pb-3 border-b border-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Extracted Job Metadata
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Client / Company Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={client}
                  onChange={(e) => {
                    setClient(e.target.value);
                    if (fieldErrors.client) setFieldErrors(prev => ({ ...prev, client: undefined }));
                  }}
                  placeholder="e.g. TechCorp Industries (Leave blank if not in JD)"
                  className={`w-full px-4 py-3 rounded-xl bg-[#070B14] border text-white text-sm placeholder-gray-500 focus:outline-none transition-all ${
                    fieldErrors.client ? 'border-rose-500' : 'border-gray-800 focus:border-blue-500'
                  }`}
                />
                {fieldErrors.client && <p className="text-rose-400 text-xs mt-1">{fieldErrors.client}</p>}
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Position Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => {
                    setPosition(e.target.value);
                    if (fieldErrors.position) setFieldErrors(prev => ({ ...prev, position: undefined }));
                  }}
                  placeholder="e.g. SAP CO Consultant"
                  className={`w-full px-4 py-3 rounded-xl bg-[#070B14] border text-white text-sm placeholder-gray-500 focus:outline-none transition-all ${
                    fieldErrors.position ? 'border-rose-500' : 'border-gray-800 focus:border-blue-500'
                  }`}
                />
                {fieldErrors.position && <p className="text-rose-400 text-xs mt-1">{fieldErrors.position}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY / Remote"
                  className="w-full px-4 py-3 rounded-xl bg-[#070B14] border border-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Work Mode */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Work Mode <span className="text-rose-400">*</span>
                </label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as 'Remote' | 'Hybrid' | 'Onsite')}
                  className="w-full px-4 py-3 rounded-xl bg-[#070B14] border border-gray-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>

              {/* Salary */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                  Salary Compensation Range
                </label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $130,000 - $170,000 (Empty if not present in JD)"
                  className="w-full px-4 py-3 rounded-xl bg-[#070B14] border border-gray-800 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Extracted Requirements Panel */}
          {requirements.length > 0 && (
            <div className="bg-[#0F172A]/80 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
                <div>
                  <h2 className="text-lg font-semibold text-white">Extracted Candidate Criteria ({requirements.length})</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Mandatory requirements are strictly enforced; preferred criteria yield bonus points.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                    {mandatoryCount} Mandatory
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                    {preferredCount} Preferred
                  </span>
                </div>
              </div>

              {/* List of Scanned Requirements */}
              <div className="space-y-3 mb-6">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3.5 rounded-xl bg-[#070B14] border border-gray-800 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleMandatory(req.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                          req.mandatory
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                        }`}
                      >
                        {req.mandatory ? '⚠ Mandatory' : '○ Preferred'}
                      </button>
                      <div>
                        <span className="text-xs text-gray-200 block">{req.requirement}</span>
                        {req.sourceEvidence && (
                          <span className="text-[10px] text-gray-500 block italic mt-0.5">
                            Source Evidence: "{req.sourceEvidence}"
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded border border-gray-700">
                        {req.category}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(req.id)}
                        className="text-gray-500 hover:text-rose-400 p-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Custom Requirement Box */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-800">
                <input
                  type="text"
                  value={newReqText}
                  onChange={(e) => setNewReqText(e.target.value)}
                  placeholder="Add custom candidate requirement..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#070B14] border border-gray-800 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setNewReqMandatory(!newReqMandatory)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border ${
                    newReqMandatory ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {newReqMandatory ? 'Mandatory' : 'Preferred'}
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomRequirement}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all"
                >
                  + Add
                </button>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4">
            <Link
              href="/jobs"
              className="px-6 py-3 bg-gray-800/80 hover:bg-gray-800 text-gray-300 text-sm font-semibold rounded-xl transition-colors border border-gray-700/60"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || isScanning}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving Job & Extracted Criteria...</span>
                </>
              ) : (
                <>
                  <span>Save Job & Continue</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="signin"
      />

      <Footer />
    </div>
  );
}
