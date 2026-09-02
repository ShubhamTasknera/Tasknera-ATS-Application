import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const initialRequirements: any[] = [
  {
    id: 'req-1',
    job_id: 'job-1',
    requirement: '5+ years Salesforce development experience',
    category: 'Technical Skill',
    weight: 2.0,
    is_mandatory: true,
    evidence_required: true,
    recruiter_confirmed: true,
    source_evidence: 'Minimum 5 years of Salesforce hands-on experience',
    needs_verification: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'req-2',
    job_id: 'job-1',
    requirement: 'Manufacturing Cloud configuration and customization',
    category: 'Technical Skill',
    weight: 2.0,
    is_mandatory: true,
    evidence_required: true,
    recruiter_confirmed: true,
    source_evidence: 'Deep knowledge of Salesforce Manufacturing Cloud',
    needs_verification: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'req-3',
    job_id: 'job-1',
    requirement: 'Apex, LWC, and Flow Automation proficiency',
    category: 'Technical Skill',
    weight: 1.5,
    is_mandatory: true,
    evidence_required: true,
    recruiter_confirmed: false,
    source_evidence: 'Proven track record writing scalable Apex triggers and Lightning Web Components',
    needs_verification: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'req-4',
    job_id: 'job-1',
    requirement: 'Salesforce Certified Administrator or Platform Developer I',
    category: 'Certification',
    weight: 1.0,
    is_mandatory: false,
    evidence_required: false,
    recruiter_confirmed: false,
    source_evidence: 'Preferred certifications',
    needs_verification: false,
    created_at: new Date().toISOString(),
  },
];

let requirementsStore = [...initialRequirements];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authToken = req.headers.get('authorization');

    // Forward to backend if available
    try {
      const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api';
      const res = await fetch(`${backendUrl}/jobs/${id}/requirements`, {
        headers: { ...(authToken ? { Authorization: authToken } : {}) }
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn('[Next.js API] Backend /requirements unavailable, using mock store');
    }

    return NextResponse.json({
      success: true,
      requirements: requirementsStore,
      data: requirementsStore
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const newReq = {
      id: `req-${Date.now()}`,
      job_id: id,
      requirement: body.requirement,
      category: body.category || 'Technical Skill',
      weight: body.weight || 1.0,
      is_mandatory: Boolean(body.is_mandatory),
      evidence_required: Boolean(body.evidence_required),
      recruiter_confirmed: Boolean(body.recruiter_confirmed),
      source_evidence: body.source_evidence || '',
      needs_verification: false,
      created_at: new Date().toISOString(),
    };

    requirementsStore.push(newReq);

    return NextResponse.json({
      success: true,
      requirement: newReq,
      data: newReq,
      message: 'Requirement added successfully'
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
