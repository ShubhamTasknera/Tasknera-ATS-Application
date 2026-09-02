import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api';
    const authToken = req.headers.get('authorization');

    try {
      const backendRes = await fetch(`${backendUrl}/evaluations`, {
        headers: {
          ...(authToken ? { Authorization: authToken } : {})
        },
        cache: 'no-store'
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch (backendErr: any) {
      console.warn('[Next.js API] Backend /evaluations unreachable:', backendErr.message);
    }

    return NextResponse.json({
      success: true,
      total: 0,
      evaluations: []
    });
  } catch (err: any) {
    console.error('Evaluations GET API error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal error' }, { status: 500 });
  }
}
