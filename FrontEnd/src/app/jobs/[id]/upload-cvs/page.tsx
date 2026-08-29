'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  candidate?: string;
  score?: number;
  decision?: string;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function UploadCVsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: UploadedFile[] = Array.from(incoming).map(f => ({
      id: `${Date.now()}-${Math.random()}`,
      name: f.name,
      size: formatSize(f.size),
      status: 'queued',
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Simulate processing
  const handleEvaluate = async () => {
    if (!files.length) return;
    setIsProcessing(true);

    // Simulate per-file processing
    for (let i = 0; i < files.length; i++) {
      await new Promise(r => setTimeout(r, 800));
      const mockResults = [
        { candidate: 'Sarah Mitchell', score: 94, decision: 'SUBMIT' },
        { candidate: 'Michael Chen', score: 76, decision: 'REVIEW' },
        { candidate: 'Jennifer Lopez', score: 52, decision: 'DO NOT SUBMIT' },
      ];
      const result = mockResults[i % mockResults.length];
      setFiles(prev =>
        prev.map((f, idx) =>
          idx === i
            ? { ...f, status: 'done', candidate: result.candidate, score: result.score, decision: result.decision }
            : f
        )
      );
    }

    setIsProcessing(false);
    setIsDone(true);
  };

  const decisionColor = (d?: string) => {
    if (d === 'SUBMIT') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (d === 'REVIEW') return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-[#060C1A] text-white flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto px-6 pt-28 pb-20 flex-1 w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/jobs" className="hover:text-gray-400">Jobs</Link>
          <span>/</span>
          <Link href={`/jobs/${jobId}`} className="hover:text-gray-400">Job Details</Link>
          <span>/</span>
          <span className="text-gray-400">Upload CVs</span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-10">
          {[
            { n: '1', label: 'Upload JD', done: true },
            { n: '2', label: 'Review Requirements', done: true },
            { n: '3', label: 'Upload CVs', active: true },
          ].map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  s.done ? 'bg-emerald-500 text-white' :
                  s.active ? 'bg-blue-600 text-white' :
                  'bg-gray-800 text-gray-500'
                }`}>
                  {s.done ? '✓' : s.n}
                </div>
                <span className={`text-sm font-medium ${s.active ? 'text-white' : s.done ? 'text-emerald-400' : 'text-gray-600'}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-gray-800" />}
            </React.Fragment>
          ))}
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Upload Candidate CVs</h1>
          <p className="text-gray-500 text-sm">Upload one or multiple CVs. System will extract candidate data and evaluate against the job requirements.</p>
        </div>

        {/* Upload Zone */}
        {!isDone && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all mb-6 ${
              isDragging
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-gray-800 bg-gray-900/30 hover:border-gray-700'
            }`}
          >
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={e => addFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Drop CV files here or click to browse</p>
            <p className="text-gray-500 text-sm">PDF, DOC, DOCX, TXT · Multiple files supported · Max 10MB each</p>
            {files.length > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-blue-600/10 text-blue-400 border border-blue-600/30 px-3 py-1 rounded-full text-xs font-semibold">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-[#0F172A]/60 border border-gray-800 rounded-xl overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{files.length} CV{files.length > 1 ? 's' : ''}</span>
              {!isProcessing && !isDone && (
                <button onClick={() => setFiles([])} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
                  Clear all
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-800/50">
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-4 px-5 py-3.5">
                  {/* Icon */}
                  <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>

                  {/* File name + size */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{f.name}</p>
                    <p className="text-gray-600 text-xs">{f.size}</p>
                  </div>

                  {/* Status / Result */}
                  <div className="flex items-center gap-3">
                    {f.status === 'queued' && (
                      <span className="text-gray-600 text-xs">Queued</span>
                    )}
                    {f.status === 'processing' && (
                      <svg className="animate-spin w-4 h-4 text-blue-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {f.status === 'done' && f.score !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">{f.candidate}</span>
                        <span className={`text-sm font-bold ${f.score >= 80 ? 'text-emerald-400' : f.score >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
                          {f.score}/100
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${decisionColor(f.decision)}`}>
                          {f.decision}
                        </span>
                      </div>
                    )}
                    {f.status === 'error' && (
                      <span className="text-red-400 text-xs">Error</span>
                    )}
                  </div>

                  {/* Remove */}
                  {!isProcessing && f.status === 'queued' && (
                    <button onClick={() => removeFile(f.id)} className="text-gray-700 hover:text-red-400 transition-colors p-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anti-hallucination notice */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-white text-xs font-semibold mb-1">Evidence-Based Evaluation</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                The system will only extract information explicitly present in the CV. Skills, experience, and qualifications will never be invented or inferred without evidence. Every matched requirement will show its source.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href={`/jobs/${jobId}/requirements`} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-700">
            ← Back
          </Link>
          <div className="flex items-center gap-3">
            {isDone && (
              <Link
                href="/evaluations"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                View Results →
              </Link>
            )}
            {!isDone && (
              <button
                onClick={handleEvaluate}
                disabled={files.length === 0 || isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-900/30"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Evaluating...
                  </>
                ) : (
                  <>
                    Evaluate {files.length > 0 ? `${files.length} CV${files.length > 1 ? 's' : ''}` : 'CVs'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
