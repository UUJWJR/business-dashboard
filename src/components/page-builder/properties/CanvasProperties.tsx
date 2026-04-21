import type { GridType } from '../../../types/pageBuilder';

interface CanvasPropertiesProps {
  background: string;
  gridType: GridType;
  gridSize: number;
  onUpdateBackground: (bg: string) => void;
  onSetGrid: (type: GridType, size: number) => void;
}

export default function CanvasProperties({ background, gridType, gridSize, onUpdateBackground, onSetGrid }: CanvasPropertiesProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">背景颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={background}
            onChange={(e) => onUpdateBackground(e.target.value)}
            className="w-8 h-8 rounded border border-gray-200 dark:border-white/[0.06] cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">{background}</span>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">网格样式</label>
        <div className="flex gap-1">
          {(['none', 'dot', 'grid'] as GridType[]).map((type) => (
            <button
              key={type}
              onClick={() => onSetGrid(type, gridSize)}
              className={`flex-1 py-1.5 text-xs rounded-btn border transition-colors ${
                gridType === type
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400'
              }`}
            >
              {type === 'none' ? '无' : type === 'dot' ? '点阵' : '网格'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">网格间距</label>
        <div className="flex gap-1">
          {[8, 12, 20].map((size) => (
            <button
              key={size}
              onClick={() => onSetGrid(gridType, size)}
              className={`flex-1 py-1.5 text-xs rounded-btn border transition-colors ${
                gridSize === size
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400'
              }`}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
