import { useState, useCallback } from 'react';
import type { TablePayload, TableCellStyle } from '../../../types/pageBuilder';
import { insertRow, deleteRow, insertCol, deleteCol, mergeCells, splitCell } from '../../../utils/tableUtils';

interface TablePropertiesProps {
  content: TablePayload;
  onUpdate: (content: TablePayload) => void;
}

export default function TableProperties({ content, onUpdate }: TablePropertiesProps) {
  const { cells } = content;
  const [mergeStartRow, setMergeStartRow] = useState(0);
  const [mergeStartCol, setMergeStartCol] = useState(0);
  const [mergeEndRow, setMergeEndRow] = useState(0);
  const [mergeEndCol, setMergeEndCol] = useState(0);
  const [styleRow, setStyleRow] = useState(0);
  const [styleCol, setStyleCol] = useState(0);
  const [insertRowIndex, setInsertRowIndex] = useState(0);
  const [insertColIndex, setInsertColIndex] = useState(0);

  const updateCellValue = useCallback(
    (row: number, col: number, value: string) => {
      const newCells = cells.map((r) => r.map((c) => ({ ...c })));
      newCells[row][col].value = value;
      onUpdate({ ...content, cells: newCells });
    },
    [cells, content, onUpdate]
  );

  const updateCellStyle = useCallback(
    (row: number, col: number, style: Partial<TableCellStyle>) => {
      const newCells = cells.map((r) => r.map((c) => ({ ...c })));
      newCells[row][col].style = { ...newCells[row][col].style, ...style };
      onUpdate({ ...content, cells: newCells });
    },
    [cells, content, onUpdate]
  );

  const handleInsertRow = () => onUpdate(insertRow(content, insertRowIndex));
  const handleDeleteRow = () => onUpdate(deleteRow(content, insertRowIndex));
  const handleInsertCol = () => onUpdate(insertCol(content, insertColIndex));
  const handleDeleteCol = () => onUpdate(deleteCol(content, insertColIndex));
  const handleMerge = () => onUpdate(mergeCells(content, mergeStartRow, mergeStartCol, mergeEndRow, mergeEndCol));
  const handleSplit = () => onUpdate(splitCell(content, styleRow, styleCol));

  const currentCell = cells[styleRow]?.[styleCol];
  const currentStyle = currentCell?.style || {};

  return (
    <div className="space-y-4">
      {/* Data editor */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">数据</label>
        <div className="overflow-auto max-h-48 border border-gray-200 dark:border-white/[0.06] rounded">
          <table className="w-full text-xs">
            <tbody>
              {cells.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-gray-100 dark:border-white/[0.04] p-0">
                      <input
                        value={cell.value}
                        onChange={(e) => updateCellValue(ri, ci, e.target.value)}
                        className="w-full px-1 py-0.5 bg-transparent outline-none text-gray-900 dark:text-white"
                        style={{
                          backgroundColor: cell.style?.backgroundColor,
                          color: cell.style?.color,
                          fontWeight: cell.style?.fontWeight,
                          textAlign: cell.style?.textAlign,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row/Col operations */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">行列操作</label>
        <div className="flex gap-1">
          <input
            type="number"
            value={insertRowIndex}
            onChange={(e) => setInsertRowIndex(parseInt(e.target.value) || 0)}
            className="w-12 px-1 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
          />
          <button onClick={handleInsertRow} className="flex-1 py-1 text-xs rounded border bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-50">插入行</button>
          <button onClick={handleDeleteRow} className="flex-1 py-1 text-xs rounded border bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-red-600 hover:bg-red-50">删除行</button>
        </div>
        <div className="flex gap-1">
          <input
            type="number"
            value={insertColIndex}
            onChange={(e) => setInsertColIndex(parseInt(e.target.value) || 0)}
            className="w-12 px-1 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
          />
          <button onClick={handleInsertCol} className="flex-1 py-1 text-xs rounded border bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-50">插入列</button>
          <button onClick={handleDeleteCol} className="flex-1 py-1 text-xs rounded border bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-red-600 hover:bg-red-50">删除列</button>
        </div>
      </div>

      {/* Merge */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">合并单元格</label>
        <div className="grid grid-cols-4 gap-1">
          <input type="number" value={mergeStartRow} onChange={(e) => setMergeStartRow(parseInt(e.target.value) || 0)} className="px-1 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white" placeholder="起始行" />
          <input type="number" value={mergeStartCol} onChange={(e) => setMergeStartCol(parseInt(e.target.value) || 0)} className="px-1 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white" placeholder="起始列" />
          <input type="number" value={mergeEndRow} onChange={(e) => setMergeEndRow(parseInt(e.target.value) || 0)} className="px-1 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white" placeholder="结束行" />
          <input type="number" value={mergeEndCol} onChange={(e) => setMergeEndCol(parseInt(e.target.value) || 0)} className="px-1 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white" placeholder="结束列" />
        </div>
        <button onClick={handleMerge} className="w-full py-1 text-xs rounded border bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-50">合并</button>
      </div>

      {/* Cell style */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block">单元格样式</label>
        <div className="flex gap-1">
          <input
            type="number"
            value={styleRow}
            onChange={(e) => setStyleRow(parseInt(e.target.value) || 0)}
            className="w-12 px-1 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
            placeholder="行"
          />
          <input
            type="number"
            value={styleCol}
            onChange={(e) => setStyleCol(parseInt(e.target.value) || 0)}
            className="w-12 px-1 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
            placeholder="列"
          />
          <button onClick={handleSplit} className="flex-1 py-1 text-xs rounded border bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 hover:bg-gray-50">拆分</button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={currentStyle.backgroundColor || '#ffffff'}
            onChange={(e) => updateCellStyle(styleRow, styleCol, { backgroundColor: e.target.value })}
            className="w-8 h-8 rounded border border-gray-200 dark:border-white/[0.06] cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">背景</span>
          <input
            type="color"
            value={currentStyle.color || '#1e293b'}
            onChange={(e) => updateCellStyle(styleRow, styleCol, { color: e.target.value })}
            className="w-8 h-8 rounded border border-gray-200 dark:border-white/[0.06] cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">文字</span>
        </div>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => updateCellStyle(styleRow, styleCol, { textAlign: align })}
              className={`flex-1 py-1 text-xs rounded border transition-colors ${
                currentStyle.textAlign === align
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
                  : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
              }`}
            >
              {align === 'left' ? '左' : align === 'center' ? '中' : '右'}
            </button>
          ))}
          <button
            onClick={() => updateCellStyle(styleRow, styleCol, { fontWeight: currentStyle.fontWeight === 'bold' ? 'normal' : 'bold' })}
            className={`flex-1 py-1 text-xs rounded border transition-colors ${
              currentStyle.fontWeight === 'bold'
                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
                : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
            }`}
          >
            <strong>B</strong>
          </button>
        </div>
      </div>
    </div>
  );
}
