import React from 'react';
import { ProjectItem } from '../../types/resume';
import { FolderGit2, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface ProjectsEditorProps {
  projects: ProjectItem[];
  onChange: (updated: ProjectItem[]) => void;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({ projects, onChange }) => {
  const handleAddItem = () => {
    const newItem: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      technologies: '',
      contribution: '',
      link: ''
    };
    onChange([...projects, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof ProjectItem, value: string) => {
    onChange(projects.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleRemoveItem = (id: string) => {
    onChange(projects.filter(item => item.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Key Projects & Portfolio</h3>
            <p className="text-xs text-slate-500">Showcase software, hardware, design, or open-source projects.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
          <p>No project items added yet.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add a project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  {item.name || 'New Project'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === projects.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Project Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    placeholder="e.g. Distributed Cache Engine"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Tech Stack */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Technologies Used
                  </label>
                  <input
                    type="text"
                    value={item.technologies}
                    onChange={(e) => handleUpdateItem(item.id, 'technologies', e.target.value)}
                    placeholder="e.g. Go, Docker, Redis, gRPC"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Project URL */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Project Link / Repository URL
                  </label>
                  <input
                    type="url"
                    value={item.link}
                    onChange={(e) => handleUpdateItem(item.id, 'link', e.target.value)}
                    placeholder="https://github.com/username/project"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Project Overview & Purpose
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="Brief overview explaining what problem the project solved and its architecture..."
                    className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white leading-relaxed"
                  />
                </div>

                {/* Contribution */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Your Specific Contribution & Results
                  </label>
                  <input
                    type="text"
                    value={item.contribution}
                    onChange={(e) => handleUpdateItem(item.id, 'contribution', e.target.value)}
                    placeholder="e.g. Designed Raft consensus logic; reached 1,200+ GitHub stars."
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
