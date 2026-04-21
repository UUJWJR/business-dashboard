import type { TablePayload } from '../types/pageBuilder';

export function insertRow(payload: TablePayload, rowIndex: number): TablePayload {
  const newCells = payload.cells.map((row) => [...row]);
  const colCount = newCells[0]?.length || 1;
  newCells.splice(rowIndex, 0, Array.from({ length: colCount }, () => ({ value: '' })));
  const newHeights = [...payload.rowHeights];
  newHeights.splice(rowIndex, 0, 100 / newCells.length);
  return { ...payload, cells: newCells, rowHeights: normalizeArray(newHeights) };
}

export function deleteRow(payload: TablePayload, rowIndex: number): TablePayload {
  if (payload.cells.length <= 1) return payload;
  const newCells = payload.cells.filter((_, i) => i !== rowIndex);
  const newHeights = payload.rowHeights.filter((_, i) => i !== rowIndex);
  return { ...payload, cells: newCells, rowHeights: normalizeArray(newHeights) };
}

export function insertCol(payload: TablePayload, colIndex: number): TablePayload {
  const newCells = payload.cells.map((row) => {
    const newRow = [...row];
    newRow.splice(colIndex, 0, { value: '' });
    return newRow;
  });
  const newWidths = [...payload.colWidths];
  newWidths.splice(colIndex, 0, 100 / newCells[0].length);
  return { ...payload, cells: newCells, colWidths: normalizeArray(newWidths) };
}

export function deleteCol(payload: TablePayload, colIndex: number): TablePayload {
  if ((payload.cells[0]?.length || 0) <= 1) return payload;
  const newCells = payload.cells.map((row) => row.filter((_, i) => i !== colIndex));
  const newWidths = payload.colWidths.filter((_, i) => i !== colIndex);
  return { ...payload, cells: newCells, colWidths: normalizeArray(newWidths) };
}

export function mergeCells(
  payload: TablePayload,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
): TablePayload {
  const newCells = payload.cells.map((row, ri) =>
    row.map((cell, ci) => {
      if (ri === startRow && ci === startCol) {
        return { ...cell, rowSpan: endRow - startRow + 1, colSpan: endCol - startCol + 1 };
      }
      if (
        ri >= startRow &&
        ri <= endRow &&
        ci >= startCol &&
        ci <= endCol &&
        (ri !== startRow || ci !== startCol)
      ) {
        return { ...cell, value: '', rowSpan: 1, colSpan: 1, hidden: true };
      }
      return cell;
    })
  );
  return { ...payload, cells: newCells };
}

export function splitCell(payload: TablePayload, row: number, col: number): TablePayload {
  const cell = payload.cells[row]?.[col];
  if (!cell?.rowSpan && !cell?.colSpan) return payload;
  const newCells = payload.cells.map((r, ri) =>
    r.map((c, ci) => {
      if (ri === row && ci === col) {
        return { ...c, rowSpan: undefined, colSpan: undefined };
      }
      const inSpan =
        ri >= row &&
        ri < row + (cell.rowSpan || 1) &&
        ci >= col &&
        ci < col + (cell.colSpan || 1);
      if (inSpan && c.hidden) {
        return { ...c, hidden: false };
      }
      return c;
    })
  );
  return { ...payload, cells: newCells };
}

function normalizeArray(arr: number[]): number[] {
  const sum = arr.reduce((a, b) => a + b, 0);
  if (sum === 0) return arr.map(() => 100 / arr.length);
  return arr.map((v) => (v / sum) * 100);
}
