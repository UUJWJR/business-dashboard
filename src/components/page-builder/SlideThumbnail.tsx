import { X } from 'lucide-react';
import type { Slide } from '../../types/pageBuilder';

interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function SlideThumbnail({ slide, index, isActive, onClick, onDelete }: SlideThumbnailProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full aspect-video rounded-md border-2 overflow-hidden bg-white transition-all ${
          isActive
            ? 'border-primary-500 ring-2 ring-primary-200'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
        }`}
      >
        <div className="p-1 h-full overflow-hidden">
          <div className="text-[6px] leading-tight text-gray-400 text-center mb-0.5">{slide.name}</div>
          <div className="relative w-full h-full">
            {slide.elements.slice(0, 3).map((el) => (
              <div
                key={el.id}
                className="absolute bg-primary-200 rounded-sm"
                style={{
                  left: `${el.position.x}%`,
                  top: `${el.position.y}%`,
                  width: `${Math.min(el.size.width, 30)}%`,
                  height: `${Math.min(el.size.height, 20)}%`,
                }}
              />
            ))}
          </div>
        </div>
      </button>
      <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="absolute bottom-1 left-1 text-[8px] bg-gray-800/60 text-white px-1 rounded">
        {index + 1}
      </div>
    </div>
  );
}
