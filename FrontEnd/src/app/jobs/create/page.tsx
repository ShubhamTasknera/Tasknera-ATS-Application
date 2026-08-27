'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateJobPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [jdText, setJdText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    workMode: 'Hybrid' as 'Remote' | 'Hybrid' | 'Onsite',
    department: '',
    employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract',
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // In real app, would parse the file here
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      // In real app, would send to API for parsing
      router.push('/jobs/jd-1/requirements'); // Navigate to requirement review
    }, 2000);
  };

  const sampleJD = `SAP CO Consultant - TechCorp Industries

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
- Lead S/4HANA implementation projects
- Provide training and support to end users
- Develop reporting solutions

Salary: $120,000 - $180,000`;

  const loadSampleJD = () => {
    setJdText(sampleJD);
    setFormData({
      title: 'SAP CO Consultant',
      company: 'TechCorp Industries',
      location: 'New York, NY',
      workMode: 'Hybrid',
      department: 'Finance Technology',
      employmentType: 'Full-time',
    });
  };

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
            <Link href="/jobs" className="text-slate-400 hover:text-white transition-colors">
              ← Back to Jobs
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan to-gunmetal rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Job</h1>
              <p className="text-slate-400">Upload or paste a job description to begin candidate evaluation</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan to-cyan/80 rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <span className="text-white font-medium">Upload JD</span>
            </div>
            <div className="flex-1 h-px bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-slate-400 font-bold text-sm">
                2
              </div>
              <span className="text-slate-400">Review Requirements</span>
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

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-2xl p-8 border border-white/10 mb-6">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  placeholder="e.g., Senior SAP CO Consultant"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  placeholder="e.g., TechCorp Industries"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  placeholder="e.g., New York, NY"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Work Mode</label>
                <select
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  placeholder="e.g., Finance Technology"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl rounded-2xl p-8 border border-white/10 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Job Description</h2>
              <button
                type="button"
                onClick={loadSampleJD}
                className="px-4 py-2 bg-cyan/20 hover:bg-cyan/30 text-cyan rounded-lg text-sm font-medium transition-colors border border-cyan/30"
              >
                Load Sample JD
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'paste'
                    ? 'bg-gradient-to-r from-cyan to-cyan/80 text-white shadow-lg'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-cyan to-cyan/80 text-white shadow-lg'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Upload File
              </button>
            </div>

            {/* Paste Tab */}
            {activeTab === 'paste' && (
              <textarea
                required={activeTab === 'paste' && !uploadedFile}
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={16}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none font-mono text-sm"
                placeholder="Paste job description here...

Example:
SAP CO Consultant - TechCorp

Requirements:
- 5+ years SAP CO experience (Mandatory)
- 4+ years S/4HANA experience
..."
              />
            )}

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="relative group cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-primary-400/30 hover:border-primary-400/60 rounded-2xl p-12 text-center transition-all duration-300 bg-primary-400/5 hover:bg-primary-400/10">
                  <svg className="w-16 h-16 mx-auto mb-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {uploadedFile ? (
                    <div>
                      <p className="text-white font-semibold mb-2">File uploaded:</p>
                      <p className="text-primary-300">{uploadedFile.name}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white font-semibold mb-2">Drop JD file here or click to browse</p>
                      <p className="text-slate-400 text-sm">PDF, DOC, DOCX, TXT • Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Link
              href="/jobs"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isProcessing || (!jdText && !uploadedFile)}
              className="px-8 py-3 bg-gradient-to-r from-cyan to-gunmetal hover:from-cyan/90 hover:to-gunmetal/90 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan/30 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Parse & Continue
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
