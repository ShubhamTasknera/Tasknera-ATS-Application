/**
 * Comprehensive Automated Acceptance & Calibration Test Suite for ATS Evaluation Engine
 * Tests:
 * - 8 Acceptance Scenarios (Deterministic, Zero Mandatory, Calibration, Gating)
 * - Required Test Cases (Section 16: Test A through Test F)
 * - Final Calibration Report (Section 20)
 */

import { calculateATSScore, calculateProfessionalTenure, calculateSpecificTenure } from '../services/atsScoringEngine';
import { CandidateRecord } from '../controllers/candidateController';

// Standard SunLife GenAI / Senior AI-ML Engineer JD Requirements
const genAiJdRequirements = [
  { id: 'req-1', requirement: 'Python', category: 'Technical Skill', weight: 2.0, is_mandatory: true },
  { id: 'req-2', requirement: 'SQL', category: 'Technical Skill', weight: 2.0, is_mandatory: true },
  { id: 'req-3', requirement: 'FastAPI', category: 'Technical Skill', weight: 2.0, is_mandatory: true },
  { id: 'req-4', requirement: 'LangGraph', category: 'GenAI', weight: 2.0, is_mandatory: true },
  { id: 'req-5', requirement: 'Retrieval Augmented Generation (RAG)', category: 'GenAI', weight: 2.0, is_mandatory: true },
  { id: 'req-6', requirement: 'Vector Databases (Pinecone or ChromaDB)', category: 'GenAI', weight: 1.5, is_mandatory: false },
  { id: 'req-7', requirement: 'AWS Bedrock or Azure OpenAI', category: 'Cloud/GenAI', weight: 1.5, is_mandatory: false },
  { id: 'req-8', requirement: '4-6 years professional experience', category: 'Experience', weight: 2.0, is_mandatory: true },
  { id: 'req-9', requirement: 'NCR Location (Gurugram / Noida / Delhi)', category: 'Location', weight: 1.5, is_mandatory: true },
  { id: 'req-10', requirement: 'Immediate joiner (within 15 days)', category: 'Availability', weight: 1.0, is_mandatory: false },
  { id: 'req-11', requirement: 'Bachelors in Computer Science or related engineering field', category: 'Education', weight: 1.0, is_mandatory: false },
];

const mockJob = {
  id: 'job-genai-sunlife-1',
  position: 'Senior GenAI Engineer',
  client: 'SunLife Financial',
  jd_text: 'Looking for a Senior GenAI Engineer with Python, FastAPI, LangGraph, RAG, and 4-6 years of experience in NCR.'
};

// ============================================================================
// CANDIDATE PROFILES (1 - 5)
// ============================================================================

// 1. Karan Malhotra (Strong Full Match Profile)
const karanMalhotra: CandidateRecord = {
  id: 'cand-karan',
  name: 'Karan Malhotra',
  email: 'karan.malhotra@example.com',
  phone: '+91 98765 43210',
  location: 'Gurugram, Haryana',
  currentTitle: 'Senior GenAI Engineer',
  currentCompany: 'Apex AI Labs',
  totalExperience: '5.5 years',
  skills: ['Python', 'SQL', 'FastAPI', 'LangGraph', 'LangChain', 'RAG', 'Pinecone', 'AWS Bedrock', 'Docker', 'PostgreSQL'],
  experience: [
    {
      title: 'Senior GenAI Engineer',
      company: 'Apex AI Labs',
      startDate: '2021',
      endDate: 'Present',
      duration: '3.5 years',
      description: 'Architected multi-agent graph workflows using LangGraph and Python. Developed production asynchronous REST APIs with FastAPI and deployed RAG pipelines with Pinecone vector database and AWS Bedrock.'
    },
    {
      title: 'Python Backend Developer',
      company: 'DataCore Systems',
      startDate: '2019',
      endDate: '2021',
      duration: '2 years',
      description: 'Built scalable backend microservices using Python, SQL, and PostgreSQL databases.'
    }
  ],
  education: [
    { degree: 'B.Tech', field: 'Computer Science and Engineering', institution: 'Delhi Technological University', year: '2019' }
  ],
  rawText: 'Karan Malhotra. Gurugram, India. 5.5 years experience in Python, SQL, FastAPI, LangGraph, RAG, Pinecone, AWS Bedrock. Immediate joiner (serving notice, 10 days).'
} as any;

