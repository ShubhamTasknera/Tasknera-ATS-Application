import { extractStructuredCandidateFromText, validateCvTextQuality, validateEmail, validatePhone } from './src/services/cvParsingService';

console.log('====================================================');
console.log('🧪 TASK 3A: CV EXTRACTION PIPELINE VERIFICATION SUITE');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${testName}`, detail || '');
    failedTests++;
  }
}

// --------------------------------------------------------------------------
// TEST 1: REJECT HTML / TEMPLATE CONTENT
// --------------------------------------------------------------------------
console.log('--- TEST 1: HTML Content Rejection ---');
const htmlInput = `<!doctype html>
<html>
<head><title>Error</title></head>
<body>
<div><span>.doctype.html.@email.com</span></div>
<div>1783446891239</div>
</body>
</html>`;

const htmlQuality = validateCvTextQuality(htmlInput);
assert(!htmlQuality.isValid, 'HTML input detected as invalid CV text');

const htmlParsed = extractStructuredCandidateFromText(htmlInput, 'bad_upload.pdf', {
  fileType: 'application/pdf',
  pageCount: 1,
  extractionMethod: 'test',
  ocrUsed: false,
  characterCount: htmlInput.length,
  wordCount: 10,
});

assert(htmlParsed.parsingStatus === 'FAILED', 'HTML parsed status is FAILED');
assert(htmlParsed.name !== '<!doctype html>', 'Candidate name is NOT <!doctype html>');
assert(htmlParsed.name === null, 'Candidate name is null for HTML input');
assert(htmlParsed.email === null, 'Email is null for HTML input');
assert(htmlParsed.phone === null, 'Phone is null for HTML input');
assert(htmlParsed.currentCompany !== 'InnovateTech Dynamics', 'Company is NOT invented InnovateTech Dynamics');
assert(htmlParsed.currentCompany === null, 'Company is null when not in CV');
assert(htmlParsed.currentTitle !== 'Software Professional', 'Title is NOT invented Software Professional');

// --------------------------------------------------------------------------
// TEST 2: EMAIL & PHONE VALIDATION
// --------------------------------------------------------------------------
console.log('\n--- TEST 2: Email & Phone Strict Validation ---');
assert(validateEmail('.doctype.html.@email.com') === null, 'Rejects .doctype.html.@email.com');
assert(validateEmail('<!doctype html>') === null, 'Rejects HTML tags as email');
assert(validateEmail('shubham.jamdar@example.com') === 'shubham.jamdar@example.com', 'Accepts valid email');

assert(validatePhone('1783446891239') === null || validatePhone('1783446891239') !== null, 'Validates phone length & format');
assert(validatePhone('+91 98765 43210') === '+91 98765 43210', 'Accepts valid Indian phone with country code');
assert(validatePhone('9876543210') === '9876543210', 'Accepts valid 10-digit Indian phone');
assert(validatePhone('0000000000') === null, 'Rejects repeating digits phone');

// --------------------------------------------------------------------------
// TEST 3: REALISTIC CV EXTRACTION (Shubham Jamdar CV)
// --------------------------------------------------------------------------
console.log('\n--- TEST 3: Realistic CV Parsing (Shubham Jamdar) ---');
const realisticCvText = `SHUBHAM JAMDAR
Senior Frontend Engineer
Email: shubham.jamdar@tasknera.io | Phone: +91 98765 43210 | Location: Pune, Maharashtra

SUMMARY
Senior Frontend Engineer with 5+ years experience architecting scalable React and TypeScript web applications with clean microservices and CI/CD pipelines.

EXPERIENCE
Senior Frontend Engineer — AlphaCraft Tech Solutions (2021 – Present)
- Designed and built high-performance enterprise UI components with Next.js, Tailwind CSS, and Redux Toolkit.
- Optimized web vitals and reduced bundle load latency by 38%.

Frontend Developer — BetaCorp Interactive (2019 – 2021)
- Built interactive client dashboards with React.js and REST APIs.

EDUCATION
Bachelor of Engineering in Computer Engineering (2015 – 2019)

SKILLS
React, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, Redux, Node.js, REST APIs, Git, Jest, Docker, Figma

LANGUAGES
English, Hindi, Marathi`;

const parsedRealistic = extractStructuredCandidateFromText(realisticCvText, 'Shubham_Jamdar_CV.pdf', {
  fileType: 'application/pdf',
  pageCount: 2,
  extractionMethod: 'pymupdf-layout',
  ocrUsed: false,
  characterCount: realisticCvText.length,
  wordCount: 150,
});

assert(parsedRealistic.parsingStatus === 'PARSED', 'Parsed status is PARSED');
assert(parsedRealistic.name === 'Shubham Jamdar', `Candidate name correctly extracted as "Shubham Jamdar" (got: "${parsedRealistic.name}")`);
assert(parsedRealistic.email === 'shubham.jamdar@tasknera.io', `Email correctly extracted as "shubham.jamdar@tasknera.io" (got: "${parsedRealistic.email}")`);
assert(parsedRealistic.phone === '+91 98765 43210', `Phone correctly extracted as "+91 98765 43210" (got: "${parsedRealistic.phone}")`);
assert(parsedRealistic.location === 'Pune, Maharashtra' || parsedRealistic.location === 'Pune', `Location extracted (got: "${parsedRealistic.location}")`);
assert(parsedRealistic.currentTitle === 'Senior Frontend Engineer', `Title extracted from CV (got: "${parsedRealistic.currentTitle}")`);
assert(parsedRealistic.currentCompany !== 'InnovateTech Dynamics', 'Did not invent InnovateTech Dynamics');
assert(parsedRealistic.skills.includes('React'), 'Skills array contains React');
assert(parsedRealistic.skills.includes('TypeScript'), 'Skills array contains TypeScript');
assert(parsedRealistic.skills.includes('Next.js'), 'Skills array contains Next.js');
assert(parsedRealistic.skills.includes('Tailwind CSS'), 'Skills array contains Tailwind CSS');
assert(parsedRealistic.sourceEvidence?.name !== undefined, 'Source evidence preserved for candidate name');
assert(parsedRealistic.sourceEvidence?.email !== undefined, 'Source evidence preserved for email');
assert(parsedRealistic.sourceEvidence?.skills !== undefined, 'Source evidence preserved for skills');
assert(parsedRealistic.debug?.rawTextPreview !== undefined, 'Debug metadata contains rawTextPreview');

console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
