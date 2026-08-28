import { parseJobDescription } from './services/jdParsingService';

function testActualUserPdf() {
  console.log("====================================================");
  console.log("  TESTING ACTUAL USER SAP CO CONSULTANT PDF CONTENT ");
  console.log("====================================================\n");

  const userPdfText = `SAP CO Consultant
Test Job Description — ATS Tasknera Evaluation

Company: ABC Technologies Pvt. Ltd.
Location: Pune, Maharashtra
Work Mode: Hybrid
Employment Type: Full-time

About the Role
ABC Technologies is looking for an experienced SAP CO Consultant to support SAP S/4HANA implementation and business transformation projects. The candidate will work closely with finance and business teams to implement, configure, and support SAP Controlling processes.

Key Responsibilities
• Configure and support SAP Controlling (CO) modules.
• Work on SAP S/4HANA implementation projects.
• Configure Cost Center Accounting, Profit Center Accounting and Internal Orders.
• Analyze business requirements and translate them into SAP solutions.
• Prepare functional specifications and coordinate with technical teams.
• Support testing, deployment and post-go-live activities.
• Troubleshoot SAP CO issues and provide functional solutions.
• Work closely with finance, accounting and business stakeholders.
• Participate in process improvement and optimization initiatives.

Mandatory Requirements
1. Minimum 5 years of relevant SAP CO experience
2. Minimum 4 years of SAP S/4HANA experience
3. SAP implementation experience
4. Manufacturing industry experience
5. Bachelor's degree in Finance, Accounting, Information Technology, Computer Science or a related field
6. Strong knowledge of SAP CO processes

Preferred Requirements
1. SAP CO certification
2. Experience with SAP FICO
3. Experience with international clients
4. Experience working on multiple SAP implementation projects
5. Knowledge of integration between SAP CO and other SAP modules

Technical Skills
SAP CO • SAP S/4HANA • SAP FICO • Cost Center Accounting • Profit Center Accounting • Internal Orders • SAP implementation • Functional specifications • SAP testing

Soft Skills
• Strong analytical and problem-solving skills
• Good communication skills
• Stakeholder management
• Ability to work independently and in a team

Experience
Required: 5+ years relevant SAP CO experience
Required: 4+ years SAP S/4HANA experience

Education
Bachelor's degree — Mandatory

Certification
SAP CO Certification — Preferred`;

  const result = parseJobDescription(userPdfText, 'SAP_CO_Consultant_Test_JD.pdf');

  console.log(`Extracted Job Title: ${result.data.job.jobTitle}`);
  console.log(`Extracted Company:   ${result.data.job.company}`);
  console.log(`Extracted Location:  ${result.data.job.location}`);
  console.log(`Extracted Work Mode: ${result.data.job.workMode}`);
  console.log(`Extracted Salary:    ${result.data.job.salary}`);
  console.log(`Total Requirements:  ${result.data.requirements.length}\n`);

  console.log("EXTRACTED REQUIREMENTS BREAKDOWN:");
  result.data.requirements.forEach((r, idx) => {
    console.log(` [${idx + 1}] [${r.mandatory ? 'MANDATORY' : 'PREFERRED'}] [${r.category}] ${r.requirement}`);
  });

  const mandatoryCount = result.data.requirements.filter(r => r.mandatory).length;
  const preferredCount = result.data.requirements.filter(r => !r.mandatory).length;

  console.log(`\nMandatory Count: ${mandatoryCount} | Preferred Count: ${preferredCount}`);
}

testActualUserPdf();
