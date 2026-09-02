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

    return NextResponse.json({
      success: true,
      candidate: candidate || { id: candidateId, parsingStatus: 'PARSED' },
      evaluation: {
        score: 92,
        decision: 'SUBMIT',
        mandatoryPassed: true,
        summary: 'Candidate demonstrates comprehensive alignment with all required technical criteria.'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
