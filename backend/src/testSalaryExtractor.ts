import { extractSalary } from './services/jdParsingService';

async function runSalaryExtractorTests() {
  console.log('====================================================');
  console.log('  TESTING DETERMINISTIC SALARY EXTRACTOR & NORMALIZER ');
  console.log('====================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  function assertSalary(text: string, expected: string | null, testName: string) {
    totalTests++;
    const result = extractSalary(text);
    const actual = result.salary;

    if (actual === expected) {
      passedTests++;
      console.log(`[PASS] ${testName}`);
      console.log(`       Input:    "${text.replace(/\n/g, ' ')}"`);
      console.log(`       Expected: "${expected}" | Got: "${actual}"`);
      console.log(`       Debug:    rawMatch="${result.debug.rawMatch}", method="${result.debug.method}"\n`);
    } else {
      console.error(`[FAIL] ${testName}`);
      console.error(`       Input:    "${text.replace(/\n/g, ' ')}"`);
      console.error(`       Expected: "${expected}" | Got: "${actual}"\n`);
    }
  }

  // TEST 1: En-dash range
  assertSalary('Salary: ₹6–10 LPA', '₹6–10 LPA', 'TEST 1: Standard en-dash salary (Salary: ₹6–10 LPA)');

  // TEST 2: Hyphen with spaces -> Normalized to en-dash
  assertSalary('Salary: ₹6 - 10 LPA', '₹6–10 LPA', 'TEST 2: Hyphen with spaces normalized (Salary: ₹6 - 10 LPA)');

  // TEST 3: No currency symbol
  assertSalary('Salary: 6–10 LPA', '6–10 LPA', 'TEST 3: Salary without currency symbol (Salary: 6–10 LPA)');

  // TEST 4: Compensation label with single LPA amount
  assertSalary('Compensation: ₹12 LPA', '₹12 LPA', 'TEST 4: Compensation single amount (Compensation: ₹12 LPA)');

  // TEST 5: Large numeric range with per annum
  assertSalary(
    'Salary: ₹10,00,000 - ₹15,00,000 per annum',
    '₹10,00,000–₹15,00,000 per annum',
    'TEST 5: Large numeric range per annum (Salary: ₹10,00,000 - ₹15,00,000 per annum)'
  );

  // TEST 6: Non-salary numbers (experience years, joining date) -> Must return null
  assertSalary(
    'Job Summary:\n2+ years experience\n5 years relevant experience\n2026 joining date\nNO salary mentioned.',
    null,
    'TEST 6: Non-salary numbers (experience years, joining date) return salary = null'
  );

  // TEST 7: Multi-line / glued text -> Must truncate immediately after LPA (No trailing document text!)
  assertSalary(
    'Salary: ₹8–12 LPA\nJob Summary\nCompany XYZ is looking for...',
    '₹8–12 LPA',
    'TEST 7: Salary stops at token end (NO trailing document text like Job Summary)'
  );

  console.log('====================================================');
  console.log(`  RESULTS: ${passedTests} / ${totalTests} SALARY TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runSalaryExtractorTests().catch(err => {
  console.error('Salary Test Error:', err);
  process.exit(1);
});
