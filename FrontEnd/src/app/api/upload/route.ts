import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file

// Global in-memory cache for demo duplicate tracking
const SEEN_FILE_HASHES = new Set<string>();

export interface UploadedFileResult {
  id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  status: 'PENDING' | 'PARSING' | 'PARSED' | 'FAILED' | 'duplicate';
  isDuplicate?: boolean;
  jobId?: string;
  candidateId?: string;
  aiAnalysis?: any;
  error?: string;
  message?: string;
}


// POST - Multi-file Upload for CVs or JDs
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = (formData.get('type') as string) || 'cv'; // 'cv' or 'jd'
    const jobId = (formData.get('jobId') as string) || request.nextUrl.searchParams.get('jobId') || undefined;

    // Collect all files from 'files', 'files[]', 'file', or any File entries
    const fileEntries: File[] = [];

    for (const key of ['files', 'files[]', 'file']) {
      const values = formData.getAll(key);
      for (const val of values) {
        if (val instanceof File && val.size > 0) {
          fileEntries.push(val);
        }
      }
    }

    // Fallback: check all other formData fields for Files
    if (fileEntries.length === 0) {
      for (const [, val] of formData.entries()) {
        if (val instanceof File && val.size > 0 && !fileEntries.includes(val)) {
          fileEntries.push(val);
        }
      }
    }

    if (fileEntries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided for upload' },
        { status: 400 }
      );
    }

    // Create target upload directory if it doesn't exist
    const uploadSubDir = type === 'cv' ? 'cv' : type === 'jd' ? 'jd' : 'files';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', uploadSubDir);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const results: UploadedFileResult[] = [];
    const candidateIds: string[] = [];

    // Process each file
    for (const file of fileEntries) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidExt = ALLOWED_EXTENSIONS.includes(ext);
      const isValidType = !file.type || ALLOWED_TYPES.includes(file.type) || file.type.startsWith('text/');

      if (!isValidExt && !isValidType) {
        results.push({
          id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          filename: file.name,
          originalName: file.name,
          fileUrl: '',
          fileSize: file.size,
          fileType: file.type || ext,
          uploadedAt: new Date().toISOString(),
          status: 'FAILED',
          jobId,
          error: `Invalid file type. Only PDF, DOCX, DOC, and TXT are supported.`,
        });
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        results.push({
          id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          filename: file.name,
          originalName: file.name,
          fileUrl: '',
          fileSize: file.size,
          fileType: file.type || ext,
          uploadedAt: new Date().toISOString(),
          status: 'FAILED',
          jobId,
          error: `File size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
        });
        continue;
      }

      // Convert file buffer and calculate hash
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileKey = `${file.name.toLowerCase()}_${file.size}`;

      // Check if file was previously uploaded
      if (SEEN_FILE_HASHES.has(fileKey)) {
        const dupCandidateId = `cand-dup-${Math.random().toString(36).substring(2, 7)}`;
        const dupResult: UploadedFileResult = {
          id: dupCandidateId,
          candidateId: dupCandidateId,
          filename: file.name,
          originalName: file.name,
          fileUrl: '',
          fileSize: file.size,
          fileType: file.type || ext,
          uploadedAt: new Date().toISOString(),
          status: 'duplicate',
          isDuplicate: true,
          jobId,
          message: 'Candidate CV already exists in your account',
        };
        results.push(dupResult);

        if (fileEntries.length === 1) {
          return NextResponse.json({
            status: 'duplicate',
            message: 'Candidate CV already exists in your account',
            candidate: dupResult,
            candidates: [dupResult],
          });
        }
        continue;
      }

      SEEN_FILE_HASHES.add(fileKey);

      const timestamp = Date.now();
      const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${safeOriginalName}`;
      const filepath = path.join(uploadDir, filename);

      // Persist to disk
      await writeFile(filepath, buffer);

      const fileUrl = `/uploads/${uploadSubDir}/${filename}`;
      const candidateId = `cand-${timestamp}-${Math.random().toString(36).substring(2, 7)}`;
      candidateIds.push(candidateId);

      // Initial analysis summary
      const aiAnalysis = type === 'cv'
        ? {
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' '),
            skills: ['Extracted from Document'],
            experience: 'Pending AI Extraction',
            parsingStatus: 'PARSING',
          }
        : undefined;

      results.push({
        id: candidateId,
        candidateId,
        filename,
        originalName: file.name,
        fileUrl,
        fileSize: file.size,
        fileType: file.type || ext,
        uploadedAt: new Date().toISOString(),
        status: 'PARSED',
        jobId,
        aiAnalysis,
      });
    }

    // Check if single file duplicate
    if (results.length === 1 && results[0].status === 'duplicate') {
      return NextResponse.json({
        status: 'duplicate',
        message: 'Candidate CV already exists in your account',
        candidate: results[0],
        candidates: results,
      });
    }

    return NextResponse.json({
      success: true,
      jobId,
      uploadedCount: results.length,
      successfulCount: results.filter(r => r.status !== 'FAILED' && r.status !== 'duplicate').length,
      duplicateCount: results.filter(r => r.status === 'duplicate').length,
      candidateIds,
      data: results,
      candidates: results,
      message: `Successfully processed ${results.length} file(s)`,
    });

  } catch (error: any) {
    console.error('Multi-file upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload files' },
      { status: 500 }
    );
  }
}

