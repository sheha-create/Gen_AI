import React, { useState } from 'react';
import { SectionKey } from '../../types/resume';
import { SECTION_METADATA } from '../../data/sampleData';
import { GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Layers } from 'lucide-react';

interface SectionOrganizerProps {
  sectionOrder: SectionKey[];
  hiddenSections: SectionKey[];
  onReorder: (newOrder: SectionKey[]) => void;
  onToggleVisibility: (key: SectionKey) => void;
}

export const SectionOrganizer: React.FC<SectionOrganizerProps> = ({
  sectionOrder,
  hiddenSections,
  onReorder,
  onToggleVisibility
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent or custom drag preview
    e.dataTransfer.setData('text/plain', `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, moved);

    onReorder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sectionOrder.length) return;

    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    onReorder(newOrder);
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Section Organizer & Hierarchy</h3>
            <p className="text-xs text-slate-500">Drag items or use the arrows to reorder sections. Toggle eye to show/hide.</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sectionOrder.map((key, index) => {
          const meta = SECTION_METADATA[key] || { label: key, description: '' };
          const isHidden = hiddenSections.includes(key);
          const isDragging = draggedIndex === index;
          const isTarget = dragOverIndex === index;

          return (
            <div
              key={key}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all select-none ${
                isDragging
                  ? 'opacity-40 border-dashed border-indigo-400 bg-indigo-50/50'
                  : isTarget
                  ? 'border-indigo-500 bg-indigo-50/70 shadow-sm'
                  : isHidden
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Drag Handle & Label */}
              <div className="flex items-center gap-3">
                <div
                  className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <span className={`text-xs font-semibold ${isHidden ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {meta.label}
                    </span>
                    <p className="text-[10px] text-slate-400 hidden sm:block">
                      {meta.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Controls: Move Up, Move Down, Toggle Visibility */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMove(index, 'up')}
                  title="Move section up (accessible keyboard control)"
                  aria-label={`Move ${meta.label} up`}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-25"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={index === sectionOrder.length - 1}
                  onClick={() => handleMove(index, 'down')}
                  title="Move section down (accessible keyboard control)"
                  aria-label={`Move ${meta.label} down`}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-25"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleVisibility(key)}
                  title={isHidden ? 'Show section in preview' : 'Hide section from preview'}
                  aria-label={`${isHidden ? 'Show' : 'Hide'} ${meta.label}`}
                  className={`p-1.5 rounded ml-1 transition-colors ${
                    isHidden
                      ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                      : 'text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
