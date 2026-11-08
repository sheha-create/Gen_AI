import React, { useState, useEffect } from 'react';
import { ResumeData, SectionKey, ResumeSettings } from './types/resume';
import { SAMPLE_RESUME, EMPTY_RESUME, SECTION_METADATA } from './data/sampleData';
import { exportResumeToJson, importResumeFromJson } from './utils/exportImport';
import { Header } from './components/Header';
import { ResumePreview } from './components/preview/ResumePreview';
import { ProfileEditor } from './components/editor/ProfileEditor';
import { SummaryEditor } from './components/editor/SummaryEditor';
import { ExperienceEditor } from './components/editor/ExperienceEditor';
import { EducationEditor } from './components/editor/EducationEditor';
import { ProjectsEditor } from './components/editor/ProjectsEditor';
import { SkillsEditor } from './components/editor/SkillsEditor';
import { CertificationsEditor } from './components/editor/CertificationsEditor';
import { AchievementsEditor } from './components/editor/AchievementsEditor';
import { SectionOrganizer } from './components/editor/SectionOrganizer';
import { CompletenessMeter } from './components/tools/CompletenessMeter';
import { JobMatcherModal } from './components/tools/JobMatcherModal';
import { ActionVerbsModal } from './components/tools/ActionVerbsModal';
import { DesignSettingsModal } from './components/tools/DesignSettingsModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { Toast, ToastMessage } from './components/common/Toast';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Award,
  Trophy,
  Layers,
  Eye,
  Edit3
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'careercraft_resume_data_v1';

