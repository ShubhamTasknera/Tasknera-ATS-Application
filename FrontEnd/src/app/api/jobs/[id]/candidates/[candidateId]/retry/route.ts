import { NextRequest, NextResponse } from 'next/server';
import { jobCandidatesStore } from '../../upload/route';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; candidateId: string }> }
) {
  try {
    const { id: jobId, candidateId } = await params;

    const list = jobCandidatesStore[jobId] || [];
    const candidate = list.find((c: any) => c.id === candidateId);

    if (candidate) {
      candidate.parsingStatus = 'PARSED';
      delete candidate.errorMessage;
    }

    return NextResponse.json({
      success: true,
      candidate: candidate || { id: candidateId, parsingStatus: 'PARSED' },
      message: 'Candidate re-evaluated successfully'
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
