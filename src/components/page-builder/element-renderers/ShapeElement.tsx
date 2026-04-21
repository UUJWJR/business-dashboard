import type { ShapePayload } from '../../../types/pageBuilder';

interface ShapeElementProps {
  content: ShapePayload;
}

export default function ShapeElement({ content }: ShapeElementProps) {
  const { shapeType, fillColor, strokeColor, strokeWidth, opacity } = content;

  const commonProps = {
    fill: fillColor || (shapeType === 'line' ? 'none' : '#94a3b8'),
    stroke: strokeColor || '#64748b',
    strokeWidth: strokeWidth ?? (shapeType === 'line' ? 2 : 0),
    opacity: opacity ?? 1,
  };

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {shapeType === 'rect' && <rect x="0" y="0" width="100" height="100" {...commonProps} />}
      {shapeType === 'roundedRect' && <rect x="0" y="0" width="100" height="100" rx="8" {...commonProps} />}
      {shapeType === 'circle' && <circle cx="50" cy="50" r="50" {...commonProps} />}
      {shapeType === 'triangle' && <polygon points="50,5 95,95 5,95" {...commonProps} />}
      {shapeType === 'arrow' && (
        <path d="M10,50 L70,50 L70,30 L95,55 L70,80 L70,60 L10,60 Z" {...commonProps} />
      )}
      {shapeType === 'line' && <line x1="0" y1="50" x2="100" y2="50" {...commonProps} />}
    </svg>
  );
}
