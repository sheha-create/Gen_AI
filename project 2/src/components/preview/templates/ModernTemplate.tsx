import React from 'react';
import { ResumeData, SectionKey } from '../../../types/resume';
import { Mail, Phone, MapPin, Globe, Linkedin, ExternalLink, Award, GraduationCap, Briefcase, FolderGit2, Trophy, Wrench, FileText } from 'lucide-react';

interface TemplateProps {
  resume: ResumeData;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ resume }) => {
  const { profile, summary, experience, education, projects, skills, certifications, achievements, settings } = resume;
  const accentColor = settings.accentColor || '#4f46e5';

  const isHidden = (key: SectionKey) => settings.hiddenSections.includes(key);

  // Group skills by category
  const skillsByCategory = React.useMemo(() => {
    const map = new Map<string, typeof skills>();
    skills.forEach(s => {
      const cat = s.category.trim() || 'Technical Skills';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    });
    return Array.from(map.entries());
  }, [skills]);

  // Sidebar sections vs Main sections classification based on user order
  const sidebarSectionKeys: SectionKey[] = ['skills', 'education', 'certifications'];
  const mainSectionKeys: SectionKey[] = ['summary', 'experience', 'projects', 'achievements'];

  const sidebarOrdered = settings.sectionOrder.filter(k => sidebarSectionKeys.includes(k) && !isHidden(k));
  const mainOrdered = settings.sectionOrder.filter(k => mainSectionKeys.includes(k) && !isHidden(k));

  const renderSectionHeader = (title: string, Icon: React.ElementType) => (
    <div className="flex items-center gap-2 pb-1.5 mb-3 border-b-2" style={{ borderColor: `${accentColor}33` }}>
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
        style={{ backgroundColor: accentColor }}
      >
        <Icon className="w-3 h-3" />
      </div>
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
        {title}
      </h2>
    </div>
  );

  const renderSidebarItem = (key: SectionKey) => {
    switch (key) {
      case 'skills':
        if (skills.length === 0) return null;
        return (
          <div key="skills" className="mb-6 break-inside-avoid">
            {renderSectionHeader('Key Competencies', Wrench)}
            <div className="space-y-3">
              {skillsByCategory.map(([cat, list]) => (
                <div key={cat}>
                  <div className="text-[8.5pt] font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                    {cat}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map(s => (
                      <span
                        key={s.id}
                        className="inline-flex items-center px-2 py-0.5 rounded text-[8pt] font-medium transition-colors"
                        style={{
                          backgroundColor: `${accentColor}12`,
                          color: accentColor,
                          border: `1px solid ${accentColor}25`
                        }}
                      >
                        {s.name}
                        {s.proficiency && (
                          <span className="ml-1 text-[7pt] opacity-75">
                            • {s.proficiency}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        if (education.length === 0) return null;
        return (
          <div key="education" className="mb-6">
            {renderSectionHeader('Education', GraduationCap)}
            <div className="space-y-3">
              {education.map(edu => (
                <div key={edu.id} className="break-inside-avoid">
                  <div className="font-bold text-[9.5pt] text-slate-900 leading-snug">
                    {edu.qualification}
                  </div>
                  {edu.field && (
                    <div className="text-[9pt] font-medium text-slate-700">
                      {edu.field}
                    </div>
                  )}
                  <div className="text-[8.5pt] text-slate-600 mt-0.5">
                    {edu.institution}
                  </div>
                  <div className="text-[8pt] font-medium text-slate-500 mt-0.5">
                    {edu.startDate} – {edu.current ? 'Present' : edu.endDate || 'Present'}
                  </div>
                  {edu.grade && (
                    <div className="text-[8pt] font-semibold text-slate-700 mt-1">
                      {edu.grade}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'certifications':
        if (certifications.length === 0) return null;
        return (
          <div key="certifications" className="mb-6">
            {renderSectionHeader('Certifications', Award)}
            <div className="space-y-2.5">
              {certifications.map(cert => (
                <div key={cert.id} className="break-inside-avoid">
                  <div className="font-semibold text-[9pt] text-slate-900 leading-tight">
                    {cert.name}
                  </div>
                  {cert.issuer && (
                    <div className="text-[8pt] text-slate-600">{cert.issuer}</div>
                  )}
                  <div className="flex items-center justify-between text-[7.5pt] text-slate-500 mt-0.5">
                    {cert.date && <span>Issued: {cert.date}</span>}
                    {cert.credentialId && <span className="font-mono">ID: {cert.credentialId}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderMainItem = (key: SectionKey) => {
    switch (key) {
      case 'summary':
        if (!summary.trim()) return null;
        return (
          <div key="summary" className="mb-5 break-inside-avoid">
            {renderSectionHeader('Executive Summary', FileText)}
            <p className="text-[9.5pt] leading-relaxed text-slate-700 bg-slate-50/80 p-3 rounded-lg border-l-4" style={{ borderColor: accentColor }}>
              {summary}
            </p>
          </div>
        );

      case 'experience':
        if (experience.length === 0) return null;
        return (
          <div key="experience" className="mb-5">
            {renderSectionHeader('Experience & Career Track', Briefcase)}
            <div className="space-y-4">
              {experience.map(exp => (
                <div key={exp.id} className="break-inside-avoid relative pl-3.5 border-l-2 border-slate-200">
                  {/* Timeline bullet dot */}
                  <div
                    className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-[10pt] text-slate-900">
                      {exp.role || 'Role'}
                    </span>
                    <span className="text-[8.5pt] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate || 'Present'}
                    </span>
                  </div>
                  <div className="text-[9pt] font-medium text-slate-700 mb-1">
                    {exp.organization} {exp.location && <span className="text-slate-500 font-normal">• {exp.location}</span>}
                  </div>

                  {exp.responsibilities && (
                    <div className="text-[9pt] text-slate-600 space-y-1">
                      {exp.responsibilities.split('\n').filter(Boolean).map((line, i) => (
                        <div key={i} className="flex items-start">
                          <span className="text-slate-400 mr-1.5">•</span>
                          <span className="leading-snug">{line.trim().replace(/^[•\-\*]\s*/, '')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {exp.measurableAchievements && (
                    <div className="mt-2 text-[8.5pt] p-2 rounded bg-indigo-50/50 border border-indigo-100 text-slate-800">
                      <span className="font-semibold" style={{ color: accentColor }}>Impact & Results: </span>
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
          <div key="projects" className="mb-5">
            {renderSectionHeader('Key Projects & Portfolio', FolderGit2)}
            <div className="space-y-3">
              {projects.map(proj => (
                <div key={proj.id} className="break-inside-avoid p-2.5 rounded-lg border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-[9.5pt] text-slate-900">
                      <span>{proj.name}</span>
                      {proj.link && (
                        <a
                          href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <ExternalLink className="w-3 h-3 inline" />
                        </a>
                      )}
                    </div>
                    {proj.technologies && (
                      <span className="text-[7.5pt] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {proj.technologies}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-[8.5pt] text-slate-600 leading-snug">
                      {proj.description}
                    </p>
                  )}
                  {proj.contribution && (
                    <div className="text-[8pt] text-slate-700 font-medium mt-1">
                      <span className="text-slate-500">Key contribution: </span>{proj.contribution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'achievements':
        if (achievements.length === 0) return null;
        return (
          <div key="achievements" className="mb-5">
            {renderSectionHeader('Honors & Recognitions', Trophy)}
            <div className="space-y-2">
              {achievements.map(ach => (
                <div key={ach.id} className="break-inside-avoid p-2 rounded bg-amber-50/40 border border-amber-200/50">
                  <div className="flex items-baseline justify-between font-semibold text-[9pt] text-slate-900">
                    <span>{ach.award}</span>
                    {ach.date && <span className="text-[8pt] text-slate-500 font-normal">{ach.date}</span>}
                  </div>
                  {ach.competition && (
                    <div className="text-[8pt] text-slate-600 italic">{ach.competition}</div>
                  )}
                  {ach.description && (
                    <p className="text-[8pt] text-slate-700 mt-0.5 leading-snug">{ach.description}</p>
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
    <div className="w-full bg-white text-slate-800 font-sans min-h-[1123px] box-border">
      {/* Top Banner Header with Prominent Name */}
      <header className="px-8 pt-8 pb-5 border-b border-slate-200 bg-slate-900 text-white relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: accentColor }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase">
              {profile.fullName || 'Your Name'}
            </h1>
            {profile.professionalTitle && (
              <p className="text-[11pt] font-medium tracking-wide mt-0.5" style={{ color: '#e0e7ff' }}>
                {profile.professionalTitle}
              </p>
            )}
          </div>

          {/* Quick contact pills */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[8.5pt] text-slate-300">
            {profile.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>{profile.phone}</span>
              </div>
            )}
            {profile.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <a href={`mailto:${profile.email}`} className="hover:text-white underline">{profile.email}</a>
              </div>
            )}
            {profile.portfolioUrl && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                  {profile.portfolioUrl.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {profile.linkedInUrl && (
              <div className="flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-indigo-400" />
                <a href={profile.linkedInUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                  {profile.linkedInUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'in/')}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Structured 2-Column Layout */}
      <div className="grid grid-cols-12 min-h-[calc(1123px-120px)]">
        {/* Left Sidebar (35% width, 4 columns) */}
        <aside className="col-span-4 bg-slate-50/70 p-6 border-r border-slate-200 space-y-2">
          {sidebarOrdered.map(renderSidebarItem)}
        </aside>

        {/* Right Main Column (65% width, 8 columns) */}
        <main className="col-span-8 p-6 space-y-2">
          {mainOrdered.map(renderMainItem)}
        </main>
      </div>
    </div>
  );
};
