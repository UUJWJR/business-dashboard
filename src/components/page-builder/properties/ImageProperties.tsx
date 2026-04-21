import { useRef } from 'react';
import type { ImagePayload } from '../../../types/pageBuilder';

interface ImagePropertiesProps {
  content: ImagePayload;
  onUpdate: (content: ImagePayload) => void;
}

export default function ImageProperties({ content, onUpdate }: ImagePropertiesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpdate({ ...content, src: String(ev.target?.result || '') });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">上传图片</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-xs text-gray-700 dark:text-gray-300 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/20 dark:file:text-primary-300"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">图片 URL</label>
        <input
          type="text"
          value={content.src || ''}
          onChange={(e) => onUpdate({ ...content, src: e.target.value })}
          placeholder="https://..."
          className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">圆角 (px)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={content.borderRadius ?? 0}
          onChange={(e) => onUpdate({ ...content, borderRadius: parseInt(e.target.value) || 0 })}
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