// 2. Sneha Joshi (Classical ML, No FastAPI, No LangGraph, No RAG)
const snehaJoshi: CandidateRecord = {
  id: 'cand-sneha',
  name: 'Sneha Joshi',
  email: 'sneha.joshi@example.com',
  location: 'Bengaluru, Karnataka',
  currentTitle: 'Machine Learning Engineer',
  currentCompany: 'Insight Analytics',
  totalExperience: '5 years',
  skills: ['Python', 'SQL', 'Scikit-learn', 'TensorFlow', 'Pandas', 'NumPy', 'Flask'],
  experience: [
    {
      title: 'Machine Learning Engineer',
      company: 'Insight Analytics',
      startDate: '2020',
      endDate: 'Present',
      duration: '4 years',
      description: 'Trained predictive ML models using Python, SQL, Scikit-learn, and TensorFlow. Built model serving prototypes using Flask.'
    }
  ],
  education: [
    { degree: 'B.E.', field: 'Information Technology', institution: 'Pune University', year: '2020' }
  ],
  rawText: 'Sneha Joshi. Bengaluru. 5 years experience in Python, SQL, Scikit-learn, TensorFlow, ML algorithms, Flask. Notice period: 60 days.'
} as any;

// 3. Meera Iyer (Strong Python/ML with LangChain prototype, but lacks LangGraph and FastAPI)
const meeraIyer: CandidateRecord = {
  id: 'cand-meera',
  name: 'Meera Iyer',
  email: 'meera.iyer@example.com',
  location: 'Noida, UP',
  currentTitle: 'AI Developer',
  totalExperience: '4.5 years',
  skills: ['Python', 'SQL', 'Django', 'LangChain', 'OpenAI API', 'Vector Embeddings'],
  experience: [
    {
      title: 'AI Developer',
      company: 'CloudGen Solutions',
      startDate: '2021',
      endDate: 'Present',
      duration: '3.5 years',
      description: 'Built conversational chatbots using LangChain and OpenAI API. Utilized vector embeddings for document search. Backend services built using Django.'
    }
  ],
  education: [
    { degree: 'B.Tech', field: 'Computer Science', institution: 'IIT Roorkee', year: '2020' }
  ],
  rawText: 'Meera Iyer. Noida, NCR. 4.5 years experience in Python, SQL, Django, LangChain, OpenAI API. Immediate joiner.'
} as any;

// 4. Ritesh Verma (Has skills & 4 yrs exp, but based in Mumbai for NCR requirement)
const riteshVerma: CandidateRecord = {
  id: 'cand-ritesh',
  name: 'Ritesh Verma',
  email: 'ritesh.verma@example.com',
  location: 'Mumbai, Maharashtra',
  currentTitle: 'Backend AI Engineer',
  totalExperience: '4.5 years',
  skills: ['Python', 'SQL', 'FastAPI', 'RAG', 'ChromaDB', 'Docker'],
  experience: [
    {
      title: 'Backend AI Engineer',
      company: 'FinTech Wave',
      startDate: '2020',
      endDate: 'Present',
      duration: '4.5 years',
      description: 'Developed FastAPI services and integrated RAG pipelines with ChromaDB.'
    }
  ],
  education: [
    { degree: 'B.E.', field: 'Computer Engineering', institution: 'Mumbai University', year: '2020' }
  ],
  rawText: 'Ritesh Verma. Mumbai. 4.5 years experience in Python, SQL, FastAPI, RAG, ChromaDB. Notice: 30 days.'
} as any;

// 5. Aditya Singh (Has GenAI & LangGraph, but only 1 year experience vs 4-6 yrs)
const adityaSingh: CandidateRecord = {
  id: 'cand-aditya',
  name: 'Aditya Singh',
  email: 'aditya.singh@example.com',
  location: 'New Delhi',
  currentTitle: 'Junior AI Associate',
  totalExperience: '1 year',
  skills: ['Python', 'FastAPI', 'LangGraph', 'RAG', 'Pinecone'],
  experience: [
    {
      title: 'Junior AI Associate',
      company: 'NextGen AI',
      startDate: '2024',
      endDate: 'Present',
      duration: '1 year',
      description: 'Worked on LangGraph agents and FastAPI endpoints.'
    }
  ],
  education: [
    { degree: 'B.Tech', field: 'Computer Science', institution: 'DTU', year: '2024' }
  ],
  rawText: 'Aditya Singh. New Delhi. 1 year experience in Python, FastAPI, LangGraph, RAG. Immediate availability.'
} as any;

