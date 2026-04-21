import type { ImagePayload } from '../../../types/pageBuilder';

interface ImageElementProps {
  content: ImagePayload;
}

export default function ImageElement({ content }: ImageElementProps) {
  const { src, opacity, borderRadius } = content;

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-surface-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded">
        <span className="text-xs text-gray-500 dark:text-gray-400">点击上传图片</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="canvas"
      className="w-full h-full object-cover"
      style={{
        opacity: opacity ?? 1,
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
      }}
      draggable={false}
    />
  );
}
