import { evaluateCandidateAgainstRequirements } from '../services/evaluationService';

async function testAIScoring() {
  console.log('Testing TaskNera AI Semantic ATS Scoring Engine...\n');

  const salesJob = {
    id: 'job-sales-ae',
    position: 'Enterprise Account Executive - B2B SaaS',
    title: 'Enterprise Account Executive - B2B SaaS',
    client: 'CloudScale Technologies',
    company: 'CloudScale Technologies'
  };

  const requirements = [
    {
      id: 'req-1',
      requirement: 'Proven track record of quota attainment in B2B enterprise SaaS sales',
      category: 'Sales Experience',
      is_mandatory: true,
      weight: 2.0
    },
    {
      id: 'req-2',
      requirement: 'Hands-on experience with Salesforce CRM and sales pipeline management',
      category: 'Tools',
      is_mandatory: true,
      weight: 1.5
    },
    {
      id: 'req-3',
      requirement: 'Experience managing multi-stakeholder contract negotiations and deal closing',
      category: 'Functional Competency',
      is_mandatory: false,
      weight: 1.0
    }
  ];

  // 1. Qualified Sales Candidate
  const qualifiedCandidate: any = {
    id: 'cand-sarah',
    name: 'Sarah Jenkins',
    currentTitle: 'Senior Account Executive',
    currentCompany: 'Datacore Software',
    email: 'sarah.jenkins@example.com',
    skills: ['Salesforce CRM', 'B2B Sales', 'Quota Attainment', 'Contract Negotiation', 'Pipeline Management'],
    experience: [
      {
        title: 'Senior Account Executive',
        company: 'Datacore Software',
        duration: '2021 - Present',
        description: 'Achieved 130% of annual sales quota in 2022 and 2023. Managed complex enterprise sales cycles and used Salesforce CRM to track pipeline velocity.'
      }
    ],
    rawText: 'Sarah Jenkins. Senior Account Executive with 5+ years driving enterprise B2B sales, quota attainment, and contract negotiation.'
  };

  // 2. Complete Mismatch Candidate (Software Developer)
  const mismatchCandidate: any = {
    id: 'cand-alex',
    name: 'Alex Kumar',
    currentTitle: 'Senior Backend Engineer',
    currentCompany: 'CodeBase Labs',
    email: 'alex.kumar@example.com',
    skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes'],
    experience: [
      {
        title: 'Senior Backend Engineer',
        company: 'CodeBase Labs',
        duration: '2020 - Present',
        description: 'Built high-concurrency microservices in Python and FastAPI with PostgreSQL databases.'
      }
    ],
    rawText: 'Alex Kumar. Senior Backend Engineer specializing in Python, microservices, and distributed cloud systems.'
  };

  console.log('>>> EVALUATING CANDIDATE 1: Sarah Jenkins (Strong B2B Sales Fit)...');
  const evalSarah = await evaluateCandidateAgainstRequirements(qualifiedCandidate, salesJob, requirements);
  console.log(`Sarah ATS Score: ${evalSarah.overallScore}% (${evalSarah.matchLevel})`);
  console.log(`Recommendation: ${evalSarah.recommendation} - "${evalSarah.recommendationReason}"`);
  console.log(`Mandatory Failed: ${evalSarah.mandatoryRequirementFailed}`);
  console.log(`Evaluator: ${evalSarah.evaluator}`);
  console.log('Requirements Breakdown:');
  for (const r of evalSarah.requirements) {
    console.log(`  - [${r.status}] ${r.requirement}`);
    console.log(`    Score: ${r.score}% | Confidence: ${r.confidence} | Evidence: "${(r.candidateEvidence || '').substring(0, 80)}..."`);
  }

  console.log('\n--------------------------------------------------------------\n');

  console.log('>>> EVALUATING CANDIDATE 2: Alex Kumar (Backend Engineer Mismatch)...');
  const evalAlex = await evaluateCandidateAgainstRequirements(mismatchCandidate, salesJob, requirements);
  console.log(`Alex ATS Score: ${evalAlex.overallScore}% (${evalAlex.matchLevel})`);
  console.log(`Recommendation: ${evalAlex.recommendation} - "${evalAlex.recommendationReason}"`);
  console.log(`Mandatory Failed: ${evalAlex.mandatoryRequirementFailed}`);
  console.log(`Evaluator: ${evalAlex.evaluator}`);
  // 3. Moderate Fit Candidate (Account Executive with Sales experience, but no Salesforce experience)
  const moderateCandidate: any = {
    id: 'cand-jordan',
    name: 'Jordan Lee',
    currentTitle: 'Account Executive',
    currentCompany: 'DirectSell Corp',
    email: 'jordan.lee@example.com',
    skills: ['B2B Sales', 'Lead Generation', 'Contract Negotiation', 'Cold Calling'],
    experience: [
      {
        title: 'Account Executive',
        company: 'DirectSell Corp',
        duration: '2022 - Present',
        description: 'Conducted outbound B2B sales prospecting, achieved 105% quota attainment in enterprise software deals, and led commercial contract negotiations using HubSpot CRM.'
      }
    ],
    rawText: 'Jordan Lee. Account Executive with 3+ years experience closing B2B software contracts and managing deals.'
  };

  console.log('\n--------------------------------------------------------------\n');
  console.log('>>> EVALUATING CANDIDATE 3: Jordan Lee (Moderate Sales Fit, Partial Tools)...');
  const evalJordan = await evaluateCandidateAgainstRequirements(moderateCandidate, salesJob, requirements);
  console.log(`Jordan ATS Score: ${evalJordan.overallScore}% (${evalJordan.matchLevel})`);
  console.log(`Recommendation: ${evalJordan.recommendation} - "${evalJordan.recommendationReason}"`);
  console.log(`Mandatory Failed: ${evalJordan.mandatoryRequirementFailed}`);
  console.log(`Evaluator: ${evalJordan.evaluator}`);
  console.log('Requirements Breakdown:');
  for (const r of evalJordan.requirements) {
    console.log(`  - [${r.status}] ${r.requirement}`);
    console.log(`    Score: ${r.score}% | Confidence: ${r.confidence} | Evidence: "${(r.candidateEvidence || '').substring(0, 80)}..."`);
  }
}

testAIScoring().catch(console.error);