// ============================================================================
// SECTION 16 SPECIFIC TEST CANDIDATES (Test A - Test F)
// ============================================================================

// Test A — Completely Irrelevant CV (Graphic Designer for Senior AWS Cloud Engineer)
const alexGraphicDesigner: CandidateRecord = {
  id: 'cand-alex-design',
  name: 'Alex Morgan',
  email: 'alex.design@example.com',
  location: 'New York, NY',
  currentTitle: 'Graphic Designer',
  currentCompany: 'Creative Studio',
  totalExperience: '2 years',
  skills: ['Photoshop', 'Illustrator', 'Figma', 'InDesign', 'Typography'],
  experience: [
    {
      title: 'Graphic Designer',
      company: 'Creative Studio',
      startDate: '2022',
      endDate: '2024',
      duration: '2 years',
      description: 'Designed vector illustrations, logos, and UI wireframes using Figma and Photoshop.'
    }
  ],
  education: [{ degree: 'B.A.', field: 'Graphic Design', institution: 'Pratt Institute', year: '2022' }],
  rawText: 'Alex Morgan. 2 years Graphic Designer. Photoshop, Illustrator, Figma, InDesign.'
} as any;

const awsCloudEngineerJd = {
  id: 'job-aws-cloud-1',
  position: 'Senior AWS Cloud Engineer',
  client: 'CloudScale Inc',
  requirements: [
    { id: 'req-aws-1', requirement: '5+ years AWS', category: 'Experience', weight: 2.5, is_mandatory: true },
    { id: 'req-aws-2', requirement: 'Terraform', category: 'Technical Skill', weight: 2.0, is_mandatory: true },
    { id: 'req-aws-3', requirement: 'Docker', category: 'Technical Skill', weight: 1.5, is_mandatory: false },
    { id: 'req-aws-4', requirement: 'Kubernetes', category: 'Technical Skill', weight: 2.0, is_mandatory: true },
    { id: 'req-aws-5', requirement: 'CI/CD pipelines', category: 'Technical Skill', weight: 1.5, is_mandatory: false },
  ]
};

// Test B — Missing Mandatory Skill (Python/Django for Senior Java Developer with Spring Boot)
const priyaPythonDev: CandidateRecord = {
  id: 'cand-priya-python',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  location: 'Bangalore',
  currentTitle: 'Senior Python Developer',
  totalExperience: '8 years',
  skills: ['Python', 'Django', 'AWS', 'PostgreSQL', 'Redis'],
  experience: [
    {
      title: 'Senior Python Developer',
      company: 'DataFlow Inc',
      startDate: '2016',
      endDate: '2024',
      duration: '8 years',
      description: 'Built high-throughput backend APIs using Python, Django, AWS, and PostgreSQL databases.'
    }
  ],
  education: [{ degree: 'B.Tech', field: 'Computer Science', institution: 'NIT Trichy', year: '2016' }],
  rawText: 'Priya Sharma. 8 years Python, Django, AWS, PostgreSQL, microservices with Django.'
} as any;

const javaDeveloperJd = {
  id: 'job-java-sr-1',
  position: 'Senior Java Developer',
  client: 'Enterprise Bank',
  requirements: [
    { id: 'req-java-1', requirement: '5 years Java', category: 'Experience', weight: 2.5, is_mandatory: true },
    { id: 'req-java-2', requirement: 'Spring Boot', category: 'Technical Skill', weight: 2.0, is_mandatory: true },
    { id: 'req-java-3', requirement: 'Microservices', category: 'Technical Skill', weight: 1.5, is_mandatory: true },
    { id: 'req-java-4', requirement: 'SQL and Relational Databases', category: 'Technical Skill', weight: 1.5, is_mandatory: false },
  ]
};

