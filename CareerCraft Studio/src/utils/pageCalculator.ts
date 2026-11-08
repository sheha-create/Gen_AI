import { ResumeData } from '../types/resume';

export interface CompletenessItem {
  id: string;
  label: string;
  weight: number;
  completed: boolean;
  tip: string;
}

export interface CompletenessReport {
  score: number;
  items: CompletenessItem[];
  missingCount: number;
}

export function calculateResumeCompleteness(resume: ResumeData): CompletenessReport {
  const items: CompletenessItem[] = [
    {
      id: 'name',
      label: 'Full Name',
      weight: 15,
      completed: Boolean(resume.profile.fullName.trim()),
      tip: 'Add your full professional name so recruiters can identify you.'
    },
    {
      id: 'title',
      label: 'Professional Title',
      weight: 10,
      completed: Boolean(resume.profile.professionalTitle.trim()),
      tip: 'Specify your target role or current specialization (e.g., Senior Frontend Engineer).'
    },
    {
      id: 'contact',
      label: 'Contact Details (Email & Phone)',
      weight: 15,
      completed: Boolean(resume.profile.email.trim() && resume.profile.phone.trim()),
      tip: 'Provide both email and phone for hiring managers to schedule interviews.'
    },
    {
      id: 'location',
      label: 'Location / Region',
      weight: 5,
      completed: Boolean(resume.profile.location.trim()),
      tip: 'Include your city/state or "Remote" to clarify your work eligibility and timezone.'
    },
    {
      id: 'summary',
      label: 'Professional Summary',
      weight: 15,
      completed: Boolean(resume.summary.trim() && resume.summary.trim().length >= 40),
      tip: 'Write a concise 2-4 sentence summary highlighting your core strengths and impact.'
    },
    {
      id: 'experience',
      label: 'Work Experience',
      weight: 20,
      completed: resume.experience.length > 0 && resume.experience.some(e => e.organization && e.role),
      tip: 'List at least one work or internship experience with measurable outcomes.'
    },
    {
      id: 'education',
      label: 'Education History',
      weight: 10,
      completed: resume.education.length > 0 && resume.education.some(e => e.institution && e.qualification),
      tip: 'Add your degree, university/college, or current academic program.'
    },
    {
      id: 'skills',
      label: 'Skills & Proficiencies',
      weight: 10,
      completed: resume.skills.length >= 3,
      tip: 'Add at least 3 relevant technical or core competencies.'
    }
  ];

  let earned = 0;
  let totalWeight = 0;
  let missingCount = 0;

  for (const item of items) {
    totalWeight += item.weight;
    if (item.completed) {
      earned += item.weight;
    } else {
      missingCount++;
    }
  }

  const score = Math.round((earned / totalWeight) * 100);

  return {
    score,
    items,
    missingCount
  };
}

// 1 A4 page at 96 DPI is approx 1123px height.
export const A4_PAGE_HEIGHT_PX = 1123;

export interface PageEstimate {
  estimatedPages: number;
  contentHeightPx: number;
  hasOverflowRisk: boolean;
  statusMessage: string;
}

export function estimatePageOverflow(elementHeightPx: number): PageEstimate {
  if (elementHeightPx <= 0) {
    return {
      estimatedPages: 1,
      contentHeightPx: 0,
      hasOverflowRisk: false,
      statusMessage: 'Estimated 1 Page'
    };
  }

  // Margin buffer per page ~40px
  const effectivePageHeight = A4_PAGE_HEIGHT_PX;
  const rawPages = elementHeightPx / effectivePageHeight;
  const estimatedPages = Math.max(1, Math.ceil(rawPages));

  // Risk if content is within 50px of crossing to the next page
  const remainder = elementHeightPx % effectivePageHeight;
  const hasOverflowRisk = remainder > (effectivePageHeight - 90) && remainder < (effectivePageHeight - 10);

  let statusMessage = `${estimatedPages} Page${estimatedPages > 1 ? 's' : ''}`;
  if (hasOverflowRisk) {
    statusMessage += ' (Spill warning: close to next page boundary)';
  }

  return {
    estimatedPages,
    contentHeightPx: elementHeightPx,
    hasOverflowRisk,
    statusMessage
  };
}
