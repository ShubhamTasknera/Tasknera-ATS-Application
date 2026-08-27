import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // days

    // Mock analytics data - Replace with real database queries
    const analyticsData = {
      overview: {
        totalHires: 142,
        hiresChange: 23,
        timeToHire: 18,
        timeToHireChange: -12,
        acceptanceRate: 87,
        acceptanceRateChange: 5,
        costPerHire: 2400,
        costPerHireChange: -8,
      },
      hiringFunnel: [
        { stage: 'Applications', count: 1847, percentage: 100 },
        { stage: 'Screening', count: 892, percentage: 48 },
        { stage: 'Interviews', count: 234, percentage: 13 },
        { stage: 'Offers', count: 67, percentage: 4 },
        { stage: 'Hired', count: 52, percentage: 3 },
      ],
      topSources: [
        { source: 'LinkedIn', candidates: 687, hires: 34 },
        { source: 'Indeed', candidates: 423, hires: 21 },
        { source: 'Referrals', candidates: 312, hires: 45 },
        { source: 'Company Website', candidates: 267, hires: 18 },
        { source: 'Glassdoor', candidates: 158, hires: 12 },
      ],
      departmentPerformance: [
        { department: 'Engineering', openings: 12, hires: 45, avgTime: 16 },
        { department: 'Product', openings: 5, hires: 18, avgTime: 22 },
        { department: 'Design', openings: 3, hires: 12, avgTime: 19 },
        { department: 'Marketing', openings: 7, hires: 24, avgTime: 15 },
        { department: 'Sales', openings: 8, hires: 32, avgTime: 12 },
      ],
      timeline: generateTimelineData(parseInt(period)),
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      period: `${period} days`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Helper function to generate timeline data
function generateTimelineData(days: number) {
  const timeline = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      applications: Math.floor(Math.random() * 50) + 20,
      interviews: Math.floor(Math.random() * 15) + 5,
      hires: Math.floor(Math.random() * 5) + 1,
    });
  }

  return timeline;
}
