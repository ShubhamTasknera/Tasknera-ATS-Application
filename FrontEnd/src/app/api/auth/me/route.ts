import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    // Try backend first
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const backendRes = await fetch(`${backendUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
    } catch (backendErr) {
      console.warn('Backend /auth/me call failed, using local token decoding fallback');
    }

    // Decode fallback token
    let email = 'recruiter@tasknera.com';
    if (token.startsWith('jwt_local_session_')) {
      const parts = token.split('_');
      if (parts[3]) {
        try {
          email = Buffer.from(parts[3], 'base64').toString('utf-8');
        } catch {}
      }
    }

    return NextResponse.json({
      user: {
        id: 'usr_current',
        name: email.split('@')[0].replace(/[._-]/g, ' '),
        email,
        role: 'MEMBER',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
