import React, { useState } from 'react';
import { ACTION_VERBS, WEAK_PHRASES } from '../../utils/actionVerbs';
import { X, Sparkles, Copy, Check, ShieldCheck } from 'lucide-react';

interface ActionVerbsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActionVerbsModal: React.FC<ActionVerbsModalProps> = ({ isOpen, onClose }) => {
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'verbs' | 'phrases'>('verbs');

  if (!isOpen) return null;

  const handleCopy = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Action Verbs & Phrasing Coach</h2>
              <p className="text-xs text-slate-500">Elevate your bullet points with high-impact, non-fabricated language.</p>
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 pt-3 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('verbs')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'verbs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Power Action Verbs Bank
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('phrases')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'phrases'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Replace Weak Phrases
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Authenticity Guarantee: </strong> These suggestions refine syntax and vocabulary. They never fabricate experiences, positions, or metrics.
            </span>
          </div>

          {activeTab === 'verbs' ? (
            <div className="space-y-4">
              {ACTION_VERBS.map((category) => (
                <div key={category.category} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-900">{category.category}</h4>
                  <p className="text-[11px] text-slate-500 mb-2.5">{category.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {category.verbs.map((verb) => {
                      const isCopied = copiedVerb === verb;
                      return (
                        <button
                          key={verb}
                          type="button"
                          onClick={() => handleCopy(verb)}
                          title="Click to copy verb"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            isCopied
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 shadow-2xs'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-slate-400" />}
                          <span>{verb}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {WEAK_PHRASES.map((wp, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-600 line-through">
                      "{wp.weakPhrase}"
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Weak / Passive
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{wp.explanation}</p>
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-slate-700">Better Alternatives: </span>
                    <span className="text-xs font-bold text-indigo-700">
                      {wp.replacementAlternatives.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
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
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
