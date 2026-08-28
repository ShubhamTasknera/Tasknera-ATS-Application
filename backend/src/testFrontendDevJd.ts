import { parseJobDescription } from './services/jdParsingService';

async function runFrontendDevJdTestSuite() {
  console.log('====================================================');
  console.log('  TESTING SIMPLE FRONTEND DEVELOPER TEST JD PARSER  ');
  console.log('====================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`[PASS] ${testName}`);
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       Detail: ${detail}`);
    }
  }

  // ----------------------------------------------------
  // TEST 1: Simple Frontend Developer Test JD (Full)
  // ----------------------------------------------------
  const frontendDevJdText = `Job Title:
Frontend Developer

Company:
TechNova Solutions

Location:
Pune, Maharashtra

Work Mode:
Hybrid

Employment Type:
Full-time

Salary:
₹6–10 LPA

Job Summary:
TechNova Solutions is looking for a passionate Frontend Developer with 2+ years of experience building modern web applications using React.js and TypeScript.

Mandatory Requirements:
1. Minimum 2+ years of experience with React.js (Mandatory)
2. Strong proficiency in TypeScript and JavaScript (ES6+) (Mandatory)
3. Experience with HTML5, CSS3, Tailwind CSS or modern CSS (Mandatory)
4. Knowledge of REST APIs and state management (Redux/Zustand) (Mandatory)
5. Bachelor's degree in Computer Science or related field (Mandatory)

Preferred Requirements:
1. Experience with Next.js or server-side rendering (Preferred)
2. Familiarity with Docker and CI/CD pipelines (Preferred)
3. Experience with UI/UX design tools like Figma (Preferred)`;

  const result1 = parseJobDescription(frontendDevJdText, 'Simple_Frontend_Developer_Test_JD.pdf');

  assert(
    result1.data.job.jobTitle === 'Frontend Developer',
    'TEST 1A: Position Title extracted as "Frontend Developer"',
    `Got "${result1.data.job.jobTitle}"`
  );

  assert(
    result1.data.job.company === 'TechNova Solutions',
    'TEST 1B: Company Name extracted as "TechNova Solutions" (NOT blank)',
    `Got "${result1.data.job.company}"`
  );

  assert(
    result1.data.job.location === 'Pune, Maharashtra',
    'TEST 1C: Location extracted as "Pune, Maharashtra"',
    `Got "${result1.data.job.location}"`
  );

  assert(
    result1.data.job.workMode === 'Hybrid',
    'TEST 1D: Work Mode extracted as "Hybrid"',
    `Got "${result1.data.job.workMode}"`
  );

  assert(
    result1.data.job.salary === '₹6–10 LPA',
    'TEST 1E: Salary extracted as bounded token "₹6–10 LPA" (NO trailing merged text)',
    `Got "${result1.data.job.salary}"`
  );

  assert(
    result1.data.requirements.length >= 8,
    'TEST 1F: Extracted individual requirements (5 Mandatory & 3 Preferred)',
    `Extracted ${result1.data.requirements.length} total requirements`
  );

  // ----------------------------------------------------
  // TEST 2: JD Without Salary Returns salary = null (Not "2" or "2026")
  // ----------------------------------------------------
  const noSalaryJd = `Job Title: Frontend Engineer
Company: TechNova
Joining Year: 2026
Experience: 2+ years required

Requirements:
- React.js experience`;

  const result2 = parseJobDescription(noSalaryJd);

  assert(
    result2.data.job.salary === null,
    'TEST 2: JD without salary returns salary = null (NOT "2" or "2026")',
    `Got salary: "${result2.data.job.salary}"`
  );

  // ----------------------------------------------------
  // TEST 3: JD Without Company Returns company = null
  // ----------------------------------------------------
  const noCompanyJd = `Job Title: React Developer
Location: Remote
Salary: ₹8–12 LPA

Requirements:
- Minimum 3 years experience`;

  const result3 = parseJobDescription(noCompanyJd);

  assert(
    result3.data.job.company === null,
    'TEST 3: JD without company returns company = null (Zero default company fallback)',
    `Got company: "${result3.data.job.company}"`
  );

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runFrontendDevJdTestSuite().catch(err => {
  console.error('Test Suite Error:', err);
  process.exit(1);
});
