import React, { useState } from 'react';
import { ResumeData } from '../../types/resume';
import { calculateResumeCompleteness } from '../../utils/pageCalculator';
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Award } from 'lucide-react';

interface CompletenessMeterProps {
  resume: ResumeData;
}

export const CompletenessMeter: React.FC<CompletenessMeterProps> = ({ resume }) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const report = calculateResumeCompleteness(resume);

  const getScoreColor = () => {
    if (report.score >= 85) return 'text-emerald-600 bg-emerald-500';
    if (report.score >= 60) return 'text-amber-600 bg-amber-500';
    return 'text-rose-600 bg-rose-500';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Resume Completeness</span>
              <span className={`text-xs font-extrabold ${getScoreColor().split(' ')[0]}`}>
                {report.score}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {report.missingCount === 0
                ? 'All foundational sections complete!'
                : `${report.missingCount} recommended area${report.missingCount > 1 ? 's' : ''} to improve`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors"
        >
          <span>{expanded ? 'Hide Details' : 'View Checklist'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getScoreColor().split(' ')[1]}`}
          style={{ width: `${report.score}%` }}
        />
      </div>

      {/* Expanded Checklist Details */}
      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          {report.items.map(item => (
            <div key={item.id} className="flex items-start gap-2 text-xs">
              {item.completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${item.completed ? 'text-slate-700' : 'text-slate-900'}`}>
                    {item.label}
                  </span>
                  <span className={`text-[10px] ${item.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {item.completed ? 'Complete' : `+${item.weight}%`}
                  </span>
                </div>
                {!item.completed && (
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{item.tip}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
