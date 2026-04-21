import * as XLSX from 'xlsx';

export interface ParsedTable {
  id: string;
  title: string;
  columns: string[];
  rows: Record<string, string | number>[];
  rowCount: number;
}

export interface ParsedSheet {
  name: string;
  tables: ParsedTable[];
}

function countNonEmpty(row: unknown): number {
  if (!Array.isArray(row)) return 0;
  return row.filter((c) => c !== undefined && c !== null && c !== '').length;
}

function isEmptyRow(row: unknown): boolean {
  if (!Array.isArray(row)) return true;
  return row.every((c) => c === undefined || c === null || c === '');
}

function looksLikeHeader(row: unknown[]): boolean {
  if (!Array.isArray(row) || row.length === 0) return false;
  const nonEmpty = row.filter((c) => c !== undefined && c !== null && c !== '');
  if (nonEmpty.length < 2) return false;
  const stringCount = nonEmpty.filter((c) => typeof c === 'string').length;
  return stringCount / nonEmpty.length >= 0.5;
}

function detectTables(rawData: unknown[][]): ParsedTable[] {
  const tables: ParsedTable[] = [];
  let currentStart = 0;

  for (let i = 0; i <= rawData.length; i++) {
    const isSeparator = i === rawData.length || isEmptyRow(rawData[i]);

    if (isSeparator && currentStart < i) {
      const segment = rawData.slice(currentStart, i).filter((r) => !isEmptyRow(r));
      if (segment.length === 0) {
        currentStart = i + 1;
        continue;
      }

      let headerIdx = 0;
      let tableTitle = '';

      if (!looksLikeHeader(segment[0] as unknown[])) {
        const firstNonEmpty = countNonEmpty(segment[0]);
        if (firstNonEmpty <= 2) {
          tableTitle = String((segment[0] as unknown[])[0] || '').trim();
        }

        let found = false;
        for (let j = 1; j < Math.min(segment.length, 6); j++) {
          if (looksLikeHeader(segment[j] as unknown[])) {
            headerIdx = j;
            found = true;
            break;
          }
        }

        if (!found) {
          let best = 0;
          let max = countNonEmpty(segment[0]);
          for (let j = 1; j < segment.length; j++) {
            const cnt = countNonEmpty(segment[j]);
            if (cnt > max) {
              max = cnt;
              best = j;
            }
          }
          headerIdx = best;
        }
      }

      const headerRow = segment[headerIdx] as unknown[];
      const headers = (headerRow || []).map((h) => String(h || '').trim());

      let maxColIdx = headers.length - 1;
      for (let r = headerIdx + 1; r < segment.length; r++) {
        const row = segment[r] as unknown[];
        for (let c = row.length - 1; c >= 0; c--) {
          if (row[c] !== undefined && row[c] !== null && row[c] !== '') {
            maxColIdx = Math.max(maxColIdx, c);
            break;
          }
        }
      }
      const maxCols = maxColIdx + 1;

      while (headers.length < maxCols) {
        headers.push(`列${headers.length + 1}`);
      }

      const dataRows = segment.slice(headerIdx + 1);
      const rows: Record<string, string | number>[] = [];

      for (const rawRow of dataRows) {
        const rowArr = Array.isArray(rawRow) ? rawRow : [];
        if (isEmptyRow(rowArr)) continue;

        const row: Record<string, string | number> = {};
        let hasRealValue = false;
        for (let idx = 0; idx < maxCols; idx++) {
          const header = headers[idx];
          if (!header) continue;
          const val = rowArr[idx];
          if (val !== undefined && val !== null && val !== '') {
            hasRealValue = true;
          }
          row[header] = typeof val === 'number' ? val : String(val ?? '');
        }
        if (hasRealValue) {
          rows.push(row);
        }
      }

      if (rows.length > 0) {
        tables.push({
          id: `table-${tables.length}`,
          title: tableTitle || headers.filter(Boolean).slice(0, 3).join(' / ') || `表格 ${tables.length + 1}`,
          columns: headers.filter(Boolean),
          rows,
          rowCount: rows.length,
        });
      }

      currentStart = i + 1;
    } else if (isSeparator) {
      currentStart = i + 1;
    }
  }

  return tables;
}

export function parseExcelFile(file: File): Promise<ParsedSheet[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data || !(data instanceof ArrayBuffer)) {
          reject(new Error('文件读取失败'));
          return;
        }
        const workbook = XLSX.read(data, { type: 'array' });
        const sheets: ParsedSheet[] = [];

        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: '' });

          if (!Array.isArray(jsonData) || jsonData.length === 0) continue;

          const tables = detectTables(jsonData);
          if (tables.length === 0) continue;

          sheets.push({ name: sheetName, tables });
        }

        resolve(sheets);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('解析 Excel 失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}
