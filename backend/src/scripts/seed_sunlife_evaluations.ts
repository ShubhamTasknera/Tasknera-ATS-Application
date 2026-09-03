import prisma from '../config/prisma';
import { calculateATSScore } from '../services/atsScoringEngine';

const SUNLIFE_JOB_ID = '4cb34f70-bb54-4bee-a6ea-d256dbc1f850';
const DEFAULT_USER_ID = '4f260321-5d23-420f-83cd-20c6825984eb'; // dev@tasknera.com

const sunlifeRequirements = [
  {
    requirement: 'Strong hands-on experience in Python and SQL',
    category: 'Technical Skills',
    weight: 1.5,
    is_mandatory: true
  },
  {
    requirement: 'Experience building APIs using FastAPI or similar frameworks',
    category: 'Technical Skills',
    weight: 1.5,
    is_mandatory: true
  },
  {
    requirement: 'Hands-on experience with Machine Learning & Deep Learning: Scikit-learn, TensorFlow, PyTorch, Keras',
    category: 'Technical Skills',
    weight: 1.5,
    is_mandatory: true
  },
  {
    requirement: 'Hands-on experience with LangGraph / Multi-Agent Systems and Agentic AI workflows',
    category: 'Technical Skills',
    weight: 2.0,
    is_mandatory: true
  },
  {
    requirement: 'Experience working with Vector Databases (Pinecone, FAISS), Embeddings, Semantic Search, and RAG evaluation metrics (RAGAS, BLEU, ROUGE)',
    category: 'Technical Skills',
    weight: 1.5,
    is_mandatory: true
  },
  {
    requirement: 'Hands-on production experience with AWS SageMaker and AWS Bedrock deployments',
    category: 'Technical Skills',
    weight: 2.0,
    is_mandatory: true
  },
  {
    requirement: '4–6 Years of relevant professional experience',
    category: 'Experience',
    weight: 1.5,
    is_mandatory: true
  },
  {
    requirement: 'Noida / NCR / Gurugram Local Candidates Only (Face to Face interview at Sec-62 Gurgaon)',
    category: 'Location',
    weight: 2.0,
    is_mandatory: true
  },
  {
    requirement: 'Immediate Joiners Only (Serving Notice / Short Notice)',
    category: 'Availability',
    weight: 1.0,
    is_mandatory: false
  }
];

