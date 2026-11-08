import React, { useRef, useEffect, useState } from 'react';
import { ResumeData } from '../../types/resume';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';
import { estimatePageOverflow, A4_PAGE_HEIGHT_PX } from '../../utils/pageCalculator';
import { ZoomIn, ZoomOut, Maximize2, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

interface ResumePreviewProps {
  resume: ResumeData;
  onPrintPdf: () => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ resume, onPrintPdf }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.85);
  const [measuredPages, setMeasuredPages] = useState<number>(1);
  const [overflowWarning, setOverflowWarning] = useState<boolean>(false);
  const [heightPx, setHeightPx] = useState<number>(1123);

  // Measure content height and calculate pages whenever resume changes
  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        const h = contentRef.current.scrollHeight;
        setHeightPx(h);
        const est = estimatePageOverflow(h);
        setMeasuredPages(est.estimatedPages);
        setOverflowWarning(est.hasOverflowRisk);
      }
    };

    measure();
    const timeout = setTimeout(measure, 150);
    return () => clearTimeout(timeout);
  }, [resume, zoom]);

  // Adjust font styling and density classes
  const getFontFamilyClass = () => {
    switch (resume.settings.fontFamily) {
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      default: return 'font-sans';
    }
  };

  const getDensityClass = () => {
    switch (resume.settings.spacing) {
      case 'compact': return 'text-[0.92em] space-compact';
      case 'relaxed': return 'text-[1.05em] space-relaxed';
      default: return 'text-[1em] space-normal';
    }
  };

  const renderTemplate = () => {
    switch (resume.settings.selectedTemplate) {
      case 'classic':
        return <ClassicTemplate resume={resume} />;
      case 'minimal':
        return <MinimalTemplate resume={resume} />;
      case 'modern':
      default:
        return <ModernTemplate resume={resume} />;
    }
  };

  const fitToWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48; // padding
      const a4WidthPx = 794; // approx A4 width at 96 DPI (210mm)
      const ratio = Math.min(1.2, Math.max(0.5, containerWidth / a4WidthPx));
      setZoom(Math.round(ratio * 100) / 100);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-200/80 rounded-xl overflow-hidden border border-slate-300/80 shadow-sm">
      {/* Preview Action Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-800 text-white text-xs select-none">
        {/* Left: Template badge & Page estimate */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            Live A4 Preview
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-700/80 text-slate-200 font-mono text-[11px] font-medium">
            {measuredPages} Page{measuredPages > 1 ? 's' : ''} (A4 Flow)
          </span>

          {overflowWarning ? (
            <span className="flex items-center gap-1 text-amber-400 text-[11px] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-600/30">
              <AlertTriangle className="w-3 h-3" />
              Content close to page split
            </span>
          ) : (
            <span className="hidden sm:flex items-center gap-1 text-emerald-400 text-[11px]">
              <CheckCircle className="w-3 h-3" />
              Layout Clean
            </span>
          )}
        </div>

        {/* Right: Zoom controls & Print PDF */}
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <div className="flex items-center bg-slate-700 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
              title="Zoom Out"
              className="p-1 hover:bg-slate-600 rounded text-slate-200 hover:text-white transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-slate-300 min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))}
              title="Zoom In"
              className="p-1 hover:bg-slate-600 rounded text-slate-200 hover:text-white transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={fitToWidth}
              title="Fit to Width"
              className="p-1 hover:bg-slate-600 rounded text-slate-200 hover:text-white transition-colors ml-0.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={onPrintPdf}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md shadow-xs transition-colors"
          >
            Export Selectable PDF
          </button>
        </div>
      </div>

      {/* Interactive Live Canvas Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-slate-300/60"
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="resume-preview-wrapper"
        >
          {/* Printable A4 Resume Sheet */}
          <div
            id="careercraft-resume-document"
            ref={contentRef}
            className={`w-[210mm] min-h-[297mm] bg-white shadow-2xl relative select-text cursor-auto ${getFontFamilyClass()} ${getDensityClass()}`}
          >
            {renderTemplate()}

            {/* Visual page break guides if taller than 1 page */}
            {measuredPages > 1 && (
              <>
                {Array.from({ length: measuredPages - 1 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="absolute left-0 right-0 pointer-events-none no-print border-b-2 border-dashed border-red-400/80 z-20 flex justify-end pr-2"
                    style={{ top: `${(idx + 1) * A4_PAGE_HEIGHT_PX}px` }}
                  >
                    <span className="bg-red-500 text-white text-[9px] font-mono px-2 py-0.5 rounded-t-sm shadow-sm">
                      End of A4 Page {idx + 1}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
