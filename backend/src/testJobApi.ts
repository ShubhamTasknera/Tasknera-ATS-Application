import http from 'http';
import { AddressInfo } from 'net';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';

dotenv.config();

// Create isolated Express test app instance
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

let server: http.Server;
let baseUrl: string;

const request = async (path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) => {
  const url = `${baseUrl}${path}`;
  const method = options.method || 'GET';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const fetchOptions: any = { method, headers };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
};

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND JOB CREATION API TESTS');
  console.log('====================================================\n');

  try {
    // 1. Setup Test Recruiter Account
    const testEmail = `recruiter_${Date.now()}@tasknera.com`;
    const testPassword = 'Password123!';

    console.log('1️⃣ Registering test recruiter account...');
    const signupRes = await request('/api/auth/signup', {
      method: 'POST',
      body: { name: 'Recruiter User', email: testEmail, password: testPassword }
    });

    if (signupRes.status !== 201 || !signupRes.data.token) {
      throw new Error(`Signup failed: ${JSON.stringify(signupRes.data)}`);
    }

    const token = signupRes.data.token;
    const authHeaders = { Authorization: `Bearer ${token}` };
    console.log('   ✅ Test recruiter registered successfully. JWT Token acquired.\n');

    // 2. Test 401 Unauthorized Access
    console.log('2️⃣ Testing 401 Unauthorized access (no Bearer token)...');
    const unauthRes = await request('/api/jobs', { method: 'GET' });
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${unauthRes.status}`);
    }
    console.log('   ✅ 401 Unauthorized correctly enforced.\n');

    // 3. Test 400 Validation Error (missing client/position)
    console.log('3️⃣ Testing 400 Bad Request validation (missing required fields)...');
    const badJobRes = await request('/api/jobs', {
      method: 'POST',
      headers: authHeaders,
      body: { position: 'Senior Engineer' } // Missing 'client'
    });
    if (badJobRes.status !== 400) {
      throw new Error(`Expected 400 Bad Request, got ${badJobRes.status}`);
    }
    console.log(`   ✅ 400 Bad Request correctly returned: "${badJobRes.data.error}"\n`);

    // 4. Test 1: Create Job (POST /api/jobs)
    console.log('4️⃣ Testing 1/5: Create Job (POST /api/jobs)...');
    const newJobPayload = {
      client: 'Acme Corp',
      position: 'Senior Backend Engineer (TypeScript)',
      location: 'San Francisco, CA / Remote',
      work_mode: 'Hybrid',
      salary: '$140,000 - $170,000',
      jd_text: 'We are seeking an experienced Backend Engineer skilled in Node.js, Express, TypeScript, and PostgreSQL...',
      jd_file_url: 'https://storage.tasknera.com/jds/acme_backend_eng.pdf',
      status: 'draft'
    };

    const createRes = await request('/api/jobs', {
      method: 'POST',
      headers: authHeaders,
      body: newJobPayload
    });

    if (createRes.status !== 201 || !createRes.data.job || !createRes.data.job.id) {
      throw new Error(`Create job failed: ${JSON.stringify(createRes.data)}`);
    }

    const createdJob = createRes.data.job;
    console.log(`   ✅ Job created successfully in PostgreSQL! Job ID: ${createdJob.id}`);
    console.log(`      Client: ${createdJob.client} | Position: ${createdJob.position} | Status: ${createdJob.status}\n`);

    // 5. Test 2: Retrieve Job by ID (GET /api/jobs/:id)
    console.log('5️⃣ Testing 2/5: Retrieve Job by ID (GET /api/jobs/:id)...');
    const getByIdRes = await request(`/api/jobs/${createdJob.id}`, {
      method: 'GET',
      headers: authHeaders
    });

    if (getByIdRes.status !== 200 || !getByIdRes.data.job) {
      throw new Error(`Get job by ID failed: ${JSON.stringify(getByIdRes.data)}`);
    }

    const retrievedJob = getByIdRes.data.job;
    if (retrievedJob.client !== newJobPayload.client || retrievedJob.position !== newJobPayload.position) {
      throw new Error('Retrieved job fields do not match created job');
    }
    console.log('   ✅ Job retrieved successfully by ID with complete database fields.\n');

    // 6. Test 3: Update Job (PUT /api/jobs/:id)
    console.log('6️⃣ Testing 3/5: Update Job (PUT /api/jobs/:id)...');
    const updatePayload = {
      position: 'Lead Backend Architect (TypeScript & Rust)',
      salary: '$160,000 - $190,000',
      status: 'published'
    };

    const updateRes = await request(`/api/jobs/${createdJob.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: updatePayload
    });

    if (updateRes.status !== 200 || !updateRes.data.job) {
      throw new Error(`Update job failed: ${JSON.stringify(updateRes.data)}`);
    }

    const updatedJob = updateRes.data.job;
    if (updatedJob.position !== updatePayload.position || updatedJob.status !== 'published') {
      throw new Error('Updated fields mismatch');
    }
    console.log(`   ✅ Job updated successfully!`);
    console.log(`      New Position: ${updatedJob.position} | New Status: ${updatedJob.status} | Salary: ${updatedJob.salary}\n`);

    // 7. Test 4: Get All Jobs (GET /api/jobs)
    console.log('7️⃣ Testing 4/5: Retrieve Complete Job List (GET /api/jobs)...');
    const getAllRes = await request('/api/jobs', {
      method: 'GET',
      headers: authHeaders
    });

    if (getAllRes.status !== 200 || !Array.isArray(getAllRes.data.jobs)) {
      throw new Error(`Get all jobs failed: ${JSON.stringify(getAllRes.data)}`);
    }

    console.log(`   ✅ Complete job list retrieved successfully! Total jobs found: ${getAllRes.data.count}`);
    const foundTarget = getAllRes.data.jobs.find((j: any) => j.id === createdJob.id);
    if (!foundTarget) {
      throw new Error('Created job not present in job list output');
    }
    console.log('   ✅ Created job exists in the returned list array.\n');

    // 8. Test 404 Not Found & Invalid UUID Validation
    console.log('8️⃣ Testing 404 Not Found & UUID Validation error handling...');
    const invalidUuidRes = await request('/api/jobs/invalid-uuid-123', {
      method: 'GET',
      headers: authHeaders
    });
    if (invalidUuidRes.status !== 400) {
      throw new Error(`Expected 400 for invalid UUID, got ${invalidUuidRes.status}`);
    }

    const nonExistentUuidRes = await request('/api/jobs/00000000-0000-0000-0000-000000000000', {
      method: 'GET',
      headers: authHeaders
    });
    if (nonExistentUuidRes.status !== 404) {
      throw new Error(`Expected 404 for non-existent UUID, got ${nonExistentUuidRes.status}`);
    }
    console.log('   ✅ 400 (Invalid UUID) and 404 (Not Found) correctly verified.\n');

    console.log('====================================================');
    console.log('🎉 ALL BACKEND JOB API TESTS PASSED SUCCESSFULLY! (100%)');
    console.log('====================================================');
  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message || err);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
};

server = app.listen(0, () => {
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
  runTests();
});
