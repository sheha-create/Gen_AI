import { ResumeData } from '../types/resume';
import { validateResumeData } from './validation';

export function exportResumeToJson(resume: ResumeData, filename?: string): void {
  const dataStr = JSON.stringify(resume, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const safeName = (resume.profile.fullName.trim() || 'Resume')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  link.href = url;
  link.download = filename || `${safeName}_careercraft_resume.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importResumeFromJson(file: File): Promise<ResumeData> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json') && file.type !== 'application/json' && file.type !== '') {
      reject(new Error('Invalid file type. Please upload a .json file.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateResumeData(parsed);

        if (!result.isValid || !result.data) {
          reject(new Error(result.error || 'Failed to validate resume data.'));
          return;
        }

        resolve(result.data);
      } catch (err) {
        reject(new Error('Could not parse file as JSON. Please verify the file is not corrupted.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the selected file.'));
    };

    reader.readAsText(file);
  });
}
