import { NextRequest, NextResponse } from 'next/server';
import { jobCandidatesStore } from '@/lib/jobStore';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const authToken = req.headers.get('authorization');

    // 1. Try forwarding to backend
    try {
      const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api';
      const res = await fetch(`${backendUrl}/jobs/${jobId}/candidates`, {
        headers: {
          ...(authToken ? { Authorization: authToken } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn('[Next.js API] Backend /jobs/[id]/candidates unavailable, using local store');
    }

    const currentList = jobCandidatesStore[jobId] || [];

    return NextResponse.json({
      success: true,
      jobId,
      candidates: currentList,
      count: currentList.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
