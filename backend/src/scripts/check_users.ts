import prisma from '../config/prisma';

async function main() {
  const job = await prisma.job.findUnique({
    where: { id: '4cb34f70-bb54-4bee-a6ea-d256dbc1f850' },
    include: { requirements: true, candidates: true }
  });
  console.log('JOB:', job?.position, 'CLIENT:', job?.client, 'CREATED BY:', job?.created_by);
  console.log('REQ COUNT:', job?.requirements.length);
  if (job?.requirements) {
    for (const r of job.requirements) {
      console.log(' - Req:', r.requirement, '| Mandatory:', r.is_mandatory, '| Weight:', r.weight);
    }
  }
  console.log('CANDIDATES IN JOB:', job?.candidates.map(c => ({ id: c.id, name: c.name, file_name: c.file_name, created_by: c.created_by })));

  const evals = await prisma.candidateEvaluation.findMany({
    where: { job_id: '4cb34f70-bb54-4bee-a6ea-d256dbc1f850' },
    include: { candidate: true }
  });
  console.log('EXISTING EVALUATIONS IN DB:', evals.map(e => ({ id: e.id, cand: e.candidate.name, score: e.overall_score, tier: e.match_level, user: e.candidate.created_by })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
