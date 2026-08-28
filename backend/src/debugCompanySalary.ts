import { parseJobDescription, extractSalary, validateCleanFieldValue } from './services/jdParsingService';

const sampleJd = `Job Title:
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
TechNova Solutions is looking for a passionate Frontend Developer...`;

console.log("=== DEBUGGING COMPANY & SALARY ===");
const salRes = extractSalary(sampleJd);
console.log("extractSalary result:", salRes);

const parsed = parseJobDescription(sampleJd, 'Simple_Frontend_Developer_Test_JD.pdf');
console.log("\nparseJobDescription result:");
console.log("Company:", parsed.data.job.company);
console.log("Position:", parsed.data.job.jobTitle);
console.log("Location:", parsed.data.job.location);
console.log("WorkMode:", parsed.data.job.workMode);
console.log("Salary:", parsed.data.job.salary);
