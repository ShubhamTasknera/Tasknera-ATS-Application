import { parseJobDescription } from './services/jdParsingService';

async function runLayoutPdfParsingTests() {
  console.log('====================================================');
  console.log('  TESTING LAYOUT-AWARE PDF PARSER & FIELD VALIDATOR ');
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
  // TEST A: Simple Single-Column Layout
  // ----------------------------------------------------
  const textA = `Job Title: Frontend Developer
Company: TechNova Solutions
Location: Pune, Maharashtra
Work Mode: Hybrid
Salary: ₹6–10 LPA

Requirements:
- 2+ years React.js experience`;

  const resultA = parseJobDescription(textA);
  assert(resultA.data.job.company === 'TechNova Solutions', 'TEST A: Single-column company extracted cleanly', `Got "${resultA.data.job.company}"`);
  assert(resultA.data.job.location === 'Pune, Maharashtra', 'TEST A: Single-column location extracted cleanly', `Got "${resultA.data.job.location}"`);
  assert(resultA.data.job.salary === '₹6–10 LPA', 'TEST A: Single-column salary extracted cleanly', `Got "${resultA.data.job.salary}"`);

  // ----------------------------------------------------
  // TEST B: Side-by-Side Company and Position
  // ----------------------------------------------------
  const textB = `Company: TechNova Solutions    Position: Frontend Developer
Location: Pune, Maharashtra      Work Mode: Hybrid
Salary: ₹6–10 LPA`;

  const resultB = parseJobDescription(textB);
  assert(resultB.data.job.company === 'TechNova Solutions', 'TEST B: Side-by-side company extracted', `Got "${resultB.data.job.company}"`);
  assert(resultB.data.job.jobTitle === 'Frontend Developer', 'TEST B: Side-by-side position extracted', `Got "${resultB.data.job.jobTitle}"`);

  // ----------------------------------------------------
  // TEST C: Side-by-Side Salary and Location
  // ----------------------------------------------------
  const textC = `Company: ABC Tech
Position: Backend Lead
Salary: ₹12–18 LPA               Location: Mumbai, India
Work Mode: Onsite`;

  const resultC = parseJobDescription(textC);
  assert(resultC.data.job.salary === '₹12–18 LPA', 'TEST C: Side-by-side salary extracted cleanly (no location contamination)', `Got "${resultC.data.job.salary}"`);
  assert(resultC.data.job.location === 'Mumbai, India', 'TEST C: Side-by-side location extracted cleanly (no salary contamination)', `Got "${resultC.data.job.location}"`);

  // ----------------------------------------------------
  // TEST D: Salary Absent
  // ----------------------------------------------------
  const textD = `Job Title: DevOps Engineer
Company: CloudCorp
Location: Remote
2+ years AWS experience required. Joining year 2026.`;

  const resultD = parseJobDescription(textD);
  assert(resultD.data.job.salary === null, 'TEST D: Salary absent returns salary = null (No non-salary number captured)', `Got "${resultD.data.job.salary}"`);

  // ----------------------------------------------------
  // TEST E: Company Absent
  // ----------------------------------------------------
  const textE = `Job Title: Fullstack Engineer
Location: Hyderabad
Salary: ₹15–22 LPA`;

  const resultE = parseJobDescription(textE);
  assert(resultE.data.job.company === null, 'TEST E: Company absent returns company = null', `Got "${resultE.data.job.company}"`);

  // ----------------------------------------------------
  // TEST F: Large Salary Range with per annum
  // ----------------------------------------------------
  const textF = `Company: Global Systems
Position: Architect
Salary: ₹10,00,000 - ₹15,00,000 per annum
Location: Bangalore`;

  const resultF = parseJobDescription(textF);
  assert(resultF.data.job.salary === '₹10,00,000–₹15,00,000 per annum', 'TEST F: Large salary range per annum extracted', `Got "${resultF.data.job.salary}"`);

  console.log('\n====================================================');
  console.log(`  RESULTS: ${passedTests} / ${totalTests} LAYOUT TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runLayoutPdfParsingTests().catch(err => {
  console.error('Layout Test Error:', err);
  process.exit(1);
});
