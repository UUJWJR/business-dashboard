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

function detectTables(rawData: unknown[][]): ParsedTable[] {
  const tables: ParsedTable[] = [];
  let currentStart = 0;

  for (let i = 0; i <= rawData.length; i++) {
    const isEmptyRow =
      i < rawData.length &&
      (!rawData[i] || rawData[i].every((cell) => cell === undefined || cell === null || cell === ''));

    const isSeparator = isEmptyRow || i === rawData.length;

    if (isSeparator && currentStart < i) {
      const segment = rawData.slice(currentStart, i);
      if (segment.length === 0) {
        currentStart = i + 1;
        continue;
      }

      // Find the row with the most non-empty cells — treat it as the header
      const headerRow = segment.reduce((best, row) => {
        const nonEmpty = (row || []).filter((c) => c !== undefined && c !== null && c !== '').length;
        const bestNonEmpty = (best || []).filter((c) => c !== undefined && c !== null && c !== '').length;
        return nonEmpty >= bestNonEmpty ? row : best;
      }, segment[0]);

      const headers = (headerRow || []).map((h) => String(h || ''));
      const headerIdx = segment.indexOf(headerRow);
      const dataRows = segment.slice(headerIdx + 1);

      // Determine the max column count across the segment to avoid truncation
      const maxCols = Math.max(
        headers.length,
        ...segment.map((r) => (r || []).length)
      );

      // Pad headers to max column count so we don't lose trailing columns
      while (headers.length < maxCols) {
        headers.push(`列${headers.length + 1}`);
      }

      const rows: Record<string, string | number>[] = [];
      for (const rawRow of dataRows) {
        const rowArr = rawRow || [];
        if (rowArr.every((cell) => cell === undefined || cell === null || cell === '')) continue;

        const row: Record<string, string | number> = {};
        for (let idx = 0; idx < maxCols; idx++) {
          const header = headers[idx];
          if (!header) continue;
          const val = rowArr[idx];
          row[header] = typeof val === 'number' ? val : String(val ?? '');
        }
        if (Object.keys(row).length > 0) {
          rows.push(row);
        }
      }

      if (rows.length > 0) {
        tables.push({
          id: `table-${tables.length}`,
          title: headers.slice(0, 3).filter(Boolean).join(' / ') || `表格 ${tables.length + 1}`,
          columns: headers.filter(Boolean),
          rows,
          rowCount: rows.length,
        });
      }

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
        if (!data) {
          reject(new Error('文件读取失败'));
          return;
        }
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheets: ParsedSheet[] = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          // defval: '' ensures empty cells are included as '' so array length stays consistent
          const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: '' });

          if (jsonData.length === 0) return;

          const tables = detectTables(jsonData);
          if (tables.length === 0) return;

          sheets.push({ name: sheetName, tables });
        });

        resolve(sheets);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('解析 Excel 失败'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsBinaryString(file);
  });
}
