import { useRef, useState, useCallback } from 'react';
import type { TextPayload } from '../../../types/pageBuilder';

interface TextElementProps {
  content: TextPayload;
  isSelected: boolean;
  onUpdate: (content: TextPayload) => void;
}

export default function TextElement({ content, isSelected, onUpdate }: TextElementProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (ref.current) {
      onUpdate({ ...content, text: ref.current.innerText || '请输入正文内容' });
    }
  }, [content, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, []);

  return (
    <p
      ref={ref}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`w-full h-full p-2 text-gray-700 dark:text-gray-300 outline-none cursor-pointer overflow-auto ${
        isEditing ? 'bg-primary-50/50 dark:bg-primary-900/20 rounded' : ''
      }`}
      style={{ fontSize: `${content.fontSize || 14}px`, lineHeight: 1.6 }}
    >
      {content.text}
    </p>
  );
}
