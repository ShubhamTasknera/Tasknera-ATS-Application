import { extractStructuredCandidateFromText } from '../services/cvParsingService';
import { calculateATSScore } from '../services/atsScoringEngine';
import { parseJobDescription } from '../services/jdParsingService';
import { computeComprehensiveMatchScore } from '../utils/requirementUtils';

const jdRaw = `
Client: IBM
Job Title: Full Stack Engineer-(Go and React)
Mandatory Skills: Golang, React.js
Experience: 6 to 12 Years
Location: Bangalore, Onsite (locals only)
Immediate Joiners, 10-15 days
Budget: 20 LPA Max
F2F Interviews

Responsibilities:
· Design and develop RESTful API Endpoints, ensuring high performance, scalability and maintainability.
· Collaborate with other Front-End Engineers and develop dynamic, responsive and user-friendly web applications.
· Define Data Models and database schemas and manage relational databases or NoSQL databases ensuring data integrity and performance.
· Build, manage and own deployment pipelines
· Create and maintain documentation of application design, configuration and maintenance.
· Provide accurate timelines for specific tasks assigned.
· Participate in scheduled on-call rotation and respond to emergencies.

Minimum Qualifications
· 6+ years professional experience working with medium/large complex code bases
· Proven experience in Full Stack development
· Experience with one or more of the following programming languages: Go(Primarily), Java, or Python
· Experience in REST API design and implementation
· DevOps experience
· Strong communication skills and work ethic

Preferred Qualifications
· BS or MS Degree in Computer Science or equivalent field.
· Demonstrated ability to write clean, maintainable, and well-documented code.
· In-depth database management, cloud technologies (AWS), and containerization (Docker, Kubernetes)
· Knowledge of React best practices, and ability to explain them to other developers
· Familiarity with DevOps tools and practices, including CI/CD pipelines
· Automated deployment tools (e.g. Terraform, Ansible, Jenkins)
· Excellent problem-solving skills and attention to detail
· Experience with Agile development methodologies such as SAFe, Scrum
`;

