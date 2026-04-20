import { useRef, useEffect } from 'react';
import { Maximize2, Trash2 } from 'lucide-react';
import type { PageBuilderElement, Position, Size } from '../../types/pageBuilder';

interface ElementToolbarProps {
  element: PageBuilderElement;
  onUpdate: (id: string, partial: Partial<PageBuilderElement>) => void;
  onAutoResize: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function ElementToolbar({
  element,
  onUpdate,
  onAutoResize,
  onRemove,
}: ElementToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Position toolbar above the element
    const el = document.querySelector(`[data-element-id="${element.id}"]`);
    if (el && toolbarRef.current) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement?.getBoundingClientRect();
      if (parentRect) {
        toolbarRef.current.style.left = `${rect.left - parentRect.left}px`;
        toolbarRef.current.style.top = `${rect.top - parentRect.top - 48}px`;
      }
    }
  }, [element.id, element.position, element.size]);

  const handlePositionChange = (axis: 'x' | 'y', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const newPos: Position = {
      ...element.position,
      [axis]: Math.max(0, Math.min(100, num)),
    };
    onUpdate(element.id, { position: newPos });
  };

  const handleSizeChange = (dim: 'width' | 'height', value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const newSize: Size = {
      ...element.size,
      [dim]: Math.max(5, Math.min(100, num)),
    };
    onUpdate(element.id, { size: newSize });
  };

  return (
    <div
      ref={toolbarRef}
      className="absolute z-[60] flex items-center gap-2 px-3 py-2 bg-white dark:bg-surface-900 rounded-lg shadow-float dark:shadow-float-dark border border-gray-200 dark:border-white/[0.06] whitespace-nowrap"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">X</label>
        <input
          type="number"
          value={Math.round(element.position.x * 10) / 10}
          onChange={(e) => handlePositionChange('x', e.target.value)}
          className="w-14 px-1.5 py-0.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">Y</label>
        <input
          type="number"
          value={Math.round(element.position.y * 10) / 10}
          onChange={(e) => handlePositionChange('y', e.target.value)}
          className="w-14 px-1.5 py-0.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div className="w-px h-4 bg-gray-200 dark:bg-white/[0.06]" />
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">W</label>
        <input
          type="number"
          value={Math.round(element.size.width * 10) / 10}
          onChange={(e) => handleSizeChange('width', e.target.value)}
          className="w-14 px-1.5 py-0.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-500 dark:text-gray-400">H</label>
        <input
          type="number"
          value={Math.round(element.size.height * 10) / 10}
          onChange={(e) => handleSizeChange('height', e.target.value)}
          className="w-14 px-1.5 py-0.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div className="w-px h-4 bg-gray-200 dark:bg-white/[0.06]" />
      <button
        onClick={() => onAutoResize(element.id)}
        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
        title="自适应大小"
      >
        <Maximize2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
      </button>
      <button
        onClick={() => onRemove(element.id)}
        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        title="删除"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-500" />
      </button>
    </div>
  );
}
