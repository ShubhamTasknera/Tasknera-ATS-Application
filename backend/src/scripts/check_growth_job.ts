import { CANDIDATE_STORE } from '../controllers/candidateController';
import { GLOBAL_JOB_STORE } from '../controllers/jobController';
import { evaluateCandidateAgainstRequirements } from '../services/evaluationService';

async function testGrowthMarketingJob() {
  console.log("Checking all jobs in store...");
  let growthJobId = null;
  for (const [id, job] of GLOBAL_JOB_STORE.entries()) {
    console.log(`Job in store: ${id} - ${job.position} (${(job.requirements || []).length} reqs)`);
    if (job.position?.toLowerCase().includes('growth') || job.position?.toLowerCase().includes('marketing')) {
      growthJobId = id;
    }
  }

  for (const [jobId, list] of CANDIDATE_STORE.entries()) {
    console.log(`Job ${jobId} has ${list.length} candidates in CANDIDATE_STORE:`);
    for (const c of list) {
      console.log(`  - ${c.name} | ${c.currentTitle} | ${c.fileName}`);
    }
  }
}

testGrowthMarketingJob().catch(console.error);