const candidatesData = [
  {
    name: 'Ananya Rao',
    email: 'ananya.rao.cv@example.com',
    phone: '+91 90000 21001',
    location: 'Gurugram, Haryana',
    current_title: 'Senior GenAI Engineer',
    current_company: 'NeuralBridge AI',
    total_experience: '5.5 yrs',
    summary: 'GenAI / ML Engineer with 5.5 years of experience designing and deploying production AI/ML and Generative AI solutions.',
    file_name: 'CV_1_Ananya_Rao.pdf',
    skills: [
      'Python', 'SQL', 'FastAPI', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'Regression',
      'Classification', 'Clustering', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Tuning',
      'LLMs', 'Prompt Engineering', 'RAG', 'Agentic AI', 'Multi-Agent Systems', 'LangChain', 'LangGraph',
      'OpenAI APIs', 'Hugging Face', 'LangSmith', 'Pinecone', 'FAISS', 'Embeddings', 'Semantic Search',
      'RAGAS', 'BLEU', 'ROUGE', 'AWS EC2', 'S3', 'SageMaker', 'Bedrock', 'Docker', 'Git', 'JIRA', 'CI/CD', 'Agile'
    ],
    experience: [
      {
        title: 'Senior GenAI Engineer',
        company: 'NeuralBridge AI',
        startDate: '2023',
        endDate: 'Present',
        duration: '2 years',
        description: 'Designed production RAG applications using LangChain, LangGraph, Pinecone and OpenAI APIs; built FastAPI services and agentic workflows; evaluated RAG quality with RAGAS; deployed on AWS Bedrock and SageMaker.'
      },
      {
        title: 'ML Engineer',
        company: 'DataNova Technologies',
        startDate: '2021',
        endDate: '2023',
        duration: '2 years',
        description: 'Built classification, regression and NLP models using Scikit-learn, TensorFlow and PyTorch; developed feature engineering/model evaluation pipelines and REST APIs; used PostgreSQL, Docker and CI/CD.'
      },
      {
        title: 'Software Engineer',
        company: 'CloudIQ Systems',
        startDate: '2020',
        endDate: '2021',
        duration: '1.5 years',
        description: 'Developed Python backend services and SQL data pipelines.'
      }
    ],
    education: [{ degree: 'B.Tech Computer Science and Engineering', institution: 'Engineering College', year: '2020' }],
    raw_text: 'Ananya Rao Gurugram, Haryana Notice period 15 days; NCR local; hybrid-ready. NeuralBridge AI, DataNova Technologies, CloudIQ Systems.'
  },
  {
    name: 'Karan Malhotra',
    email: 'karan.malhotra.cv@example.com',
    phone: '+91 90000 21002',
    location: 'Noida, Uttar Pradesh',
    current_title: 'Lead AI/ML Engineer',
    current_company: 'FinAI Labs',
    total_experience: '6 yrs',
    summary: 'AI/ML Engineer with 6 years of experience across machine learning, deep learning and Generative AI.',
    file_name: 'CV_2_Karan_Malhotra.pdf',
    skills: [
      'Python', 'SQL', 'FastAPI', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'Regression',
      'Classification', 'Clustering', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Tuning',
      'NLP', 'LLMs', 'Prompt Engineering', 'RAG', 'LangChain', 'LangGraph', 'OpenAI APIs', 'Hugging Face',
      'Pinecone', 'FAISS', 'Embedding Models', 'Semantic Search', 'RAGAS', 'AWS EC2', 'S3', 'SageMaker',
      'Bedrock', 'Docker', 'Git', 'JIRA', 'CI/CD', 'Agile', 'PostgreSQL'
    ],
    experience: [
      {
        title: 'Lead AI/ML Engineer',
        company: 'FinAI Labs',
        startDate: '2021',
        endDate: 'Present',
        duration: '3.5 years',
        description: 'Developed GenAI applications using OpenAI APIs, LangChain and RAG; built Pinecone/FAISS vector search and FastAPI services; developed PyTorch/TensorFlow models and AWS deployments.'
      },
      {
        title: 'ML Engineer',
        company: 'TechMind Analytics',
        startDate: '2019',
        endDate: '2021',
        duration: '2 years',
        description: 'Created classification and regression models, feature engineering pipelines and NLP solutions; implemented model evaluation, hyperparameter tuning and REST APIs.'
      },
      {
        title: 'Software Engineer',
        company: 'InnoData',
        startDate: '2018',
        endDate: '2019',
        duration: '1 year',
        description: 'Built Python data-processing services and SQL applications.'
      }
    ],
    education: [
      { degree: 'M.Tech Artificial Intelligence', institution: 'University', year: '2018' },
      { degree: 'B.E. Computer Engineering', institution: 'University', year: '2016' }
    ],
    raw_text: 'Karan Malhotra Noida, Uttar Pradesh Short-notice joiner; NCR local. FinAI Labs, TechMind Analytics, InnoData.'
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer.cv@example.com',
    phone: '+91 90000 21003',
    location: 'Bengaluru, Karnataka',
    current_title: 'ML Engineer',
    current_company: 'InsightWorks',
    total_experience: '5 yrs',
    summary: 'Machine Learning Engineer with 5 years of experience in Python, SQL, classical ML, deep learning and NLP.',
    file_name: 'CV_3_Meera_Iyer.pdf',
    skills: [
      'Python', 'SQL', 'FastAPI', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'Regression',
      'Classification', 'Clustering', 'Feature Engineering', 'Model Evaluation', 'Hyperparameter Tuning',
      'NLP', 'LLMs', 'Prompt Engineering', 'RAG', 'LangChain', 'OpenAI APIs', 'Hugging Face', 'FAISS',
      'Embeddings', 'Docker', 'Git', 'JIRA', 'CI/CD', 'AWS EC2', 'S3', 'Agile'
    ],
    experience: [
      {
        title: 'ML Engineer',
        company: 'InsightWorks',
        startDate: '2022',
        endDate: 'Present',
        duration: '2.5 years',
        description: 'Built classification, regression and NLP models using Scikit-learn and PyTorch; developed FastAPI model services; built a proof-of-concept RAG assistant with LangChain, OpenAI APIs and FAISS.'
      },
      {
        title: 'Data Scientist',
        company: 'QuantEdge',
        startDate: '2021',
        endDate: '2022',
        duration: '1.5 years',
        description: 'Developed predictive models, hyperparameter tuning and SQL data pipelines.'
      },
      {
        title: 'Software Engineer',
        company: 'AppSphere',
        startDate: '2019',
        endDate: '2021',
        duration: '2 years',
        description: 'Developed Python APIs and data-processing applications.'
      }
    ],
    education: [{ degree: 'B.E. Computer Science', institution: 'University', year: '2019' }],
    raw_text: 'Meera Iyer Bengaluru, Karnataka 30 days notice; not NCR local; no professional LangGraph, SageMaker or Bedrock ownership.'
  },
  {
    name: 'Ritesh Verma',
    email: 'ritesh.verma.cv@example.com',
    phone: '+91 90000 21004',
    location: 'Pune, Maharashtra',
    current_title: 'Senior Backend Engineer',
    current_company: 'CloudMatrix',
    total_experience: '7 yrs',
    summary: 'Senior Python Backend Engineer with 7 years of experience building REST APIs, cloud services and data platforms.',
    file_name: 'CV_4_Ritesh_Verma.pdf',
    skills: [
      'Python', 'SQL', 'FastAPI', 'Django', 'REST APIs', 'PostgreSQL', 'MongoDB', 'Docker',
      'AWS EC2', 'S3', 'Git', 'Jenkins', 'CI/CD', 'JIRA', 'Agile', 'OpenAI APIs', 'LangChain',
      'RAG', 'FAISS', 'Basic PyTorch', 'Basic Scikit-learn'
    ],
    experience: [
      {
        title: 'Senior Backend Engineer',
        company: 'CloudMatrix',
        startDate: '2020',
        endDate: 'Present',
        duration: '4 years',
        description: 'Designed Python/FastAPI services and AWS deployments; built an internal OpenAI document assistant using LangChain and FAISS; used Docker and CI/CD.'
      },
      {
        title: 'Backend Engineer',
        company: 'WebCore Systems',
        startDate: '2018',
        endDate: '2020',
        duration: '2 years',
        description: 'Built Python services, PostgreSQL applications and integration APIs.'
      },
      {
        title: 'Software Developer',
        company: 'SoftGrid',
        startDate: '2017',
        endDate: '2018',
        duration: '1 year',
        description: 'Developed backend services and SQL applications.'
      }
    ],
    education: [{ degree: 'B.E. Information Technology', institution: 'University', year: '2017' }],
    raw_text: 'Ritesh Verma Pune, Maharashtra No professional TensorFlow/Keras; no production LangGraph/SageMaker/Bedrock; not NCR local.'
  }
];

