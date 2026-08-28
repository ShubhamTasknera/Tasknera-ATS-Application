import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST - Match candidates with job description
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobDescription, candidates } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { success: false, error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Candidates array is required' },
        { status: 400 }
      );
    }

    // Simulate AI matching (Replace with actual AI logic)
    const matchedCandidates = candidates.map((candidate) => {
      // Simple keyword matching simulation
      const jdLower = jobDescription.toLowerCase();
      const candidateSkills = candidate.skills || [];
      
      let matchScore = 70; // Base score
      
      // Increase score for skill matches
      candidateSkills.forEach((skill: string) => {
        if (jdLower.includes(skill.toLowerCase())) {
          matchScore += 5;
        }
      });

      // Cap at 100
      matchScore = Math.min(matchScore, 100);

      return {
        ...candidate,
        matchScore: matchScore,
        matchedSkills: candidateSkills.filter((skill: string) =>
          jdLower.includes(skill.toLowerCase())
        ),
        missingSkills: extractMissingSkills(jdLower, candidateSkills),
      };
    });

    // Sort by match score
    matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      success: true,
      data: {
        totalCandidates: matchedCandidates.length,
        averageMatch: calculateAverage(matchedCandidates.map(c => c.matchScore)),
        topCandidates: matchedCandidates.slice(0, 10),
        allCandidates: matchedCandidates,
      },
      message: 'Candidates matched successfully',
    });
  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to match candidates' },
      { status: 500 }
    );
  }
}

// Helper function to extract missing skills
function extractMissingSkills(jd: string, candidateSkills: string[]): string[] {
  // Common skills to check for
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
    'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'Git',
    'Agile', 'Scrum', 'Leadership', 'Communication'
  ];

  const missingSkills: string[] = [];
  
  commonSkills.forEach(skill => {
    if (jd.includes(skill.toLowerCase()) && 
        !candidateSkills.some(cs => cs.toLowerCase() === skill.toLowerCase())) {
      missingSkills.push(skill);
    }
  });

  return missingSkills;
}

// Helper function to calculate average
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return Math.round(sum / numbers.length);
}
