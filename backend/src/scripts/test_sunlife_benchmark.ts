import { calculateATSScore } from '../services/atsScoringEngine';
import { CandidateRecord } from '../controllers/candidateController';

console.log('===============================================================');
console.log('BENCHMARK EVALUATION: SUNLIFE GenAI / AI-ML ENGINEER JD');
console.log('===============================================================');

const sunlifeJobData = {
  id: 'job-sunlife-genai',
  title: 'GenAI / AI-ML Engineer',
  position: 'GenAI / AI-ML Engineer',
  client: 'SunLife',
  company: 'SunLife',
  location: 'Gurugram (Hybrid)',
  work_mode: 'Hybrid',
  salary: '18-20 LPA (MAX)'
};

const sunlifeRequirements = [
  {
    id: 'req-1',
    requirement: 'Strong hands-on experience in Python and SQL',
    category: 'Technical Skills',
    weight: 1.5,
    is_mandatory: true,
    isMandatory: true
  },
  {
    id: 'req-2',
    requirement: 'Experience building APIs using FastAPI or similar frameworks',
    category: 'Technical Skills',
    weight: 1.5,
    is_mandatory: true,
    isMandatory: true
  },
  {
    id: 'req-3',
    requirement: 'Hands-on experience with Machine Learning & Deep Learning: Scikit-learn, TensorFlow, PyTorch, Keras',
    category: 'Technical Skills',
    weight: 1.5,
    is_mandatory: true,
    isMandatory: true
  },
  {
    id: 'req-4',
    requirement: 'Hands-on experience with LangGraph / Multi-Agent Systems and Agentic AI workflows',
    category: 'Technical Skills',
    weight: 2.0,
    is_mandatory: true,
    isMandatory: true
  },
  {
    id: 'req-5',
    requirement: 'Experience working with Vector Databases (Pinecone, FAISS), Embeddings, Semantic Search, and RAG evaluation metrics (RAGAS, BLEU, ROUGE)',
    category: 'Technical Skills',
    weight: 1.5,
    is_mandatory: true,
    isMandatory: true
  },
  {
    id: 'req-6',
    requirement: 'Hands-on production experience with AWS SageMaker and AWS Bedrock deployments',
    category: 'Technical Skills',
    weight: 2.0,
    is_mandatory: true,
    isMandatory: true
  },
  {
    id: 'req-7',
    requirement: '4–6 Years of relevant professional experience',
    category: 'Experience',
    weight: 1.5,
    is_mandatory: true,
    isMandatory: true
  },
  {
    id: 'req-8',
    requirement: 'Noida / NCR / Gurugram Local Candidates Only (Face to Face interview at Sec-62 Gurgaon)',
    category: 'Location',
    weight: 2.0,
    is_mandatory: true,
    isMandatory: true
  },
  {
    id: 'req-9',
    requirement: 'Immediate Joiners Only (Serving Notice / Short Notice)',
    category: 'Availability',
    weight: 1.0,
    is_mandatory: false,
    isMandatory: false
  }
];

// 1. Ananya Rao
const ananyaRao: any = {
  id: 'cand-ananya',
  jobId: 'job-sunlife-genai',
  name: 'Ananya Rao',
  email: 'ananya.rao.cv@example.com',
  phone: '+91 90000 21001',
  location: 'Gurugram, Haryana',
  currentTitle: 'Senior GenAI Engineer',
  currentCompany: 'NeuralBridge AI',
  totalExperience: '5.5 yrs',
  relevantExperience: '5.5 yrs',
  summary: 'GenAI / ML Engineer with 5.5 years of experience designing and deploying production AI/ML and Generative AI solutions.',
  skills: [
    'Python', 'SQL', 'FastAPI', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'Regression',
    'Classification', 'Clustering', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Tuning',
    'LLMs', 'Prompt Engineering', 'RAG', 'Agentic AI', 'Multi-Agent Systems', 'LangChain', 'LangGraph',
    'OpenAI APIs', 'Hugging Face', 'LangSmith', 'Pinecone', 'FAISS', 'Embeddings', 'Semantic Search',
    'RAGAS', 'BLEU', 'ROUGE', 'AWS EC2', 'S3', 'SageMaker', 'Bedrock', 'Docker', 'Git', 'JIRA', 'CI/CD', 'Agile'
  ],
  education: [{ degree: 'B.Tech Computer Science and Engineering', institution: 'Engineering College', year: '2020' }],
  experience: [
    {
      title: 'Senior GenAI Engineer',
      company: 'NeuralBridge AI',
      startDate: '2023',
      endDate: 'Present',
      description: 'Designed production RAG applications using LangChain, LangGraph, Pinecone and OpenAI APIs; built FastAPI services and agentic workflows; evaluated RAG quality with RAGAS; deployed on AWS Bedrock and SageMaker.'
    },
    {
      title: 'ML Engineer',
      company: 'DataNova Technologies',
      startDate: '2021',
      endDate: '2023',
      description: 'Built classification, regression and NLP models using Scikit-learn, TensorFlow and PyTorch; developed feature engineering/model evaluation pipelines and REST APIs; used PostgreSQL, Docker and CI/CD.'
    },
    {
      title: 'Software Engineer',
      company: 'CloudIQ Systems',
      startDate: '2020',
      endDate: '2021',
      description: 'Developed Python backend services and SQL data pipelines.'
    }
  ],
  rawText: 'Ananya Rao Gurugram, Haryana Notice period 15 days; NCR local; hybrid-ready. NeuralBridge AI, DataNova Technologies, CloudIQ Systems.',
  fileName: 'CV_1_Ananya_Rao.pdf',
  fileSize: 2979,
  uploadedAt: new Date().toISOString()
};