async function seedSunLifeBenchmark() {
  console.log('Seeding SunLife Job & Accurate Evidence-Based Candidate Evaluations...');

  // 1. Verify/Update Job
  let job = await prisma.job.findUnique({
    where: { id: SUNLIFE_JOB_ID }
  });

  if (!job) {
    job = await prisma.job.create({
      data: {
        id: SUNLIFE_JOB_ID,
        position: 'GenAI / AI-ML Engineer',
        client: 'SunLife',
        location: 'Gurugram (Hybrid)',
        work_mode: 'Hybrid',
        salary_range: '18-20 LPA (MAX)',
        experience_required: '4–6 Years',
        status: 'active',
        created_by: DEFAULT_USER_ID,
        jd_text: 'SunLife GenAI / AI-ML Engineer JD'
      }
    });
  }

  // 2. Clean & Replace Requirements with clean benchmark requirements
  await prisma.requirement.deleteMany({
    where: { job_id: SUNLIFE_JOB_ID }
  });

  for (const req of sunlifeRequirements) {
    await prisma.requirement.create({
      data: {
        job_id: SUNLIFE_JOB_ID,
        requirement: req.requirement,
        category: req.category,
        weight: req.weight,
        is_mandatory: req.is_mandatory
      }
    });
  }
  console.log(`Created ${sunlifeRequirements.length} accurate requirements for SunLife Job.`);

  // 3. Insert Candidates & CandidateApplications
  for (const cData of candidatesData) {
    // Check if candidate already exists
    let candidate = await prisma.candidate.findFirst({
      where: {
        email: cData.email
      }
    });

    if (candidate) {
      // Update candidate
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          job_id: SUNLIFE_JOB_ID,
          name: cData.name,
          location: cData.location,
          current_title: cData.current_title,
          current_company: cData.current_company,
          total_experience: cData.total_experience,
          summary: cData.summary,
          raw_text: cData.raw_text,
          parsing_status: 'PARSED'
        }
      });
    } else {
      candidate = await prisma.candidate.create({
        data: {
          job_id: SUNLIFE_JOB_ID,
          name: cData.name,
          email: cData.email,
          phone: cData.phone,
          location: cData.location,
          current_title: cData.current_title,
          current_company: cData.current_company,
          total_experience: cData.total_experience,
          summary: cData.summary,
          raw_text: cData.raw_text,
          parsing_status: 'PARSED',
          created_by: DEFAULT_USER_ID
        }
      });
    }

    // Insert CandidateApplication
    await prisma.candidateApplication.upsert({
      where: {
        job_id_candidate_id: {
          job_id: SUNLIFE_JOB_ID,
          candidate_id: candidate.id
        }
      },
      update: {
        stage: 'EVALUATED'
      },
      create: {
        job_id: SUNLIFE_JOB_ID,
        candidate_id: candidate.id,
        stage: 'EVALUATED'
      }
    });

    // Clean & Insert skills
    await prisma.candidateSkill.deleteMany({ where: { candidate_id: candidate.id } });
    for (const s of cData.skills) {
      await prisma.candidateSkill.create({
        data: {
          candidate_id: candidate.id,
          skill: s
        }
      });
    }

    // Clean & Insert experience
    await prisma.candidateExperience.deleteMany({ where: { candidate_id: candidate.id } });
    for (const exp of cData.experience) {
      await prisma.candidateExperience.create({
        data: {
          candidate_id: candidate.id,
          title: exp.title,
          company: exp.company,
          start_date: exp.startDate,
          end_date: exp.endDate,
          duration: exp.duration,
          description: exp.description
        }
      });
    }

    console.log(`Saved Candidate: ${cData.name} (${cData.location})`);
  }

  console.log('Seeding completed successfully!');
}

seedSunLifeBenchmark()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
