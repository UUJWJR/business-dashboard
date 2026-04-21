import { useState, useCallback } from 'react';
import type { TablePayload } from '../../../types/pageBuilder';

interface TableElementProps {
  content: TablePayload;
  onUpdate?: (content: TablePayload) => void;
}

export default function TableElement({ content, onUpdate }: TableElementProps) {
  const { cells, colWidths, rowHeights, headerRowCount } = content;
  const [editing, setEditing] = useState<{ row: number; col: number } | null>(null);

  const updateCellValue = useCallback(
    (row: number, col: number, value: string) => {
      if (!onUpdate) return;
      const newCells = cells.map((r) => r.map((c) => ({ ...c })));
      newCells[row][col].value = value;
      onUpdate({ ...content, cells: newCells });
    },
    [cells, content, onUpdate]
  );

  const isHeader = (rowIndex: number) => rowIndex < headerRowCount;

  return (
    <div className="w-full h-full overflow-auto p-2">
      <table className="w-full text-sm border-collapse">
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: `${w}%` }} />
          ))}
        </colgroup>
        <tbody>
          {cells.map((row, ri) => (
            <tr
              key={ri}
              style={{ height: `${rowHeights[ri] ?? 0}%` }}
              className="border-b border-gray-100 dark:border-white/[0.04] last:border-0"
            >
              {row.map((cell, ci) => {
                if (cell.hidden) return null;
                const header = isHeader(ri);
                const Tag = header ? 'th' : 'td';
                return (
                  <Tag
                    key={ci}
                    rowSpan={cell.rowSpan}
                    colSpan={cell.colSpan}
                    className={`border border-gray-200 dark:border-white/[0.06] px-2 py-1 ${
                      header
                        ? 'font-semibold bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                    style={{
                      backgroundColor: cell.style?.backgroundColor,
                      color: cell.style?.color,
                      fontWeight: cell.style?.fontWeight,
                      textAlign: cell.style?.textAlign,
                    }}
                    onDoubleClick={() => {
                      if (onUpdate) setEditing({ row: ri, col: ci });
                    }}
                  >
                    {editing?.row === ri && editing?.col === ci ? (
                      <input
                        autoFocus
                        value={cell.value}
                        onChange={(e) => updateCellValue(ri, ci, e.target.value)}
                        onBlur={() => setEditing(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditing(null);
                        }}
                        className="w-full bg-transparent outline-none text-inherit"
                        style={{
                          textAlign: cell.style?.textAlign || 'left',
                          fontWeight: cell.style?.fontWeight,
                          color: 'inherit',
                        }}
                      />
                    ) : (
                      cell.value
                    )}
                  </Tag>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
