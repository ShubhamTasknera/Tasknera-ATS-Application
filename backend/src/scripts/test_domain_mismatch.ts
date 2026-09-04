import { calculateATSScore } from '../services/atsScoringEngine';
import { getStandardRequirementsForPosition } from '../controllers/evaluationController';
import { CandidateRecord } from '../controllers/candidateController';

// Technical candidate: Software Engineer with 4 years Java / Node experience
const technicalCandidate: CandidateRecord = {
  id: 'cand-tech-1',
  jobId: 'job-sales-1',
  fileName: 'john_doe_software_engineer.pdf',
  fileSize: 1024,
  name: 'John Doe',
  email: 'john.doe@techdev.com',
  currentTitle: 'Senior Software Engineer',
  currentCompany: 'FinTech Solutions Inc.',
  totalExperience: '4.5 years',
  skills: ['Java', 'Spring Boot', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Git', 'CI/CD'],
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'FinTech Solutions Inc.',
      startDate: '2022-01',
      endDate: 'Present',
      description: 'Architected microservices using Java and Spring Boot. Optimized PostgreSQL queries and deployed containers with Docker.'
    },
    {
      title: 'Software Developer',
      company: 'AppSoft Labs',
      startDate: '2020-06',
      endDate: '2021-12',
      description: 'Developed RESTful backend endpoints in Node.js and TypeScript. Collaborated in Agile sprints.'
    }
  ],
  education: [
    {
      degree: 'Bachelor of Technology',
      field: 'Computer Science',
      institution: 'State University',
      year: '2020'
    }
  ],
  rawText: 'John Doe Senior Software Engineer Java Spring Boot Node.js PostgreSQL Docker REST APIs Git CI/CD Microservices State University B.Tech Computer Science'
} as any as CandidateRecord;

// Sales candidate: B2B Account Executive with 4 years quota-carrying experience
const salesCandidate: CandidateRecord = {
  id: 'cand-sales-1',
  jobId: 'job-sales-1',
  fileName: 'sarah_smith_sales_executive.pdf',
  fileSize: 1024,
  name: 'Sarah Smith',
  email: 'sarah.smith@salespro.com',
  currentTitle: 'Senior Account Executive',
  currentCompany: 'CloudScale SaaS',
  totalExperience: '4.2 years',
  skills: ['B2B Sales', 'Lead Generation', 'Salesforce CRM', 'HubSpot', 'Pipeline Management', 'Cold Calling', 'Contract Negotiation', 'Quota Attainment'],
  experience: [
    {
      title: 'Senior Account Executive',
      company: 'CloudScale SaaS',
      startDate: '2022-03',
      endDate: 'Present',
      description: 'Exceeded assigned annual quota by 130%. Managed B2B sales pipeline, conducted discovery demos, and closed 25+ enterprise contracts using Salesforce.'
    },
    {
      title: 'Business Development Representative',
      company: 'GrowthForce',
      startDate: '2020-08',
      endDate: '2022-02',
      description: 'Executed outbound prospecting and cold calling campaigns. Generated over 150 qualified sales leads in HubSpot.'
    }
  ],
  education: [
    {
      degree: 'Bachelor of Business Administration',
      field: 'Marketing & Sales',
      institution: 'Business Institute',
      year: '2020'
    }
  ],
  rawText: 'Sarah Smith Senior Account Executive B2B Sales Salesforce CRM HubSpot Pipeline Management Lead Generation Quota Attainment Cold Calling Contract Negotiation Bachelor of Business Administration'
} as any as CandidateRecord;

const salesJob = {
  id: 'job-sales-1',
  position: 'B2B Sales Account Executive',
  title: 'B2B Sales Account Executive',
  client: 'Apex Enterprise CRM',
  company: 'Apex Enterprise CRM'
};

const salesRequirements = getStandardRequirementsForPosition(salesJob.position, salesJob.client);

const techJob = {
  id: 'job-tech-1',
  position: 'Senior Backend Engineer',
  title: 'Senior Backend Engineer',
  client: 'TechNova Cloud',
  company: 'TechNova Cloud'
};

const techRequirements = getStandardRequirementsForPosition(techJob.position, techJob.client);

