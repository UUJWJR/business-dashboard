import { Plus } from 'lucide-react';
import type { Slide } from '../../types/pageBuilder';
import SlideThumbnail from './SlideThumbnail';

interface SlidePanelProps {
  slides: Slide[];
  activeSlideId: string;
  onAddSlide: () => void;
  onDeleteSlide: (id: string) => void;
  onSetActiveSlide: (id: string) => void;
}

export default function SlidePanel({ slides, activeSlideId, onAddSlide, onDeleteSlide, onSetActiveSlide }: SlidePanelProps) {
  return (
    <div className="w-44 flex-shrink-0 bg-white dark:bg-surface-900 border-r border-gray-200/80 dark:border-white/[0.06] flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/80 dark:border-white/[0.06]">
        <span className="text-xs font-semibold text-gray-900 dark:text-white">幻灯片</span>
        <button
          onClick={onAddSlide}
          className="w-6 h-6 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center hover:bg-primary-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={index}
            isActive={slide.id === activeSlideId}
            onClick={() => onSetActiveSlide(slide.id)}
            onDelete={() => onDeleteSlide(slide.id)}
          />
        ))}
      </div>
    </div>
  );
}
