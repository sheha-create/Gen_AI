import React from 'react';
import { ResumeData, SectionKey } from '../../../types/resume';
import { Mail, Phone, MapPin, Globe, Linkedin, ExternalLink } from 'lucide-react';

interface TemplateProps {
  resume: ResumeData;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { profile, summary, experience, education, projects, skills, certifications, achievements, settings } = resume;
  const accentColor = settings.accentColor || '#1e293b';

  const isHidden = (key: SectionKey) => settings.hiddenSections.includes(key);

  // Group skills by category if available
  const skillCategories = React.useMemo(() => {
    const map = new Map<string, string[]>();
    skills.forEach(s => {
      const cat = s.category.trim() || 'General Skills';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s.name);
    });
    return Array.from(map.entries());
  }, [skills]);

  const renderSectionHeader = (title: string) => (
    <div className="pb-1 mb-2.5 border-b-2" style={{ borderColor: accentColor }}>
      <h2
        className="text-xs font-bold uppercase tracking-wider text-slate-800"
        style={{ color: accentColor }}
      >
        {title}
      </h2>
    </div>
  );

  const renderSection = (key: SectionKey) => {
    if (isHidden(key)) return null;

    switch (key) {
      case 'summary':
        if (!summary.trim()) return null;
        return (
          <section key="summary" className="mb-4 break-inside-avoid">
            {renderSectionHeader('Professional Summary')}
            <p className="text-[10pt] leading-relaxed text-slate-700 text-justify">
              {summary}
            </p>
          </section>
        );

      case 'experience':
        if (experience.length === 0) return null;
        return (
          <section key="experience" className="mb-4">
            {renderSectionHeader('Professional Experience')}
            <div className="space-y-3.5">
              {experience.map((exp) => (
                <div key={exp.id} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-[10.5pt] text-slate-900">
                      {exp.role || 'Role'}
                    </span>
                    <span className="text-[9pt] font-medium text-slate-600">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[9.5pt] text-slate-700 italic mb-1.5">
                    <span>{exp.organization}</span>
                    {exp.location && <span className="not-italic text-[9pt] text-slate-500">{exp.location}</span>}
                  </div>

                  {exp.responsibilities && (
                    <div className="text-[9.5pt] text-slate-700 pl-4 space-y-1">
                      {exp.responsibilities.split('\n').filter(Boolean).map((line, i) => (
                        <div key={i} className="flex items-start">
                          <span className="inline-block mr-2 text-slate-400 select-none">•</span>
                          <span className="flex-1 leading-snug">{line.trim().replace(/^[•\-\*]\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {exp.measurableAchievements && (
                    <div className="mt-1.5 pl-4 text-[9pt] text-slate-700 bg-slate-50/70 p-1.5 rounded border-l-2 border-slate-300">
                      <span className="font-semibold text-slate-900">Key Achievements: </span>
                      <span className="leading-snug">{exp.measurableAchievements}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'projects':
        if (projects.length === 0) return null;
        return (
          <section key="projects" className="mb-4">
            {renderSectionHeader('Projects & Technical Initiatives')}
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-[10pt] text-slate-900">
                      <span>{proj.name}</span>
                      {proj.link && (
                        <a
                          href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-[8pt] text-indigo-600 hover:underline"
                        >
                          <ExternalLink className="w-2.5 h-2.5 ml-0.5 inline" />
                        </a>
                      )}
                    </div>
                    {proj.technologies && (
                      <span className="text-[8.5pt] font-mono text-slate-600">
                        [{proj.technologies}]
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-[9.5pt] text-slate-700 leading-snug mt-0.5">
                      {proj.description}
                    </p>
                  )}
                  {proj.contribution && (
                    <p className="text-[9pt] text-slate-600 italic mt-0.5 pl-3 border-l-2 border-slate-200">
                      Contribution: {proj.contribution}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'education':
        if (education.length === 0) return null;
        return (
          <section key="education" className="mb-4">
            {renderSectionHeader('Education')}
            <div className="space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-[10pt] text-slate-900">
                      {edu.qualification}{edu.field ? `, ${edu.field}` : ''}
                    </span>
                    <span className="text-[9pt] text-slate-600">
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[9.5pt] text-slate-700">
                    <span className="italic">{edu.institution}</span>
                    {edu.location && <span className="text-[9pt] text-slate-500">{edu.location}</span>}
                  </div>
                  {edu.grade && (
                    <div className="text-[9pt] font-medium text-slate-600 mt-0.5">
                      {edu.grade}
                    </div>
                  )}
                  {edu.description && (
                    <p className="text-[9pt] text-slate-600 leading-snug mt-0.5">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'skills':
        if (skills.length === 0) return null;
        return (
          <section key="skills" className="mb-4 break-inside-avoid">
            {renderSectionHeader('Skills & Competencies')}
            <div className="space-y-1.5 text-[9.5pt]">
              {skillCategories.map(([cat, list]) => (
                <div key={cat} className="flex items-baseline">
                  <span className="font-semibold text-slate-900 w-36 shrink-0">{cat}:</span>
                  <span className="text-slate-700 flex-1">{list.join(' • ')}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case 'certifications':
        if (certifications.length === 0) return null;
        return (
          <section key="certifications" className="mb-4">
            {renderSectionHeader('Certifications & Credentials')}
            <div className="space-y-2">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-baseline justify-between break-inside-avoid">
                  <div>
                    <span className="font-semibold text-[9.5pt] text-slate-900">{cert.name}</span>
                    {cert.issuer && <span className="text-[9pt] text-slate-600"> — {cert.issuer}</span>}
                    {cert.credentialId && (
                      <span className="text-[8.5pt] text-slate-500 ml-2 font-mono">({cert.credentialId})</span>
                    )}
                  </div>
                  {cert.date && <span className="text-[9pt] text-slate-500 shrink-0">{cert.date}</span>}
                </div>
              ))}
            </div>
          </section>
        );

      case 'achievements':
        if (achievements.length === 0) return null;
        return (
          <section key="achievements" className="mb-4">
            {renderSectionHeader('Honors & Achievements')}
            <div className="space-y-2">
              {achievements.map((ach) => (
                <div key={ach.id} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between">
                    <span className="font-semibold text-[9.5pt] text-slate-900">{ach.award}</span>
                    {ach.date && <span className="text-[9pt] text-slate-500">{ach.date}</span>}
                  </div>
                  {ach.competition && (
                    <div className="text-[9pt] text-slate-600 italic">{ach.competition}</div>
                  )}
                  {ach.description && (
                    <p className="text-[9pt] text-slate-700 mt-0.5 leading-snug">{ach.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-white text-slate-800 p-8 md:p-12 font-serif min-h-[1123px] box-border">
      {/* Header */}
      <header className="text-center pb-4 mb-4 border-b border-slate-300">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 uppercase">
          {profile.fullName || 'Your Name'}
        </h1>
        {profile.professionalTitle && (
          <p className="text-[11pt] font-medium text-slate-700 mt-1 tracking-wide">
            {profile.professionalTitle}
          </p>
        )}

        {/* Contact info single horizontal line with dots */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9pt] text-slate-600 mt-2 font-sans">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {profile.location}
            </span>
          )}
          {profile.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              {profile.phone}
            </span>
          )}
          {profile.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a>
            </span>
          )}
          {profile.portfolioUrl && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {profile.portfolioUrl.replace(/^https?:\/\//, '')}
              </a>
            </span>
          )}
          {profile.linkedInUrl && (
            <span className="flex items-center gap-1">
              <Linkedin className="w-3 h-3 text-slate-400" />
              <a href={profile.linkedInUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {profile.linkedInUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'in/')}
              </a>
            </span>
          )}
        </div>
      </header>

      {/* Dynamic Ordered Sections */}
      <main className="space-y-4">
        {settings.sectionOrder.map(renderSection)}
      </main>
    </div>
  );
};