console.log('================================================================');
console.log('TEST 1: Technical Software Engineer evaluated against SALES Job');
console.log('================================================================');
const techOnSalesResult = calculateATSScore(technicalCandidate, salesJob, salesRequirements);
console.log(`Candidate: ${technicalCandidate.name} (${technicalCandidate.currentTitle})`);
console.log(`Job: ${salesJob.position}`);
console.log(`Score: ${techOnSalesResult.overallScore}%`);
console.log(`Match Tier: ${techOnSalesResult.matchLevel}`);
console.log(`Mandatory Failures: ${techOnSalesResult.mandatoryFailures.length}`);
techOnSalesResult.mandatoryFailures.forEach(f => console.log(`  - [${f.category}] ${f.requirement}: ${f.reason}`));
console.log(`Warnings: ${techOnSalesResult.warnings.join(' | ')}`);

console.log('\n================================================================');
console.log('TEST 2: Authentic Sales Executive evaluated against SALES Job');
console.log('================================================================');
const salesOnSalesResult = calculateATSScore(salesCandidate, salesJob, salesRequirements);
console.log(`Candidate: ${salesCandidate.name} (${salesCandidate.currentTitle})`);
console.log(`Job: ${salesJob.position}`);
console.log(`Score: ${salesOnSalesResult.overallScore}%`);
console.log(`Match Tier: ${salesOnSalesResult.matchLevel}`);
console.log(`Mandatory Failures: ${salesOnSalesResult.mandatoryFailures.length}`);
salesOnSalesResult.mandatoryFailures.forEach(f => console.log(`  - [${f.category}] ${f.requirement}: ${f.reason}`));
console.log('Requirement details:');
salesOnSalesResult.requirementResults.forEach(r => console.log(`  * [${r.status}] ${r.requirement}: ${r.evidence || r.failureReason}`));

console.log('\n================================================================');
console.log('TEST 3: Sales Executive evaluated against SOFTWARE ENGINEER Job');
console.log('================================================================');
const salesOnTechResult = calculateATSScore(salesCandidate, techJob, techRequirements);
console.log(`Candidate: ${salesCandidate.name} (${salesCandidate.currentTitle})`);
console.log(`Job: ${techJob.position}`);
console.log(`Score: ${salesOnTechResult.overallScore}%`);
console.log(`Match Tier: ${salesOnTechResult.matchLevel}`);
console.log(`Mandatory Failures: ${salesOnTechResult.mandatoryFailures.length}`);
salesOnTechResult.mandatoryFailures.forEach(f => console.log(`  - [${f.category}] ${f.requirement}: ${f.reason}`));

console.log('\n================================================================');
console.log('TEST 4: Software Engineer evaluated against SOFTWARE ENGINEER Job');
console.log('================================================================');
const techOnTechResult = calculateATSScore(technicalCandidate, techJob, techRequirements);
console.log(`Candidate: ${technicalCandidate.name} (${technicalCandidate.currentTitle})`);
console.log(`Job: ${techJob.position}`);
console.log(`Score: ${techOnTechResult.overallScore}%`);
console.log(`Match Tier: ${techOnTechResult.matchLevel}`);
console.log(`Mandatory Failures: ${techOnTechResult.mandatoryFailures.length}`);
techOnTechResult.mandatoryFailures.forEach(f => console.log(`  - [${f.category}] ${f.requirement}: ${f.reason}`));
console.log('Requirement details:');
techOnTechResult.requirementResults.forEach(r => console.log(`  * [${r.status}] ${r.requirement}: ${r.evidence || r.failureReason}`));

// Validations
if (techOnSalesResult.overallScore > 20) {
  console.error('FAILED: Technical candidate scored > 20% on Sales job!');
  process.exit(1);
} else {
  console.log('\nPASSED: Technical candidate scored <= 20% on Sales job!');
}

if (salesOnSalesResult.overallScore < 70) {
  console.error('FAILED: Sales candidate scored < 70% on Sales job!');
  process.exit(1);
} else {
  console.log('PASSED: Sales candidate scored >= 70% on Sales job!');
}

if (salesOnTechResult.overallScore > 20) {
  console.error('FAILED: Sales candidate scored > 20% on Technical job!');
  process.exit(1);
} else {
  console.log('PASSED: Sales candidate scored <= 20% on Technical job!');
}

if (techOnTechResult.overallScore < 70) {
  console.error('FAILED: Technical candidate scored < 70% on Technical job!');
  process.exit(1);
} else {
  console.log('PASSED: Technical candidate scored >= 70% on Technical job!');
}

console.log('\nALL CROSS-DOMAIN ATS TESTS PASSED WITH 100% ACCURACY!');