const cands = [
  {
    name: 'Aarav Mehta',
    file: 'Aarav_Mehta_CV.pdf',
    text: `Aarav Mehta
Bengaluru, India | aarav.mehta.cv@example.com | +91 90000 10001
PROFESSIONAL SUMMARY
Full Stack Engineer with 8 years of experience building medium-to-large enterprise applications using Go, React.js, REST APIs, PostgreSQL, Docker, Kubernetes and CI/CD. Strong experience owning backend services, responsive web applications and production deployments.

TECHNICAL SKILLS
Golang, Go, React.js, TypeScript, JavaScript, REST APIs, PostgreSQL, MongoDB, Docker, Kubernetes, AWS, Jenkins, Terraform, Git, CI/CD, SQL, Agile, Scrum

PROFESSIONAL EXPERIENCE
Senior Full Stack Engineer — NovaTech Systems | Bengaluru | 2021 – Present
• Designed scalable RESTful APIs in Go and developed responsive React.js applications.
• Defined PostgreSQL schemas and MongoDB data models.
• Owned Docker/Kubernetes deployments and Jenkins CI/CD pipelines.
• Participated in on-call rotation and mentored developers.

Full Stack Engineer — CloudBridge Technologies | Bengaluru | 2018 – 2021
• Built Go microservices and React dashboards for enterprise customers.
• Implemented REST APIs, automated deployments, monitoring and database optimization.

Software Engineer — DataWorks Pvt Ltd | Bengaluru | 2016 – 2018
• Developed web services and internal applications using Java, JavaScript and SQL.

EDUCATION
B.E. Computer Science, Visvesvaraya Technological University, 2016

ADDITIONAL INFORMATION
Certifications: AWS Certified Developer – Associate. Agile/Scrum experience. Strong technical documentation and stakeholder communication.`
  },
  {
    name: 'Neha Kulkarni',
    file: 'Neha_Kulkarni_CV.pdf',
    text: `Neha Kulkarni
Bengaluru, India | neha.kulkarni.cv@example.com | +91 90000 10002
PROFESSIONAL SUMMARY
Full Stack Developer with 7 years of professional experience. Strong in Go and React.js with hands-on REST API development, relational databases, Docker and CI/CD. Experienced in enterprise application development and production support.

TECHNICAL SKILLS
Golang, React.js, JavaScript, TypeScript, REST API, PostgreSQL, MySQL, Docker, Jenkins, AWS, Git, CI/CD, Kubernetes, Scrum

PROFESSIONAL EXPERIENCE
Lead Full Stack Developer — FinServe Digital | Bengaluru | 2020 – Present
• Developed Go REST services and React.js user interfaces.
• Managed PostgreSQL schemas, Docker images and Jenkins pipelines.
• Supported production incidents and documented application architecture.

Full Stack Developer — InnoApps | Bengaluru | 2018 – 2020
• Built React applications and backend APIs using Go and Java.
• Worked with MySQL and PostgreSQL and participated in Agile delivery.

Software Developer — WebCore | Bengaluru | 2017 – 2018
• Developed JavaScript web modules and REST integrations.

EDUCATION
M.Tech Computer Science, 2017; B.Sc. Computer Science, 2015

ADDITIONAL INFORMATION
Preferred skills: AWS, Docker, Kubernetes, CI/CD, React best practices. Strong communication and problem-solving skills.`
  },
  {
    name: 'Rohan Desai',
    file: 'Rohan_Desai_CV.pdf',
    text: `Rohan Desai
Bengaluru, India | rohan.desai.cv@example.com | +91 90000 10003
PROFESSIONAL SUMMARY
Full Stack Engineer with 6 years of experience focused on Java and React.js applications. Experienced in REST API design, databases and DevOps practices. Limited professional Go experience but strong transferable backend engineering experience.

TECHNICAL SKILLS
React.js, Java, Spring Boot, JavaScript, TypeScript, REST APIs, PostgreSQL, MySQL, Docker, Jenkins, AWS, Git, CI/CD, SQL, Scrum

PROFESSIONAL EXPERIENCE
Senior Full Stack Engineer — EnterpriseWorks | Bengaluru | 2022 – Present
• Developed Spring Boot REST APIs and React.js applications.
• Designed relational database schemas and maintained Jenkins-based CI/CD pipelines.
• Worked with Docker and AWS.

Software Engineer — TechAxis | Bengaluru | 2020 – 2022
• Built Java REST services, React dashboards and SQL data models.

Developer — SoftLabs | Pune | 2018 – 2020
• Developed Java web applications and database integrations.

EDUCATION
B.E. Information Technology, 2018

ADDITIONAL INFORMATION
Go: completed training and built two personal projects; no long-term production Go role. Familiar with Kubernetes and Agile.`
  },
  {
    name: 'Vikram Nair',
    file: 'Vikram_Nair_CV.pdf',
    text: `Vikram Nair
Bengaluru, India | vikram.nair.cv@example.com | +91 90000 10004
PROFESSIONAL SUMMARY
Backend Engineer with 9 years of experience in Python and Java, specializing in REST APIs, databases, cloud and DevOps. Has worked with React.js on internal tools but has limited frontend ownership and no significant professional Go experience.

TECHNICAL SKILLS
Python, Java, FastAPI, Django, REST APIs, React.js, JavaScript, PostgreSQL, MongoDB, AWS, Docker, Kubernetes, Jenkins, Terraform, Git, CI/CD

PROFESSIONAL EXPERIENCE
Principal Backend Engineer — CloudScale | Bengaluru | 2019 – Present
• Designed high-performance REST APIs, database models and cloud deployments.
• Owned Terraform, Docker, Kubernetes and Jenkins automation.
• Participated in production on-call.

Backend Engineer — AppMatrix | Bengaluru | 2017 – 2019
• Built Python APIs and PostgreSQL services and supported AWS infrastructure.

Software Engineer — LogicTree | Chennai | 2015 – 2017
• Developed Java backend systems and SQL integrations.

EDUCATION
M.S. Computer Science, 2015

ADDITIONAL INFORMATION
React.js used for internal admin tools. Go: no professional experience. Strong DevOps and cloud background.`
  }
];

