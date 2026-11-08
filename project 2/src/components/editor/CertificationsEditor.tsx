import React from 'react';
import { CertificationItem } from '../../types/resume';
import { Award, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface CertificationsEditorProps {
  certifications: CertificationItem[];
  onChange: (updated: CertificationItem[]) => void;
}

export const CertificationsEditor: React.FC<CertificationsEditorProps> = ({ certifications, onChange }) => {
  const handleAddItem = () => {
    const newItem: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      credentialId: '',
      credentialUrl: ''
    };
    onChange([...certifications, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof CertificationItem, value: string) => {
    onChange(certifications.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleRemoveItem = (id: string) => {
    onChange(certifications.filter(item => item.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= certifications.length) return;
    const reordered = [...certifications];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onChange(reordered);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Certifications & Licenses</h3>
            <p className="text-xs text-slate-500">Verified industry certifications and professional accreditations.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
          <p>No certifications added yet.</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add a certification
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {certifications.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  {item.name || 'New Certification'}
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
                    disabled={index === certifications.length - 1}
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
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Certification Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Issuer */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Issuing Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.issuer}
                    onChange={(e) => handleUpdateItem(item.id, 'issuer', e.target.value)}
                    placeholder="e.g. Amazon Web Services (AWS)"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => handleUpdateItem(item.id, 'date', e.target.value)}
                    placeholder="e.g. 2023-04"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Credential ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Credential ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={item.credentialId || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'credentialId', e.target.value)}
                    placeholder="e.g. AWS-SAA-8849201"
                    className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                {/* Verification URL */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Verification URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={item.credentialUrl || ''}
                    onChange={(e) => handleUpdateItem(item.id, 'credentialUrl', e.target.value)}
                    placeholder="https://aws.amazon.com/verify"
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
