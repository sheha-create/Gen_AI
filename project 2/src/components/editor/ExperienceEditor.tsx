import React from 'react';
import { ExperienceItem } from '../../types/resume';
import { Briefcase, Plus, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { findWeakPhrasesInText } from '../../utils/actionVerbs';

interface ExperienceEditorProps {
  experience: ExperienceItem[];
  onChange: (updated: ExperienceItem[]) => void;
  onOpenActionVerbs: () => void;
}

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({ experience, onChange, onOpenActionVerbs }) => {
  const handleAddItem = () => {
    const newItem: ExperienceItem = {
      id: `exp-${Date.now()}`,
      organization: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      responsibilities: '',
      measurableAchievements: ''
    };
    onChange([newItem, ...experience]);
  };

  const handleUpdateItem = (id: string, field: keyof ExperienceItem, value: unknown) => {
    onChange(experience.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleRemoveItem = (id: string) => {
    onChange(experience.filter(item => item.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= experience.length) return;
    const reordered = [...experience];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Work Experience</h3>
            <p className="text-xs text-slate-500">Employment history, leadership roles, and measurable contributions.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenActionVerbs}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Action Verbs
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Position
          </button>
        </div>
      </div>

      {experience.length === 0 ? (
        <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
          <p>No work experience entries yet.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add your first work role
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experience.map((item, index) => {
            const weakPhrases = findWeakPhrasesInText(item.responsibilities);

            return (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 space-y-3 relative group"
              >
                {/* Header with Title and Reorder/Delete */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold text-slate-800">
                    {item.role || 'New Role'} {item.organization ? `at ${item.organization}` : ''}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      title="Move up"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === experience.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      title="Move down"
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Delete entry"
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Organization */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Organization / Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.organization}
                      onChange={(e) => handleUpdateItem(item.id, 'organization', e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Role / Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.role}
                      onChange={(e) => handleUpdateItem(item.id, 'role', e.target.value)}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Location (City, State / Remote)
                    </label>
                    <input
                      type="text"
                      value={item.location}
                      onChange={(e) => handleUpdateItem(item.id, 'location', e.target.value)}
                      placeholder="e.g. San Francisco, CA or Remote"
                      className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  {/* Dates */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-slate-700">
                        Dates (Start & End)
                      </label>
                      <label className="inline-flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.current}
                          onChange={(e) => handleUpdateItem(item.id, 'current', e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-0 w-3 h-3"
                        />
                        <span>Current Role</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.startDate}
                        onChange={(e) => handleUpdateItem(item.id, 'startDate', e.target.value)}
                        placeholder="e.g. 2021-03 or Mar 2021"
                        className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                      <input
                        type="text"
                        disabled={item.current}
                        value={item.current ? 'Present' : item.endDate}
                        onChange={(e) => handleUpdateItem(item.id, 'endDate', e.target.value)}
                        placeholder="e.g. 2023-08 or Aug 2023"
                        className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Key Responsibilities & Initiatives (One bullet per line)
                    </label>
                    <textarea
                      rows={3}
                      value={item.responsibilities}
                      onChange={(e) => handleUpdateItem(item.id, 'responsibilities', e.target.value)}
                      placeholder="• Architected real-time WebSocket pipeline handling 40,000 requests/sec&#10;• Mentored junior engineers through pair programming and code reviews"
                      className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white leading-relaxed"
                    />
                  </div>

                  {/* Measurable Achievements */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Measurable Achievements (Quantified Results, Revenue, Latency, Awards)
                    </label>
                    <textarea
                      rows={2}
                      value={item.measurableAchievements}
                      onChange={(e) => handleUpdateItem(item.id, 'measurableAchievements', e.target.value)}
                      placeholder="e.g. Reduced p99 latency by 42% and saved $180k/yr in AWS infrastructure spend."
                      className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white leading-relaxed"
                    />
                  </div>
                </div>

                {weakPhrases.length > 0 && (
                  <div className="p-2 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-800">
                    <span className="font-semibold">Tip: </span> Consider replacing "{weakPhrases[0].phrase}" with action verbs like {weakPhrases[0].suggestions.slice(0, 3).join(', ')}.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
