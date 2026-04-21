import { useRef, useState, useCallback } from 'react';
import type { TitlePayload } from '../../../types/pageBuilder';

interface TitleElementProps {
  content: TitlePayload;
  isSelected: boolean;
  onUpdate: (content: TitlePayload) => void;
}

export default function TitleElement({ content, isSelected, onUpdate }: TitleElementProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (ref.current) {
      onUpdate({ ...content, text: ref.current.innerText || '请输入标题' });
    }
  }, [content, onUpdate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        (e.target as HTMLElement).blur();
      }
    },
    []
  );

  const effectiveAlign = content.align || content.textAlign || 'left';
  const alignClass =
    effectiveAlign === 'center' ? 'text-center' : effectiveAlign === 'right' ? 'text-right' : 'text-left';

  return (
    <h2
      ref={ref}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`w-full h-full flex items-center px-2 text-gray-900 dark:text-white outline-none cursor-pointer ${alignClass} ${
        isEditing ? 'bg-primary-50/50 dark:bg-primary-900/20 rounded' : ''
      }`}
      style={{
        fontSize: `${content.fontSize || 24}px`,
        lineHeight: 1.3,
        color: content.color || undefined,
        fontWeight: content.fontWeight || 'bold',
        fontStyle: content.fontStyle || 'normal',
        textDecoration: content.textDecoration || 'none',
      }}
    >
      {content.text}
    </h2>
  );
}
