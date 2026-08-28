import { parseJobDescription, performOcrFallback } from './services/jdParsingService';

async function runParsingTestSuite() {
  console.log('====================================================');
  console.log('  ATS TASKNERA: 8-POINT JD PARSING & OCR TEST SUITE ');
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
  // TEST 1: Normal Text-Based PDF (SAP CO Consultant)
  // ----------------------------------------------------
  const sapCoJdText = `Job Title: SAP CO Consultant
Company: TechCorp Industries
Location: New York, NY
Work Mode: Hybrid
Salary: $130,000 - $170,000

Overview:
We are seeking an experienced SAP CO Consultant with strong manufacturing domain knowledge.

Requirements:
- 5+ years SAP CO experience (Mandatory)
- 4+ years SAP S/4HANA experience (Mandatory)
- Manufacturing industry experience (Mandatory)
- SAP implementation project experience
- Bachelor's degree in Finance, Accounting or related field
- SAP certification (Preferred)
- Power BI experience (Preferred)

Responsibilities:
- Configure and customize SAP CO modules
- Lead S/4HANA implementation projects`;

  const result1 = parseJobDescription(sapCoJdText, 'SAP_CO_Consultant_JD.pdf');

  assert(
    result1.data.job.jobTitle === 'SAP CO Consultant',
    'TEST 1A: Correct Job Title extracted from content',
    `Expected "SAP CO Consultant", got "${result1.data.job.jobTitle}"`
  );

  assert(
    result1.data.job.company === 'TechCorp Industries',
    'TEST 1B: Correct Company extracted from content',
    `Expected "TechCorp Industries", got "${result1.data.job.company}"`
  );

  assert(
    result1.data.job.salary === '$130,000 - $170,000',
    'TEST 1C: Correct Salary extracted',
    `Expected "$130,000 - $170,000", got "${result1.data.job.salary}"`
  );

  assert(
    result1.data.requirements.length >= 5,
    'TEST 1D: Individual requirements preserved without premature summarization',
    `Extracted ${result1.data.requirements.length} requirements`
  );

  // ----------------------------------------------------
  // TEST 2: Scanned/Image PDF Quality Check & OCR Fallback
  // ----------------------------------------------------
  const scannedPdfSimulated = `   \n  scanned image content  `;
  const result2 = parseJobDescription(scannedPdfSimulated, 'Scanned_Doc.pdf', 'application/pdf', 1, 'tesseract-ocr', true);

  assert(
    result2.data.document.ocrUsed === true,
    'TEST 2: Scanned PDF quality check detects low character count & records OCR Fallback',
    `Got ocrUsed: ${result2.data.document.ocrUsed}`
  );

  // ----------------------------------------------------
  // TEST 3: PDF Metadata Title ("ReportLab Generated PDF document") Rejection
  // ----------------------------------------------------
  const pdfMetadataNoise = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R /Producer (ReportLab Generated PDF document) >>
endobj
Job Title: Principal Database Administrator
Company: DataWorks Inc

Requirements:
- 8+ years PostgreSQL experience (Mandatory)`;

  const result3 = parseJobDescription(pdfMetadataNoise, 'ReportLab_Test.pdf');

  assert(
    result3.data.job.jobTitle !== 'ReportLab Generated PDF document' && result3.data.job.jobTitle === 'Principal Database Administrator',
    'TEST 3: PDF metadata title "ReportLab Generated PDF document" REJECTED; body title extracted',
    `Got jobTitle: "${result3.data.job.jobTitle}"`
  );

  // ----------------------------------------------------
  // TEST 4: JD Without Salary
  // ----------------------------------------------------
  const noSalaryJd = `Position: Senior Software Engineer
Client: Acme Corp
Location: Remote

Requirements:
- 7+ years Node.js experience (Mandatory)
- PostgreSQL database experience`;

  const result4 = parseJobDescription(noSalaryJd);
  assert(
    result4.data.job.salary === null,
    'TEST 4: JD without salary returns salary = null',
    `Got salary: "${result4.data.job.salary}"`
  );

  // ----------------------------------------------------
  // TEST 5: Preferred Certification Classification
  // ----------------------------------------------------
  const certJd = `Job Title: Cloud Architect
Company: CloudTech

Requirements:
- AWS Solutions Architect Certification (Preferred)
- 5+ years AWS experience (Mandatory)`;

  const result5 = parseJobDescription(certJd);
  const certReq = result5.data.requirements.find(r => r.category === 'Certification' || r.requirement.includes('Certification'));

  assert(
    Boolean(certReq && certReq.mandatory === false),
    'TEST 5: Preferred certification correctly classified as mandatory = false',
    `Got cert req: ${JSON.stringify(certReq)}`
  );

  // ----------------------------------------------------
  // TEST 6: JD Containing 10+ Individual Requirements Preserved
  // ----------------------------------------------------
  const multiReqJd = `Job Title: Senior ERP Systems Manager
Company: Global Enterprise

Requirements:
- Minimum 10 years IT industry experience (Mandatory)
- Minimum 5 years SAP ERP implementation experience (Mandatory)
- Strong experience with SAP S/4HANA (Mandatory)
- Bachelor's degree in Computer Science or Business (Mandatory)
- SAP Certified Professional (Preferred)
- Experience with Oracle ERP Systems (Preferred)
- PMP Project Management Certification (Preferred)
- Excellent verbal and written communication skills (Mandatory)
- Experience managing offshore development teams (Preferred)
- Knowledge of ITIL Service Management (Preferred)`;

  const result6 = parseJobDescription(multiReqJd);

  assert(
    result6.data.requirements.length === 10,
    'TEST 6: All 10 individual requirements preserved separately without summarization',
    `Expected 10 individual requirements, got ${result6.data.requirements.length}`
  );

  // ----------------------------------------------------
  // TEST 7: Malformed / Empty PDF Returns Extraction Error & Zero Generic Data
  // ----------------------------------------------------
  const emptyJd = `   \n\n  `;
  const result7 = parseJobDescription(emptyJd);

  assert(
    result7.success === false && result7.data.requirements.length === 0 && result7.data.job.jobTitle === null,
    'TEST 7: Malformed/empty document returns success = false with zero generic fallback requirements',
    `Got success: ${result7.success}, reqs count: ${result7.data.requirements.length}`
  );

  // ----------------------------------------------------
  // TEST 8: JD Containing Unrelated Numbers (e.g. Page Numbers, Dates, IDs)
  // ----------------------------------------------------
  const numberNoiseJd = `Job Title: DevOps Engineer
Company: CloudOps Ltd
Page 1 of 4 | Date: 2026-08-28 | Doc ID: 019284

Requirements:
- 5+ years Kubernetes experience (Mandatory)
- 4 years Terraform experience (Mandatory)`;

  const result8 = parseJobDescription(numberNoiseJd);

  assert(
    result8.data.job.salary === null,
    'TEST 8: Unrelated numbers (Doc ID 019284, Page 1 of 4) NOT incorrectly interpreted as salary',
    `Got salary: "${result8.data.job.salary}"`
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

runParsingTestSuite().catch(err => {
  console.error('Test Suite Unhandled Error:', err);
  process.exit(1);
});
