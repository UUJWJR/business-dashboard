import { useRef, useEffect, useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { PageBuilderElement, CanvasSize } from '../../types/pageBuilder';
import CanvasElement from './CanvasElement';

interface CanvasProps {
  elements: PageBuilderElement[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, partial: Partial<PageBuilderElement>) => void;
  onBringToFront: (id: string) => void;
  onRemoveElement: (id: string) => void;
}

export default function Canvas({
  elements,
  selectedId,
  onSelectElement,
  onUpdateElement,
  onBringToFront,
  onRemoveElement,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 0, height: 0 });

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-drop-area',
  });

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onSelectElement(null);
      }
    },
    [onSelectElement]
  );

  return (
    <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50/50 dark:bg-black/20">
      <div
        ref={(node) => {
          setNodeRef(node);
          (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onClick={handleCanvasClick}
        className={`relative w-full max-w-[1200px] aspect-video bg-white dark:bg-surface-900 rounded-card shadow-card dark:shadow-card-dark overflow-hidden transition-colors ${
          isOver ? 'ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-surface-950' : ''
        }`}
      >
        {/* Grid overlay - light mode */}
        <div
          className="absolute inset-0 pointer-events-none dark:hidden"
          style={{
            backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
        {/* Grid overlay - dark mode */}
        <div
          className="absolute inset-0 pointer-events-none hidden dark:block"
          style={{
            backgroundImage: `linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            canvasSize={canvasSize}
            isSelected={element.id === selectedId}
            onSelect={() => {
              onSelectElement(element.id);
              onBringToFront(element.id);
            }}
            onUpdate={onUpdateElement}
            onRemove={onRemoveElement}
          />
        ))}
      </div>
    </div>
  );
}
