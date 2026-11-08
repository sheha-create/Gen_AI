import { ResumeData, SCHEMA_VERSION, SectionKey } from '../types/resume';

export const SECTION_METADATA: Record<SectionKey, { label: string; icon: string; description: string }> = {
  summary: {
    label: 'Professional Summary',
    icon: 'FileText',
    description: 'High-impact overview of your expertise and career direction.'
  },
  experience: {
    label: 'Work Experience',
    icon: 'Briefcase',
    description: 'Roles, key initiatives, and measurable achievements.'
  },
  projects: {
    label: 'Featured Projects',
    icon: 'FolderGit2',
    description: 'Technical projects, products, and open-source contributions.'
  },
  education: {
    label: 'Education',
    icon: 'GraduationCap',
    description: 'Academic credentials, degrees, and notable coursework.'
  },
  skills: {
    label: 'Skills & Proficiencies',
    icon: 'Wrench',
    description: 'Technical competencies, tools, and categorized proficiencies.'
  },
  certifications: {
    label: 'Certifications',
    icon: 'Award',
    description: 'Industry credentials, licenses, and verified accreditations.'
  },
  achievements: {
    label: 'Honors & Achievements',
    icon: 'Trophy',
    description: 'Hackathons, academic honors, or company awards.'
  }
};

export const COLOR_PRESETS = [
  { name: 'Indigo Modern', value: '#4f46e5' },
  { name: 'Slate Professional', value: '#1e293b' },
  { name: 'Teal Contemporary', value: '#0d9488' },
  { name: 'Navy Executive', value: '#1e3a8a' },
  { name: 'Emerald Forest', value: '#059669' },
  { name: 'Crimson Bold', value: '#b91c1c' },
  { name: 'Bronze Earth', value: '#92400e' },
];

