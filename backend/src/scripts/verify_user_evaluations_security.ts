import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'ats_tasknera_super_secret_jwt_key_2026';
const BASE_URL = 'http://127.0.0.1:5000/api';

function makeToken(userId: string, email: string, role: string, organizationId: string): string {
  return jwt.sign({ userId, email, role, organizationId }, SECRET, { expiresIn: '1h' });
}

async function runSecurityVerification() {
  console.log('===============================================================');
  console.log('STARTING ATS USER-SPECIFIC EVALUATIONS SECURITY VERIFICATION');
  console.log('===============================================================\n');

  // 1. Ensure test users exist
  const ram = await prisma.user.findUnique({ where: { email: 'ram@tasknera.com' } });
  const dev = await prisma.user.findUnique({ where: { email: 'dev@tasknera.com' } });

  if (!ram || !dev) {
    throw new Error('Required base users ram@tasknera.com and dev@tasknera.com not found!');
  }

  // Ensure Admin user
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN', organizationId: 'org-tasknera' } });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin@12345', salt);
    admin = await prisma.user.upsert({
      where: { email: 'admin@tasknera.com' },
      update: { role: 'ADMIN', organizationId: 'org-tasknera' },
      create: {
        email: 'admin@tasknera.com',
        name: 'System Admin',
        password: hash,
        role: 'ADMIN',
        organizationId: 'org-tasknera'
      }
    });
  }

  // Ensure Cross-Org user
  let crossUser = await prisma.user.findUnique({ where: { email: 'competitor@othercorp.com' } });
  if (!crossUser) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Other@12345', salt);
    crossUser = await prisma.user.create({
      data: {
        email: 'competitor@othercorp.com',
        name: 'Competitor User',
        password: hash,
        role: 'MEMBER',
        organizationId: 'org-competitor'
      }
    });
  }

  const ramToken = makeToken(ram.id, ram.email, ram.role, ram.organizationId || 'org-tasknera');
  const devToken = makeToken(dev.id, dev.email, dev.role, dev.organizationId || 'org-tasknera');
  const adminToken = makeToken(admin.id, admin.email, 'ADMIN', 'org-tasknera');
  const crossToken = makeToken(crossUser.id, crossUser.email, 'MEMBER', 'org-competitor');

  console.log(`[Users Initialized]`);
  console.log(`- Ram Charan: ID=${ram.id} (org=${ram.organizationId})`);
  console.log(`- Ajay Devghan: ID=${dev.id} (org=${dev.organizationId})`);
  console.log(`- Admin: ID=${admin.id} (org=${admin.organizationId})`);
  console.log(`- Competitor: ID=${crossUser.id} (org=${crossUser.organizationId})\n`);

  let allPassed = true;

  const assert = (condition: boolean, desc: string) => {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
    } else {
      console.error(`  [FAIL] ${desc}`);
      allPassed = false;
    }
  };

  // -------------------------------------------------------------
  // TEST 1: Unauthenticated GET /api/evaluations returns 401
  // -------------------------------------------------------------
  console.log('TEST 1: Unauthenticated Request Protection');
  const unauthRes = await fetch(`${BASE_URL}/evaluations`);
  assert(unauthRes.status === 401, `Unauthenticated request returned HTTP ${unauthRes.status} (expected 401)`);

  // -------------------------------------------------------------
  // TEST 2: User Switch Test - Ram Charan sees ONLY his evaluations
  // -------------------------------------------------------------
  console.log('\nTEST 2: Ram Charan GET /api/evaluations (Requisition Owner Isolation)');
  const ramRes = await fetch(`${BASE_URL}/evaluations`, {
    headers: { Authorization: `Bearer ${ramToken}` }
  });
  const ramData = await ramRes.json();
  assert(ramRes.status === 200, `Ram fetch returned HTTP ${ramRes.status}`);
  assert(Array.isArray(ramData.evaluations), 'Evaluations array returned');
  console.log(`  Ram Charan evaluations count: ${ramData.evaluations.length}`);
  const ramCandidates = ramData.evaluations.map((e: any) => e.candidate);
  console.log(`  Candidates seen by Ram: ${ramCandidates.join(', ')}`);
  assert(ramData.evaluations.length === 5, `Ram Charan sees exactly 5 evaluations (got ${ramData.evaluations.length})`);
  assert(!ramCandidates.includes('Karan Malhotra'), 'Ram CANNOT see Ajay\'s candidate Karan Malhotra');
  assert(!ramCandidates.includes('Ananya Rao'), 'Ram CANNOT see Ajay\'s candidate Ananya Rao');
  assert(ramCandidates.includes('Aarav Mehta'), 'Ram sees his Tata Capital candidate Aarav Mehta');
  assert(ramCandidates.includes('Karan Patel'), 'Ram sees his IBM candidate Karan Patel');

  // -------------------------------------------------------------
  // TEST 3: User Switch Test - Ajay Devghan sees ONLY his evaluations
  // -------------------------------------------------------------
  console.log('\nTEST 3: Ajay Devghan GET /api/evaluations (Requisition Owner Isolation)');
  const devRes = await fetch(`${BASE_URL}/evaluations`, {
    headers: { Authorization: `Bearer ${devToken}` }
  });
  const devData = await devRes.json();
  assert(devRes.status === 200, `Ajay fetch returned HTTP ${devRes.status}`);
  console.log(`  Ajay Devghan evaluations count: ${devData.evaluations.length}`);
  const devCandidates = devData.evaluations.map((e: any) => e.candidate);
  console.log(`  Candidates seen by Ajay: ${devCandidates.join(', ')}`);
  assert(devData.evaluations.length === 4, `Ajay sees exactly 4 evaluations (got ${devData.evaluations.length})`);
  assert(devCandidates.includes('Karan Malhotra'), 'Ajay sees his SunLife candidate Karan Malhotra');
  assert(devCandidates.includes('Ananya Rao'), 'Ajay sees his SunLife candidate Ananya Rao');
  assert(!devCandidates.includes('Aarav Mehta'), 'Ajay CANNOT see Ram\'s candidate Aarav Mehta');
  assert(!devCandidates.includes('Karan Patel'), 'Ajay CANNOT see Ram\'s candidate Karan Patel');

  // -------------------------------------------------------------
  // TEST 4: Direct URL / Inspect Audit Unauthorized Access Protection
  // -------------------------------------------------------------
  console.log('\nTEST 4: Direct URL / Inspect Audit Cross-User Access Protection');
  const ajayEvalId = devData.evaluations[0]?.evaluationId;
  const ramEvalId = ramData.evaluations[0]?.evaluationId;

  // Ram tries to inspect Ajay's evaluation by evaluationId
  const ramAccessAjayRes = await fetch(`${BASE_URL}/evaluations/${ajayEvalId}`, {
    headers: { Authorization: `Bearer ${ramToken}` }
  });
  assert(ramAccessAjayRes.status === 403, `Ram accessing Ajay's evaluation returned HTTP ${ramAccessAjayRes.status} (expected 403 Forbidden)`);

  // Ajay tries to inspect Ram's evaluation by evaluationId
  const ajayAccessRamRes = await fetch(`${BASE_URL}/evaluations/${ramEvalId}`, {
    headers: { Authorization: `Bearer ${devToken}` }
  });
  assert(ajayAccessRamRes.status === 403, `Ajay accessing Ram's evaluation returned HTTP ${ajayAccessRamRes.status} (expected 403 Forbidden)`);

  // Owner inspection succeeds
  const ramOwnEvalRes = await fetch(`${BASE_URL}/evaluations/${ramEvalId}`, {
    headers: { Authorization: `Bearer ${ramToken}` }
  });
  assert(ramOwnEvalRes.status === 200, `Ram accessing his own evaluation returned HTTP 200 OK`);

  // -------------------------------------------------------------
  // TEST 5: Cross-Organization Security Protection
  // -------------------------------------------------------------
  console.log('\nTEST 5: Cross-Organization Isolation');
  const crossEvalRes = await fetch(`${BASE_URL}/evaluations`, {
    headers: { Authorization: `Bearer ${crossToken}` }
  });
  const crossData = await crossEvalRes.json();
  assert(crossData.evaluations.length === 0, `External org user sees 0 evaluations from org-tasknera (got ${crossData.evaluations.length})`);

  const crossDirectRes = await fetch(`${BASE_URL}/evaluations/${ramEvalId}`, {
    headers: { Authorization: `Bearer ${crossToken}` }
  });
  assert(crossDirectRes.status === 403, `External org user direct access to Ram's evaluation returned HTTP ${crossDirectRes.status} (expected 403 Forbidden)`);

  // -------------------------------------------------------------
  // TEST 6: Candidate Pool is Common to Everyone
  // -------------------------------------------------------------
  console.log('\nTEST 6: Candidate Pool is Common to All Team Members');
  const ramPoolRes = await fetch(`${BASE_URL}/candidates`, {
    headers: { Authorization: `Bearer ${ramToken}` }
  });
  const devPoolRes = await fetch(`${BASE_URL}/candidates`, {
    headers: { Authorization: `Bearer ${devToken}` }
  });
  const ramPoolData = await ramPoolRes.json();
  const devPoolData = await devPoolRes.json();

  const ramPoolIds = new Set(ramPoolData.candidates?.map((c: any) => c.id) || []);
  const devPoolIds = new Set(devPoolData.candidates?.map((c: any) => c.id) || []);

  assert(ramPoolIds.size > 0 && devPoolIds.size > 0, `Both users see candidates in talent pool (Ram sees ${ramPoolIds.size}, Dev sees ${devPoolIds.size})`);
  assert(ramPoolIds.size === devPoolIds.size, `Candidate pool count is equal for both team members (${ramPoolIds.size} total candidates)`);

  // -------------------------------------------------------------
  // TEST 7: Evaluation Decision Updates
  // -------------------------------------------------------------
  console.log('\nTEST 7: Evaluation Decision Action Permissions');
  // Ram updates his evaluation decision to 'SUBMIT'
  const updateDecisionRes = await fetch(`${BASE_URL}/evaluations/${ramEvalId}/decision`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${ramToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ decision: 'SUBMIT' })
  });
  assert(updateDecisionRes.status === 200, `Ram updating his evaluation decision returned HTTP 200`);

  // Ajay attempts to update Ram's evaluation decision
  const ajayTamperRes = await fetch(`${BASE_URL}/evaluations/${ramEvalId}/decision`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${devToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ decision: 'DO NOT SUBMIT' })
  });
  assert(ajayTamperRes.status === 403, `Ajay tampering with Ram's decision returned HTTP ${ajayTamperRes.status} (expected 403 Forbidden)`);

  // -------------------------------------------------------------
  // TEST 8: Admin Visibility
  // -------------------------------------------------------------
  console.log('\nTEST 8: Admin Organization Visibility');
  const adminRes = await fetch(`${BASE_URL}/evaluations`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminData = await adminRes.json();
  assert(adminRes.status === 200, `Admin fetch returned HTTP ${adminRes.status}`);
  assert(adminData.evaluations.length >= 9, `Admin sees all evaluations in organization (${adminData.evaluations.length} total)`);

  console.log('\n===============================================================');
  if (allPassed) {
    console.log('ALL 8 SECURITY & ISOLATION TEST SUITES PASSED PERFECTLY!');
  } else {
    console.error('SOME TESTS FAILED! CHECK OUTPUT ABOVE.');
  }
  console.log('===============================================================');
}

runSecurityVerification()
  .catch(err => {
    console.error('Fatal Verification Error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
