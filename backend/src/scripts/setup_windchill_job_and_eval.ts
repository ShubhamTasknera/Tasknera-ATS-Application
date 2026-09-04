import prisma from '../config/prisma';
import { evaluateCandidateAgainstRequirements } from '../services/evaluationService';
import { mapDbCandidateToRecord } from '../controllers/candidateController';

async function setupWindchillJobAndEvaluateRiya() {
  console.log('=== SETTING UP WINDCHILL JOB & EVALUATION FOR RAM CHARAN ===\n');

  // 1. Get Ram Charan
  const ram = await prisma.user.findUnique({
    where: { email: 'ram@tasknera.com' }
  });

  if (!ram) {
    throw new Error('User ram@tasknera.com not found!');
  }

  console.log(`Found User: ${ram.name} (${ram.email}, ID: ${ram.id})`);

  // 2. Create or find Windchill Job for Ram
  let windchillJob = await prisma.job.findFirst({
    where: {
      position: { contains: 'Windchill', mode: 'insensitive' },
      created_by: ram.id
    },
    include: {
      requirements: true
    }
  });

  if (!windchillJob) {
    console.log('Creating Windchill Job Requisition for Ram Charan...');
    windchillJob = await prisma.job.create({
      data: {
        client: 'Windchill (Parametric Technology Corporation)',
        position: 'Sr. Windchill Developer',
        location: 'Pune',
        work_mode: 'Hybrid',
        salary: 'upto 23LPA',
        jd_text: 'PTC Windchill (Parametric Technology Corporation)\nPosition: Sr. Windchill Developer\nLocation: Pune (Hybrid)\nBudget: upto 23LPA\n\nMandatory Skills / Key Requirements:\n- 4 to 8 years experience in Windchill (or 13+ years overall)\n- Windchill customization (Form Processors, Action Models, Data Utilities, UI Components)\n- Core Java, J2EE, JSP, Servlets\n- Work Mode: Pune (Hybrid)\n\nPreferred Skills:\n- Windchill rehost / upgrades is preferred\n- Experience with Info*Engine, REST/SOAP Web Services, Windchill Business Workflows',
        status: 'active',
        created_by: ram.id,
        requirements: {
          create: [
            {
              requirement: 'Overall Experience: 12+ Years in IT / PLM',
              category: 'Experience',
              is_mandatory: true,
              weight: 2.0,
              recruiter_confirmed: true,
              evidence_required: true,
              source_evidence: 'Overall Experience: 13+ Years'
            },
            {
              requirement: 'Hands-on PTC Windchill Experience: 10+ Years',
              category: 'Experience',
              is_mandatory: true,
              weight: 2.0,
              recruiter_confirmed: true,
              evidence_required: true,
              source_evidence: 'Hands-on Windchill Experience: 10–15 Years'
            },
            {
              requirement: 'PTC Windchill Development & Core Customization (Form Processors, Action Models, Data Utilities, UI Components, WCA)',
              category: 'Technical Skill',
              is_mandatory: true,
              weight: 2.0,
              recruiter_confirmed: true,
              evidence_required: true,
              source_evidence: 'Windchill customization: Form Processors, Action Models, Data Utilities, UI Components'
            },
            {
              requirement: 'Core Java, J2EE, Servlets, JSP, XML, JSON',
              category: 'Technical Skill',
              is_mandatory: true,
              weight: 1.5,
              recruiter_confirmed: true,
              evidence_required: true,
              source_evidence: 'Core Java, J2EE, JSP, Servlets'
            },
            {
              requirement: 'Work Location: Pune (Hybrid availability)',
              category: 'General',
              is_mandatory: true,
              weight: 1.0,
              recruiter_confirmed: true,
              evidence_required: true,
              source_evidence: 'Location: Pune (Hybrid)'
            },
            {
              requirement: 'Windchill Rehost, Upgrades, Info*Engine, REST/SOAP Web Services & CAD/ERP Integrations',
              category: 'Technical Skill',
              is_mandatory: false,
              weight: 1.0,
              recruiter_confirmed: true,
              evidence_required: true,
              source_evidence: 'Windchill rehost / upgrades is preferred'
            }
          ]
        }
      },
      include: {
        requirements: true
      }
    });
    console.log(`✓ Created Windchill Job: ID=${windchillJob.id}`);
  } else {
    console.log(`✓ Existing Windchill Job found: ID=${windchillJob.id}`);
  }

  // 3. Find Riya Bhat candidate
  const riya = await prisma.candidate.findFirst({
    where: {
      name: { contains: 'Riya Bhat', mode: 'insensitive' }
    },
    include: {
      experiences: true,
      education: true,
      skills: true,
      certifications: true,
      languages: true,
      projects: true
    }
  });

  if (!riya) {
    throw new Error('Candidate Riya Bhat not found in database!');
  }

  console.log(`Found Candidate: ${riya.name} (ID: ${riya.id}, Current Title: ${riya.current_title})`);

  // 4. Update Riya's candidate record to be attributed to Ram and linked to this job
  await prisma.candidate.update({
    where: { id: riya.id },
    data: {
      created_by: ram.id,
      job_id: windchillJob.id
    }
  });

  // Link CandidateApplication
  const application = await prisma.candidateApplication.upsert({
    where: {
      job_id_candidate_id: {
        job_id: windchillJob.id,
        candidate_id: riya.id
      }
    },
    update: {
      stage: 'SHORTLISTED',
      status: 'active'
    },
    create: {
      job_id: windchillJob.id,
      candidate_id: riya.id,
      stage: 'SHORTLISTED',
      status: 'active'
    }
  });

  // 5. Evaluate Riya against Windchill Job requirements
  const candidateRecord = mapDbCandidateToRecord(riya, windchillJob.id);

  const jobData = {
    id: windchillJob.id,
    position: windchillJob.position,
    title: windchillJob.position,
    client: windchillJob.client,
    company: windchillJob.client,
    jd_text: windchillJob.jd_text || undefined,
    created_by: ram.id
  };

  const evaluationPayload = await evaluateCandidateAgainstRequirements(candidateRecord, jobData, windchillJob.requirements);

  const finalScore = Math.round(evaluationPayload.overallScore ?? evaluationPayload.overallMatch ?? 0);
  const complianceStr = `${evaluationPayload.mandatoryCompliance.met}/${evaluationPayload.mandatoryCompliance.total}`;
  const decision = evaluationPayload.recommendation || (finalScore >= 80 ? 'SUBMIT' : 'REVIEW');

  console.log('\n--- EVALUATION RESULT ---');
  console.log(`Overall Score: ${finalScore}%`);
  console.log(`ATS Score: ${evaluationPayload.atsScore}%`);
  console.log(`Match Level: ${evaluationPayload.matchLevel}`);
  console.log(`Mandatory Compliance: ${complianceStr} (Failed: ${evaluationPayload.mandatoryRequirementFailed})`);
  console.log(`Decision: ${decision}`);
  console.log(`Recommendation Reason: ${evaluationPayload.recommendationReason}`);

  // 6. Save in prisma.evaluation table
  const existingEval = await prisma.evaluation.findFirst({
    where: {
      candidateId: riya.id,
      jobId: windchillJob.id,
      createdByUserId: ram.id
    }
  });

  let evaluation;
  if (existingEval) {
    evaluation = await prisma.evaluation.update({
      where: { id: existingEval.id },
      data: {
        score: finalScore,
        atsScore: evaluationPayload.atsScore ?? finalScore,
        matchLevel: evaluationPayload.matchLevel,
        mandatoryCompliance: complianceStr,
        mandatoryFailed: Boolean(evaluationPayload.mandatoryRequirementFailed),
        decision: decision,
        auditData: evaluationPayload as any,
        updatedAt: new Date()
      }
    });
  } else {
    evaluation = await prisma.evaluation.create({
      data: {
        candidateId: riya.id,
        jobId: windchillJob.id,
        candidateJobId: application.id,
        createdByUserId: ram.id,
        organizationId: ram.organizationId || 'org-tasknera',
        score: finalScore,
        atsScore: evaluationPayload.atsScore ?? finalScore,
        matchLevel: evaluationPayload.matchLevel,
        mandatoryCompliance: complianceStr,
        mandatoryFailed: Boolean(evaluationPayload.mandatoryRequirementFailed),
        decision: decision,
        status: 'COMPLETED',
        auditData: evaluationPayload as any
      }
    });
  }

  // Update application match score
  await prisma.candidateApplication.update({
    where: { id: application.id },
    data: {
      match_score: finalScore
    }
  });

  console.log(`\n✓ Successfully saved Evaluation: ID=${evaluation.id} in database.`);
  console.log(`✓ Riya Bhat is now fully evaluated for Ram Charan under ${windchillJob.position} (${windchillJob.client})!`);
}

setupWindchillJobAndEvaluateRiya()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
