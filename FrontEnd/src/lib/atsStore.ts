// In-House Tasknera ATS Unified Store (Local State + LocalStorage Synchronization)

export type CandidateStageStatus = 
  | 'SOURCED'
  | 'SCREENED'
  | 'SHORTLISTED'
  | 'PENDING_TL_REVIEW'
  | 'TL_APPROVED'
  | 'OVERRIDDEN'
  | 'REJECTED';

export interface ScreeningInfo {
  currentCtc?: string;
  expectedCtc?: string;
  noticePeriod?: string;
  location?: string;
  relocationReady?: 'Yes' | 'No' | 'Hybrid only';
  notes?: string;
  screenedBy?: string;
  screenedAt?: string;
}

export interface CandidateItem {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  location: string;
  exp: string;
  companyCount: number;
  currentCompany?: string;
  match: number;
  calibratedScore?: number;
  scoreOverrideReason?: string;
  decision: 'SUBMIT' | 'REVIEW' | 'DO NOT SUBMIT';
  stageStatus: CandidateStageStatus;
  jobId: string;
  jobTitle: string;
  client: string;
  assignedRecruiter: string;
  skills: string[];
  mandatoryMatch: string; // e.g. "5/5"
  mandatoryFailed: boolean;
  screeningInfo?: ScreeningInfo;
  flagReason?: string;
  submittedToTlAt?: string;
  tlReviewedBy?: string;
  tlReviewedAt?: string;
  evidenceSnippets?: { requirement: string; evidence: string; status: 'MET' | 'PARTIAL' | 'MISSING' }[];
  uploadedAt: string;
}

export interface JobItem {
  id: string;
  title: string;
  client: string;
  location: string;
  mode: 'Hybrid' | 'Remote' | 'Onsite';
  salary: string;
  candidates: number;
  topScore: number;
  status: 'Active' | 'Draft' | 'Closed';
  assignedRecruiter: string;
  pod: string;
  createdAtDaysAgo: number;
  mandatoryRequirementsCount: number;
  totalRequirementsCount: number;
  description?: string;
  requirements?: { id: string; requirement: string; category: string; mandatory: boolean; weight: number }[];
}

export interface AuditEvent {
  id: string;
  action: 'JOB_CREATED' | 'RESUMES_UPLOADED' | 'SCREENING_SAVED' | 'SENT_TO_TL_REVIEW' | 'SCORE_OVERRIDE_APPROVED' | 'TL_APPROVED' | 'REQUISITION_REASSIGNED' | 'USER_ROLE_UPDATED';
  user: string;
  userRole: string;
  target: string;
  detail: string;
  time: string;
  timestamp: number;
}

export interface DailyTimeLog {
  day: string; // 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'
  date: string;
  hoursSpent: number; // e.g. 6.4
  resumesReviewedCount: number; // e.g. 38
  resumesTimeHours: number; // e.g. 3.2
  screeningsCount: number; // e.g. 8
  screeningTimeHours: number; // e.g. 2.1
  jdsUploadedCount: number; // e.g. 1
  jdTimeHours: number; // e.g. 1.1
}

export interface RecruiterMetric {
  id: string;
  name: string;
  email: string;
  role: 'RECRUITER_MEMBER' | 'TEAM_LEAD' | 'ADMIN';
  team: string;
  activeJobs: number;
  jdsUploaded: number;
  resumesSeen: number;
  screenedThisWeek: number;
  tlApprovedCount: number;
  avgMatchScore: number;
  avgTimePerScreen: string;
  avgTimePerResume: string;
  todayHoursSpent: number;
  totalHoursThisWeek: number;
  dailyTimeLogs: DailyTimeLog[];
  capacity: 'Optimal' | 'Normal' | 'Available' | 'High Load';
  lastActive: string;
  recentActivity?: string[];
}