const parsedJd = parseJobDescription(jdRaw, 'IBM_FullStack_JD.pdf', 'application/pdf', 2, 'text', false);
const jobRequirements = parsedJd.data.requirements.map((r: any) => ({
  id: r.id,
  requirement: r.requirement,
  category: r.category,
  weight: r.weight,
  is_mandatory: Boolean(r.isMandatory ?? r.mandatory ?? r.is_mandatory)
}));

console.log('\n================================================================');
console.log('JOB REQUISITION PARSED:', parsedJd.data.job.positionTitle);
console.log('Client:', parsedJd.data.job.company);
console.log('Requirements count:', jobRequirements.length);
console.log('================================================================\n');

for (const c of cands) {
  const parsedCandidate = extractStructuredCandidateFromText(c.text, c.file, {
    fileType: 'application/pdf',
    pageCount: 1,
    extractionMethod: 'test-runner',
    ocrUsed: false,
    characterCount: c.text.length,
    wordCount: c.text.split(/\s+/).length
  });

  const candidateRecord = {
    id: 'cand-' + c.name.toLowerCase().replace(/\s+/g, '-'),
    jobId: 'ibm-fs-1',
    ...parsedCandidate,
    totalExperience: parsedCandidate.totalExperience || '0 yrs',
    relevantExperience: parsedCandidate.totalExperience || '0 yrs',
    currentTitle: parsedCandidate.currentTitle || 'Full Stack Engineer',
    currentCompany: parsedCandidate.currentCompany || '',
    summary: parsedCandidate.summary || '',
    fileName: c.file,
    fileSize: 10240,
    uploadedAt: new Date().toISOString()
  };

  const atsScore = calculateATSScore(candidateRecord as any, {
    id: 'ibm-fs-1',
    position: parsedJd.data.job.positionTitle || 'Full Stack Engineer',
    client: parsedJd.data.job.company || 'IBM',
    jd_text: jdRaw
  }, jobRequirements);

  const comprehensive = computeComprehensiveMatchScore(candidateRecord as any, {
    jd_text: jdRaw,
    position: parsedJd.data.job.positionTitle || 'Full Stack Engineer',
    requirements: jobRequirements
  });

  console.log('----------------------------------------------------------------');
  console.log(`CANDIDATE: ${c.name}`);
  console.log(`Parsed Total Experience: ${parsedCandidate.totalExperience} (~${parsedCandidate.totalExperienceYears} yrs)`);
  console.log(`Parsed Skills (${parsedCandidate.skills.length}): ${parsedCandidate.skills.join(', ')}`);
  console.log(`Parsed Work History: ${parsedCandidate.experience.length} roles`);
  console.log(`Deterministic ATS Score: ${atsScore.overallScore}% [${atsScore.matchLevel}]`);
  console.log(`Comprehensive Engine Score: ${comprehensive.overallScore}% [${comprehensive.matchLevel}]`);
  console.log(`Mandatory Requirements Passed: ${!atsScore.mandatoryRequirementFailed ? 'YES (All Passed)' : 'NO (Failed Mandatory Gate)'}`);
  console.log(`Recommendation Decision: ${atsScore.overallScore >= 75 && !atsScore.mandatoryRequirementFailed ? 'SUBMIT / INTERVIEW' : atsScore.overallScore >= 60 ? 'REVIEW' : 'DO NOT SUBMIT'}`);
  console.log(`Key Strengths: ${atsScore.strengths.slice(0, 4).join('; ') || 'None'}`);
  console.log(`Identified Gaps: ${atsScore.gaps.slice(0, 3).join('; ') || 'None'}`);
  console.log('----------------------------------------------------------------\n');
}
