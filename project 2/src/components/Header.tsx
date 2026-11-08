import React, { useRef } from 'react';
import {
  Download,
  Upload,
  FileText,
  RotateCcw,
  Sparkles,
  Palette,
  Search,
  Printer,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onClearResume: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onOpenDesignSettings: () => void;
  onOpenJobMatcher: () => void;
  onOpenActionVerbs: () => void;
  onPrintPdf: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  onClearResume,
  onExportJson,
  onImportJson,
  onOpenDesignSettings,
  onOpenJobMatcher,
  onOpenActionVerbs,
  onPrintPdf
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <header className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-30 select-none no-print">
      <div className="max-w-[1700px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900">
                CareerCraft <span className="text-indigo-600">Studio</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                100% Offline & Private
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              A4 Resume Builder • Selectable Text PDF • Zero Data Tracking
            </p>
          </div>
        </div>

        {/* Center / Actions */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Fictional Sample Profile */}
          <button
            type="button"
            onClick={onLoadSample}
            title="Load Fictional Alex Morgan Profile for Demonstration"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Sample Demo Profile</span>
            <span className="md:hidden">Demo</span>
          </button>

          {/* Reset / Blank */}
          <button
            type="button"
            onClick={onClearResume}
            title="Start with a blank resume"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">New / Reset</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-0.5 hidden sm:block" />

          {/* Design Settings */}
          <button
            type="button"
            onClick={onOpenDesignSettings}
            title="Templates, Colors & Typography Settings"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <span>Design</span>
          </button>

          {/* Job Matcher */}
          <button
            type="button"
            onClick={onOpenJobMatcher}
            title="Compare keywords against target job description"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Job Matcher</span>
          </button>

          {/* Action Verbs */}
          <button
            type="button"
            onClick={onOpenActionVerbs}
            title="Action verbs and phrasing coach"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Action Verbs</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 mx-0.5" />

          {/* Save JSON */}
          <button
            type="button"
            onClick={onExportJson}
            title="Export resume data to a local .json file"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Save Data</span>
          </button>

          {/* Load JSON */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Load resume data from a saved .json file"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Data</span>
          </button>

          {/* Print to PDF (Selectable text) */}
          <button
            type="button"
            onClick={onPrintPdf}
            title="Export high-resolution selectable text PDF"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors ml-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
