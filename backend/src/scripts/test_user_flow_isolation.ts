import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'ats_tasknera_super_secret_jwt_key_2026';
const BASE_URL = 'http://127.0.0.1:5000/api';

function makeToken(userId: string, email: string, role: string, organizationId: string): string {
  return jwt.sign({ userId, email, role, organizationId }, SECRET, { expiresIn: '2h' });
}

async function main() {
  console.log('================================================================');
  console.log('TESTING USER 1 & USER 2 COMPLETE WORK ISOLATION & EVALUATION FLOW');
  console.log('================================================================\n');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('TestPassword123!', salt);

  // Setup User 1 (MEMBER)
  const user1 = await prisma.user.upsert({
    where: { email: 'user1_test@tasknera.com' },
    update: { role: 'MEMBER', organizationId: 'org-tasknera' },
    create: {
      email: 'user1_test@tasknera.com',
      name: 'User One',
      password: hash,
      role: 'MEMBER',
      organizationId: 'org-tasknera'
    }
  });

  // Setup User 2 (MEMBER)
  const user2 = await prisma.user.upsert({
    where: { email: 'user2_test@tasknera.com' },
    update: { role: 'MEMBER', organizationId: 'org-tasknera' },
    create: {
      email: 'user2_test@tasknera.com',
      name: 'User Two',
      password: hash,
      role: 'MEMBER',
      organizationId: 'org-tasknera'
    }
  });

  const token1 = makeToken(user1.id, user1.email, 'MEMBER', 'org-tasknera');
  const token2 = makeToken(user2.id, user2.email, 'MEMBER', 'org-tasknera');

  console.log(`✓ User 1 initialized: ${user1.email} (ID: ${user1.id})`);
  console.log(`✓ User 2 initialized: ${user2.email} (ID: ${user2.id})\n`);

  // Step 1: User 1 creates a JD (simulating http://localhost:4028/jobs/create)
  console.log('--- Step 1: User 1 creates a JD ---');
  const createJob1Res = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`
    },
    body: JSON.stringify({
      client: 'Acme Corporation',
      position: 'Senior React Engineer',
      location: 'Bangalore / Remote',
      work_mode: 'Remote',
      salary: '25-35 LPA',
      status: 'active',
      requirements: [
        { requirement: '5+ years experience in React and TypeScript', category: 'Technical Skill', is_mandatory: true, weight: 2.0 },
        { requirement: 'Hands-on experience with Next.js and Tailwind CSS', category: 'Technical Skill', is_mandatory: true, weight: 1.5 },
        { requirement: 'RESTful API integration & state management', category: 'Technical Skill', is_mandatory: false, weight: 1.0 }
      ]
    })
  });
  const job1Data = await createJob1Res.json();
  const job1Id = job1Data.job?.id;
  console.log(`✓ User 1 created Job ID: ${job1Id} (${job1Data.job?.position})`);

  // Step 2: User 1 uploads a CV for that job
  console.log('\n--- Step 2: User 1 uploads CV for Job 1 ---');
  const cv1Content = `
Arjun Verma
arjun.verma@example.com | +91 9123456780 | Bangalore, India
Senior Frontend Developer at Infosys
5 years of extensive experience building scalable applications using React, Next.js, TypeScript, and Tailwind CSS.
Experience:
Senior Frontend Developer - Infosys (2021 - Present)
Built modern React and Next.js applications with Tailwind CSS and Redux.
Frontend Engineer - Wipro (2019 - 2021)
Developed responsive UI components using React and JavaScript.
Education:
B.Tech in Computer Science, 2019
Skills: React, TypeScript, Next.js, Tailwind CSS, JavaScript, Redux, HTML, CSS
`;
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const formData1 = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="jobId"\r\n\r\n${job1Id}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="Arjun_Verma_Resume.txt"\r\nContent-Type: text/plain\r\n\r\n${cv1Content}\r\n`),
    Buffer.from(`--${boundary}--\r\n`)
  ]);

  const upload1Res = await fetch(`${BASE_URL}/jobs/${job1Id}/candidates/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    },
    body: formData1
  });
  const upload1Data = await upload1Res.json();
  console.log(`✓ User 1 uploaded CV response status: ${upload1Res.status}`);
  const cand1 = upload1Data.candidates?.[0] || upload1Data.candidate;
  console.log(`✓ Parsed Candidate 1: ${cand1?.name} | Title: ${cand1?.currentTitle} | Status: ${cand1?.parsingStatus}`);

  // Step 3: User 1 fetches evaluations
  console.log('\n--- Step 3: User 1 views Evaluation Page ---');
  const eval1Res = await fetch(`${BASE_URL}/evaluations?scope=mine`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  const eval1Data = await eval1Res.json();
  console.log(`✓ User 1 evaluations count: ${eval1Data.evaluations?.length}`);
  const user1CandidateNames = eval1Data.evaluations?.map((e: any) => e.candidate) || [];
  console.log(`✓ Candidates shown to User 1: ${user1CandidateNames.join(', ')}`);

  if (!user1CandidateNames.includes('Arjun Verma')) {
    throw new Error('FAILED: User 1 cannot see their uploaded candidate "Arjun Verma" on evaluation page!');
  }
  const user1Eval = eval1Data.evaluations.find((e: any) => e.candidate === 'Arjun Verma');
  console.log(`✓ Evaluation Score: ${user1Eval?.score}% | Decision: ${user1Eval?.decision} | Match: ${user1Eval?.matchLevel}`);

  // Step 4: User 1 inspects audit details
  console.log('\n--- Step 4: User 1 inspects Audit Details ---');
  const inspectRes = await fetch(`${BASE_URL}/evaluations/${user1Eval.evaluationId || user1Eval.id}?jobId=${job1Id}`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  const inspectData = await inspectRes.json();
  console.log(`✓ Inspect Audit HTTP status: ${inspectRes.status}`);
  console.log(`✓ Evaluation details:`, {
    candidateName: inspectData.evaluation?.candidateName,
    candidateRole: inspectData.evaluation?.candidateRole,
    candidateCompany: inspectData.evaluation?.candidateCompany,
    candidateEmail: inspectData.evaluation?.candidateEmail,
    candidatePhone: inspectData.evaluation?.candidatePhone,
    overallScore: inspectData.evaluation?.overallScore,
    requirementsCount: inspectData.evaluation?.requirements?.length
  });

  if (!inspectData.evaluation?.candidateName || inspectData.evaluation?.candidateName === 'Candidate') {
    throw new Error('FAILED: Candidate name missing from evaluation details!');
  }

  // Step 5: User 2 creates a JD and uploads a candidate
  console.log('\n--- Step 5: User 2 creates another JD and uploads CV ---');
  const createJob2Res = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token2}`
    },
    body: JSON.stringify({
      client: 'Beta Financial Services',
      position: 'Python Backend Architect',
      location: 'Hyderabad',
      work_mode: 'Hybrid',
      salary: '30-40 LPA',
      status: 'active',
      requirements: [
        { requirement: '7+ years experience in Python and FastAPI microservices', category: 'Technical Skill', is_mandatory: true, weight: 2.0 },
        { requirement: 'PostgreSQL, Redis, and message queues', category: 'Technical Skill', is_mandatory: true, weight: 1.5 }
      ]
    })
  });
  const job2Data = await createJob2Res.json();
  const job2Id = job2Data.job?.id;
  console.log(`✓ User 2 created Job ID: ${job2Id} (${job2Data.job?.position})`);

  const cv2Content = `
Siddharth Sen
siddharth.sen@example.com | +91 9988776655 | Hyderabad, India
Lead Python Engineer at TCS
7 years building backend microservices with Python, FastAPI, and PostgreSQL.
Experience:
Lead Python Engineer - TCS (2020 - Present)
Backend Engineer - Cognizant (2017 - 2020)
Skills: Python, FastAPI, Django, PostgreSQL, Redis, Docker
`;
  const boundary2 = '----WebKitFormBoundaryUser2SecretBoundary';
  const formData2 = Buffer.concat([
    Buffer.from(`--${boundary2}\r\nContent-Disposition: form-data; name="jobId"\r\n\r\n${job2Id}\r\n`),
    Buffer.from(`--${boundary2}\r\nContent-Disposition: form-data; name="files"; filename="Siddharth_Sen_CV.txt"\r\nContent-Type: text/plain\r\n\r\n${cv2Content}\r\n`),
    Buffer.from(`--${boundary2}--\r\n`)
  ]);

  const upload2Res = await fetch(`${BASE_URL}/jobs/${job2Id}/candidates/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token2}`,
      'Content-Type': `multipart/form-data; boundary=${boundary2}`
    },
    body: formData2
  });
  console.log(`✓ User 2 uploaded CV response status: ${upload2Res.status}`);

  // Step 6: Verify User 1 DOES NOT see User 2's candidate
  console.log('\n--- Step 6: Verify Isolation on User 1 Evaluation Page ---');
  const user1RecheckRes = await fetch(`${BASE_URL}/evaluations?scope=mine`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  const user1RecheckData = await user1RecheckRes.json();
  const user1SeenNames = user1RecheckData.evaluations?.map((e: any) => e.candidate) || [];
  console.log(`✓ User 1 currently sees: ${user1SeenNames.join(', ')}`);

  if (user1SeenNames.includes('Siddharth Sen')) {
    throw new Error('FAILED: User 1 can see User 2\'s candidate Siddharth Sen! User isolation breached!');
  }
  console.log('✓ PASS: User 1 CANNOT see User 2\'s candidate Siddharth Sen.');

  // Step 7: Verify User 2 DOES NOT see User 1's candidate
  console.log('\n--- Step 7: Verify Isolation on User 2 Evaluation Page ---');
  const user2EvalRes = await fetch(`${BASE_URL}/evaluations?scope=mine`, {
    headers: { Authorization: `Bearer ${token2}` }
  });
  const user2EvalData = await user2EvalRes.json();
  const user2SeenNames = user2EvalData.evaluations?.map((e: any) => e.candidate) || [];
  console.log(`✓ User 2 currently sees: ${user2SeenNames.join(', ')}`);

  if (user2SeenNames.includes('Arjun Verma')) {
    throw new Error('FAILED: User 2 can see User 1\'s candidate Arjun Verma! User isolation breached!');
  }
  if (!user2SeenNames.includes('Siddharth Sen')) {
    throw new Error('FAILED: User 2 cannot see their own candidate Siddharth Sen!');
  }
  console.log('✓ PASS: User 2 CANNOT see User 1\'s candidate Arjun Verma.');
  console.log('✓ PASS: User 2 sees their own candidate Siddharth Sen.');

  // Step 8: Cross-User Direct Inspection Access Protection
  console.log('\n--- Step 8: Cross-User Direct Inspection Protection ---');
  const user2Eval = user2EvalData.evaluations.find((e: any) => e.candidate === 'Siddharth Sen');
  const crossAccessRes = await fetch(`${BASE_URL}/evaluations/${user2Eval.evaluationId || user2Eval.id}`, {
    headers: { Authorization: `Bearer ${token1}` }
  });
  console.log(`✓ User 1 accessing User 2 evaluation returns HTTP ${crossAccessRes.status}`);
  if (crossAccessRes.status !== 403) {
    throw new Error(`FAILED: Cross-user evaluation inspection returned ${crossAccessRes.status} (expected 403)`);
  }
  console.log('✓ PASS: Unauthorized cross-user evaluation inspection blocked with 403 Forbidden.');

  console.log('\n================================================================');
  console.log('SUCCESS! ALL USER-SPECIFIC EVALUATION & ISOLATION CHECKS PASSED!');
  console.log('================================================================');
}

main()
  .catch(err => {
    console.error('Fatal Test Error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

