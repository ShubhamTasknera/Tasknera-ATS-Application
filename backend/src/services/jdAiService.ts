import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AiParsedJd {
  companyName: string | null;
  positionTitle: string | null;
  location: string | null;
  workMode: 'Remote' | 'Hybrid' | 'Onsite' | null;
  salary: string | null;
  experience: string | null;
  mandatoryRequirements: Array<{
    requirement: string;
    category: string;
    sourceEvidence?: string;
  }>;
  preferredRequirements: Array<{
    requirement: string;
    category: string;
    sourceEvidence?: string;
  }>;
  responsibilities: string[];
}

/**
 * Clean all AI prompt symbols, brackets, bullets, checkboxes, and LaTeX tokens from text
 */
export const sanitizeAiText = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    // Convert LaTeX math symbols
    .replace(/\$\\le\$/gi, '≤')
    .replace(/\\le\b/gi, '≤')
    .replace(/\$\\ge\$/gi, '≥')
    .replace(/\\ge\b/gi, '≥')
    .replace(/\$\\sim\$/gi, '~')
    // Strip emojis
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{1F300}-\u{1F9FF}]/gu, '')
    // Strip checkboxes: [ ], [x], [X], [✓], [✔], ( ), (x)
    .replace(/^\[\s*[xX✓✔]?\s*\]\s*/, '')
    .replace(/^\(\s*[xX✓✔]?\s*\)\s*/, '')
    // Strip leading bullets, numbers, hyphens, and decorative symbols
    .replace(/^[\s•●*▪▫➢✓✔o\d.)\-_—–:|]+\s*/, '')
    // Strip duplicate checkboxes inside string if any
    .replace(/\[\s*[xX✓✔]?\s*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Parses a Job Description using Google Gemini AI if GEMINI_API_KEY / GOOGLE_API_KEY is available
 */
export const parseJdWithAi = async (rawText: string): Promise<AiParsedJd | null> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    console.log('[AI JD Parser] Initializing Google Gemini for semantic JD comprehension...');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert AI recruitment parser for an ATS (Applicant Tracking System).
Analyze the following Job Description text and extract structured job information.

CRITICAL INSTRUCTIONS:
1. Strip all symbols, checkboxes (like [ ], [x]), bullet icons (like •, ●), emojis (🚫, 📋, ⚡), LaTeX math tokens ($\le$, \\le), and recruiter prompt wrappers.
2. Extract the true "companyName" and full clean "positionTitle".
3. Differentiate between STRICT MANDATORY criteria (hard knock-out requirements / dealbreakers / must-haves) and PREFERRED criteria (nice-to-haves).
4. Do NOT include interview processes, recruiter search strings, boolean strings, or questionnaire questions in the requirements list.
5. Provide a valid, clean JSON object matching this schema:

{
  "companyName": "string or null",
  "positionTitle": "string or null",
  "location": "string or null",
  "workMode": "Remote" | "Hybrid" | "Onsite" | null,
  "salary": "string or null",
  "experience": "string or null",
  "mandatoryRequirements": [
    {
      "requirement": "Clean text of the mandatory criteria without symbols or checkboxes",
      "category": "Experience" | "Technical Skill" | "Education" | "Certification" | "Integration" | "Methodology" | "Soft Skill" | "Domain",
      "sourceEvidence": "Original text snippet"
    }
  ],
  "preferredRequirements": [
    {
      "requirement": "Clean text of preferred criteria",
      "category": "Experience" | "Technical Skill" | "Education" | "Certification" | "Integration" | "Methodology" | "Soft Skill" | "Domain",
      "sourceEvidence": "Original text snippet"
    }
  ],
  "responsibilities": [
    "Clean responsibility 1"
  ]
}

Return ONLY the raw JSON string (no markdown formatting, no code blocks).

JOB DESCRIPTION TEXT:
${rawText}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Clean JSON response (strip ```json and ``` if present)
    const jsonStr = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsedData = JSON.parse(jsonStr) as AiParsedJd;

    // Post-sanitize fields
    if (parsedData.mandatoryRequirements) {
      parsedData.mandatoryRequirements = parsedData.mandatoryRequirements.map(r => ({
        requirement: sanitizeAiText(r.requirement),
        category: r.category || 'Technical Skill',
        sourceEvidence: sanitizeAiText(r.sourceEvidence || r.requirement)
      })).filter(r => r.requirement.length > 5);
    }

    if (parsedData.preferredRequirements) {
      parsedData.preferredRequirements = parsedData.preferredRequirements.map(r => ({
        requirement: sanitizeAiText(r.requirement),
        category: r.category || 'Technical Skill',
        sourceEvidence: sanitizeAiText(r.sourceEvidence || r.requirement)
      })).filter(r => r.requirement.length > 5);
    }

    if (parsedData.positionTitle) {
      parsedData.positionTitle = sanitizeAiText(parsedData.positionTitle);
    }
    if (parsedData.companyName) {
      parsedData.companyName = sanitizeAiText(parsedData.companyName);
    }

    console.log(`[AI JD Parser] Successfully parsed with Gemini: Position="${parsedData.positionTitle}", Mandatory=${parsedData.mandatoryRequirements?.length}, Preferred=${parsedData.preferredRequirements?.length}`);
    return parsedData;
  } catch (err: any) {
    console.warn('[AI JD Parser] Gemini extraction encountered an error; falling back to deterministic parser:', err.message || err);
    return null;
  }
};
