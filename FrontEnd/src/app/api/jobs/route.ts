import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Resilient memory store for jobs
let jobs: any[] = [
  {
    id: 'job-1',
    client: 'Hexaware Technologies',
    position: 'Salesforce Manufacturing Cloud Developer',
    title: 'Salesforce Manufacturing Cloud Developer',
    department: 'Cloud Solutions',
    location: 'Remote / Bangalore',
    work_mode: 'Hybrid',
    type: 'Full-time',
    status: 'active',
    salary: '$120,000 – $150,000 / year',
    description: 'We are seeking an experienced Salesforce Manufacturing Cloud Developer...',
    requirements: [
      { id: 'r1', requirement: '5+ years Salesforce development experience', category: 'Technical Skill', is_mandatory: true, weight: 2.0 },
      { id: 'r2', requirement: 'Manufacturing Cloud configuration and customization', category: 'Technical Skill', is_mandatory: true, weight: 2.0 },
      { id: 'r3', requirement: 'Apex, LWC, Visualforce proficiency', category: 'Technical Skill', is_mandatory: true, weight: 1.5 },
      { id: 'r4', requirement: 'Salesforce Certified Administrator / Developer', category: 'Certification', is_mandatory: false, weight: 1.0 },
    ],
    candidates: 12,
    newCandidates: 3,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-2',
    client: 'BlueOrbit Technologies',
    position: 'Senior SAP CO Consultant',
    title: 'Senior SAP CO Consultant',
    department: 'Enterprise ERP',
    location: 'New York, NY',
    work_mode: 'Onsite',
    type: 'Full-time',
    status: 'active',
    salary: '$140,000 – $170,000 / year',
    description: 'Lead SAP CO implementation and configuration...',
    requirements: [
      { id: 'r5', requirement: '7+ years SAP CO experience', category: 'Technical Skill', is_mandatory: true, weight: 2.0 },
      { id: 'r6', requirement: 'Product Costing (CO-PC) and Profitability Analysis (CO-PA)', category: 'Technical Skill', is_mandatory: true, weight: 1.5 },
      { id: 'r7', requirement: 'S/4HANA Finance migration experience', category: 'Technical Skill', is_mandatory: false, weight: 1.0 },
    ],
    candidates: 8,
    newCandidates: 1,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// GET - Get all jobs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const search = searchParams.get('search')?.toLowerCase();

    let filteredJobs = [...jobs];

    if (status && status !== 'all') {
      filteredJobs = filteredJobs.filter(
        (j) => (j.status || '').toLowerCase() === status.toLowerCase()
      );
    }

    if (department && department !== 'all') {
      filteredJobs = filteredJobs.filter(
        (j) => (j.department || '').toLowerCase() === department.toLowerCase()
      );
    }

    if (search) {
      filteredJobs = filteredJobs.filter(
        (j) =>
          (j.title || '').toLowerCase().includes(search) ||
          (j.position || '').toLowerCase().includes(search) ||
          (j.client || '').toLowerCase().includes(search) ||
          (j.location || '').toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      success: true,
      jobs: filteredJobs,
      data: filteredJobs,
      total: filteredJobs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST - Create new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const position = body.position || body.title || 'Untitled Position';
    const client = body.client || body.company || 'Direct Client';
    
    const newJob = {
      id: `job-${Date.now()}`,
      client,
      company: client,
      position,
      title: position,
      department: body.department || 'Talent Acquisition',
      location: body.location || 'Remote',
      work_mode: body.work_mode || body.workMode || 'Hybrid',
      type: body.type || 'Full-time',
      status: body.status || 'draft',
      salary: body.salary || undefined,
      jd_text: body.jd_text || body.description || '',
      jd_file_url: body.jd_file_url,
      requirements: body.requirements || [],
      candidates: 0,
      newCandidates: 0,
      created_at: new Date().toISOString(),
      postedDate: new Date().toISOString(),
    };

    jobs.unshift(newJob);

    return NextResponse.json({
      success: true,
      job: newJob,
      data: newJob,
      message: 'Job created successfully',
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create job' },
      { status: 500 }
    );
  }
}

// PUT - Update job
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const jobIndex = jobs.findIndex((j) => String(j.id) === String(id));
    
    if (jobIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...updates,
    };

    return NextResponse.json({
      success: true,
      job: jobs[jobIndex],
      data: jobs[jobIndex],
      message: 'Job updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE - Delete job
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    const jobIndex = jobs.findIndex((j) => String(j.id) === String(id));
    
    if (jobIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    jobs.splice(jobIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete job' },
      { status: 500 }
    );
  }
}