// 2. Karan Malhotra
const karanMalhotra: any = {
  id: 'cand-karan',
  jobId: 'job-sunlife-genai',
  name: 'Karan Malhotra',
  email: 'karan.malhotra.cv@example.com',
  phone: '+91 90000 21002',
  location: 'Noida, Uttar Pradesh',
  currentTitle: 'Lead AI/ML Engineer',
  currentCompany: 'FinAI Labs',
  totalExperience: '6 yrs',
  relevantExperience: '6 yrs',
  summary: 'AI/ML Engineer with 6 years of experience across machine learning, deep learning and Generative AI.',
  skills: [
    'Python', 'SQL', 'FastAPI', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'Regression',
    'Classification', 'Clustering', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Tuning',
    'NLP', 'LLMs', 'Prompt Engineering', 'RAG', 'LangChain', 'LangGraph', 'OpenAI APIs', 'Hugging Face',
    'Pinecone', 'FAISS', 'Embedding Models', 'Semantic Search', 'RAGAS', 'AWS EC2', 'S3', 'SageMaker',
    'Bedrock', 'Docker', 'Git', 'JIRA', 'CI/CD', 'Agile', 'PostgreSQL'
  ],
  education: [
    { degree: 'M.Tech Artificial Intelligence', institution: 'University', year: '2018' },
    { degree: 'B.E. Computer Engineering', institution: 'University', year: '2016' }
  ],
  experience: [
    {
      title: 'Lead AI/ML Engineer',
      company: 'FinAI Labs',
      startDate: '2021',
      endDate: 'Present',
      description: 'Developed GenAI applications using OpenAI APIs, LangChain and RAG; built Pinecone/FAISS vector search and FastAPI services; developed PyTorch/TensorFlow models and AWS deployments.'
    },
    {
      title: 'ML Engineer',
      company: 'TechMind Analytics',
      startDate: '2019',
      endDate: '2021',
      description: 'Created classification and regression models, feature engineering pipelines and NLP solutions; implemented model evaluation, hyperparameter tuning and REST APIs.'
    },
    {
      title: 'Software Engineer',
      company: 'InnoData',
      startDate: '2018',
      endDate: '2019',
      description: 'Built Python data-processing services and SQL applications.'
    }
  ],
  rawText: 'Karan Malhotra Noida, Uttar Pradesh Short-notice joiner; NCR local. FinAI Labs, TechMind Analytics, InnoData.',
  fileName: 'CV_2_Karan_Malhotra.pdf',
  fileSize: 2898,
  uploadedAt: new Date().toISOString()
};

// 3. Meera Iyer (Bangalore - Non NCR, Missing LangGraph / Bedrock)
const meeraIyer: any = {
  id: 'cand-meera',
  jobId: 'job-sunlife-genai',
  name: 'Meera Iyer',
  email: 'meera.iyer.cv@example.com',
  phone: '+91 90000 21003',
  location: 'Bengaluru, Karnataka',
  currentTitle: 'ML Engineer',
  currentCompany: 'InsightWorks',
  totalExperience: '5 yrs',
  relevantExperience: '5 yrs',
  summary: 'Machine Learning Engineer with 5 years of experience in Python, SQL, classical ML, deep learning and NLP.',
  skills: [
    'Python', 'SQL', 'FastAPI', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'Regression',
    'Classification', 'Clustering', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Tuning',
    'NLP', 'LLMs', 'Prompt Engineering', 'RAG', 'LangChain', 'OpenAI APIs', 'Hugging Face', 'FAISS',
    'Embeddings', 'Docker', 'Git', 'JIRA', 'CI/CD', 'AWS EC2', 'S3', 'Agile'
  ],
  education: [{ degree: 'B.E. Computer Science', institution: 'University', year: '2019' }],
  experience: [
    {
      title: 'ML Engineer',
      company: 'InsightWorks',
      startDate: '2022',
      endDate: 'Present',
      description: 'Built classification, regression and NLP models using Scikit-learn and PyTorch; developed FastAPI model services; built a proof-of-concept RAG assistant with LangChain, OpenAI APIs and FAISS.'
    },
    {
      title: 'Data Scientist',
      company: 'QuantEdge',
      startDate: '2021',
      endDate: '2022',
      description: 'Developed predictive models, hyperparameter tuning and SQL data pipelines.'
    },
    {
      title: 'Software Engineer',
      company: 'AppSphere',
      startDate: '2019',
      endDate: '2021',
      description: 'Developed Python APIs and data-processing applications.'
    }
  ],
  rawText: 'Meera Iyer Bengaluru, Karnataka 30 days notice; not NCR local; no professional LangGraph, SageMaker or Bedrock ownership.',
  fileName: 'CV_3_Meera_Iyer.pdf',
  fileSize: 2839,
  uploadedAt: new Date().toISOString()
};

