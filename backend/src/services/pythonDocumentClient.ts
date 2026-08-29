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
  error?: string;
}

/**
 * Communicates with the Python FastAPI Document Processing Service (port 8000)
 */
export const extractDocumentTextViaPython = async (
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<PythonDocumentResponse> => {
  return new Promise((resolve) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

    // Build multipart header and footer
    const header = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    );
    const footer = Buffer.from(`\r\n--${boundary}--\r\n`);

    const payload = Buffer.concat([header, buffer, footer]);

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 8000,
        path: '/parse-document',
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': payload.length,
        },
        timeout: 3000,
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
      console.warn('[Python Client Warning] Connection to Python service on port 8000 timed out (3s). Operating in fallback mode.');
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
      console.warn('[Python Client Connection Warning] Could not connect to Python FastAPI service on port 8000. Operating in fallback mode:', err.message);
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