const INITIAL_JOBS: JobItem[] = [
  {
    id: 'jd-1',
    title: 'SAP CO Lead Consultant',
    client: 'TechCorp Industries',
    location: 'New York, NY',
    mode: 'Hybrid',
    salary: '₹28 - 36 LPA',
    candidates: 42,
    topScore: 94,
    status: 'Active',
    assignedRecruiter: 'Sarah Mitchell',
    pod: 'SAP & Enterprise Practice',
    createdAtDaysAgo: 12,
    mandatoryRequirementsCount: 4,
    totalRequirementsCount: 7,
    description: 'Senior SAP CO functional consultant with deep hands-on expertise in S/4HANA migration, Product Costing (CO-PC), and Material Ledger implementation.',
    requirements: [
      { id: 'r1', requirement: 'Minimum 6+ years SAP CO / Controlling implementation', category: 'Experience', mandatory: true, weight: 1.5 },
      { id: 'r2', requirement: 'Hands-on S/4HANA 1909 or later migration projects', category: 'Technical Skill', mandatory: true, weight: 1.3 },
      { id: 'r3', requirement: 'Product Costing (CO-PC) and Material Ledger configuration', category: 'Functional Domain', mandatory: true, weight: 1.2 },
      { id: 'r4', requirement: 'SAP FICO integration with SD & MM modules', category: 'Integration', mandatory: true, weight: 1.0 },
      { id: 'r5', requirement: 'SAP Certified Application Associate or Professional', category: 'Certification', mandatory: false, weight: 0.8 },
    ]
  },
  {
    id: 'jd-2',
    title: 'Lead S/4HANA Architect',
    client: 'Global Logistics Inc',
    location: 'Chicago, IL',
    mode: 'Remote',
    salary: '₹38 - 48 LPA',
    candidates: 28,
    topScore: 88,
    status: 'Active',
    assignedRecruiter: 'Sarah Mitchell',
    pod: 'SAP & Enterprise Practice',
    createdAtDaysAgo: 32, // Aging job > 25 days
    mandatoryRequirementsCount: 5,
    totalRequirementsCount: 8,
    description: 'Enterprise solution architect to lead global supply chain modernization on S/4HANA Cloud.',
  },
  {
    id: 'jd-3',
    title: 'Senior Backend Engineer (Go/Node)',
    client: 'TaskNera Enterprise Core',
    location: 'Bangalore / Remote',
    mode: 'Remote',
    salary: '₹24 - 32 LPA',
    candidates: 65,
    topScore: 91,
    status: 'Active',
    assignedRecruiter: 'Priya Sharma',
    pod: 'Cloud & Engineering Pod',
    createdAtDaysAgo: 8,
    mandatoryRequirementsCount: 4,
    totalRequirementsCount: 6,
    description: 'High-scale distributed systems engineer specializing in Golang, Node.js microservices, and PostgreSQL.',
  },
  {
    id: 'jd-4',
    title: 'Lead DevOps & Cloud SRE',
    client: 'CloudScale Fintech',
    location: 'Austin, TX / Remote',
    mode: 'Hybrid',
    salary: '₹30 - 42 LPA',
    candidates: 34,
    topScore: 83,
    status: 'Active',
    assignedRecruiter: 'David Park',
    pod: 'Cloud & Engineering Pod',
    createdAtDaysAgo: 29, // Aging job > 25 days
    mandatoryRequirementsCount: 5,
    totalRequirementsCount: 7,
    description: 'Kubernetes, AWS Multi-region terraform architectures, and high-reliability SRE practices.',
  }
];

