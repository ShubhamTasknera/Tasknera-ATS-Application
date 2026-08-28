import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// POST - Upload file (CV or JD)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // 'cv' or 'jd'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF, DOC, DOCX, TXT allowed' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type || 'files');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return file info
    const fileUrl = `/uploads/${type || 'files'}/${filename}`;

    // Simulate AI processing (replace with actual AI logic)
    let aiAnalysis = null;
    if (type === 'cv') {
      aiAnalysis = {
        name: 'Extracted from CV',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '5 years',
        education: 'Bachelor of Computer Science',
        matchScore: Math.floor(Math.random() * 30) + 70, // Random score 70-100
      };
    } else if (type === 'jd') {
      aiAnalysis = {
        title: 'Extracted Job Title',
        requirements: ['5+ years experience', 'React', 'Node.js'],
        skills: ['JavaScript', 'TypeScript', 'AWS'],
        salary: { min: 80000, max: 120000 },
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        filename: filename,
        originalName: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        aiAnalysis: aiAnalysis,
      },
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
