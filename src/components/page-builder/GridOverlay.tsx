import type { GridType } from '../../types/pageBuilder';

interface GridOverlayProps {
  gridType: GridType;
  gridSize: number;
}

export default function GridOverlay({ gridType, gridSize }: GridOverlayProps) {
  if (gridType === 'none') return null;
  const size = `${gridSize}px`;
  if (gridType === 'dot') {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: `${size} ${size}`,
        }}
      />
    );
  }
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
        backgroundSize: `${size} ${size}`,
      }}
    />
  );
}