export const App: React.FC = () => {
  // Load saved state or default to SAMPLE_RESUME
  const [resume, setResume] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.profile) return parsed;
      }
    } catch (e) {
      console.warn('Could not read from local storage', e);
    }
    return SAMPLE_RESUME;
  });

  // Track active section editor tab
  const [activeTab, setActiveTab] = useState<string>('profile');

  // Mobile viewport view: 'editor' | 'preview'
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');

  // Modals state
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);
  const [isActionVerbsOpen, setIsActionVerbsOpen] = useState(false);
  const [isDesignSettingsOpen, setIsDesignSettingsOpen] = useState(false);

  // Confirm modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resume));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }, [resume]);

  // Handlers for updating resume components
  const updateProfile = (profile: typeof resume.profile) => setResume(r => ({ ...r, profile }));
  const updateSummary = (summary: string) => setResume(r => ({ ...r, summary }));
  const updateExperience = (experience: typeof resume.experience) => setResume(r => ({ ...r, experience }));
  const updateEducation = (education: typeof resume.education) => setResume(r => ({ ...r, education }));
  const updateProjects = (projects: typeof resume.projects) => setResume(r => ({ ...r, projects }));
  const updateSkills = (skills: typeof resume.skills) => setResume(r => ({ ...r, skills }));
  const updateCertifications = (certifications: typeof resume.certifications) => setResume(r => ({ ...r, certifications }));
  const updateAchievements = (achievements: typeof resume.achievements) => setResume(r => ({ ...r, achievements }));
  
  const updateSettings = (settings: ResumeSettings) => setResume(r => ({ ...r, settings }));

  const handleReorderSections = (newOrder: SectionKey[]) => {
    setResume(r => ({
      ...r,
      settings: { ...r.settings, sectionOrder: newOrder }
    }));
  };

  const handleToggleSectionVisibility = (key: SectionKey) => {
    setResume(r => {
      const currentHidden = r.settings.hiddenSections || [];
      const updatedHidden = currentHidden.includes(key)
        ? currentHidden.filter(k => k !== key)
        : [...currentHidden, key];
      return {
        ...r,
        settings: { ...r.settings, hiddenSections: updatedHidden }
      };
    });
  };

  // Load sample profile with confirmation
  const handleLoadSample = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Load Sample Profile?',
      message: 'This will replace your current edits with a complete fictional profile (Alex Morgan). Unsaved edits will be overwritten.',
      isDestructive: false,
      onConfirm: () => {
        setResume(SAMPLE_RESUME);
        setConfirmDialog(c => ({ ...c, isOpen: false }));
        addToast('success', 'Sample Profile Loaded', 'Fictional senior engineer resume ready for demonstration.');
      }
    });
  };

  // Clear resume with confirmation
  const handleClearResume = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear Resume / Start Blank?',
      message: 'Are you sure you want to reset all fields? All text in the current session will be cleared.',
      isDestructive: true,
      onConfirm: () => {
        setResume(EMPTY_RESUME);
        setConfirmDialog(c => ({ ...c, isOpen: false }));
        addToast('info', 'Resume Reset', 'Started with a blank slate.');
      }
    });
  };

  // Export JSON file
  const handleExportJson = () => {
    try {
      exportResumeToJson(resume);
      addToast('success', 'Resume Data Saved', 'Downloaded JSON backup file with current fields and template settings.');
    } catch (e) {
      addToast('error', 'Export Failed', 'Could not export resume data.');
    }
  };

  // Import JSON file with validation
  const handleImportJson = async (file: File) => {
    try {
      const importedData = await importResumeFromJson(file);
      // Confirm before replacing current work
      setConfirmDialog({
        isOpen: true,
        title: 'Restore Resume from File?',
        message: `Found valid backup file "${file.name}". Do you want to load this data and replace your current editing session?`,
        isDestructive: false,
        onConfirm: () => {
          setResume(importedData);
          setConfirmDialog(c => ({ ...c, isOpen: false }));
          addToast('success', 'Resume Restored Successfully', `Loaded schema v${importedData.schemaVersion} data from ${file.name}.`);
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown validation error.';
      addToast('error', 'Import Validation Error', msg);
    }
  };

  // Print to PDF (Preserving selectable text)
  const handlePrintPdf = () => {
    window.print();
  };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase, count: resume.experience.length },
    { id: 'education', label: 'Education', icon: GraduationCap, count: resume.education.length },
    { id: 'projects', label: 'Projects', icon: FolderGit2, count: resume.projects.length },
    { id: 'skills', label: 'Skills', icon: Wrench, count: resume.skills.length },
    { id: 'certifications', label: 'Certifications', icon: Award, count: resume.certifications.length },
    { id: 'achievements', label: 'Honors', icon: Trophy, count: resume.achievements.length },
    { id: 'organizer', label: 'Reorder Sections', icon: Layers },
  ];

  const renderActiveEditor = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileEditor profile={resume.profile} onChange={updateProfile} />;
      case 'summary':
        return (
          <SummaryEditor
            summary={resume.summary}
            onChange={updateSummary}
            onOpenActionVerbs={() => setIsActionVerbsOpen(true)}
          />
        );
      case 'experience':
        return (
          <ExperienceEditor
            experience={resume.experience}
            onChange={updateExperience}
            onOpenActionVerbs={() => setIsActionVerbsOpen(true)}
          />
        );
      case 'education':
        return <EducationEditor education={resume.education} onChange={updateEducation} />;
      case 'projects':
        return <ProjectsEditor projects={resume.projects} onChange={updateProjects} />;
      case 'skills':
        return <SkillsEditor skills={resume.skills} onChange={updateSkills} />;
      case 'certifications':
        return <CertificationsEditor certifications={resume.certifications} onChange={updateCertifications} />;
      case 'achievements':
        return <AchievementsEditor achievements={resume.achievements} onChange={updateAchievements} />;
      case 'organizer':
        return (
          <SectionOrganizer
            sectionOrder={resume.settings.sectionOrder}
            hiddenSections={resume.settings.hiddenSections}
            onReorder={handleReorderSections}
            onToggleVisibility={handleToggleSectionVisibility}
          />
        );
      default:
        return <ProfileEditor profile={resume.profile} onChange={updateProfile} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <Header
        onLoadSample={handleLoadSample}
        onClearResume={handleClearResume}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onOpenDesignSettings={() => setIsDesignSettingsOpen(true)}
        onOpenJobMatcher={() => setIsJobMatcherOpen(true)}
        onOpenActionVerbs={() => setIsActionVerbsOpen(true)}
        onPrintPdf={handlePrintPdf}
      />

      {/* Mobile Switcher (Editor vs Live Preview) */}
      <div className="lg:hidden flex border-b border-slate-200 bg-white no-print">
        <button
          type="button"
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            mobileView === 'editor'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
              : 'border-transparent text-slate-600'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor & Form</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
            mobileView === 'preview'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
              : 'border-transparent text-slate-600'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live A4 Preview</span>
        </button>
      </div>

      {/* Main Dual-Pane Workspace */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left Pane: Editor Form & Quality Meter (Width: 5/12 or 6/12 on large screens) */}
        <div
          className={`lg:col-span-5 xl:col-span-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-90px)] pr-1 ${
            mobileView === 'editor' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {/* Completeness Quality Meter */}
          <CompletenessMeter resume={resume} />

          {/* Section Navigation Pills */}
          <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Editor Panel */}
          <div className="space-y-4">
            {renderActiveEditor()}
          </div>
        </div>

        {/* Right Pane: Live A4 Preview & Controls (Width: 7/12 or 7/12 on large screens) */}
        <div
          className={`lg:col-span-7 xl:col-span-7 h-[calc(100vh-90px)] min-h-[600px] ${
            mobileView === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ResumePreview resume={resume} onPrintPdf={handlePrintPdf} />
        </div>
      </main>

      {/* Modals & Tools */}
      <JobMatcherModal
        isOpen={isJobMatcherOpen}
        onClose={() => setIsJobMatcherOpen(false)}
        resume={resume}
      />

      <ActionVerbsModal
        isOpen={isActionVerbsOpen}
        onClose={() => setIsActionVerbsOpen(false)}
      />

      <DesignSettingsModal
        isOpen={isDesignSettingsOpen}
        onClose={() => setIsDesignSettingsOpen(false)}
        settings={resume.settings}
        onChange={updateSettings}
      />

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(c => ({ ...c, isOpen: false }))}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};
