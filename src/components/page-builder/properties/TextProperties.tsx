import type { TextStyle } from '../../../types/pageBuilder';

interface TextPropertiesProps {
  content: TextStyle;
  onUpdate: (content: TextStyle) => void;
}

export default function TextProperties({ content, onUpdate }: TextPropertiesProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">字号</label>
        <input
          type="number"
          value={content.fontSize || 14}
          onChange={(e) => onUpdate({ ...content, fontSize: parseInt(e.target.value) || 14 })}
          className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={content.color || '#1e293b'}
            onChange={(e) => onUpdate({ ...content, color: e.target.value })}
            className="w-8 h-8 rounded border border-gray-200 dark:border-white/[0.06] cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">{content.color || '#1e293b'}</span>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">对齐</label>
        <div className="flex gap-1">
          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ ...content, textAlign: align })}
              className={`flex-1 py-1 text-xs rounded border transition-colors ${
                content.textAlign === align
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
                  : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
              }`}
            >
              {align === 'left' ? '左' : align === 'center' ? '中' : align === 'right' ? '右' : '两端'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onUpdate({ ...content, fontWeight: content.fontWeight === 'bold' ? 'normal' : 'bold' })}
          className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
            content.fontWeight === 'bold'
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
              : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => onUpdate({ ...content, fontStyle: content.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
            content.fontStyle === 'italic'
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
              : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
          }`}
        >
          <em>I</em>
        </button>
        <button
          onClick={() =>
            onUpdate({ ...content, textDecoration: content.textDecoration === 'underline' ? 'none' : 'underline' })
          }
          className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
            content.textDecoration === 'underline'
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
              : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
          }`}
        >
          <u>U</u>
        </button>
      </div>
    </div>
  );
}
