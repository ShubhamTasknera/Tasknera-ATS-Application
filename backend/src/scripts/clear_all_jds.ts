import prisma from '../config/prisma';

async function main() {
  console.log('Connecting to database...');
  
  const jobsCountBefore = await prisma.job.count();
  const reqsCountBefore = await prisma.requirement.count();
  const appsCountBefore = await prisma.candidateApplication.count();

  console.log(`Current Database State:`);
  console.log(`- Total Jobs (JDs): ${jobsCountBefore}`);
  console.log(`- Total Requirements: ${reqsCountBefore}`);
  console.log(`- Total Candidate Applications: ${appsCountBefore}`);

  if (jobsCountBefore === 0) {
    console.log('No Jobs found in database. Database already clean.');
    return;
  }

  console.log('\nDeleting all Requirements...');
  const deletedReqs = await prisma.requirement.deleteMany({});
  console.log(`✓ Deleted ${deletedReqs.count} requirements.`);

  console.log('\nDeleting all Candidate Applications...');
  const deletedApps = await prisma.candidateApplication.deleteMany({});
  console.log(`✓ Deleted ${deletedApps.count} candidate applications.`);

  console.log('\nDeleting all Jobs (JDs)...');
  const deletedJobs = await prisma.job.deleteMany({});
  console.log(`✓ Deleted ${deletedJobs.count} jobs successfully.`);

  const jobsCountAfter = await prisma.job.count();
  console.log(`\nVerification: Remaining Jobs in DB = ${jobsCountAfter}`);
}

main()
  .catch((e) => {
    console.error('Error clearing jobs:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
