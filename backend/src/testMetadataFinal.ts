import { parseJobDescription } from './services/jdParsingService';

async function runFinalMetadataTestSuite() {
  console.log('====================================================');
  console.log('  TESTING FINAL STRUCTURED JD METADATA EXTRACTION  ');
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
  // TEST 1: Simple Frontend Developer Test JD (Full Metadata Verification)
  // ----------------------------------------------------
  const simpleJdText = `Job Title:
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
TechNova Solutions is looking for a passionate Frontend Developer with 2+ years of experience...`;

  const res1 = parseJobDescription(simpleJdText, 'Simple_Frontend_Developer_Test_JD.pdf');

  assert(
    res1.data.job.company === 'TechNova Solutions',
    'CASE 1A: Company extracted as "TechNova Solutions" (NOT "LPA")',
    `Got "${res1.data.job.company}"`
  );

  assert(
    res1.data.job.jobTitle === 'Frontend Developer',
    'CASE 1B: Position Title extracted as "Frontend Developer"',
    `Got "${res1.data.job.jobTitle}"`
  );

  assert(
    res1.data.job.location === 'Pune, Maharashtra',
    'CASE 1C: Location extracted as "Pune, Maharashtra"',
    `Got "${res1.data.job.location}"`
  );

  assert(
    res1.data.job.workMode === 'Hybrid',
    'CASE 1D: Work Mode extracted as "Hybrid"',
    `Got "${res1.data.job.workMode}"`
  );

  assert(
    res1.data.job.salary === '₹6–10 LPA',
    'CASE 1E: Salary extracted as complete range "₹6–10 LPA" (NOT "10 LPA")',
    `Got "${res1.data.job.salary}"`
  );

  // ----------------------------------------------------
  // TEST 2: No Salary Present
  // ----------------------------------------------------
  const textNoSalary = `Company: ABC Technologies
Position: Backend Developer
Experience: 5+ years required
Joining Date: 2026`;

  const res2 = parseJobDescription(textNoSalary);
  assert(res2.data.job.company === 'ABC Technologies', 'CASE 2A: Company extracted correctly when salary absent', `Got "${res2.data.job.company}"`);
  assert(res2.data.job.salary === null, 'CASE 2B: Salary absent returns salary = null (No experience years captured)', `Got "${res2.data.job.salary}"`);

  // ----------------------------------------------------
  // TEST 3: Single Salary Amount
  // ----------------------------------------------------
  const textSingleSalary = `Company: CyberCorp\nSalary: ₹10 LPA`;
  const res3 = parseJobDescription(textSingleSalary);
  assert(res3.data.job.salary === '₹10 LPA', 'CASE 3: Single salary amount extracted as "₹10 LPA"', `Got "${res3.data.job.salary}"`);

  // ----------------------------------------------------
  // TEST 4: Salary Range Normalization
  // ----------------------------------------------------
  const textSalaryRange = `Company: NextGen\nSalary: ₹8–12 LPA`;
  const res4 = parseJobDescription(textSalaryRange);
  assert(res4.data.job.salary === '₹8–12 LPA', 'CASE 4: Salary range extracted as "₹8–12 LPA"', `Got "${res4.data.job.salary}"`);

  // ----------------------------------------------------
  // TEST 5: Multi-Word Company Name
  // ----------------------------------------------------
  const textMultiWordComp = `Company: ABC Technologies Private Limited\nPosition: System Architect`;
  const res5 = parseJobDescription(textMultiWordComp);
  assert(res5.data.job.company === 'ABC Technologies Private Limited', 'CASE 5: Multi-word company name extracted in full', `Got "${res5.data.job.company}"`);

  // ----------------------------------------------------
  // TEST 6: Missing Company Returns null
  // ----------------------------------------------------
  const textNoCompany = `Job Title: React Engineer\nLocation: Remote\nSalary: ₹12–15 LPA`;
  const res6 = parseJobDescription(textNoCompany);
  assert(res6.data.job.company === null, 'CASE 6: Missing company returns company = null (Zero hardcoded fallback)', `Got "${res6.data.job.company}"`);

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passedTests} / ${totalTests} METADATA TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runFinalMetadataTestSuite().catch(err => {
  console.error('Final Metadata Test Error:', err);
  process.exit(1);
});
