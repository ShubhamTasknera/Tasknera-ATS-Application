import prisma from '../config/prisma';
import { evaluateCandidateAgainstRequirements } from '../services/evaluationService';
import { mapDbCandidateToRecord } from '../controllers/candidateController';
import { getStandardRequirementsForPosition } from '../controllers/evaluationController';

async function migrateExistingEvaluations() {
  console.log('[Migration] Starting evaluation data migration...');

  // 1. Ensure existing users have organizationId set
  const updatedUsers = await prisma.user.updateMany({
    where: {
      organizationId: null
    },
    data: {
      organizationId: 'org-tasknera'
    }
  });
  console.log(`[Migration] Updated ${updatedUsers.count} users with default organizationId 'org-tasknera'.`);

  // 2. Fetch all existing CandidateApplications
  const applications = await prisma.candidateApplication.findMany({
    include: {
      candidate: {
        include: {
          experiences: true,
          education: true,
          skills: true,
          certifications: true,
          languages: true,
          projects: true
        }
      },
      job: {
        include: {
          requirements: true
        }
      }
    }
  });

  console.log(`[Migration] Found ${applications.length} candidate applications in database.`);

  let migratedCount = 0;

  for (const app of applications) {
    if (!app.candidate || !app.job) continue;

    const candidateRecord = mapDbCandidateToRecord(app.candidate, app.job_id);

    const requirements = (app.job.requirements && app.job.requirements.length > 0)
      ? app.job.requirements
      : getStandardRequirementsForPosition(app.job.position, app.job.client);

    const jobData = {
      id: app.job.id,
      position: app.job.position,
      title: app.job.position,
      client: app.job.client,
      company: app.job.client,
      jd_text: app.job.jd_text || undefined,
      created_by: app.job.created_by
    };

    const evalPayload = evaluateCandidateAgainstRequirements(candidateRecord, jobData, requirements);

    const finalScore = evalPayload.overallScore ?? evalPayload.overallMatch ?? (app.match_score || 75);
    const complianceStr = evalPayload.mandatoryCompliance
      ? `${evalPayload.mandatoryCompliance.met}/${evalPayload.mandatoryCompliance.total}`
      : 'N/A';
    const decision = evalPayload.recommendation || (finalScore >= 80 ? 'SUBMIT' : (finalScore >= 60 ? 'REVIEW' : 'DO NOT SUBMIT'));

    // Legitimate owner is the creator of the requisition
    const ownerUserId = app.job.created_by;

    // Check if evaluation already exists
    const existing = await prisma.evaluation.findFirst({
      where: {
        candidateId: app.candidate_id,
        jobId: app.job_id,
        createdByUserId: ownerUserId
      }
    });

    if (!existing) {
      await prisma.evaluation.create({
        data: {
          organizationId: 'org-tasknera',
          candidateId: app.candidate_id,
          jobId: app.job_id,
          candidateJobId: app.id,
          createdByUserId: ownerUserId,
          score: finalScore,
          atsScore: evalPayload.atsScore ?? finalScore,
          matchLevel: evalPayload.matchLevel || (finalScore >= 80 ? 'STRONG MATCH' : 'GOOD MATCH'),
          mandatoryCompliance: complianceStr,
          mandatoryFailed: Boolean(evalPayload.mandatoryRequirementFailed),
          decision: decision,
          status: 'COMPLETED',
          auditData: evalPayload as any,
          createdAt: app.created_at,
          updatedAt: app.updated_at
        }
      });
      migratedCount++;
    }
  }

  console.log(`[Migration] Successfully created ${migratedCount} new Evaluation records in database.`);

  const summary = await prisma.evaluation.groupBy({
    by: ['createdByUserId'],
    _count: { id: true }
  });
  console.log('[Migration] Evaluation breakdown by user:', JSON.stringify(summary, null, 2));
}

migrateExistingEvaluations()
  .catch(err => {
    console.error('[Migration Error]:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
