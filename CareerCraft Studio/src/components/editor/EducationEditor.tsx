import React from 'react';
import { EducationItem } from '../../types/resume';
import { GraduationCap, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface EducationEditorProps {
  education: EducationItem[];
  onChange: (updated: EducationItem[]) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({ education, onChange }) => {
  const handleAddItem = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      qualification: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      grade: '',
      description: ''
    };
    onChange([...education, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof EducationItem, value: unknown) => {
    onChange(education.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleRemoveItem = (id: string) => {
    onChange(education.filter(item => item.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= education.length) return;
    const reordered = [...education];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Education & Academic History</h3>
            <p className="text-xs text-slate-500">Degrees, diplomas, certifications, or major academic training.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
          <p>No education entries added yet.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add education history
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  {item.qualification || 'Degree'} {item.institution ? `at ${item.institution}` : ''}
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
                    disabled={index === education.length - 1}
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
                {/* Institution */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Institution / University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.institution}
                    onChange={(e) => handleUpdateItem(item.id, 'institution', e.target.value)}
                    placeholder="e.g. University of Washington"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Degree / Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.qualification}
                    onChange={(e) => handleUpdateItem(item.id, 'qualification', e.target.value)}
                    placeholder="e.g. Bachelor of Science (B.S.)"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Field of Study */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Field of Study / Major
                  </label>
                  <input
                    type="text"
                    value={item.field}
                    onChange={(e) => handleUpdateItem(item.id, 'field', e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={item.location}
                    onChange={(e) => handleUpdateItem(item.id, 'location', e.target.value)}
                    placeholder="e.g. Seattle, WA"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Dates */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Dates</label>
                    <label className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                      <input
                        type="checkbox"
                        checked={item.current}
                        onChange={(e) => handleUpdateItem(item.id, 'current', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-0 w-3 h-3"
                      />
                      <span>In Progress</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={item.startDate}
                      onChange={(e) => handleUpdateItem(item.id, 'startDate', e.target.value)}
                      placeholder="Start Year"
                      className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <input
                      type="text"
                      disabled={item.current}
                      value={item.current ? 'Present' : item.endDate}
                      onChange={(e) => handleUpdateItem(item.id, 'endDate', e.target.value)}
                      placeholder="Graduation Year"
                      className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>

                {/* Grade / GPA */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    GPA / Honors (Optional)
                  </label>
                  <input
                    type="text"
                    value={item.grade || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'grade', e.target.value)}
                    placeholder="e.g. GPA 3.8 / 4.0 or Magna Cum Laude"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Relevant Coursework & Honors (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={item.description || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="e.g. Relevant Coursework: Algorithms, Operating Systems, Machine Learning..."
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white leading-relaxed"
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
