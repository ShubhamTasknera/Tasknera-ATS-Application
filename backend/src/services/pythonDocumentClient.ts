import http from 'http';

export interface PythonDocumentResponse {
  success: boolean;
  fileName: string;
  fileType: string;
  pageCount: number;
  extractionMethod: string;
  ocrUsed: boolean;
  textQuality: string;
  characterCount: number;
  wordCount: number;
  text: string;
  layoutText?: string;
  normalizedText?: string;
  // Structured CV JSON Fields
  candidateName?: string;
  email?: string;
  phone?: string;
  skills?: string[];
  yearsOfExperience?: string;
  education?: Array<{ degree: string; institution?: string; year?: string }>;
  pastCompanies?: string[];
  summary?: string;
  rawTextSummary?: string;
  error?: string;
}

export interface PythonBatchResponse {
  success: boolean;
  totalFiles: number;
  successfulCount: number;
  failedCount: number;
  results: PythonDocumentResponse[];
}

const PYTHON_SERVICE_PORT = parseInt(process.env.PYTHON_PORT || '8000', 10);
const PYTHON_SERVICE_HOST = process.env.PYTHON_HOST || '127.0.0.1';
const REQUEST_TIMEOUT_MS = 15000; // 15s timeout for resilient processing & OCR

/**
 * Communicates with the Python FastAPI Document Processing Service (single file extraction)
 */
export const extractDocumentTextViaPython = async (
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<PythonDocumentResponse> => {
  return new Promise((resolve) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    // Build multipart payload
    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);
    const payload = Buffer.concat([header, buffer, footer]);

    const req = http.request(
      {
        hostname: PYTHON_SERVICE_HOST,
        port: PYTHON_SERVICE_PORT,
        path: '/parse-document',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': payload.length,
        },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        let responseData = '';
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              const json: PythonDocumentResponse = JSON.parse(responseData);
              resolve(json);
            } else {
              console.warn('[Python Client Warning] HTTP status', res.statusCode, responseData);
              resolve({
                success: false,
                fileName: filename,
                fileType: mimeType,
                pageCount: 1,
                extractionMethod: 'fallback-node',
                ocrUsed: false,
                textQuality: 'FAILED',
                characterCount: 0,
                wordCount: 0,
                text: '',
                layoutText: '',
                normalizedText: '',
                error: `Python document processor error (HTTP ${res.statusCode})`
              });
            }
          } catch (e: any) {
            console.error('[Python Client JSON Parse Error]', e);
            resolve({
              success: false,
              fileName: filename,
              fileType: mimeType,
              pageCount: 1,
              extractionMethod: 'fallback-node',
              ocrUsed: false,
              textQuality: 'FAILED',
              characterCount: 0,
              wordCount: 0,
              text: '',
              layoutText: '',
              normalizedText: '',
              error: 'Failed to parse JSON response from Python service.'
            });
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      console.warn(`[Python Client Warning] Connection to Python service on port ${PYTHON_SERVICE_PORT} timed out (${REQUEST_TIMEOUT_MS}ms). Operating in fallback mode.`);
      resolve({
        success: false,
        fileName: filename,
        fileType: mimeType,
        pageCount: 1,
        extractionMethod: 'fallback-node',
        ocrUsed: false,
        textQuality: 'FAILED',
        characterCount: 0,
        wordCount: 0,
        text: '',
        layoutText: '',
        normalizedText: '',
        error: 'Python service timed out.'
      });
    });

    req.on('error', (err) => {
      console.warn(`[Python Client Connection Warning] Could not connect to Python FastAPI service on port ${PYTHON_SERVICE_PORT}. Operating in fallback mode:`, err.message);
      resolve({
        success: false,
        fileName: filename,
        fileType: mimeType,
        pageCount: 1,
        extractionMethod: 'fallback-node',
        ocrUsed: false,
        textQuality: 'FAILED',
        characterCount: 0,
        wordCount: 0,
        text: '',
        layoutText: '',
        normalizedText: '',
        error: 'Python document processing service is unavailable.'
      });
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Communicates with the Python FastAPI Document Processing Service for batch files
 */
export const extractBatchDocumentsViaPython = async (
  files: Array<{ buffer: Buffer; filename: string; mimeType: string }>
): Promise<PythonBatchResponse> => {
  if (!files || files.length === 0) {
    return {
      success: true,
      totalFiles: 0,
      successfulCount: 0,
      failedCount: 0,
      results: []
    };
  }

  // Process files concurrently with individual safety
  const results = await Promise.all(
    files.map(f => extractDocumentTextViaPython(f.buffer, f.filename, f.mimeType))
  );

  const successfulCount = results.filter(r => r.success).length;

  return {
    success: true,
    totalFiles: results.length,
    successfulCount,
    failedCount: results.length - successfulCount,
    results
  };
};