const INITIAL_CANDIDATES: CandidateItem[] = [
  {
    id: 'cand-1',
    name: 'Michael Chen',
    role: 'Senior SAP Consultant',
    email: 'michael.c@example.com',
    phone: '+1 (555) 234-8901',
    location: 'San Francisco, CA',
    exp: '7.5 yrs',
    companyCount: 2,
    currentCompany: 'Accenture Enterprise',
    match: 76,
    calibratedScore: undefined,
    decision: 'REVIEW',
    stageStatus: 'PENDING_TL_REVIEW',
    jobId: 'jd-1',
    jobTitle: 'SAP CO Lead Consultant',
    client: 'TechCorp Industries',
    assignedRecruiter: 'Sarah Mitchell',
    skills: ['SAP CO', 'S/4HANA', 'Material Ledger', 'CO-PC', 'Cost Center Accounting'],
    mandatoryMatch: '4/4',
    mandatoryFailed: false,
    screeningInfo: {
      currentCtc: '₹26 LPA',
      expectedCtc: '₹32 LPA',
      noticePeriod: '30 Days (Serving)',
      location: 'San Francisco (Open to Hybrid NY)',
      relocationReady: 'Yes',
      notes: 'Strong technical communicator. Led 2 S/4HANA migration projects. Needs TL signoff for client domain alignment.',
      screenedBy: 'Sarah Mitchell',
      screenedAt: '25 min ago'
    },
    flagReason: 'Strong S/4HANA & CO-PC depth; candidate is located on West Coast for East Coast hybrid requisition.',
    submittedToTlAt: '25 min ago',
    evidenceSnippets: [
      { requirement: 'Minimum 6+ years SAP CO', evidence: '7.5 years continuous SAP CO/FI configuration at Accenture & Deloitte', status: 'MET' },
      { requirement: 'S/4HANA migration experience', evidence: 'Architected S/4HANA 1909 conversion for manufacturing conglomerate', status: 'MET' },
      { requirement: 'Product Costing (CO-PC)', evidence: 'Configured standard costing, variance calculation, and WIP valuation', status: 'MET' },
    ],
    uploadedAt: 'Today, 10:15 AM'
  },
  {
    id: 'cand-2',
    name: 'Sarah Jenkins',
    role: 'SAP CO & FICO Specialist',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 345-6789',
    location: 'New York, NY',
    exp: '8.2 yrs',
    companyCount: 3,
    currentCompany: 'Infosys Consulting',
    match: 94,
    decision: 'SUBMIT',
    stageStatus: 'SCREENED',
    jobId: 'jd-1',
    jobTitle: 'SAP CO Lead Consultant',
    client: 'TechCorp Industries',
    assignedRecruiter: 'Sarah Mitchell',
    skills: ['SAP CO', 'S/4HANA 2020', 'CO-PC', 'Material Ledger', 'Profitability Analysis (CO-PA)'],
    mandatoryMatch: '4/4',
    mandatoryFailed: false,
    screeningInfo: {
      currentCtc: '₹28 LPA',
      expectedCtc: '₹34 LPA',
      noticePeriod: '15 Days',
      location: 'Jersey City, NJ (Immediate NY Commute)',
      relocationReady: 'Yes',
      notes: 'Excellent candidate! Direct 100% fit for S/4HANA and Product Costing requirements.',
      screenedBy: 'Sarah Mitchell',
      screenedAt: '1 hour ago'
    },
    evidenceSnippets: [
      { requirement: 'Minimum 6+ years SAP CO', evidence: '8+ years dedicated SAP CO consultant in global client engagements', status: 'MET' },
      { requirement: 'S/4HANA migration experience', evidence: 'Led greenfield S/4HANA 2020 deployment for Fortune 500 retailer', status: 'MET' },
    ],
    uploadedAt: 'Today, 09:30 AM'
  },
  {
    id: 'cand-3',
    name: 'James Wilson',
    role: 'Cloud & DevOps Engineer',
    email: 'james.w@example.com',
    phone: '+1 (555) 456-7890',
    location: 'Austin, TX',
    exp: '6.0 yrs',
    companyCount: 2,
    currentCompany: 'CloudNative Corp',
    match: 79,
    decision: 'REVIEW',
    stageStatus: 'PENDING_TL_REVIEW',
    jobId: 'jd-4',
    jobTitle: 'Lead DevOps & Cloud SRE',
    client: 'CloudScale Fintech',
    assignedRecruiter: 'Priya Sharma',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD', 'Prometheus'],
    mandatoryMatch: '4/5',
    mandatoryFailed: false,
    screeningInfo: {
      currentCtc: '₹28 LPA',
      expectedCtc: '₹35 LPA',
      noticePeriod: 'Immediate',
      location: 'Austin, TX',
      relocationReady: 'Yes',
      notes: 'Extensive Kubernetes & Terraform experience. AWS multi-region failover certification is pending confirmation from client.',
      screenedBy: 'Priya Sharma',
      screenedAt: '2 hours ago'
    },
    flagReason: 'Meets 4/5 mandatory rules; AWS multi-region failover certification is pending confirmation.',
    submittedToTlAt: '2 hours ago',
    uploadedAt: 'Yesterday'
  },
  {
    id: 'cand-4',
    name: 'Marcus Vance',
    role: 'Staff Distributed Systems Engineer',
    email: 'marcus.v@example.com',
    phone: '+1 (555) 567-8901',
    location: 'Remote, US',
    exp: '9.0 yrs',
    companyCount: 3,
    currentCompany: 'Stripe Ecosystem Partner',
    match: 91,
    decision: 'SUBMIT',
    stageStatus: 'TL_APPROVED',
    jobId: 'jd-3',
    jobTitle: 'Senior Backend Engineer (Go/Node)',
    client: 'TaskNera Enterprise Core',
    assignedRecruiter: 'Priya Sharma',
    skills: ['Golang', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'gRPC'],
    mandatoryMatch: '4/4',
    mandatoryFailed: false,
    screeningInfo: {
      currentCtc: '₹30 LPA',
      expectedCtc: '₹38 LPA',
      noticePeriod: '30 Days',
      location: 'Remote',
      relocationReady: 'Yes',
      notes: 'Top tier engineer with high throughput system architecture experience. Pre-approved by TL.',
      screenedBy: 'Priya Sharma',
      screenedAt: 'Yesterday'
    },
    tlReviewedBy: 'Alex Morales (Team Lead)',
    tlReviewedAt: 'Yesterday',
    uploadedAt: '2 days ago'
  },
  {
    id: 'cand-5',
    name: 'Jennifer Lopez',
    role: 'Junior SAP Functional Analyst',
    email: 'jennifer.l@example.com',
    location: 'Chicago, IL',
    exp: '2.0 yrs',
    companyCount: 1,
    currentCompany: 'Midwest Logistics',
    match: 52,
    decision: 'DO NOT SUBMIT',
    stageStatus: 'REJECTED',
    jobId: 'jd-1',
    jobTitle: 'SAP CO Lead Consultant',
    client: 'TechCorp Industries',
    assignedRecruiter: 'Sarah Mitchell',
    skills: ['SAP CO Basics', 'Excel', 'User Training'],
    mandatoryMatch: '1/4',
    mandatoryFailed: true,
    uploadedAt: '3 days ago'
  }
];

const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud-1',
    action: 'SENT_TO_TL_REVIEW',
    user: 'Sarah Mitchell (Recruiter)',
    userRole: 'RECRUITER_MEMBER',
    target: 'Michael Chen (SAP CO Consultant)',
    detail: 'Candidate screened (Current CTC: ₹26L, ECTC: ₹32L, Notice: 30D). Flagged for TL QA signoff.',
    time: '25 min ago',
    timestamp: Date.now() - 25 * 60 * 1000,
  },
  {
    id: 'aud-2',
    action: 'SCORE_OVERRIDE_APPROVED',
    user: 'Alex Morales (Team Lead)',
    userRole: 'TEAM_LEAD',
    target: 'Marcus Vance (Senior Backend)',
    detail: 'Score calibrated from 84% to 91% (Stripe ecosystem backend volume qualifies distributed criteria).',
    time: '2 hours ago',
    timestamp: Date.now() - 2 * 3600 * 1000,
  },
  {
    id: 'aud-3',
    action: 'RESUMES_UPLOADED',
    user: 'Priya Sharma (Recruiter)',
    userRole: 'RECRUITER_MEMBER',
    target: 'Job JD-3: Senior Backend Engineer',
    detail: 'Batch uploaded 32 resumes; AI parser evaluated and ranked candidate pool in 4.8s.',
    time: '3 hours ago',
    timestamp: Date.now() - 3 * 3600 * 1000,
  },
  {
    id: 'aud-4',
    action: 'JOB_CREATED',
    user: 'John Reynolds (Team Lead)',
    userRole: 'TEAM_LEAD',
    target: 'Job JD-1: SAP CO Lead Consultant',
    detail: 'Created new requisition with 4 mandatory and 3 preferred criteria for TechCorp Industries.',
    time: 'Yesterday',
    timestamp: Date.now() - 24 * 3600 * 1000,
  },
  {
    id: 'aud-5',
    action: 'REQUISITION_REASSIGNED',
    user: 'John Reynolds (Team Lead)',
    userRole: 'TEAM_LEAD',
    target: 'Job JD-2: Lead S/4HANA Architect',
    detail: 'Reallocated requisition workload to Sarah Mitchell.',
    time: '2 days ago',
    timestamp: Date.now() - 48 * 3600 * 1000,
  }
];

