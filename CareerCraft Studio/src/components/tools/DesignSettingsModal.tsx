import React from 'react';
import { ResumeSettings, TemplateId, FontFamily, SpacingDensity } from '../../types/resume';
import { COLOR_PRESETS } from '../../data/sampleData';
import { X, Palette, Check, LayoutTemplate, Type, Sliders } from 'lucide-react';

interface DesignSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ResumeSettings;
  onChange: (updated: ResumeSettings) => void;
}

export const DesignSettingsModal: React.FC<DesignSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChange
}) => {
  if (!isOpen) return null;

  const handleTemplateChange = (t: TemplateId) => {
    onChange({ ...settings, selectedTemplate: t });
  };

  const handleColorChange = (color: string) => {
    onChange({ ...settings, accentColor: color });
  };

  const handleFontChange = (font: FontFamily) => {
    onChange({ ...settings, fontFamily: font });
  };

  const handleSpacingChange = (sp: SpacingDensity) => {
    onChange({ ...settings, spacing: sp });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Visual Styling & Typography</h2>
              <p className="text-xs text-slate-500">Customize templates, colors, and font styles while preserving readability.</p>
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600" />
              Structural Resume Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Modern */}
              <button
                type="button"
                onClick={() => handleTemplateChange('modern')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  settings.selectedTemplate === 'modern'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Modern</span>
                  {settings.selectedTemplate === 'modern' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  2-column structured sidebar layout with prominent skills badges & timeline.
                </p>
              </button>

              {/* Classic */}
              <button
                type="button"
                onClick={() => handleTemplateChange('classic')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  settings.selectedTemplate === 'classic'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Classic</span>
                  {settings.selectedTemplate === 'classic' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Restrained single-column format, traditional hierarchy, ATS gold standard.
                </p>
              </button>

              {/* Minimal */}
              <button
                type="button"
                onClick={() => handleTemplateChange('minimal')}
                className={`p-3 text-left rounded-xl border transition-all ${
                  settings.selectedTemplate === 'minimal'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">Minimal</span>
                  {settings.selectedTemplate === 'minimal' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Generous whitespace, Swiss editorial typography, refined subtle accents.
                </p>
              </button>
            </div>
          </div>

          {/* Accent Color Palette */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-600" />
              Primary Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {COLOR_PRESETS.map((color) => {
                const isSelected = settings.accentColor.toLowerCase() === color.value.toLowerCase();
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange(color.value)}
                    title={color.name}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'ring-2 ring-offset-2 ring-indigo-600 scale-110 shadow-sm' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                  </button>
                );
              })}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300"
                />
                <span className="text-xs font-mono text-slate-600">{settings.accentColor}</span>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-600" />
              Typography Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleFontChange('sans')}
                className={`p-3 rounded-lg border text-left font-sans ${
                  settings.fontFamily === 'sans'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="text-xs">Modern Sans</div>
                <div className="text-[10px] text-slate-400 font-normal">Clean System UI</div>
              </button>

              <button
                type="button"
                onClick={() => handleFontChange('serif')}
                className={`p-3 rounded-lg border text-left font-serif ${
                  settings.fontFamily === 'serif'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="text-xs">Classic Serif</div>
                <div className="text-[10px] text-slate-400 font-normal">Editorial & Formal</div>
              </button>

              <button
                type="button"
                onClick={() => handleFontChange('mono')}
                className={`p-3 rounded-lg border text-left font-mono ${
                  settings.fontFamily === 'mono'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <div className="text-xs">Technical Mono</div>
                <div className="text-[10px] text-slate-400 font-normal">Developer Focused</div>
              </button>
            </div>
          </div>

          {/* Spacing Density */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Layout Density & Spacing
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['compact', 'normal', 'relaxed'] as SpacingDensity[]).map((density) => (
                <button
                  key={density}
                  type="button"
                  onClick={() => handleSpacingChange(density)}
                  className={`p-2.5 rounded-lg border text-center capitalize text-xs ${
                    settings.spacing === density
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            Apply Styling
          </button>
        </div>
      </div>
    </div>
  );
};
