import { ResumeData } from '../types/resume';

const COMMON_STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves',
  // Common job posting noise
  'role', 'responsibilities', 'qualifications', 'requirements', 'must', 'have', 'experience', 'years', 'working',
  'candidate', 'team', 'work', 'job', 'description', 'opportunity', 'skills', 'ability', 'preferred', 'plus', 'equal'
]);

export interface KeywordMatch {
  keyword: string;
  foundInResume: boolean;
  frequencyInJob: number;
}

export interface MatchAnalysis {
  matchPercentage: number;
  matchedCount: number;
  totalKeywordsCount: number;
  matchedKeywords: KeywordMatch[];
  missingKeywords: KeywordMatch[];
  resumeTextLength: number;
}

export function extractAllResumeText(resume: ResumeData): string {
  const parts: string[] = [];

  parts.push(resume.profile.fullName);
  parts.push(resume.profile.professionalTitle);
  parts.push(resume.summary);

  resume.experience.forEach(exp => {
    parts.push(exp.role, exp.organization, exp.responsibilities, exp.measurableAchievements);
  });

  resume.education.forEach(edu => {
    parts.push(edu.qualification, edu.field, edu.institution, edu.description || '');
  });

  resume.projects.forEach(proj => {
    parts.push(proj.name, proj.description, proj.technologies, proj.contribution);
  });

  resume.skills.forEach(skill => {
    parts.push(skill.name, skill.category);
  });

  resume.certifications.forEach(cert => {
    parts.push(cert.name, cert.issuer);
  });

  resume.achievements.forEach(ach => {
    parts.push(ach.award, ach.competition, ach.description);
  });

  return parts.filter(Boolean).join(' ').toLowerCase();
}

export function analyzeJobDescriptionMatch(jobText: string, resume: ResumeData): MatchAnalysis {
  if (!jobText.trim()) {
    return {
      matchPercentage: 0,
      matchedCount: 0,
      totalKeywordsCount: 0,
      matchedKeywords: [],
      missingKeywords: [],
      resumeTextLength: 0
    };
  }

  const resumeCorpus = extractAllResumeText(resume);

  // Tokenize job description, extracting words 3+ characters long
  const rawWords = jobText
    .toLowerCase()
    .replace(/[^a-z0-9+#.-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 3 && !COMMON_STOP_WORDS.has(word));

  // Count frequencies
  const freqMap = new Map<string, number>();
  for (const word of rawWords) {
    freqMap.set(word, (freqMap.get(word) || 0) + 1);
  }

  // Sort by frequency and take the top salient keywords
  const sorted = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30); // Top 30 salient keywords

  const matchedKeywords: KeywordMatch[] = [];
  const missingKeywords: KeywordMatch[] = [];

  for (const [kw, freq] of sorted) {
    // Check whole word match or substring in resume
    const regex = new RegExp(`\\b${kw.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\b`, 'i');
    const found = regex.test(resumeCorpus);

    const item: KeywordMatch = {
      keyword: kw,
      foundInResume: found,
      frequencyInJob: freq
    };

    if (found) {
      matchedKeywords.push(item);
    } else {
      missingKeywords.push(item);
    }
  }

  const total = matchedKeywords.length + missingKeywords.length;
  const matchPercentage = total > 0 ? Math.round((matchedKeywords.length / total) * 100) : 0;

  return {
    matchPercentage,
    matchedCount: matchedKeywords.length,
    totalKeywordsCount: total,
    matchedKeywords,
    missingKeywords,
    resumeTextLength: resumeCorpus.split(/\s+/).length
  };
}