const INITIAL_RECRUITERS: RecruiterMetric[] = [
  {
    id: 'rec-1',
    name: 'Sarah Mitchell',
    email: 'sarah.m@tasknera.com',
    role: 'RECRUITER_MEMBER',
    team: 'SAP & Enterprise Practice',
    activeJobs: 4,
    jdsUploaded: 6,
    resumesSeen: 184,
    screenedThisWeek: 48,
    tlApprovedCount: 19,
    avgMatchScore: 88,
    avgTimePerScreen: '3.1 min',
    avgTimePerResume: '1.8 min',
    todayHoursSpent: 6.4,
    totalHoursThisWeek: 32.8,
    dailyTimeLogs: [
      { day: 'Mon', date: 'Aug 28', hoursSpent: 6.8, resumesReviewedCount: 38, resumesTimeHours: 3.4, screeningsCount: 10, screeningTimeHours: 2.2, jdsUploadedCount: 1, jdTimeHours: 1.2 },
      { day: 'Tue', date: 'Aug 29', hoursSpent: 7.2, resumesReviewedCount: 42, resumesTimeHours: 3.8, screeningsCount: 12, screeningTimeHours: 2.4, jdsUploadedCount: 2, jdTimeHours: 1.0 },
      { day: 'Wed', date: 'Aug 30', hoursSpent: 6.5, resumesReviewedCount: 36, resumesTimeHours: 3.2, screeningsCount: 9, screeningTimeHours: 2.1, jdsUploadedCount: 1, jdTimeHours: 1.2 },
      { day: 'Thu', date: 'Aug 31', hoursSpent: 5.9, resumesReviewedCount: 34, resumesTimeHours: 3.0, screeningsCount: 8, screeningTimeHours: 1.9, jdsUploadedCount: 1, jdTimeHours: 1.0 },
      { day: 'Fri', date: 'Sep 01', hoursSpent: 6.4, resumesReviewedCount: 34, resumesTimeHours: 3.1, screeningsCount: 9, screeningTimeHours: 2.1, jdsUploadedCount: 1, jdTimeHours: 1.2 },
    ],
    capacity: 'Normal',
    lastActive: 'Active now',
    recentActivity: [
      'Uploaded 32 resumes for SAP CO Lead Consultant (Took 1.2 hrs)',
      'Screened Michael Chen (76% fit - 18 min call)',
      'Shortlisted Sarah Jenkins (94% fit)',
    ],
  },
  {
    id: 'rec-2',
    name: 'Priya Sharma',
    email: 'priya.s@tasknera.com',
    role: 'RECRUITER_MEMBER',
    team: 'Cloud & Engineering Pod',
    activeJobs: 5,
    jdsUploaded: 8,
    resumesSeen: 215,
    screenedThisWeek: 56,
    tlApprovedCount: 24,
    avgMatchScore: 86,
    avgTimePerScreen: '2.8 min',
    avgTimePerResume: '1.5 min',
    todayHoursSpent: 7.1,
    totalHoursThisWeek: 35.6,
    dailyTimeLogs: [
      { day: 'Mon', date: 'Aug 28', hoursSpent: 7.4, resumesReviewedCount: 46, resumesTimeHours: 3.9, screeningsCount: 12, screeningTimeHours: 2.3, jdsUploadedCount: 2, jdTimeHours: 1.2 },
      { day: 'Tue', date: 'Aug 29', hoursSpent: 7.0, resumesReviewedCount: 42, resumesTimeHours: 3.6, screeningsCount: 11, screeningTimeHours: 2.2, jdsUploadedCount: 1, jdTimeHours: 1.2 },
      { day: 'Wed', date: 'Aug 30', hoursSpent: 7.2, resumesReviewedCount: 45, resumesTimeHours: 3.8, screeningsCount: 11, screeningTimeHours: 2.2, jdsUploadedCount: 2, jdTimeHours: 1.2 },
      { day: 'Thu', date: 'Aug 31', hoursSpent: 6.9, resumesReviewedCount: 40, resumesTimeHours: 3.4, screeningsCount: 11, screeningTimeHours: 2.2, jdsUploadedCount: 1, jdTimeHours: 1.3 },
      { day: 'Fri', date: 'Sep 01', hoursSpent: 7.1, resumesReviewedCount: 42, resumesTimeHours: 3.6, screeningsCount: 11, screeningTimeHours: 2.3, jdsUploadedCount: 2, jdTimeHours: 1.2 },
    ],
    capacity: 'Optimal',
    lastActive: '15 min ago',
    recentActivity: [
      'Created JD: Senior Backend Engineer (Go/Node) (Took 45 min)',
      'Parsed & evaluated 45 CVs with AI matcher (Took 1.8 hrs)',
      'Screened Marcus Vance (91% fit - 22 min call)',
    ],
  },
  {
    id: 'rec-3',
    name: 'David Park',
    email: 'david.p@tasknera.com',
    role: 'RECRUITER_MEMBER',
    team: 'Cloud & Engineering Pod',
    activeJobs: 3,
    jdsUploaded: 4,
    resumesSeen: 128,
    screenedThisWeek: 32,
    tlApprovedCount: 14,
    avgMatchScore: 82,
    avgTimePerScreen: '3.6 min',
    avgTimePerResume: '2.2 min',
    todayHoursSpent: 5.4,
    totalHoursThisWeek: 26.2,
    dailyTimeLogs: [
      { day: 'Mon', date: 'Aug 28', hoursSpent: 5.2, resumesReviewedCount: 24, resumesTimeHours: 2.6, screeningsCount: 6, screeningTimeHours: 1.6, jdsUploadedCount: 1, jdTimeHours: 1.0 },
      { day: 'Tue', date: 'Aug 29', hoursSpent: 5.6, resumesReviewedCount: 28, resumesTimeHours: 2.8, screeningsCount: 7, screeningTimeHours: 1.8, jdsUploadedCount: 1, jdTimeHours: 1.0 },
      { day: 'Wed', date: 'Aug 30', hoursSpent: 5.0, resumesReviewedCount: 25, resumesTimeHours: 2.5, screeningsCount: 6, screeningTimeHours: 1.5, jdsUploadedCount: 1, jdTimeHours: 1.0 },
      { day: 'Thu', date: 'Aug 31', hoursSpent: 5.0, resumesReviewedCount: 25, resumesTimeHours: 2.5, screeningsCount: 6, screeningTimeHours: 1.5, jdsUploadedCount: 0, jdTimeHours: 1.0 },
      { day: 'Fri', date: 'Sep 01', hoursSpent: 5.4, resumesReviewedCount: 26, resumesTimeHours: 2.7, screeningsCount: 7, screeningTimeHours: 1.7, jdsUploadedCount: 1, jdTimeHours: 1.0 },
    ],
    capacity: 'Available',
    lastActive: '1 hour ago',
    recentActivity: [
      'Uploaded 20 resumes for DevOps SRE (Took 1.1 hrs)',
      'Screened James Wilson (79% fit - 15 min call)',
    ],
  },
  {
    id: 'rec-4',
    name: 'John Reynolds',
    email: 'john.r@tasknera.com',
    role: 'TEAM_LEAD',
    team: 'SAP & Enterprise Practice',
    activeJobs: 6,
    jdsUploaded: 9,
    resumesSeen: 240,
    screenedThisWeek: 42,
    tlApprovedCount: 38,
    avgMatchScore: 91,
    avgTimePerScreen: '2.4 min',
    avgTimePerResume: '1.4 min',
    todayHoursSpent: 7.5,
    totalHoursThisWeek: 37.0,
    dailyTimeLogs: [
      { day: 'Mon', date: 'Aug 28', hoursSpent: 7.8, resumesReviewedCount: 52, resumesTimeHours: 4.0, screeningsCount: 9, screeningTimeHours: 1.8, jdsUploadedCount: 2, jdTimeHours: 2.0 },
      { day: 'Tue', date: 'Aug 29', hoursSpent: 7.5, resumesReviewedCount: 48, resumesTimeHours: 3.8, screeningsCount: 9, screeningTimeHours: 1.8, jdsUploadedCount: 2, jdTimeHours: 1.9 },
      { day: 'Wed', date: 'Aug 30', hoursSpent: 7.2, resumesReviewedCount: 46, resumesTimeHours: 3.6, screeningsCount: 8, screeningTimeHours: 1.7, jdsUploadedCount: 2, jdTimeHours: 1.9 },
      { day: 'Thu', date: 'Aug 31', hoursSpent: 7.0, resumesReviewedCount: 46, resumesTimeHours: 3.6, screeningsCount: 8, screeningTimeHours: 1.7, jdsUploadedCount: 1, jdTimeHours: 1.7 },
      { day: 'Fri', date: 'Sep 01', hoursSpent: 7.5, resumesReviewedCount: 48, resumesTimeHours: 3.8, screeningsCount: 8, screeningTimeHours: 1.7, jdsUploadedCount: 2, jdTimeHours: 2.0 },
    ],
    capacity: 'Optimal',
    lastActive: 'Active now',
    recentActivity: [
      'Created JD: SAP CO Lead Consultant (Took 1.2 hrs)',
      'Approved 5 candidate submissions for client interview',
      'Reassigned S/4HANA requisition to Sarah',
    ],
  },
  {
    id: 'rec-5',
    name: 'Alex Morales',
    email: 'alex.m@tasknera.com',
    role: 'TEAM_LEAD',
    team: 'Cloud & Engineering Pod',
    activeJobs: 5,
    jdsUploaded: 7,
    resumesSeen: 195,
    screenedThisWeek: 39,
    tlApprovedCount: 41,
    avgMatchScore: 89,
    avgTimePerScreen: '2.5 min',
    avgTimePerResume: '1.6 min',
    todayHoursSpent: 7.0,
    totalHoursThisWeek: 34.5,
    dailyTimeLogs: [
      { day: 'Mon', date: 'Aug 28', hoursSpent: 7.0, resumesReviewedCount: 40, resumesTimeHours: 3.4, screeningsCount: 8, screeningTimeHours: 1.8, jdsUploadedCount: 1, jdTimeHours: 1.8 },
      { day: 'Tue', date: 'Aug 29', hoursSpent: 7.2, resumesReviewedCount: 42, resumesTimeHours: 3.6, screeningsCount: 8, screeningTimeHours: 1.8, jdsUploadedCount: 2, jdTimeHours: 1.8 },
      { day: 'Wed', date: 'Aug 30', hoursSpent: 6.8, resumesReviewedCount: 38, resumesTimeHours: 3.2, screeningsCount: 7, screeningTimeHours: 1.6, jdsUploadedCount: 1, jdTimeHours: 2.0 },
      { day: 'Thu', date: 'Aug 31', hoursSpent: 6.5, resumesReviewedCount: 36, resumesTimeHours: 3.0, screeningsCount: 8, screeningTimeHours: 1.8, jdsUploadedCount: 1, jdTimeHours: 1.7 },
      { day: 'Fri', date: 'Sep 01', hoursSpent: 7.0, resumesReviewedCount: 39, resumesTimeHours: 3.3, screeningsCount: 8, screeningTimeHours: 1.8, jdsUploadedCount: 2, jdTimeHours: 1.9 },
    ],
    capacity: 'Optimal',
    lastActive: 'Active now',
    recentActivity: [
      'Calibrated score for Marcus Vance to 91%',
      'Reviewed 12 borderline AI match candidates (Took 1.1 hrs)',
    ],
  }
];

