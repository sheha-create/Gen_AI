import React from 'react';
import { AchievementItem } from '../../types/resume';
import { Trophy, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface AchievementsEditorProps {
  achievements: AchievementItem[];
  onChange: (updated: AchievementItem[]) => void;
}

export const AchievementsEditor: React.FC<AchievementsEditorProps> = ({ achievements, onChange }) => {
  const handleAddItem = () => {
    const newItem: AchievementItem = {
      id: `ach-${Date.now()}`,
      award: '',
      competition: '',
      date: '',
      description: ''
    };
    onChange([...achievements, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof AchievementItem, value: string) => {
    onChange(achievements.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleRemoveItem = (id: string) => {
    onChange(achievements.filter(item => item.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= achievements.length) return;
    const reordered = [...achievements];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Honors, Awards & Achievements</h3>
            <p className="text-xs text-slate-500">Hackathons, company recognition, scholarships, or academic distinctions.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Honor / Award
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
          <p>No honors or awards added yet.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add an honor or award
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {achievements.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  {item.award || 'New Honor / Award'}
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
                    disabled={index === achievements.length - 1}
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
                {/* Award Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Award / Distinction <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.award}
                    onChange={(e) => handleUpdateItem(item.id, 'award', e.target.value)}
                    placeholder="e.g. 1st Place Winner"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Competition / Issuer */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Competition / Organization
                  </label>
                  <input
                    type="text"
                    value={item.competition}
                    onChange={(e) => handleUpdateItem(item.id, 'competition', e.target.value)}
                    placeholder="e.g. TechCrunch Global Hackathon"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Date Received
                  </label>
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => handleUpdateItem(item.id, 'date', e.target.value)}
                    placeholder="e.g. 2021-09"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Description & Context
                  </label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="e.g. Outperformed 340+ international teams with a real-time IoT coordination solution..."
                    className="w-full text-xs p-2.5 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white leading-relaxed"
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
