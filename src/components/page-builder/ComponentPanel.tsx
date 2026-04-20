import { useDraggable } from '@dnd-kit/core';
import { Type, AlignLeft, Table, BarChart3 } from 'lucide-react';
import type { PageBuilderElementType } from '../../types/pageBuilder';

interface DraggableItemProps {
  type: PageBuilderElementType;
  label: string;
  icon: React.ElementType;
}

function DraggableItem({ type, label, icon: Icon }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 px-4 py-3 rounded-btn cursor-grab active:cursor-grabbing transition-all ${
        isDragging
          ? 'opacity-50 scale-95'
          : 'bg-surface-50 dark:bg-white/[0.04] hover:bg-surface-100 dark:hover:bg-white/[0.08]'
      }`}
    >
      <div className="w-8 h-8 rounded-md bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </div>
  );
}

const items: { type: PageBuilderElementType; label: string; icon: React.ElementType }[] = [
  { type: 'title', label: '标题', icon: Type },
  { type: 'text', label: '文字', icon: AlignLeft },
  { type: 'table', label: '表格', icon: Table },
  { type: 'chart', label: '图表', icon: BarChart3 },
];

export default function ComponentPanel() {
  return (
    <div className="w-64 flex-shrink-0 bg-white dark:bg-surface-900 border-r border-gray-200/80 dark:border-white/[0.06] flex flex-col">
      <div className="px-4 py-4 border-b border-gray-200/80 dark:border-white/[0.06]">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">组件库</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">拖拽组件到画布</p>
      </div>
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {items.map((item) => (
          <DraggableItem key={item.type} {...item} />
        ))}
      </div>
    </div>
  );
}
