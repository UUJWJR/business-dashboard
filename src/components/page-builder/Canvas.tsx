import { useRef, useEffect, useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { PageBuilderElement, CanvasSize, GridType } from '../../types/pageBuilder';
import CanvasElement from './CanvasElement';
import GridOverlay from './GridOverlay';

interface CanvasProps {
  elements: PageBuilderElement[];
  selectedId: string | null;
  gridType: GridType;
  gridSize: number;
  isSubmitted: boolean;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, partial: Partial<PageBuilderElement>) => void;
  onBringToFront: (id: string) => void;
  onRemoveElement: (id: string) => void;
}

export default function Canvas({
  elements,
  selectedId,
  gridType,
  gridSize,
  isSubmitted,
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
        <GridOverlay gridType={gridType} gridSize={gridSize} />

        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            canvasSize={canvasSize}
            isSelected={element.id === selectedId}
            isReadOnly={isSubmitted}
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
