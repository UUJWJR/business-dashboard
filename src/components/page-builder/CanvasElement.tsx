import { useCallback, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import type { PageBuilderElement, CanvasSize, TitlePayload, TextPayload, TablePayload, ChartPayload, ShapePayload, ImagePayload } from '../../types/pageBuilder';
import TitleElement from './element-renderers/TitleElement';
import TextElement from './element-renderers/TextElement';
import TableElement from './element-renderers/TableElement';
import ChartElement from './element-renderers/ChartElement';
import ShapeElement from './element-renderers/ShapeElement';
import ImageElement from './element-renderers/ImageElement';

interface CanvasElementProps {
  element: PageBuilderElement;
  canvasSize: CanvasSize;
  isSelected: boolean;
  isReadOnly: boolean;
  onSelect: () => void;
  onUpdate: (id: string, partial: Partial<PageBuilderElement>) => void;
  onRemove: (id: string) => void;
}

const GRID_LOGICAL_PX = 20;

export default function CanvasElement({
  element,
  canvasSize,
  isSelected,
  isReadOnly,
  onSelect,
  onUpdate,
  onRemove,
}: CanvasElementProps) {
  const rndRef = useRef<Rnd>(null);

  const pixelX = (element.position.x / 100) * canvasSize.width;
  const pixelY = (element.position.y / 100) * canvasSize.height;
  const pixelW = (element.size.width / 100) * canvasSize.width;
  const pixelH = (element.size.height / 100) * canvasSize.height;

  const gridSize = canvasSize.width > 0 ? (GRID_LOGICAL_PX / canvasSize.width) * 100 : 1;
  const gridPixelX = canvasSize.width > 0 ? (gridSize / 100) * canvasSize.width : GRID_LOGICAL_PX;
  const gridPixelY = canvasSize.height > 0 ? (gridSize / 100) * canvasSize.height : GRID_LOGICAL_PX;

  const handleDragStop = useCallback(
    (_e: unknown, d: { x: number; y: number }) => {
      if (canvasSize.width === 0 || canvasSize.height === 0) return;
      const newX = (d.x / canvasSize.width) * 100;
      const newY = (d.y / canvasSize.height) * 100;
      onUpdate(element.id, {
        position: {
          x: Math.max(0, Math.min(100 - element.size.width, newX)),
          y: Math.max(0, Math.min(100 - element.size.height, newY)),
        },
      });
    },
    [canvasSize, element.id, element.size, onUpdate]
  );

  const handleResizeStop = useCallback(
    (_e: unknown, _direction: string, ref: HTMLElement, _delta: unknown, position: { x: number; y: number }) => {
      if (canvasSize.width === 0 || canvasSize.height === 0) return;
      const newW = (ref.offsetWidth / canvasSize.width) * 100;
      const newH = (ref.offsetHeight / canvasSize.height) * 100;
      const newX = (position.x / canvasSize.width) * 100;
      const newY = (position.y / canvasSize.height) * 100;
      onUpdate(element.id, {
        size: {
          width: Math.max(5, Math.min(100, newW)),
          height: Math.max(5, Math.min(100, newH)),
        },
        position: {
          x: Math.max(0, Math.min(100 - newW, newX)),
          y: Math.max(0, Math.min(100 - newH, newY)),
        },
      });
    },
    [canvasSize, element.id, onUpdate]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelected && (e.key === 'Delete' || e.key === 'Backspace')) {
        // Don't delete if user is editing text
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.getAttribute('contenteditable') === 'true')) {
          return;
        }
        onRemove(element.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, element.id, onRemove]);

  const renderContent = () => {
    switch (element.type) {
      case 'title':
        return <TitleElement content={element.content as TitlePayload} isSelected={isSelected} onUpdate={(content: TitlePayload) => onUpdate(element.id, { content })} />;
      case 'text':
        return <TextElement content={element.content as TextPayload} isSelected={isSelected} onUpdate={(content: TextPayload) => onUpdate(element.id, { content })} />;
      case 'table':
        return <TableElement content={element.content as TablePayload} onUpdate={(content: TablePayload) => onUpdate(element.id, { content })} />;
      case 'chart':
        return <ChartElement content={element.content as ChartPayload} />;
      case 'shape':
        return <ShapeElement content={element.content as ShapePayload} />;
      case 'image':
        return <ImageElement content={element.content as ImagePayload} />;
      default:
        return null;
    }
  };

  if (canvasSize.width === 0 || canvasSize.height === 0) {
    return null;
  }

  return (
    <Rnd
      ref={rndRef}
      data-element-id={element.id}
      position={{ x: pixelX, y: pixelY }}
      size={{ width: pixelW, height: pixelH }}
      bounds="parent"
      dragGrid={isReadOnly ? undefined : [gridPixelX, gridPixelY]}
      resizeGrid={isReadOnly ? undefined : [gridPixelX, gridPixelY]}
      disableDragging={isReadOnly}
      enableResizing={!isReadOnly}
      onDragStart={isReadOnly ? undefined : onSelect}
      onDragStop={isReadOnly ? undefined : handleDragStop}
      onResizeStart={isReadOnly ? undefined : onSelect}
      onResizeStop={isReadOnly ? undefined : handleResizeStop}
      className={`group ${isSelected ? 'z-50' : ''}`}
      style={{ zIndex: element.zIndex }}
      resizeHandleClasses={{
        bottomRight: 'rnd-handle',
      }}
      resizeHandleStyles={{
        bottomRight: {
          width: 12,
          height: 12,
          bottom: -4,
          right: -4,
          borderRadius: '50%',
          background: '#6366f1',
          border: '2px solid white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          position: 'absolute',
          cursor: 'se-resize',
          zIndex: 100,
        },
      }}
    >
      <div
        className={`w-full h-full rounded-md overflow-hidden transition-all ${
          isSelected
            ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-surface-900'
            : 'hover:ring-1 hover:ring-primary-300 dark:hover:ring-primary-700'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {renderContent()}
      </div>
    </Rnd>
  );
}
