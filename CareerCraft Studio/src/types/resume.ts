export const SCHEMA_VERSION = "1.0.0";

export type TemplateId = 'classic' | 'modern' | 'minimal';

export type FontFamily = 'sans' | 'serif' | 'mono';

export type FontSize = 'compact' | 'normal' | 'comfortable';

export type SpacingDensity = 'compact' | 'normal' | 'relaxed';

export type SectionKey =
  | 'summary'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'achievements';

export interface ProfileData {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  linkedInUrl: string;
}

export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
  measurableAchievements: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  qualification: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  grade?: string;
  description?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string;
  contribution: string;
  link: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | '';
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  credentialId?: string;
}

export interface AchievementItem {
  id: string;
  award: string;
  competition: string;
  date: string;
  description: string;
}

export interface ResumeSettings {
  selectedTemplate: TemplateId;
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
  accentColor: string;
  fontFamily: FontFamily;
  fontSize: FontSize;
  spacing: SpacingDensity;
}

export interface ResumeData {
  schemaVersion: string;
  profile: ProfileData;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: SkillItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  settings: ResumeSettings;
}
