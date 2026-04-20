import { useCallback, useRef } from 'react';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { Presentation, Download, FileImage, Trash2 } from 'lucide-react';
import ModuleLayout from '../components/layout/ModuleLayout';
import ComponentPanel from '../components/page-builder/ComponentPanel';
import Canvas from '../components/page-builder/Canvas';
import ElementToolbar from '../components/page-builder/ElementToolbar';
import { usePageBuilder } from '../hooks/usePageBuilder';
import { exportToPNG, exportToPDF } from '../utils/pageBuilderExport';
import type { PageBuilderElementType } from '../types/pageBuilder';

export default function PageBuilder() {
  const {
    elements,
    selectedId,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    bringToFront,
    autoResize,
    clearAll,
  } = usePageBuilder();

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || over.id !== 'canvas-drop-area') return;

      const type = active.data.current?.type as PageBuilderElementType;
      if (!type) return;

      const overRect = over.rect;
      const translatedLeft = active.rect.current.translated?.left;
      const translatedTop = active.rect.current.translated?.top;

      if (translatedLeft == null || translatedTop == null) return;

      const relativeX = translatedLeft - overRect.left;
      const relativeY = translatedTop - overRect.top;

      const percentX = (relativeX / overRect.width) * 100;
      const percentY = (relativeY / overRect.height) * 100;

      addElement(type, {
        x: Math.max(0, Math.min(95, percentX)),
        y: Math.max(0, Math.min(95, percentY)),
      });
    },
    [addElement]
  );

  const handleExportPNG = useCallback(async () => {
    const canvasEl = canvasContainerRef.current?.querySelector('.aspect-video') as HTMLElement;
    if (canvasEl) {
      await exportToPNG(canvasEl, '页面制作');
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    const canvasEl = canvasContainerRef.current?.querySelector('.aspect-video') as HTMLElement;
    if (canvasEl) {
      await exportToPDF(canvasEl, '页面制作');
    }
  }, []);

  const selectedElement = elements.find((el) => el.id === selectedId);

  return (
    <ModuleLayout
      title="页面制作"
      icon={<Presentation className="w-6 h-6" />}
      actions={
        <>
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-2 px-3 py-2 rounded-btn text-sm font-medium bg-white dark:bg-surface-900 border border-gray-200/80 dark:border-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            <FileImage className="w-4 h-4" />
            导出图片
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-btn text-sm font-medium bg-white dark:bg-surface-900 border border-gray-200/80 dark:border-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            <Download className="w-4 h-4" />
            导出PDF
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-3 py-2 rounded-btn text-sm font-medium bg-white dark:bg-surface-900 border border-gray-200/80 dark:border-white/[0.06] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            清空
          </button>
        </>
      }
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div ref={canvasContainerRef} className="relative flex h-[calc(100vh-8rem)] rounded-card overflow-hidden border border-gray-200/80 dark:border-white/[0.06] bg-white dark:bg-surface-900">
          <ComponentPanel />
          <Canvas
            elements={elements}
            selectedId={selectedId}
            onSelectElement={selectElement}
            onUpdateElement={updateElement}
            onBringToFront={bringToFront}
            onRemoveElement={removeElement}
          />
        </div>
        {selectedElement && (
          <ElementToolbar
            element={selectedElement}
            onUpdate={updateElement}
            onAutoResize={autoResize}
            onRemove={removeElement}
          />
        )}
      </DndContext>
    </ModuleLayout>
  );
}
