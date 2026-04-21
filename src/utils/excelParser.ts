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

      const headers = (segment[0] || []).map((h) => String(h || ''));
      const validHeaders = headers.filter(Boolean);

      if (validHeaders.length === 0) {
        currentStart = i + 1;
        continue;
      }

      const dataRows = segment.slice(1);
      const rows: Record<string, string | number>[] = [];

      for (const rawRow of dataRows) {
        const rowArr = rawRow || [];
        if (rowArr.every((cell) => cell === undefined || cell === null || cell === '')) continue;

        const row: Record<string, string | number> = {};
        headers.forEach((header, idx) => {
          if (!header) return;
          const val = rowArr[idx];
          row[header] = typeof val === 'number' ? val : String(val ?? '');
        });
        if (Object.keys(row).length > 0) {
          rows.push(row);
        }
      }

      if (rows.length > 0) {
        tables.push({
          id: `table-${tables.length}`,
          title: validHeaders.slice(0, 3).join(' / ') || `表格 ${tables.length + 1}`,
          columns: validHeaders,
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
          const jsonData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });

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
