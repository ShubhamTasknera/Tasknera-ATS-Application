'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function UploadCVsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  React.useEffect(() => {
    if (jobId) {
      router.replace(`/jobs/${jobId}/candidates`);
    }
  }, [jobId, router]);

  return (
    <div className="min-h-screen bg-[#EEF2F6] flex items-center justify-center">
      <div className="flex items-center gap-3 text-brand-orange font-bold text-sm">
        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading Candidate CV Studio...
      </div>
    </div>
  );
}
