import React from 'react';
import { FileText, Sparkles, AlertCircle } from 'lucide-react';
import { findWeakPhrasesInText } from '../../utils/actionVerbs';

interface SummaryEditorProps {
  summary: string;
  onChange: (updated: string) => void;
  onOpenActionVerbs: () => void;
}

export const SummaryEditor: React.FC<SummaryEditorProps> = ({ summary, onChange, onOpenActionVerbs }) => {
  const weakPhrases = findWeakPhrasesInText(summary);
  const wordCount = summary.trim() ? summary.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Professional Summary</h3>
            <p className="text-xs text-slate-500">Concise 2–4 sentence synthesis of your primary strengths and impact.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenActionVerbs}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Action Verbs Bank
        </button>
      </div>

      <div className="space-y-2">
        <textarea
          rows={4}
          value={summary}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Versatile Full Stack Engineer with 6+ years of experience architecting resilient cloud-native web services and high-performance React frontends..."
          className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 leading-relaxed"
        />

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{wordCount} words / {summary.length} characters</span>
          <span className={wordCount >= 30 && wordCount <= 80 ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
            Optimal length: 30–75 words
          </span>
        </div>

        {weakPhrases.length > 0 && (
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Phrasing Tip: Passive or vague phrase detected</span>
            </div>
            {weakPhrases.map((wp, i) => (
              <div key={i} className="pl-5 text-slate-700">
                Replace <span className="font-semibold text-amber-900">"{wp.phrase}"</span> with stronger alternatives like{' '}
                <span className="font-medium text-indigo-700">{wp.suggestions.join(', ')}</span>.
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
