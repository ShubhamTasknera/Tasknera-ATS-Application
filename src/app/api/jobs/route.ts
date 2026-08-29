import { NextRequest, NextResponse } from 'next/server';

// Mock database - Replace with real database later
let jobs = [
  {
    id: 1,
    title: 'Senior Full Stack Developer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    status: 'Active',
    description: 'We are looking for an experienced Full Stack Developer...',
    requirements: ['5+ years experience', 'React', 'Node.js', 'TypeScript'],
    salary: { min: 120000, max: 180000 },
    candidates: 145,
    newCandidates: 12,
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'Full-time',
    status: 'Active',
    description: 'Seeking a strategic Product Manager...',
    requirements: ['3+ years PM experience', 'Analytics', 'Agile'],
    salary: { min: 140000, max: 200000 },
    candidates: 89,
    newCandidates: 8,
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// GET - Get all jobs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    let filteredJobs = [...jobs];

    // Filter by status
    if (status) {
      filteredJobs = filteredJobs.filter(
        (j) => j.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Filter by department
    if (department) {
      filteredJobs = filteredJobs.filter(
        (j) => j.department.toLowerCase() === department.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredJobs,
      total: filteredJobs.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

// POST - Create new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newJob = {
      id: jobs.length + 1,
      title: body.title,
      department: body.department,
      location: body.location,
      type: body.type || 'Full-time',
      status: 'Active',
      description: body.description || '',
      requirements: body.requirements || [],
      salary: body.salary || { min: 0, max: 0 },
      candidates: 0,
      newCandidates: 0,
      postedDate: new Date().toISOString(),
    };

    jobs.push(newJob);

    return NextResponse.json({
      success: true,
      data: newJob,
      message: 'Job created successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
}

// PUT - Update job
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const jobIndex = jobs.findIndex((j) => j.id === id);
    
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
      data: jobs[jobIndex],
      message: 'Job updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    );
  }
}

// DELETE - Delete job
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get('id') || '0');

    const jobIndex = jobs.findIndex((j) => j.id === id);
    
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
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    );
  }
}
