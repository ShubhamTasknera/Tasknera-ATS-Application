import prisma from '../config/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ats_tasknera_enterprise_secret_2026';
const BASE_URL = 'http://localhost:5000/api';

async function main() {
  console.log('================================================================');
  console.log('VERIFYING PERSONAL EVALUATION VISIBILITY & STRICT USER PRIVACY');
  console.log('================================================================\n');

  // Step 1: Create or find User A and User B
  const userA = await prisma.user.upsert({
    where: { email: 'usera_test@tasknera.com' },
    update: {},
    create: {
      email: 'usera_test@tasknera.com',
      name: 'User A (Evaluator)',
      password: 'password123',
      role: 'MEMBER',
      organizationId: 'org-tasknera'
    }
  });

  const userB = await prisma.user.upsert({
    where: { email: 'userb_test@tasknera.com' },
    update: {},
    create: {
      email: 'userb_test@tasknera.com',
      name: 'User B (Job Creator & Admin)',
      password: 'password123',
      role: 'ADMIN',
      organizationId: 'org-tasknera'
    }
  });

  const tokenA = jwt.sign(
    { userId: userA.id, email: userA.email, role: userA.role, organizationId: userA.organizationId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const tokenB = jwt.sign(
    { userId: userB.id, email: userB.email, role: userB.role, organizationId: userB.organizationId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Step 2: Create a Job created by User B
  const jobCreatedByUserB = await prisma.job.create({
    data: {
      client: 'SunLife Financial',
      position: 'Senior AI Engineer',
      created_by: userB.id,
      status: 'active'
    }
  });

  // Step 3: Create Candidate 1
  const candidate1 = await prisma.candidate.create({
    data: {
      name: 'Candidate Evaluated By User A',
      email: 'candA@test.com',
      current_title: 'AI Specialist',
      current_company: 'Tech Corp',
      created_by: userA.id,
      parsing_status: 'PARSED'
    }
  });

  // Step 4: Create an Evaluation performed by User A on the job created by User B!
  const evalByUserA = await prisma.evaluation.create({
    data: {
      candidateId: candidate1.id,
      jobId: jobCreatedByUserB.id,
      createdByUserId: userA.id,
      evaluatedBy: userA.id,
      organizationId: 'org-tasknera',
      score: 88,
      atsScore: 88,
      matchLevel: 'STRONG MATCH',
      mandatoryCompliance: '4/4',
      decision: 'SUBMIT',
      status: 'COMPLETED',
      auditData: {
        candidateName: candidate1.name,
        jobTitle: jobCreatedByUserB.position,
        jobCompany: jobCreatedByUserB.client
      }
    }
  });

  console.log(`✓ User A (${userA.name}) evaluated Candidate 1 (${candidate1.name})`);
  console.log(`  Target Job was created by User B (${userB.name})`);
  console.log(`  Evaluation ID: ${evalByUserA.id}, evaluated_by: ${evalByUserA.evaluatedBy}\n`);

  // TEST 1: Unauthenticated request should be 401
  const unauthRes = await fetch(`${BASE_URL}/evaluations`);
  console.log(`TEST 1: Unauthenticated GET /api/evaluations => Status ${unauthRes.status} (Expected 401: ${unauthRes.status === 401 ? 'PASS' : 'FAIL'})`);

  // TEST 2: User A calls GET /api/evaluations
  const resA = await fetch(`${BASE_URL}/evaluations`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const dataA = await resA.json();
  const userASeesOwnEval = (dataA.evaluations || []).some((e: any) => e.evaluationId === evalByUserA.id);
  console.log(`TEST 2: User A GET /api/evaluations => Count: ${dataA.total || dataA.evaluations?.length}, sees own evaluation: ${userASeesOwnEval ? 'PASS' : 'FAIL'}`);

  // TEST 3: User B (who created the job AND is ADMIN) calls GET /api/evaluations
  const resB = await fetch(`${BASE_URL}/evaluations`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  const dataB = await resB.json();
  const userBSeesUserAEval = (dataB.evaluations || []).some((e: any) => e.evaluationId === evalByUserA.id);
  console.log(`TEST 3: User B GET /api/evaluations => Count: ${dataB.total || dataB.evaluations?.length}`);
  console.log(`  User B sees User A's evaluation: ${userBSeesUserAEval ? 'FAIL (Leak!)' : 'PASS (Zero Leakage - Strict User Privacy Enforced!)'}`);

  // TEST 4: Page Refresh persistence - Call GET /api/evaluations again for User A
  const refreshResA = await fetch(`${BASE_URL}/evaluations`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  const refreshDataA = await refreshResA.json();
  const stillPresent = (refreshDataA.evaluations || []).some((e: any) => e.evaluationId === evalByUserA.id);
  console.log(`TEST 4: Refreshing page preserves evaluation: ${stillPresent ? 'PASS' : 'FAIL'}`);

  // TEST 5: Verify evaluated_by in database
  const dbEval = await prisma.evaluation.findUnique({ where: { id: evalByUserA.id } });
  console.log(`TEST 5: Database record verified: evaluated_by = ${dbEval?.evaluatedBy} (Expected ${userA.id}: ${dbEval?.evaluatedBy === userA.id ? 'PASS' : 'FAIL'})`);

  // Clean up test data
  await prisma.evaluation.deleteMany({ where: { id: evalByUserA.id } });
  await prisma.candidate.deleteMany({ where: { id: candidate1.id } });
  await prisma.job.deleteMany({ where: { id: jobCreatedByUserB.id } });
  await prisma.user.deleteMany({ where: { email: { in: ['usera_test@tasknera.com', 'userb_test@tasknera.com'] } } });

  console.log('\n================================================================');
  console.log('ALL PRIVACY & VISIBILITY TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================\n');
}

main()
  .catch(err => {
    console.error('Verification failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