export const EMPTY_RESUME: ResumeData = {
  schemaVersion: SCHEMA_VERSION,
  profile: {
    fullName: '',
    professionalTitle: '',
    email: '',
    phone: '',
    location: '',
    portfolioUrl: '',
    linkedInUrl: ''
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  settings: {
    selectedTemplate: 'modern',
    sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements'],
    hiddenSections: [],
    accentColor: '#4f46e5',
    fontFamily: 'sans',
    fontSize: 'normal',
    spacing: 'normal'
  }
};

export const SAMPLE_RESUME: ResumeData = {
  schemaVersion: SCHEMA_VERSION,
  profile: {
    fullName: 'Alex Morgan',
    professionalTitle: 'Senior Full Stack Software Engineer',
    email: 'alex.morgan.dev@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    portfolioUrl: 'https://alexmorgan.dev',
    linkedInUrl: 'https://linkedin.com/in/alexmorgandev'
  },
  summary: 'Versatile Full Stack Engineer with 6+ years of experience building resilient cloud-native architectures, distributed web services, and high-performance user interfaces. Specialized in React, TypeScript, Node.js, and Kubernetes. Proven track record of spearheading architectural migrations that improved page latency by 42% and reduced cloud infrastructure spending by $180,000 annually.',
  experience: [
    {
      id: 'exp-1',
      organization: 'Vanguard Cloud Technologies',
      role: 'Senior Software Engineer - Team Lead',
      location: 'San Francisco, CA',
      startDate: '2022-03',
      endDate: '',
      current: true,
      responsibilities: 'Architected and deployed a multi-tenant observability dashboard supporting over 45,000 daily active enterprise users.\nLed a cross-functional squad of 6 engineers across sprint planning, technical design reviews, and automated CI/CD pipeline deployments.\nEngineered modular micro-frontends using React 18, Webpack Module Federation, and Tailwind CSS.',
      measurableAchievements: 'Reduced Time-to-Interactive (TTI) by 42% and achieved 99.98% uptime across all production cloud workloads.\nMentored 4 junior engineers, with 2 advancing to mid-level roles within 14 months.'
    },
    {
      id: 'exp-2',
      organization: 'Nexus Financial Systems',
      role: 'Full Stack Engineer',
      location: 'Austin, TX',
      startDate: '2019-06',
      endDate: '2022-02',
      current: false,
      responsibilities: 'Designed transaction reconciliation REST and GraphQL APIs handling $12M+ in daily payments with idempotency guarantees.\nImplemented automated regression testing suites with Jest and Playwright, lifting test coverage from 61% to 94%.\nCollaborated with product managers and security auditors to attain SOC-2 Type II compliance.',
      measurableAchievements: 'Eliminated duplicate billing incidents completely through robust Redis distributed lock mechanisms.\nOptimized PostgreSQL slow queries to cut average 95th percentile response times from 340ms to 68ms.'
    },
    {
      id: 'exp-3',
      organization: 'PixelCraft Interactive',
      role: 'Associate Web Developer',
      location: 'Seattle, WA',
      startDate: '2018-01',
      endDate: '2019-05',
      current: false,
      responsibilities: 'Built responsive client web applications, internal tools, and CMS integrations with TypeScript and Vue.js.\nRefactored legacy vanilla JavaScript codebases into modular ES6 modules with automated unit tests.',
      measurableAchievements: 'Delivered 11 client websites ahead of schedule with 100% Google Lighthouse accessibility scores.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Washington',
      qualification: 'Bachelor of Science (B.S.)',
      field: 'Computer Science & Software Engineering',
      location: 'Seattle, WA',
      startDate: '2014-09',
      endDate: '2018-06',
      current: false,
      grade: 'GPA: 3.84 / 4.0 (Dean\'s List)',
      description: 'Coursework: Distributed Systems, Operating Systems, Database Management Systems, Advanced Algorithms, Computer Networks.'
    }
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'StreamPulse Distributed Queue',
      description: 'An open-source, lightweight distributed message queue built with Go and Raft consensus, designed for edge IoT device synchronization.',
      technologies: 'Go, Raft Consensus, gRPC, Docker, Prometheus',
      contribution: 'Authored replication engine, leader election algorithms, and comprehensive benchmark test suite with over 1,200 GitHub stars.',
      link: 'https://github.com/alexm/streampulse'
    },
    {
      id: 'proj-2',
      name: 'Hyperion Analytics Platform',
      description: 'Interactive telemetry dashboard and anomaly detection engine with real-time WebSocket streaming and Canvas-based charts.',
      technologies: 'React, TypeScript, WebGL, Node.js, TimescaleDB',
      contribution: 'Designed client-side rendering pipeline capable of visualizing 100,000 data points at 60 FPS smoothly.',
      link: 'https://hyperion-analytics.demo'
    }
  ],
  skills: [
    { id: 'sk-1', name: 'TypeScript / JavaScript', category: 'Languages', proficiency: 'Expert' },
    { id: 'sk-2', name: 'React & Next.js', category: 'Frontend', proficiency: 'Expert' },
    { id: 'sk-3', name: 'Node.js & Express', category: 'Backend', proficiency: 'Advanced' },
    { id: 'sk-4', name: 'Go (Golang)', category: 'Languages', proficiency: 'Intermediate' },
    { id: 'sk-5', name: 'PostgreSQL & Redis', category: 'Databases', proficiency: 'Advanced' },
    { id: 'sk-6', name: 'Kubernetes & Docker', category: 'Cloud & DevOps', proficiency: 'Advanced' },
    { id: 'sk-7', name: 'GraphQL & REST APIs', category: 'Backend', proficiency: 'Expert' },
    { id: 'sk-8', name: 'CI/CD & GitHub Actions', category: 'Cloud & DevOps', proficiency: 'Advanced' },
    { id: 'sk-9', name: 'Tailwind CSS', category: 'Frontend', proficiency: 'Expert' },
    { id: 'sk-10', name: 'System Design & TDD', category: 'Practices', proficiency: 'Advanced' }
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services (AWS)',
      date: '2023-04',
      credentialId: 'AWS-SAA-8849201',
      credentialUrl: 'https://aws.amazon.com/verification'
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      date: '2022-11',
      credentialId: 'CKA-2200-9817',
      credentialUrl: 'https://www.cncf.io/certification/cka/'
    }
  ],
  achievements: [
    {
      id: 'ach-1',
      award: 'Global Hackathon 1st Place Winner',
      competition: 'TechCrunch Disrupt Hackathon',
      date: '2021-09',
      description: 'Selected 1st out of 340+ international teams for designing a real-time decentralized disaster relief supply tracker.'
    },
    {
      id: 'ach-2',
      award: 'Quarterly Engineering Excellence Award',
      competition: 'Vanguard Cloud Technologies',
      date: '2023-08',
      description: 'Recognized for orchestrating zero-downtime database migration of 40M+ customer records.'
    }
  ],
  settings: {
    selectedTemplate: 'modern',
    sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills', 'certifications', 'achievements'],
    hiddenSections: [],
    accentColor: '#4f46e5',
    fontFamily: 'sans',
    fontSize: 'normal',
    spacing: 'normal'
  }
};
