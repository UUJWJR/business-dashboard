import type { ShapePayload, ShapeType } from '../../../types/pageBuilder';

interface ShapePropertiesProps {
  content: ShapePayload;
  onUpdate: (content: ShapePayload) => void;
}

const shapeOptions: { value: ShapeType; label: string }[] = [
  { value: 'rect', label: '矩形' },
  { value: 'roundedRect', label: '圆角矩形' },
  { value: 'circle', label: '圆形' },
  { value: 'triangle', label: '三角形' },
  { value: 'arrow', label: '箭头' },
  { value: 'line', label: '线条' },
];

export default function ShapeProperties({ content, onUpdate }: ShapePropertiesProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">形状</label>
        <select
          value={content.shapeType}
          onChange={(e) => onUpdate({ ...content, shapeType: e.target.value as ShapeType })}
          className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
        >
          {shapeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">填充颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={content.fillColor || '#94a3b8'}
            onChange={(e) => onUpdate({ ...content, fillColor: e.target.value })}
            className="w-8 h-8 rounded border border-gray-200 dark:border-white/[0.06] cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">{content.fillColor || '#94a3b8'}</span>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">边框颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={content.strokeColor || '#64748b'}
            onChange={(e) => onUpdate({ ...content, strokeColor: e.target.value })}
            className="w-8 h-8 rounded border border-gray-200 dark:border-white/[0.06] cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">{content.strokeColor || '#64748b'}</span>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">边框粗细</label>
        <input
          type="number"
          min={0}
          max={20}
          value={content.strokeWidth ?? 0}
          onChange={(e) => onUpdate({ ...content, strokeWidth: parseInt(e.target.value) || 0 })}
          className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
          不透明度 ({Math.round((content.opacity ?? 1) * 100)}%)
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={content.opacity ?? 1}
          onChange={(e) => onUpdate({ ...content, opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
