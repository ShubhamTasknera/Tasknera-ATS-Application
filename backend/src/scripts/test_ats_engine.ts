/**
 * Automated Acceptance Test Suite for ATS Evaluation Engine
 * Tests all 7 required scenarios + Zero Mandatory Handling
 */

import { calculateATSScore } from '../services/atsScoringEngine';
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
// CANDIDATE PROFILES
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
// TEST EXECUTION & ASSERTIONS
// ============================================================================

async function runTests() {
  console.log('===============================================================');
  console.log('RUNNING ATS EVALUATION ENGINE ACCEPTANCE TEST SUITE');
  console.log('===============================================================\n');

  let passedTests = 0;
  const totalTests = 8;

  // TEST 1: Full Match Profile (Karan Malhotra)
  console.log('--- TEST 1: Full Match Candidate (Karan Malhotra) ---');
  const res1 = calculateATSScore(karanMalhotra, mockJob, genAiJdRequirements);
  console.log(`Score: ${res1.overallScore}% | Tier: ${res1.matchLevel} | Mandatory Failed: ${res1.mandatoryRequirementFailed}`);
  console.log(`Pillars:`, res1.pillarScores);
  if (res1.overallScore >= 90 && res1.matchLevel === 'EXCELLENT MATCH' && !res1.mandatoryRequirementFailed) {
    console.log('✅ TEST 1 PASSED: Strong candidate correctly received EXCELLENT MATCH.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 1 FAILED\n');
  }

  // TEST 2: Classical ML (Sneha Joshi - Missing FastAPI, LangGraph, RAG, NCR Location)
  console.log('--- TEST 2: Classical ML Missing GenAI & FastAPI (Sneha Joshi) ---');
  const res2 = calculateATSScore(snehaJoshi, mockJob, genAiJdRequirements);
  console.log(`Score: ${res2.overallScore}% | Tier: ${res2.matchLevel} | Mandatory Failed: ${res2.mandatoryRequirementFailed}`);
  console.log(`Mandatory Failures:`, res2.mandatoryFailures.map(f => f.requirement));
  if (res2.overallScore < 60 && res2.mandatoryRequirementFailed && res2.matchLevel !== 'EXCELLENT MATCH' && res2.matchLevel !== 'STRONG MATCH') {
    console.log('✅ TEST 2 PASSED: Missing core GenAI/FastAPI received low score and mandatory failure gating.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 2 FAILED\n');
  }

  // TEST 3: AI Developer with LangChain & Django but no LangGraph / FastAPI (Meera Iyer)
  console.log('--- TEST 3: Candidate with Partial LangChain & Django (Meera Iyer) ---');
  const res3 = calculateATSScore(meeraIyer, mockJob, genAiJdRequirements);
  console.log(`Score: ${res3.overallScore}% | Tier: ${res3.matchLevel} | Mandatory Failed: ${res3.mandatoryRequirementFailed}`);
  const lgReq = res3.requirements.find(r => r.requirement === 'LangGraph');
  console.log(`LangGraph Status: ${lgReq?.status} (Score: ${lgReq?.score}%)`);
  if (lgReq?.status === 'PARTIAL' && res3.mandatoryRequirementFailed && res3.overallScore >= 50 && res3.overallScore <= 80) {
    console.log('✅ TEST 3 PASSED: LangChain recognized as PARTIAL for LangGraph without false exact match.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 3 FAILED\n');
  }

  // TEST 4: Location Mismatch (Ritesh Verma in Mumbai for NCR Requirement)
  console.log('--- TEST 4: Location Mismatch (Ritesh Verma in Mumbai for NCR) ---');
  const res4 = calculateATSScore(riteshVerma, mockJob, genAiJdRequirements);
  const locReq = res4.requirements.find(r => r.category === 'Location');
  console.log(`Location Requirement Status: ${locReq?.status} | Evidence: "${locReq?.candidateEvidence}"`);
  if (locReq?.status === 'NOT_MATCHED' && res4.mandatoryRequirementFailed) {
    console.log('✅ TEST 4 PASSED: Location mismatch correctly identified as NOT_MATCHED and gated.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 4 FAILED\n');
  }

  // TEST 5: Junior Candidate (Aditya Singh - 1 Year vs 4-6 Years Required)
  console.log('--- TEST 5: Junior Candidate (Aditya Singh - 1 Year vs 4-6 Years Required) ---');
  const res5 = calculateATSScore(adityaSingh, mockJob, genAiJdRequirements);
  const expReq = res5.requirements.find(r => r.category === 'Experience');
  console.log(`Experience Status: ${expReq?.status} | Evidence: "${expReq?.candidateEvidence}"`);
  if (expReq?.status === 'NOT_MATCHED' && res5.mandatoryRequirementFailed && res5.matchLevel !== 'EXCELLENT MATCH') {
    console.log('✅ TEST 5 PASSED: Experience deficit correctly penalized.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 5 FAILED\n');
  }

  // TEST 6: Mandatory Failure Downgrades Classification (Score Caps)
  console.log('--- TEST 6: Mandatory Failure Caps Match Tier (Sneha Joshi) ---');
  if (res2.mandatoryRequirementFailed && res2.matchLevel === 'LOW MATCH') {
    console.log('✅ TEST 6 PASSED: Candidate with mandatory failures capped at LOW MATCH.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 6 FAILED\n');
  }

  // TEST 7: Determinism Test (Same Candidate + JD twice produce identical output)
  console.log('--- TEST 7: Determinism Verification ---');
  const runA = calculateATSScore(karanMalhotra, mockJob, genAiJdRequirements);
  const runB = calculateATSScore(karanMalhotra, mockJob, genAiJdRequirements);
  const isIdentical =
    runA.overallScore === runB.overallScore &&
    runA.matchLevel === runB.matchLevel &&
    runA.mandatoryRequirementFailed === runB.mandatoryRequirementFailed &&
    JSON.stringify(runA.requirements.map(r => r.status)) === JSON.stringify(runB.requirements.map(r => r.status));
  if (isIdentical) {
    console.log('✅ TEST 7 PASSED: 100% deterministic identical results across repeated evaluations.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 7 FAILED: Non-deterministic scoring detected.\n');
  }

  // TEST 8: Zero Mandatory Requirements in JD (Graceful Pure Weighted Evaluation)
  console.log('--- TEST 8: Zero Mandatory Requirements in JD ---');
  const zeroMandatoryReqs = genAiJdRequirements.map(r => ({ ...r, is_mandatory: false, isMandatory: false }));
  const res8 = calculateATSScore(karanMalhotra, mockJob, zeroMandatoryReqs);
  const res8Sneha = calculateATSScore(snehaJoshi, mockJob, zeroMandatoryReqs);
  console.log(`Karan Score (Zero Mandatory): ${res8.overallScore}% (${res8.matchLevel}) | Failed: ${res8.mandatoryRequirementFailed}`);
  console.log(`Sneha Score (Zero Mandatory): ${res8Sneha.overallScore}% (${res8Sneha.matchLevel}) | Failed: ${res8Sneha.mandatoryRequirementFailed}`);
  if (
    !res8.mandatoryRequirementFailed &&
    !res8Sneha.mandatoryRequirementFailed &&
    res8.overallScore >= 90 &&
    res8Sneha.overallScore < 50 &&
    res8.overallScore > res8Sneha.overallScore + 40
  ) {
    console.log('✅ TEST 8 PASSED: When JD has 0 mandatory requirements, engine computes accurate spread without false mandatory failures.\n');
    passedTests++;
  } else {
    console.error('❌ TEST 8 FAILED\n');
  }

  // Score Spread Summary
  console.log('===============================================================');
  console.log('CANDIDATE RANKING & SCORE SPREAD VERIFICATION:');
  console.log('===============================================================');
  const ranked = [
    { name: 'Karan Malhotra', score: res1.overallScore, tier: res1.matchLevel, passedMandatory: !res1.mandatoryRequirementFailed },
    { name: 'Meera Iyer', score: res3.overallScore, tier: res3.matchLevel, passedMandatory: !res3.mandatoryRequirementFailed },
    { name: 'Aditya Singh', score: res5.overallScore, tier: res5.matchLevel, passedMandatory: !res5.mandatoryRequirementFailed },
    { name: 'Ritesh Verma', score: res4.overallScore, tier: res4.matchLevel, passedMandatory: !res4.mandatoryRequirementFailed },
    { name: 'Sneha Joshi', score: res2.overallScore, tier: res2.matchLevel, passedMandatory: !res2.mandatoryRequirementFailed },
  ].sort((a, b) => b.score - a.score);

  ranked.forEach((c, idx) => {
    console.log(`${idx + 1}. ${c.name.padEnd(16)} → ${c.score}% [${c.tier}] (Mandatory Passed: ${c.passedMandatory})`);
  });

  console.log(`\nResults: ${passedTests} / ${totalTests} Tests Passed.`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
  }
}

runTests();
