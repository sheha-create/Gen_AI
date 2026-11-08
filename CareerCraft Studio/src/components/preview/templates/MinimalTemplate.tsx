import React from 'react';
import { ResumeData, SectionKey } from '../../../types/resume';
import { ExternalLink } from 'lucide-react';

interface TemplateProps {
  resume: ResumeData;
}

export const MinimalTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { profile, summary, experience, education, projects, skills, certifications, achievements, settings } = resume;
  const accentColor = settings.accentColor || '#0f172a';

  const isHidden = (key: SectionKey) => settings.hiddenSections.includes(key);

  const renderSection = (key: SectionKey) => {
    if (isHidden(key)) return null;

    switch (key) {
      case 'summary':
        if (!summary.trim()) return null;
        return (
          <div key="summary" className="grid grid-cols-12 gap-6 pt-5 pb-5 border-t border-slate-200/80 break-inside-avoid">
            <div className="col-span-3">
              <span className="text-[9pt] font-semibold tracking-widest text-slate-400 uppercase">
                About
              </span>
            </div>
            <div className="col-span-9">
              <p className="text-[10pt] leading-relaxed text-slate-700">
                {summary}
              </p>
            </div>
          </div>
        );

      case 'experience':
        if (experience.length === 0) return null;
        return (
          <div key="experience" className="grid grid-cols-12 gap-6 pt-5 pb-5 border-t border-slate-200/80">
            <div className="col-span-3">
              <span className="text-[9pt] font-semibold tracking-widest text-slate-400 uppercase">
                Experience
              </span>
            </div>
            <div className="col-span-9 space-y-5">
              {experience.map(exp => (
                <div key={exp.id} className="break-inside-avoid space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10pt] font-bold text-slate-900 tracking-tight">
                      {exp.role || 'Role'}
                    </span>
                    <span className="text-[8.5pt] font-mono text-slate-500">
                      {exp.startDate} — {exp.current ? 'Present' : exp.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="text-[9pt] text-slate-600 font-medium">
                    {exp.organization} {exp.location && <span className="text-slate-400 font-normal">/ {exp.location}</span>}
                  </div>

                  {exp.responsibilities && (
                    <div className="text-[9pt] text-slate-700 space-y-1 pt-1">
                      {exp.responsibilities.split('\n').filter(Boolean).map((line, i) => (
                        <div key={i} className="flex items-start">
                          <span className="text-slate-300 mr-2 select-none">—</span>
                          <span className="leading-relaxed">{line.trim().replace(/^[•\-\*]\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {exp.measurableAchievements && (
                    <div className="mt-1.5 text-[8.5pt] text-slate-600 pl-3 border-l-2" style={{ borderColor: accentColor }}>
                      <span className="font-semibold text-slate-800">Key Result: </span>
                      <span className="leading-snug">{exp.measurableAchievements}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'projects':
        if (projects.length === 0) return null;
        return (
          <div key="projects" className="grid grid-cols-12 gap-6 pt-5 pb-5 border-t border-slate-200/80">
            <div className="col-span-3">
              <span className="text-[9pt] font-semibold tracking-widest text-slate-400 uppercase">
                Projects
              </span>
            </div>
            <div className="col-span-9 space-y-4">
              {projects.map(proj => (
                <div key={proj.id} className="break-inside-avoid space-y-1">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[9.5pt] text-slate-900">
                      <span>{proj.name}</span>
                      {proj.link && (
                        <a
                          href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-slate-800"
                        >
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )}
                    </div>
                    {proj.technologies && (
                      <span className="text-[8pt] font-mono text-slate-500">
                        {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-[9pt] text-slate-600 leading-snug">
                      {proj.description}
                    </p>
                  )}
                  {proj.contribution && (
                    <p className="text-[8.5pt] text-slate-500 italic">
                      {proj.contribution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (education.length === 0) return null;
        return (
          <div key="education" className="grid grid-cols-12 gap-6 pt-5 pb-5 border-t border-slate-200/80">
            <div className="col-span-3">
              <span className="text-[9pt] font-semibold tracking-widest text-slate-400 uppercase">
                Education
              </span>
            </div>
            <div className="col-span-9 space-y-3">
              {education.map(edu => (
                <div key={edu.id} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-[9.5pt] text-slate-900">
                      {edu.qualification}{edu.field ? `, ${edu.field}` : ''}
                    </span>
                    <span className="text-[8.5pt] font-mono text-slate-500">
                      {edu.startDate} — {edu.current ? 'Present' : edu.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="text-[9pt] text-slate-600">
                    {edu.institution} {edu.location && <span className="text-slate-400">/ {edu.location}</span>}
                  </div>
                  {edu.grade && (
                    <div className="text-[8.5pt] text-slate-600 font-medium mt-0.5">{edu.grade}</div>
                  )}
                  {edu.description && (
                    <p className="text-[8.5pt] text-slate-500 mt-0.5 leading-snug">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills':
        if (skills.length === 0) return null;
        return (
          <div key="skills" className="grid grid-cols-12 gap-6 pt-5 pb-5 border-t border-slate-200/80 break-inside-avoid">
            <div className="col-span-3">
              <span className="text-[9pt] font-semibold tracking-widest text-slate-400 uppercase">
                Expertise
              </span>
            </div>
            <div className="col-span-9">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[9pt]">
                {skills.map(s => (
                  <span key={s.id} className="text-slate-700">
                    <span className="font-semibold text-slate-900">{s.name}</span>
                    {s.category && <span className="text-slate-400 text-[8pt] ml-1">({s.category})</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'certifications':
        if (certifications.length === 0) return null;
        return (
          <div key="certifications" className="grid grid-cols-12 gap-6 pt-5 pb-5 border-t border-slate-200/80">
            <div className="col-span-3">
              <span className="text-[9pt] font-semibold tracking-widest text-slate-400 uppercase">
                Credentials
              </span>
            </div>
            <div className="col-span-9 space-y-2">
              {certifications.map(cert => (
                <div key={cert.id} className="flex items-baseline justify-between break-inside-avoid">
                  <div>
                    <span className="font-semibold text-[9pt] text-slate-900">{cert.name}</span>
                    {cert.issuer && <span className="text-slate-500 text-[8.5pt]"> / {cert.issuer}</span>}
                  </div>
                  <div className="text-[8.5pt] font-mono text-slate-400 shrink-0">
                    {cert.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (achievements.length === 0) return null;
        return (
          <div key="achievements" className="grid grid-cols-12 gap-6 pt-5 pb-5 border-t border-slate-200/80">
            <div className="col-span-3">
              <span className="text-[9pt] font-semibold tracking-widest text-slate-400 uppercase">
                Honors
              </span>
            </div>
            <div className="col-span-9 space-y-2">
              {achievements.map(ach => (
                <div key={ach.id} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between font-semibold text-[9pt] text-slate-900">
                    <span>{ach.award}</span>
                    {ach.date && <span className="text-[8.5pt] font-mono text-slate-400 font-normal">{ach.date}</span>}
                  </div>
                  {ach.competition && (
                    <div className="text-[8.5pt] text-slate-500">{ach.competition}</div>
                  )}
                  {ach.description && (
                    <p className="text-[8.5pt] text-slate-600 mt-0.5">{ach.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white text-slate-800 p-8 md:p-14 font-sans min-h-[1123px] box-border">
      {/* Editorial Header */}
      <header className="pb-6">
        <div className="flex items-baseline gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <h1 className="text-3xl font-light tracking-tight text-slate-900">
            {profile.fullName || 'Your Name'}
          </h1>
        </div>

        {profile.professionalTitle && (
          <p className="text-[11pt] tracking-widest uppercase font-medium text-slate-500 mt-1 pl-5.5">
            {profile.professionalTitle}
          </p>
        )}

        {/* Minimalist Contact Line */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[8.5pt] text-slate-500 mt-4 pl-5.5 font-mono">
          {profile.location && <span>{profile.location}</span>}
          {profile.phone && <span>{profile.phone}</span>}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="text-slate-700 hover:underline">
              {profile.email}
            </a>
          )}
          {profile.portfolioUrl && (
            <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline">
              {profile.portfolioUrl.replace(/^https?:\/\//, '')}
            </a>
          )}
          {profile.linkedInUrl && (
            <a href={profile.linkedInUrl} target="_blank" rel="noreferrer" className="text-slate-700 hover:underline">
              {profile.linkedInUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'in/')}
            </a>
          )}
        </div>
      </header>

      {/* Asymmetric Swiss Sections */}
      <div>
        {settings.sectionOrder.map(renderSection)}
      </div>
    </div>
  );
};
