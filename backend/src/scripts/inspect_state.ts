import prisma from '../config/prisma';
import { CANDIDATE_STORE } from '../controllers/candidateController';
import { GLOBAL_JOB_STORE } from '../controllers/jobController';

async function inspect() {
  console.log("=== IN-MEMORY JOBS ===");
  for (const [id, job] of GLOBAL_JOB_STORE.entries()) {
    console.log(`Job: ${id} - ${job.position} | Reqs: ${(job.requirements || []).length}`);
  }

  console.log("\n=== IN-MEMORY CANDIDATES ===");
  for (const [jobId, list] of CANDIDATE_STORE.entries()) {
    console.log(`Job ID: ${jobId} -> ${list.length} candidates`);
    for (const c of list) {
      console.log(`  - ${c.name} | Role: ${c.currentTitle} | Score: ${(c as any).matchScore} | atsScore: ${(c as any).atsScore}`);
    }
  }

  console.log("\n=== DB JOBS & EVALUATIONS ===");
  try {
    const dbJobs = await prisma.job.findMany({ include: { requirements: true } });
    console.log(`DB Jobs count: ${dbJobs.length}`);
    for (const j of dbJobs) {
      console.log(`  DB Job ${j.id}: ${j.position} (${j.requirements.length} reqs)`);
    }
    const dbEvals = await prisma.evaluation.findMany();
    console.log(`DB Evaluations count: ${dbEvals.length}`);
    for (const e of dbEvals) {
      console.log(`  Eval for cand ${e.candidateId} on job ${e.jobId}: Score=${e.score}, AtsScore=${e.atsScore}`);
    }
  } catch (err: any) {
    console.log("DB query note:", err.message);
  }
}

inspect().catch(console.error);
