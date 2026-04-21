import { useState } from 'react';
import { X, Plus, Palette } from 'lucide-react';
import type { PptTemplate } from '../../../types/ppt';

interface Props {
  onSave: (template: PptTemplate) => void;
  onCancel: () => void;
}

export default function TemplateDesigner({ onSave, onCancel }: Props) {
  const [name, setName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [headerColor, setHeaderColor] = useState('#00467F');
  const [conclusionBg, setConclusionBg] = useState('#D6E7F515');
  const [conclusionBorder, setConclusionBorder] = useState('#0070C0');

  const handleSave = () => {
    if (!name.trim()) return;
    const id = `custom-${Date.now()}`;
    onSave({
      id,
      name: name.trim(),
      backgroundColor,
      headerStyle: { fontSize: 24, color: headerColor, fontWeight: 'bold' },
      conclusionStyle: {
        color: '#1A1A1A',
        backgroundColor: conclusionBg,
        borderColor: conclusionBorder,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">自定义模板</h2>
          </div>
          <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">模板名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：年度汇报专用"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">背景色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-gray-400">{backgroundColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">标题色</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={headerColor}
                  onChange={(e) => setHeaderColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-gray-400">{headerColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">结论区背景</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={conclusionBg.startsWith('#') ? conclusionBg.slice(0, 7) : '#D6E7F5'}
                  onChange={(e) => setConclusionBg(e.target.value + '15')}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-gray-400">{conclusionBg.slice(0, 7)}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">结论区边框</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={conclusionBorder}
                  onChange={(e) => setConclusionBorder(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                />
                <span className="text-xs text-gray-400">{conclusionBorder}</span>
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div
            className="rounded-lg border p-4 aspect-video flex flex-col justify-between"
            style={{ backgroundColor, borderColor: headerColor + '40' }}
          >
            <div className="text-lg font-bold" style={{ color: headerColor }}>预览标题</div>
            <div
              className="text-sm px-2 py-1 rounded border-l-4"
              style={{
                color: '#1A1A1A',
                backgroundColor: conclusionBg,
                borderLeftColor: conclusionBorder,
              }}
            >
              预览结论区文本
            </div>
            <div className="text-right text-xs opacity-50">第 1 页 / 共 6 页</div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            保存模板
          </button>
        </div>
      </div>
    </div>
  );
}
