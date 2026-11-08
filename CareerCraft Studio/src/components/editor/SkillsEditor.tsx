import React, { useState } from 'react';
import { SkillItem } from '../../types/resume';
import { Wrench, Plus, Trash2, Tag } from 'lucide-react';

interface SkillsEditorProps {
  skills: SkillItem[];
  onChange: (updated: SkillItem[]) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({ skills, onChange }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<SkillItem['proficiency']>('');

  // Bulk input state
  const [bulkInput, setBulkInput] = useState('');
  const [bulkCategory, setBulkCategory] = useState('');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const newItem: SkillItem = {
      id: `sk-${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory.trim() || 'Core Skills',
      proficiency: newSkillProficiency
    };

    onChange([...skills, newItem]);
    setNewSkillName('');
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;
    const splitNames = bulkInput.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    const newItems: SkillItem[] = splitNames.map((name, i) => ({
      id: `sk-${Date.now()}-${i}`,
      name,
      category: bulkCategory.trim() || 'Technical Skills',
      proficiency: ''
    }));

    onChange([...skills, ...newItems]);
    setBulkInput('');
    setBulkCategory('');
  };

  const handleRemoveSkill = (id: string) => {
    onChange(skills.filter(s => s.id !== id));
  };

  const handleUpdateProficiency = (id: string, prof: SkillItem['proficiency']) => {
    onChange(skills.map(s => (s.id === id ? { ...s, proficiency: prof } : s)));
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Skills & Competencies</h3>
            <p className="text-xs text-slate-500">Categorize your technical stack, tools, frameworks, and proficiencies.</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {skills.length} Skills
        </span>
      </div>

      {/* Add Skill Form */}
      <form onSubmit={handleAddSkill} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
        <span className="text-[11px] font-bold text-slate-700 block">Add Single Skill</span>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Skill name (e.g. React, Python)"
            className="sm:col-span-5 text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
          <input
            type="text"
            value={newSkillCategory}
            onChange={(e) => setNewSkillCategory(e.target.value)}
            placeholder="Category (e.g. Frontend)"
            className="sm:col-span-4 text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          />
          <select
            value={newSkillProficiency}
            onChange={(e) => setNewSkillProficiency(e.target.value as SkillItem['proficiency'])}
            className="sm:col-span-2 text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="">Proficiency (Optional)</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
          <button
            type="submit"
            className="sm:col-span-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center justify-center p-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Quick Bulk Import */}
      <details className="text-xs text-slate-600 border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
        <summary className="font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 select-none">
          <Tag className="w-3.5 h-3.5 text-indigo-500" />
          Quick Bulk Import (Paste comma-separated list)
        </summary>
        <div className="mt-2.5 space-y-2">
          <input
            type="text"
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
            placeholder="Category for these skills (e.g. DevOps, Cloud)"
            className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
          />
          <textarea
            rows={2}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Docker, Kubernetes, AWS, Terraform, CI/CD"
            className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
          />
          <button
            type="button"
            onClick={handleBulkAdd}
            className="px-3 py-1 bg-slate-800 text-white font-medium rounded text-xs hover:bg-slate-700 transition-colors"
          >
            Add All Listed Skills
          </button>
        </div>
      </details>

      {/* Render Current Skills as Tags */}
      {skills.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          No skills added yet. Add individual skills or bulk import above.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs text-slate-800 transition-colors"
            >
              <span className="font-semibold">{skill.name}</span>
              {skill.category && (
                <span className="text-[10px] text-slate-500 font-normal">
                  ({skill.category})
                </span>
              )}
              {skill.proficiency && (
                <span className="text-[9px] font-semibold px-1 rounded bg-indigo-100 text-indigo-700">
                  {skill.proficiency}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill.id)}
                className="text-slate-400 hover:text-red-500 p-0.5 rounded ml-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