class ATSStore {
  private jobs: JobItem[] = [];
  private candidates: CandidateItem[] = [];
  private auditEvents: AuditEvent[] = [];
  private recruiters: RecruiterMetric[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    } else {
      this.jobs = INITIAL_JOBS;
      this.candidates = INITIAL_CANDIDATES;
      this.auditEvents = INITIAL_AUDIT_EVENTS;
      this.recruiters = INITIAL_RECRUITERS;
    }
  }

  private loadFromStorage() {
    try {
      const storedJobs = localStorage.getItem('tasknera_ats_jobs');
      const storedCandidates = localStorage.getItem('tasknera_ats_candidates');
      const storedAudits = localStorage.getItem('tasknera_ats_audits');
      const storedRecruiters = localStorage.getItem('tasknera_ats_recruiters');

      this.jobs = storedJobs ? JSON.parse(storedJobs) : INITIAL_JOBS;
      this.candidates = storedCandidates ? JSON.parse(storedCandidates) : INITIAL_CANDIDATES;
      this.auditEvents = storedAudits ? JSON.parse(storedAudits) : INITIAL_AUDIT_EVENTS;
      this.recruiters = storedRecruiters ? JSON.parse(storedRecruiters) : INITIAL_RECRUITERS;
    } catch {
      this.jobs = INITIAL_JOBS;
      this.candidates = INITIAL_CANDIDATES;
      this.auditEvents = INITIAL_AUDIT_EVENTS;
      this.recruiters = INITIAL_RECRUITERS;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('tasknera_ats_jobs', JSON.stringify(this.jobs));
      localStorage.setItem('tasknera_ats_candidates', JSON.stringify(this.candidates));
      localStorage.setItem('tasknera_ats_audits', JSON.stringify(this.auditEvents));
      localStorage.setItem('tasknera_ats_recruiters', JSON.stringify(this.recruiters));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.notify();
  }

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // --- Getters ---
  public getJobs(): JobItem[] {
    return this.jobs;
  }

  public getJob(id: string): JobItem | undefined {
    return this.jobs.find(j => j.id === id);
  }

  public getCandidates(jobId?: string): CandidateItem[] {
    if (jobId) {
      return this.candidates.filter(c => c.jobId === jobId);
    }
    return this.candidates;
  }

  public getCandidate(id: string): CandidateItem | undefined {
    return this.candidates.find(c => c.id === id);
  }

  public getTLReviewQueue(): CandidateItem[] {
    return this.candidates.filter(c => c.stageStatus === 'PENDING_TL_REVIEW');
  }

  public getAuditEvents(): AuditEvent[] {
    return this.auditEvents;
  }

  public getRecruiters(): RecruiterMetric[] {
    return this.recruiters;
  }

  // --- Admin Analytics Helpers ---
  public getAdminOverviewStats() {
    const totalJds = this.jobs.length;
    const totalResumesSeen = this.recruiters.reduce((sum, r) => sum + (r.resumesSeen || 0), 0) + this.candidates.length;
    const totalJdsUploaded = this.recruiters.reduce((sum, r) => sum + (r.jdsUploaded || 0), 0) + this.jobs.length;
    const totalScreened = this.recruiters.reduce((sum, r) => sum + (r.screenedThisWeek || 0), 0);
    const totalShortlisted = this.recruiters.reduce((sum, r) => sum + (r.tlApprovedCount || 0), 0);
    const activeRecruiters = this.recruiters.length;
    const agingJdsCount = this.jobs.filter(j => j.createdAtDaysAgo >= 25).length;

    return {
      totalJds,
      totalJdsUploaded,
      totalResumesSeen,
      totalScreened,
      totalShortlisted,
      activeRecruiters,
      agingJdsCount,
      conversionRate: totalScreened > 0 ? Math.round((totalShortlisted / totalScreened) * 100) : 48,
    };
  }

  public getWeeklyEvaluationTrends() {
    return [
      { day: 'Mon', resumesEvaluated: 142, jdsUploaded: 4, screenings: 38 },
      { day: 'Tue', resumesEvaluated: 185, jdsUploaded: 6, screenings: 46 },
      { day: 'Wed', resumesEvaluated: 210, jdsUploaded: 5, screenings: 52 },
      { day: 'Thu', resumesEvaluated: 198, jdsUploaded: 7, screenings: 49 },
      { day: 'Fri', resumesEvaluated: 235, jdsUploaded: 8, screenings: 61 },
      { day: 'Sat', resumesEvaluated: 92, jdsUploaded: 2, screenings: 18 },
      { day: 'Sun', resumesEvaluated: 45, jdsUploaded: 1, screenings: 8 },
    ];
  }

  public getPodAnalytics() {
    return [
      { name: 'SAP & Enterprise Practice', jds: 6, resumes: 424, screenings: 90, shortlists: 57, avgScore: 89, lead: 'John Reynolds' },
      { name: 'Cloud & Engineering Pod', jds: 8, resumes: 538, screenings: 127, shortlists: 79, avgScore: 87, lead: 'Alex Morales' },
      { name: 'Finance & Operations TA', jds: 3, resumes: 160, screenings: 35, shortlists: 18, avgScore: 84, lead: 'David Park' },
    ];
  }

  public getScoreTierDistribution() {
    return [
      { name: 'High Fit (≥85%)', value: 45, color: '#10B981', label: 'Direct Submit' },
      { name: 'Moderate Fit (65-84%)', value: 38, color: '#F59E0B', label: 'Screening Review' },
      { name: 'Low Fit (<65%)', value: 17, color: '#EF4444', label: 'Rejected' },
    ];
  }

  // --- Mutations ---
  public addJob(job: Omit<JobItem, 'id' | 'createdAtDaysAgo'>, creatorName: string, creatorRole: string): JobItem {
    const newJob: JobItem = {
      ...job,
      id: `jd-${Date.now()}`,
      createdAtDaysAgo: 0,
    };
    this.jobs = [newJob, ...this.jobs];

    // Increment recruiter JD upload count
    const rec = this.recruiters.find(r => r.name.toLowerCase() === creatorName.toLowerCase() || creatorName.includes(r.name));
    if (rec) {
      rec.jdsUploaded = (rec.jdsUploaded || 0) + 1;
      rec.activeJobs = (rec.activeJobs || 0) + 1;
    }

    this.logAudit({
      action: 'JOB_CREATED',
      user: `${creatorName} (${creatorRole === 'ADMIN' ? 'Admin' : creatorRole === 'TEAM_LEAD' ? 'Team Lead' : 'TA Member'})`,
      userRole: creatorRole,
      target: `Job ${newJob.title}`,
      detail: `Created & uploaded new requisition for ${newJob.client} with ${newJob.mandatoryRequirementsCount} mandatory requirements.`
    });
    this.saveToStorage();
    return newJob;
  }

  public reassignJob(jobId: string, newRecruiterName: string, leadName: string) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;
    const prevRecruiter = job.assignedRecruiter;
    job.assignedRecruiter = newRecruiterName;
    this.logAudit({
      action: 'REQUISITION_REASSIGNED',
      user: `${leadName} (Team Lead)`,
      userRole: 'TEAM_LEAD',
      target: `Job ${job.title}`,
      detail: `Reassigned requisition from ${prevRecruiter} to ${newRecruiterName}.`
    });
    this.saveToStorage();
  }

  public addCandidateBatch(candidates: CandidateItem[], uploaderName: string, uploaderRole: string, jobTitle: string) {
    this.candidates = [...candidates, ...this.candidates];

    // Increment recruiter resumes seen count
    const rec = this.recruiters.find(r => r.name.toLowerCase() === uploaderName.toLowerCase() || uploaderName.includes(r.name));
    if (rec) {
      rec.resumesSeen = (rec.resumesSeen || 0) + candidates.length;
    }

    this.logAudit({
      action: 'RESUMES_UPLOADED',
      user: `${uploaderName} (${uploaderRole === 'ADMIN' ? 'Admin' : uploaderRole === 'TEAM_LEAD' ? 'Team Lead' : 'TA Member'})`,
      userRole: uploaderRole,
      target: `Job: ${jobTitle}`,
      detail: `Uploaded & parsed ${candidates.length} candidate resumes with AI Match Scoring.`
    });
    this.saveToStorage();
  }

  public saveScreeningInfo(candidateId: string, screening: ScreeningInfo, recruiterName: string, newStatus?: CandidateStageStatus) {
    const cand = this.candidates.find(c => c.id === candidateId);
    if (!cand) return;
    cand.screeningInfo = {
      ...screening,
      screenedBy: recruiterName,
      screenedAt: 'Just now'
    };
    if (newStatus) {
      cand.stageStatus = newStatus;
      if (newStatus === 'SHORTLISTED') {
        cand.decision = 'SUBMIT';
      } else if (newStatus === 'REJECTED') {
        cand.decision = 'DO NOT SUBMIT';
      }
    } else if (cand.stageStatus === 'SOURCED') {
      cand.stageStatus = 'SCREENED';
    }

    // Update recruiter screened count
    const rec = this.recruiters.find(r => r.name.toLowerCase() === recruiterName.toLowerCase() || recruiterName.includes(r.name));
    if (rec) {
      rec.screenedThisWeek = (rec.screenedThisWeek || 0) + 1;
      if (newStatus === 'SHORTLISTED') {
        rec.tlApprovedCount = (rec.tlApprovedCount || 0) + 1;
      }
    }

    this.logAudit({
      action: 'SCREENING_SAVED',
      user: `${recruiterName} (TA Member)`,
      userRole: 'USER',
      target: `Candidate: ${cand.name}`,
      detail: `Logged screening call (Current: ${screening.currentCtc || 'N/A'}, Expected: ${screening.expectedCtc || 'N/A'}, Notice: ${screening.noticePeriod || 'N/A'}${newStatus ? ` -> Marked as ${newStatus}` : ''}).`
    });
    this.saveToStorage();
  }

  public shortlistCandidate(candidateId: string, recruiterName: string) {
    const cand = this.candidates.find(c => c.id === candidateId);
    if (!cand) return;
    cand.stageStatus = 'SHORTLISTED';
    cand.decision = 'SUBMIT';

    const rec = this.recruiters.find(r => r.name.toLowerCase() === recruiterName.toLowerCase() || recruiterName.includes(r.name));
    if (rec) {
      rec.tlApprovedCount = (rec.tlApprovedCount || 0) + 1;
    }

    this.logAudit({
      action: 'TL_APPROVED',
      user: `${recruiterName} (TA Member)`,
      userRole: 'USER',
      target: `Candidate: ${cand.name} (${cand.jobTitle})`,
      detail: `Candidate approved & shortlisted directly by ${recruiterName}.`
    });
    this.saveToStorage();
  }

  public rejectCandidate(candidateId: string, recruiterName: string, reason?: string) {
    const cand = this.candidates.find(c => c.id === candidateId);
    if (!cand) return;
    cand.stageStatus = 'REJECTED';
    cand.decision = 'DO NOT SUBMIT';
    this.logAudit({
      action: 'SCORE_OVERRIDE_APPROVED',
      user: `${recruiterName} (TA Member)`,
      userRole: 'USER',
      target: `Candidate: ${cand.name} (${cand.jobTitle})`,
      detail: `Candidate rejected by ${recruiterName}.${reason ? ` Reason: ${reason}` : ''}`
    });
    this.saveToStorage();
  }

  public submitForTLReview(candidateId: string, flagReason: string, recruiterName: string) {
    const cand = this.candidates.find(c => c.id === candidateId);
    if (!cand) return;
    cand.stageStatus = 'PENDING_TL_REVIEW';
    cand.flagReason = flagReason || 'Submitted by recruiter for QA verification.';
    cand.submittedToTlAt = 'Just now';
    this.logAudit({
      action: 'SENT_TO_TL_REVIEW',
      user: `${recruiterName} (TA Member)`,
      userRole: 'USER',
      target: `Candidate: ${cand.name} (${cand.jobTitle})`,
      detail: `Flagged for QA review: ${cand.flagReason}`
    });
    this.saveToStorage();
  }

  public approveTL(candidateId: string, tlName: string) {
    const cand = this.candidates.find(c => c.id === candidateId);
    if (!cand) return;
    cand.stageStatus = 'TL_APPROVED';
    cand.decision = 'SUBMIT';
    cand.tlReviewedBy = tlName;
    cand.tlReviewedAt = 'Just now';
    this.logAudit({
      action: 'TL_APPROVED',
      user: `${tlName} (Team Lead)`,
      userRole: 'TEAM_LEAD',
      target: `Candidate: ${cand.name}`,
      detail: `QA Profile verified & approved for Client/Interview submission.`
    });
    this.saveToStorage();
  }

  public calibrateScoreTL(candidateId: string, newScore: number, reason: string, tlName: string) {
    const cand = this.candidates.find(c => c.id === candidateId);
    if (!cand) return;
    const oldScore = cand.calibratedScore || cand.match;
    cand.calibratedScore = newScore;
    cand.scoreOverrideReason = reason;
    cand.stageStatus = 'OVERRIDDEN';
    cand.decision = newScore >= 75 ? 'SUBMIT' : 'REVIEW';
    cand.tlReviewedBy = tlName;
    cand.tlReviewedAt = 'Just now';
    this.logAudit({
      action: 'SCORE_OVERRIDE_APPROVED',
      user: `${tlName} (Team Lead)`,
      userRole: 'TEAM_LEAD',
      target: `Candidate: ${cand.name} (${cand.jobTitle})`,
      detail: `Calibrated match score from ${oldScore}% to ${newScore}%. Reason: ${reason}`
    });
    this.saveToStorage();
  }

  public rejectTL(candidateId: string, reason: string, tlName: string) {
    const cand = this.candidates.find(c => c.id === candidateId);
    if (!cand) return;
    cand.stageStatus = 'REJECTED';
    cand.decision = 'DO NOT SUBMIT';
    cand.scoreOverrideReason = reason;
    cand.tlReviewedBy = tlName;
    cand.tlReviewedAt = 'Just now';
    this.saveToStorage();
  }

  private logAudit(event: Omit<AuditEvent, 'id' | 'time' | 'timestamp'>) {
    const newAudit: AuditEvent = {
      ...event,
      id: `aud-${Date.now()}`,
      time: 'Just now',
      timestamp: Date.now(),
    };
    this.auditEvents = [newAudit, ...this.auditEvents.slice(0, 49)];
  }
}

export const atsStore = new ATSStore();