// Test C — General Experience Must Not Leak (8 years general software, 0 SAP for SAP Consultant)
const rahulGeneralEngineer: CandidateRecord = {
  id: 'cand-rahul-dev',
  name: 'Rahul Sen',
  email: 'rahul.sen@example.com',
  location: 'Hyderabad',
  currentTitle: 'Senior Software Engineer',
  totalExperience: '8 years',
  skills: ['C++', 'Linux', 'Embedded Systems', 'SQL', 'Git'],
  experience: [
    {
      title: 'Software Engineer',
      company: 'SystemCore',
      startDate: '2016',
      endDate: '2024',
      duration: '8 years',
      description: 'Developed embedded Linux controllers and performance-critical C++ modules.'
    }
  ],
  education: [{ degree: 'B.Tech', field: 'Electronics Engineering', institution: 'JNTU', year: '2016' }],
  rawText: 'Rahul Sen. 8 years Software Engineering. C++, Linux kernel, device drivers, SQL.'
} as any;

const sapConsultantJd = {
  id: 'job-sap-1',
  position: 'SAP Consultant',
  client: 'Global Manufacturing Corp',
  requirements: [
    { id: 'req-sap-1', requirement: '5 years SAP experience', category: 'Experience', weight: 2.5, is_mandatory: true },
    { id: 'req-sap-2', requirement: 'SAP MM / ERP', category: 'Technical Skill', weight: 2.0, is_mandatory: true },
    { id: 'req-sap-3', requirement: 'Material Management processes', category: 'Functional Skill', weight: 1.5, is_mandatory: false }
  ]
};

// Test D — Strong Matching Candidate for AWS Cloud Engineer
const davidAwsEngineer: CandidateRecord = {
  id: 'cand-david-aws',
  name: 'David Chen',
  email: 'david.chen@example.com',
  location: 'San Jose, CA',
  currentTitle: 'Senior Cloud Engineer',
  totalExperience: '6 years',
  skills: ['AWS', 'Terraform', 'Kubernetes', 'Docker', 'Jenkins', 'GitHub Actions', 'Linux'],
  experience: [
    {
      title: 'Senior Cloud Engineer',
      company: 'CloudWorks',
      startDate: '2018',
      endDate: '2024',
      duration: '6 years',
      description: '6 years AWS cloud infrastructure engineering. Provisioned multi-region AWS environments using Terraform. Deployed containerized microservices on Kubernetes (EKS) and Docker. Configured automated CI/CD with Jenkins and GitHub Actions.'
    }
  ],
  education: [{ degree: 'B.S.', field: 'Computer Science', institution: 'UC Berkeley', year: '2018' }],
  rawText: 'David Chen. Senior AWS Cloud Engineer. 6 years AWS, Terraform, Kubernetes, Docker, Jenkins, GitHub Actions, CI/CD.'
} as any;

// Test E — Generic Keyword False Positive CV
const genericKeywordCv: CandidateRecord = {
  id: 'cand-generic-kw',
  name: 'Generic Business Analyst',
  email: 'analyst@example.com',
  location: 'Chicago, IL',
  currentTitle: 'Business Analyst',
  totalExperience: '3 years',
  skills: ['Excel', 'PowerBI', 'Reporting'],
  experience: [
    {
      title: 'Business Analyst',
      company: 'BizInsights',
      startDate: '2021',
      endDate: 'Present',
      duration: '3 years',
      description: 'Worked on data analysis and business reporting for enterprise clients.'
    }
  ],
  education: [{ degree: 'B.B.A.', field: 'Business', institution: 'DePaul', year: '2021' }],
  rawText: 'Worked on data analysis and business reporting.'
} as any;

// Test F — Different Technology (Oracle ERP for Mandatory SAP MM)
const oracleConsultant: CandidateRecord = {
  id: 'cand-oracle-erp',
  name: 'Suresh Menon',
  email: 'suresh.menon@example.com',
  location: 'Chennai',
  currentTitle: 'Oracle ERP Consultant',
  totalExperience: '7 years',
  skills: ['Oracle ERP', 'Oracle Financials', 'PL/SQL', 'Oracle Cloud'],
  experience: [
    {
      title: 'Oracle ERP Consultant',
      company: 'TechOracle Ltd',
      startDate: '2017',
      endDate: '2024',
      duration: '7 years',
      description: 'Configured and deployed Oracle ERP and Oracle Financials modules. Extensive PL/SQL development.'
    }
  ],
  education: [{ degree: 'B.E.', field: 'Information Technology', institution: 'Anna University', year: '2017' }],
  rawText: 'Suresh Menon. Oracle ERP, Oracle Financials, Oracle Cloud, PL/SQL. 7 years experience.'
} as any;

