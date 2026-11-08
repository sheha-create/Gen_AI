import React, { useState } from 'react';
import { ResumeData } from '../../types/resume';
import { analyzeJobDescriptionMatch, MatchAnalysis } from '../../utils/atsMatcher';
import { X, Search, CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';

interface JobMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeData;
}

export const JobMatcherModal: React.FC<JobMatcherModalProps> = ({ isOpen, onClose, resume }) => {
  const [jobText, setJobText] = useState('');
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!jobText.trim()) return;
    const res = analyzeJobDescriptionMatch(jobText, resume);
    setAnalysis(res);
  };

  const loadSampleJob = () => {
    setJobText(
      `Job Title: Senior Full Stack Engineer\n\nRequirements:\n- 5+ years of experience with React, TypeScript, and modern frontend architectures\n- Strong proficiency in Node.js, REST APIs, GraphQL, and microservices\n- Experience with cloud infrastructure: Docker, Kubernetes, AWS, CI/CD pipelines\n- Familiarity with PostgreSQL, Redis caching, and database performance tuning\n- Proven ability to write automated unit and integration tests (Jest, Playwright)\n- Excellent communication skills, mentorship experience, and agile project delivery.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Local Job Description Matcher</h2>
              <p className="text-xs text-slate-500">Transparent keyword comparison performed 100% locally on your device.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Important Transparent Disclaimer */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Transparent Local Matching Notice: </span>
              This tool performs pure client-side keyword extraction to show you which terms from the target job posting appear in your resume. It does <strong>not</strong> claim guaranteed ATS scoring or proprietary recruiter filtering algorithms.
            </div>
          </div>

          {/* Job text input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Target Job Description</label>
              <button
                type="button"
                onClick={loadSampleJob}
                className="text-xs font-medium text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Paste Sample Job Posting
              </button>
            </div>
            <textarea
              rows={5}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the target job description or role requirements here..."
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/40 leading-relaxed font-sans"
            />
            <button
              type="button"
              disabled={!jobText.trim()}
              onClick={handleAnalyze}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              Compare Keywords Locally
            </button>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Keyword Match Rate</span>
                  <span className="text-2xl font-black text-slate-900">{analysis.matchPercentage}%</span>
                </div>
                <div className="text-right text-xs text-slate-600">
                  <div><strong>{analysis.matchedCount}</strong> of {analysis.totalKeywordsCount} core terms present</div>
                  <div className="text-[11px] text-slate-400">Based on top frequent job keywords</div>
                </div>
              </div>

              {/* Matched Keywords */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Matched Keywords Found in Your Resume ({analysis.matchedKeywords.length})
                </h4>
                {analysis.matchedKeywords.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No matching keywords detected yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.matchedKeywords.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        {item.keyword}
                        <span className="text-[10px] text-emerald-600 font-mono">({item.frequencyInJob}x)</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Keywords */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  Keywords in Job Description Not Yet in Resume ({analysis.missingKeywords.length})
                </h4>
                {analysis.missingKeywords.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium">Excellent! All top key terms from the job post appear in your resume.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingKeywords.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200"
                      >
                        {item.keyword}
                        <span className="text-[10px] text-rose-600 font-mono">({item.frequencyInJob}x)</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