// 4. Ritesh Verma (Pune - Non NCR, Backend heavy, Missing Deep Learning / GenAI Frameworks)
const riteshVerma: any = {
  id: 'cand-ritesh',
  jobId: 'job-sunlife-genai',
  name: 'Ritesh Verma',
  email: 'ritesh.verma.cv@example.com',
  phone: '+91 90000 21004',
  location: 'Pune, Maharashtra',
  currentTitle: 'Senior Backend Engineer',
  currentCompany: 'CloudMatrix',
  totalExperience: '7 yrs',
  relevantExperience: '7 yrs',
  summary: 'Senior Python Backend Engineer with 7 years of experience building REST APIs, cloud services and data platforms.',
  skills: [
    'Python', 'SQL', 'FastAPI', 'Django', 'REST APIs', 'PostgreSQL', 'MongoDB', 'Docker',
    'AWS EC2', 'S3', 'Git', 'Jenkins', 'CI/CD', 'JIRA', 'Agile', 'OpenAI APIs', 'LangChain',
    'RAG', 'FAISS', 'Basic PyTorch', 'Basic Scikit-learn'
  ],
  education: [{ degree: 'B.E. Information Technology', institution: 'University', year: '2017' }],
  experience: [
    {
      title: 'Senior Backend Engineer',
      company: 'CloudMatrix',
      startDate: '2020',
      endDate: 'Present',
      description: 'Designed Python/FastAPI services and AWS deployments; built an internal OpenAI document assistant using LangChain and FAISS; used Docker and CI/CD.'
    },
    {
      title: 'Backend Engineer',
      company: 'WebCore Systems',
      startDate: '2018',
      endDate: '2020',
      description: 'Built Python services, PostgreSQL applications and integration APIs.'
    },
    {
      title: 'Software Developer',
      company: 'SoftGrid',
      startDate: '2017',
      endDate: '2018',
      description: 'Developed backend services and SQL applications.'
    }
  ],
  rawText: 'Ritesh Verma Pune, Maharashtra No professional TensorFlow/Keras; no production LangGraph/SageMaker/Bedrock; not NCR local.',
  fileName: 'CV_4_Ritesh_Verma.pdf',
  fileSize: 2730,
  uploadedAt: new Date().toISOString()
};

const candidates: Array<{ cand: any; expectedMatch: string; expectedMandatory: boolean }> = [
  { cand: ananyaRao, expectedMatch: 'EXCELLENT MATCH', expectedMandatory: true },
  { cand: karanMalhotra, expectedMatch: 'EXCELLENT MATCH', expectedMandatory: true },
  { cand: meeraIyer, expectedMatch: 'LOW MATCH', expectedMandatory: false },
  { cand: riteshVerma, expectedMatch: 'LOW MATCH', expectedMandatory: false }
];

let allPassed = true;

for (const { cand, expectedMatch, expectedMandatory } of candidates) {
  const result = calculateATSScore(cand, sunlifeJobData, sunlifeRequirements);
  const score = Math.round(result.overallScore ?? 0);
  console.log(`\nCandidate: ${cand.name?.padEnd(16)} | Score: ${String(score + '%').padEnd(5)} | Tier: ${result.matchLevel.padEnd(16)} | Mandatory Passed: ${!result.mandatoryRequirementFailed}`);
  if (result.mandatoryFailures.length > 0) {
    console.log(`  Mandatory Failures:`, result.mandatoryFailures.map((f: any) => `${f.requirement} (${f.reason})`));
  }
  
  if (result.matchLevel !== expectedMatch) {
    console.error(`❌ Mismatch for ${cand.name}: Expected ${expectedMatch}, got ${result.matchLevel}`);
    allPassed = false;
  } else {
    console.log(`✅ ${cand.name} correctly evaluated as ${result.matchLevel}`);
  }
}

if (allPassed) {
  console.log('\n===============================================================');
  console.log('🎉 ALL SUNLIFE CANDIDATE EVALUATIONS PASSED WITH 100% ACCURACY!');
  console.log('===============================================================');
} else {
  process.exit(1);
}