const mandatorySapMmJd = {
  id: 'job-sap-mm-1',
  position: 'SAP MM Consultant',
  client: 'Logistics Global',
  requirements: [
    { id: 'req-s-1', requirement: 'Mandatory: SAP MM', category: 'Technical Skill', weight: 3.0, is_mandatory: true },
    { id: 'req-s-2', requirement: 'Material Management procurement workflows', category: 'Functional Skill', weight: 2.0, is_mandatory: false },
  ]
};

// ============================================================================
// TEST EXECUTION & ASSERTIONS
// ============================================================================

async function runAcceptanceTests() {
  console.log('===============================================================');
  console.log('RUNNING ATS EVIDENCE-BASED DETERMINISTIC ACCEPTANCE SUITE');
  console.log('===============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  const test = (title: string, fn: () => boolean) => {
    totalTests++;
    console.log(`--- ${title} ---`);
    try {
      const ok = fn();
      if (ok) {
        console.log(`✅ ${title} PASSED\n`);
        passedTests++;
      } else {
        console.error(`❌ ${title} FAILED\n`);
      }
    } catch (err) {
      console.error(`❌ ${title} ERROR:`, err, '\n');
    }
  };

  // 1. Full Match Profile (Karan Malhotra)
  test('TEST 1: Full Match Candidate (Karan Malhotra)', () => {
    const res = calculateATSScore(karanMalhotra, mockJob, genAiJdRequirements);
    console.log(`Score: ${res.overallScore}% | Raw: ${res.rawScore}% | Tier: ${res.matchLevel} | Mandatory Failed: ${res.mandatoryRequirementFailed}`);
    return res.overallScore >= 90 && res.matchLevel === 'EXCELLENT MATCH' && !res.mandatoryRequirementFailed;
  });

  // 2. Classical ML (Sneha Joshi - Missing FastAPI, LangGraph, RAG, NCR Location)
  test('TEST 2: Classical ML Missing GenAI & FastAPI (Sneha Joshi)', () => {
    const res = calculateATSScore(snehaJoshi, mockJob, genAiJdRequirements);
    console.log(`Score: ${res.overallScore}% | Raw: ${res.rawScore}% | Tier: ${res.matchLevel} | Mandatory Failed: ${res.mandatoryRequirementFailed}`);
    console.log(`Mandatory Failures (${res.mandatoryFailures.length}):`, res.mandatoryFailures.map(f => f.requirement));
    // Must be capped at <= 40% due to mandatory failure
    return res.overallScore <= 40 && res.mandatoryRequirementFailed && (res.matchLevel === 'LOW MATCH' || res.matchLevel === 'MINIMAL MATCH');
  });

  // 3. AI Developer with LangChain & Django but no LangGraph / FastAPI (Meera Iyer)
  test('TEST 3: Candidate with Partial LangChain & Django (Meera Iyer)', () => {
    const res = calculateATSScore(meeraIyer, mockJob, genAiJdRequirements);
    const lgReq = res.requirements.find(r => r.requirement === 'LangGraph');
    console.log(`LangGraph Status: ${lgReq?.status} (Score: ${lgReq?.score}%)`);
    console.log(`Score: ${res.overallScore}% | Raw: ${res.rawScore}% | Mandatory Failed: ${res.mandatoryRequirementFailed}`);
    // LangChain is recognized as PARTIAL (0.4) for LangGraph, mandatory fails, raw score is 50-70, final capped <= 40%
    return lgReq?.status === 'PARTIAL' && res.mandatoryRequirementFailed && res.overallScore <= 40 && res.rawScore >= 50;
  });

  // 4. Location Mismatch (Ritesh Verma in Mumbai for NCR Requirement)
  test('TEST 4: Location Mismatch (Ritesh Verma in Mumbai for NCR)', () => {
    const res = calculateATSScore(riteshVerma, mockJob, genAiJdRequirements);
    const locReq = res.requirements.find(r => r.category === 'Location');
    console.log(`Location Status: ${locReq?.status} | Score: ${res.overallScore}% (Capped: ${res.overallScore <= 40})`);
    return locReq?.status === 'NOT_MATCHED' && res.mandatoryRequirementFailed && res.overallScore <= 40;
  });

  // 5. Junior Candidate (Aditya Singh - 1 Year vs 4-6 Years Required)
  test('TEST 5: Junior Candidate (Aditya Singh - 1 Year vs 4-6 Years Required)', () => {
    const res = calculateATSScore(adityaSingh, mockJob, genAiJdRequirements);
    const expReq = res.requirements.find(r => r.category === 'Experience');
    console.log(`Experience Status: ${expReq?.status} | Score: ${res.overallScore}% (Mandatory Failed: ${res.mandatoryRequirementFailed})`);
    return expReq?.status === 'NOT_MATCHED' && res.mandatoryRequirementFailed && res.overallScore <= 40;
  });

  // 6. Mandatory Failure Caps Match Tier (Sneha Joshi)
  test('TEST 6: Mandatory Failure Caps Match Tier (Sneha Joshi)', () => {
    const res = calculateATSScore(snehaJoshi, mockJob, genAiJdRequirements);
    return res.mandatoryRequirementFailed && (res.matchLevel === 'LOW MATCH' || res.matchLevel === 'MINIMAL MATCH') && res.overallScore <= 40;
  });

  // 7. Determinism Verification
  test('TEST 7: Determinism Verification', () => {
    const runA = calculateATSScore(karanMalhotra, mockJob, genAiJdRequirements);
    const runB = calculateATSScore(karanMalhotra, mockJob, genAiJdRequirements);
    return runA.overallScore === runB.overallScore &&
           runA.rawScore === runB.rawScore &&
           runA.matchLevel === runB.matchLevel &&
           runA.mandatoryRequirementFailed === runB.mandatoryRequirementFailed &&
           JSON.stringify(runA.requirements.map(r => r.status)) === JSON.stringify(runB.requirements.map(r => r.status));
  });

  // 8. Zero Mandatory Requirements in JD
  test('TEST 8: Zero Mandatory Requirements in JD (Pure Weighted Evaluation)', () => {
    const zeroMandatoryReqs = genAiJdRequirements.map(r => ({ ...r, is_mandatory: false, isMandatory: false }));
    const res8 = calculateATSScore(karanMalhotra, mockJob, zeroMandatoryReqs);
    const res8Sneha = calculateATSScore(snehaJoshi, mockJob, zeroMandatoryReqs);
    console.log(`Karan (Zero Mandatory): ${res8.overallScore}% | Failed: ${res8.mandatoryRequirementFailed}`);
    console.log(`Sneha (Zero Mandatory): ${res8Sneha.overallScore}% | Failed: ${res8Sneha.mandatoryRequirementFailed}`);
    return !res8.mandatoryRequirementFailed &&
           !res8Sneha.mandatoryRequirementFailed &&
           res8.overallScore >= 90 &&
           res8Sneha.overallScore < 50 &&
           res8.overallScore > res8Sneha.overallScore + 40;
  });

  // ==========================================================================
  // SECTION 16: REQUIRED TEST CASES
  // ==========================================================================
  console.log('\n===============================================================');
  console.log('EXECUTING SECTION 16 REQUIRED TEST CASES (TEST A - TEST F)');
  console.log('===============================================================\n');

  // Test A — Completely Irrelevant CV
  test('Test A: Completely Irrelevant CV (Graphic Designer for Senior AWS Cloud Engineer)', () => {
    const res = calculateATSScore(alexGraphicDesigner, awsCloudEngineerJd, awsCloudEngineerJd.requirements);
    console.log(`Score: ${res.overallScore}% | Raw: ${res.rawScore}% | Tier: ${res.matchLevel}`);
    const awsReq = res.requirements.find(r => r.requirement.includes('AWS'));
    const tfReq = res.requirements.find(r => r.requirement.includes('Terraform'));
    const k8sReq = res.requirements.find(r => r.requirement.includes('Kubernetes'));
    console.log(`AWS: ${awsReq?.status}, Terraform: ${tfReq?.status}, Kubernetes: ${k8sReq?.status}`);
    return res.overallScore < 45 &&
           res.overallScore <= 40 &&
           res.mandatoryRequirementFailed &&
           awsReq?.status === 'NOT_MATCHED' &&
           tfReq?.status === 'NOT_MATCHED' &&
           k8sReq?.status === 'NOT_MATCHED';
  });

  // Test B — Missing Mandatory Skill
  test('Test B: Missing Mandatory Skill (Python/Django for Senior Java Developer with Spring Boot)', () => {
    const res = calculateATSScore(priyaPythonDev, javaDeveloperJd, javaDeveloperJd.requirements);
    console.log(`Score: ${res.overallScore}% | Raw: ${res.rawScore}% | Mandatory Failed: ${res.mandatoryRequirementFailed}`);
    const javaReq = res.requirements.find(r => r.requirement.toLowerCase().includes('java'));
    const springReq = res.requirements.find(r => r.requirement.toLowerCase().includes('spring'));
    console.log(`Java: ${javaReq?.status}, Spring Boot: ${springReq?.status}`);
    return res.mandatoryRequirementFailed &&
           res.overallScore <= 40 &&
           javaReq?.status === 'NOT_MATCHED' &&
           springReq?.status === 'NOT_MATCHED';
  });

  // Test C — General Experience Must Not Leak
  test('Test C: General Experience Must Not Leak (8y Software Eng, 0 SAP for SAP Consultant)', () => {
    const totalTenure = calculateProfessionalTenure(rahulGeneralEngineer);
    const sapSpecific = calculateSpecificTenure(rahulGeneralEngineer, ['sap']);
    console.log(`totalCareerYears: ${totalTenure} | SAP-specificYears: ${sapSpecific.specificYears}`);
    
    const res = calculateATSScore(rahulGeneralEngineer, sapConsultantJd, sapConsultantJd.requirements);
    const sapExpReq = res.requirements.find(r => r.requirement.includes('SAP experience'));
    console.log(`SAP Experience Status: ${sapExpReq?.status} | Evidence: "${sapExpReq?.candidateEvidence}"`);
    console.log(`Final Score: ${res.overallScore}% (Capped: ${res.overallScore <= 40})`);
    
    return totalTenure === 8 &&
           sapSpecific.specificYears === 0 &&
           sapExpReq?.status === 'NOT_MATCHED' &&
           res.mandatoryRequirementFailed &&
           res.overallScore <= 40;
  });

  // Test D — Strong Matching Candidate
  test('Test D: Strong Matching Candidate (David Chen for Senior AWS Cloud Engineer)', () => {
    const res = calculateATSScore(davidAwsEngineer, awsCloudEngineerJd, awsCloudEngineerJd.requirements);
    console.log(`Score: ${res.overallScore}% | Tier: ${res.matchLevel} | Mandatory Failed: ${res.mandatoryRequirementFailed}`);
    console.log('Requirements Match Summary:');
    res.requirements.forEach(r => console.log(`  - ${r.requirement}: ${r.status} (${r.score}%)`));
    return res.overallScore >= 80 && !res.mandatoryRequirementFailed;
  });

  // Test E — Generic Keyword False Positive CV
  test('Test E: Generic Keyword False Positive (CV has "data analysis and business reporting")', () => {
    const awsJobSimple = {
      id: 'job-aws-simple',
      position: 'AWS Cloud Engineer',
      requirements: [
        { id: 'req-e-1', requirement: 'AWS Cloud Engineer', category: 'Technical Skill', weight: 2.0, is_mandatory: true },
        { id: 'req-e-2', requirement: 'Cloud Infrastructure', category: 'Technical Skill', weight: 2.0, is_mandatory: true },
      ]
    };
    const res = calculateATSScore(genericKeywordCv, awsJobSimple, awsJobSimple.requirements);
    console.log(`Score: ${res.overallScore}% | Mandatory Failed: ${res.mandatoryRequirementFailed}`);
    res.requirements.forEach(r => console.log(`  - ${r.requirement}: ${r.status} (Evidence: "${r.candidateEvidence}")`));
    const allNotMatched = res.requirements.every(r => r.status === 'NOT_MATCHED');
    return allNotMatched && res.overallScore === 0 && res.mandatoryRequirementFailed;
  });

  // Test F — Different Technology (Oracle ERP for Mandatory SAP MM)
  test('Test F: Different Technology (Oracle ERP for Mandatory SAP MM)', () => {
    const res = calculateATSScore(oracleConsultant, mandatorySapMmJd, mandatorySapMmJd.requirements);
    console.log(`Score: ${res.overallScore}% | Mandatory Failed: ${res.mandatoryRequirementFailed}`);
    const sapMmReq = res.requirements.find(r => r.requirement.includes('SAP MM'));
    console.log(`SAP MM Status: ${sapMmReq?.status} | Evidence: "${sapMmReq?.candidateEvidence}"`);
    return sapMmReq?.status === 'NOT_MATCHED' &&
           res.mandatoryRequirementFailed &&
           res.overallScore <= 40;
  });

  // ==========================================================================
  // SECTION 20: REQUIRED FINAL VERIFICATION CALIBRATION REPORT
  // ==========================================================================
  console.log('\n===============================================================');
  console.log('SECTION 20: CALIBRATION VERIFICATION REPORT TABLE');
  console.log('===============================================================');

  const candidatesToReport = [
    { title: '1. Irrelevant CV', cand: alexGraphicDesigner, job: awsCloudEngineerJd, reqs: awsCloudEngineerJd.requirements },
    { title: '2. Partially Relevant CV', cand: meeraIyer, job: mockJob, reqs: genAiJdRequirements },
    { title: '3. Strong Matching CV', cand: karanMalhotra, job: mockJob, reqs: genAiJdRequirements },
    { title: '4. Missing Mandatory Skill', cand: priyaPythonDev, job: javaDeveloperJd, reqs: javaDeveloperJd.requirements },
    { title: '5. High General Exp / No Specific Exp', cand: rahulGeneralEngineer, job: sapConsultantJd, reqs: sapConsultantJd.requirements },
    { title: '6. Generic Keyword False Positive CV', cand: genericKeywordCv, job: awsCloudEngineerJd, reqs: awsCloudEngineerJd.requirements },
  ];

  console.log(
    'Candidate'.padEnd(28) +
    'Raw'.padEnd(7) +
    'Final'.padEnd(8) +
    'Mand.Fail'.padEnd(12) +
    'Matched Skills'.padEnd(28) +
    'Missing Skills'.padEnd(28) +
    'Specific Exp'.padEnd(16) +
    'Decision'
  );
  console.log('-'.repeat(135));

  for (const item of candidatesToReport) {
    const r = calculateATSScore(item.cand, item.job, item.reqs);
    const matched = r.requirements.filter(x => x.status === 'MATCHED').map(x => x.requirement).slice(0, 2).join(', ') || 'None';
    const missing = r.requirements.filter(x => x.status === 'NOT_MATCHED').map(x => x.requirement).slice(0, 2).join(', ') || 'None';
    const specExp = r.requirements.find(x => x.category === 'Experience')?.experienceDetails?.candidateRelevantExperience ??
                    (r.requirements.some(x => x.category === 'Experience') ? `${r.requirements.find(x => x.category === 'Experience')?.status}` : 'N/A');
    const decision = r.mandatoryRequirementFailed || r.overallScore < 50 ? 'DO NOT SUBMIT' : r.overallScore >= 75 ? 'SUBMIT' : 'REVIEW';

    console.log(
      (item.cand.name || 'Candidate').padEnd(28) +
      `${r.rawScore}%`.padEnd(7) +
      `${r.overallScore}%`.padEnd(8) +
      `${r.mandatoryRequirementFailed ? 'YES' : 'NO'}`.padEnd(12) +
      matched.substring(0, 26).padEnd(28) +
      missing.substring(0, 26).padEnd(28) +
      String(specExp).padEnd(16) +
      decision
    );
  }

  console.log('\n===============================================================');
  console.log(`OVERALL RESULTS: ${passedTests} / ${totalTests} Tests Passed.`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL ACCEPTANCE & CALIBRATION TESTS PASSED PERFECTLY!');
  } else {
    console.error(`⚠️ ${totalTests - passedTests} tests failed.`);
  }
}

runAcceptanceTests();
