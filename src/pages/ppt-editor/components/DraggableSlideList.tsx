import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, Table2 } from 'lucide-react';
import type { PptSlideData } from '../../../types/ppt';
import MarkdownEditor from './MarkdownEditor';
import AIConclusionGenerator from './AIConclusionGenerator';

interface SortableItemProps {
  slide: PptSlideData;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (field: keyof PptSlideData, value: string) => void;
  onUpdateBlockConclusion: (blockId: string, value: string) => void;
  titleError: boolean;
  conclusionError: boolean;
  noteError: boolean;
}

function SortableItem({
  slide,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onUpdateBlockConclusion,
  titleError,
  conclusionError,
  noteError,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const blockCount = slide.content.type === 'mixed' ? slide.content.blocks.length : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-white dark:bg-gray-800 overflow-hidden ${
        isExpanded
          ? 'border-primary-200 dark:border-primary-800'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center px-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing text-gray-400"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between py-3 px-2 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs flex items-center justify-center text-gray-600 dark:text-gray-300">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[300px]">
              {slide.title}
            </span>
            {blockCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Table2 className="w-3 h-3" />
                {blockCount} 个表格
              </span>
            )}
            {(titleError || conclusionError || noteError) && (
              <span className="text-xs text-red-500">字数超限</span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              标题（最多20字）
            </label>
            <input
              type="text"
              value={slide.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              maxLength={25}
              className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                titleError
                  ? 'border-red-300 focus:ring-red-200 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-primary-200 bg-white dark:bg-gray-800'
              } text-gray-900 dark:text-white`}
            />
            <p className={`mt-0.5 text-xs text-right ${titleError ? 'text-red-500' : 'text-gray-400'}`}>
              {slide.title.length}/20
            </p>
          </div>

          {/* Slide-level conclusion (optional) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              本页总结论（最多150字）
            </label>
            <MarkdownEditor
              value={slide.conclusion}
              onChange={(value) => onUpdate('conclusion', value)}
              placeholder="输入本页总体分析结论，支持 Markdown 语法"
              rows={2}
            />
            <p className={`mt-0.5 text-xs text-right ${conclusionError ? 'text-red-500' : 'text-gray-400'}`}>
              {slide.conclusion.length}/150
            </p>
          </div>

          {/* Per-block editing */}
          {slide.content.type === 'mixed' && slide.content.blocks.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                表格分析结论
              </p>
              {slide.content.blocks.map((block, bIdx) => (
                <div
                  key={block.id}
                  className="p-3 rounded-md border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs flex items-center justify-center font-medium">
                      {bIdx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {block.title || `表格 ${bIdx + 1}`}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({(block.config as { columns?: string[] })?.columns?.length ?? 0} 列)
                    </span>
                  </div>

                  <MarkdownEditor
                    value={block.conclusion}
                    onChange={(value) => onUpdateBlockConclusion(block.id, value)}
                    placeholder={`输入表格 ${bIdx + 1} 的分析结论`}
                    rows={2}
                  />

                  <AIConclusionGenerator
                    tableData={
                      block.type === 'table'
                        ? {
                            columns: (block.config as { columns: string[] }).columns,
                            rows: (block.config as { rows: Record<string, string | number>[] }).rows,
                          }
                        : undefined
                    }
                    title={slide.title}
                    currentConclusion={block.conclusion}
                    onUpdate={(value) => onUpdateBlockConclusion(block.id, value)}
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              备注（最多40字）
            </label>
            <input
              type="text"
              value={slide.note}
              onChange={(e) => onUpdate('note', e.target.value)}
              maxLength={45}
              className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                noteError
                  ? 'border-red-300 focus:ring-red-200 bg-red-50 dark:bg-red-900/10'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-primary-200 bg-white dark:bg-gray-800'
              } text-gray-900 dark:text-white`}
            />
            <p className={`mt-0.5 text-xs text-right ${noteError ? 'text-red-500' : 'text-gray-400'}`}>
              {slide.note.length}/40
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  slides: PptSlideData[];
  errors: Record<string, boolean>;
  onReorder: (slides: PptSlideData[]) => void;
  onUpdateSlide: (index: number, field: keyof PptSlideData, value: string) => void;
  onUpdateBlockConclusion: (slideIndex: number, blockId: string, value: string) => void;
}

export default function DraggableSlideList({
  slides,
  errors,
  onReorder,
  onUpdateSlide,
  onUpdateBlockConclusion,
}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = slides.findIndex((s) => s.id === active.id);
        const newIndex = slides.findIndex((s) => s.id === over.id);
        const reordered = arrayMove(slides, oldIndex, newIndex).map((slide, i) => ({
          ...slide,
          pageNumber: i + 1,
        }));
        onReorder(reordered);
      }
    },
    [slides, onReorder]
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {slides.map((slide, index) => (
            <SortableItem
              key={slide.id}
              slide={slide}
              index={index}
              isExpanded={expandedIndex === index}
              onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
              onUpdate={(field, value) => onUpdateSlide(index, field, value)}
              onUpdateBlockConclusion={(blockId, value) =>
                onUpdateBlockConclusion(index, blockId, value)
              }
              titleError={slide.title.length > 20 || errors[`${index}-title`]}
              conclusionError={slide.conclusion.length > 150 || errors[`${index}-conclusion`]}
              noteError={slide.note.length > 40 || errors[`${index}-note`]}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
