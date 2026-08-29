import { NextRequest, NextResponse } from 'next/server';

// Mock database - Replace with real database later
let candidates = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 234 567 890',
    role: 'Senior Developer',
    status: 'Interview',
    match: 98,
    location: 'San Francisco, CA',
    experience: '8 years',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    resumeUrl: null,
    appliedDate: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.c@email.com',
    phone: '+1 234 567 891',
    role: 'Product Manager',
    status: 'Review',
    match: 95,
    location: 'New York, NY',
    experience: '6 years',
    skills: ['Strategy', 'Analytics', 'Agile', 'Roadmapping'],
    resumeUrl: null,
    appliedDate: new Date().toISOString(),
  },
];

// GET - Get all candidates
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let filteredCandidates = [...candidates];

    // Filter by status
    if (status && status !== 'all') {
      filteredCandidates = filteredCandidates.filter(
        (c) => c.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCandidates = filteredCandidates.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.role.toLowerCase().includes(searchLower) ||
          c.skills.some((skill) => skill.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredCandidates,
      total: filteredCandidates.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

// POST - Create new candidate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newCandidate = {
      id: candidates.length + 1,
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      role: body.role,
      status: 'New',
      match: body.match || 0,
      location: body.location || null,
      experience: body.experience || null,
      skills: body.skills || [],
      resumeUrl: body.resumeUrl || null,
      appliedDate: new Date().toISOString(),
    };

    candidates.push(newCandidate);

    return NextResponse.json({
      success: true,
      data: newCandidate,
      message: 'Candidate created successfully',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}

// PUT - Update candidate
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const candidateIndex = candidates.findIndex((c) => c.id === id);
    
    if (candidateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    candidates[candidateIndex] = {
      ...candidates[candidateIndex],
      ...updates,
    };

    return NextResponse.json({
      success: true,
      data: candidates[candidateIndex],
      message: 'Candidate updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update candidate' },
      { status: 500 }
    );
  }
}

// DELETE - Delete candidate
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = parseInt(searchParams.get('id') || '0');

    const candidateIndex = candidates.findIndex((c) => c.id === id);
    
    if (candidateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    candidates.splice(candidateIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}
