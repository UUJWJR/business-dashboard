import * as XLSX from 'xlsx';

export interface ParsedSheet {
  name: string;
  columns: string[];
  rows: Record<string, string | number>[];
  rowCount: number;
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

          // First row as headers
          const headers = (jsonData[0] || []).map((h) => String(h || ''));
          const dataRows = jsonData.slice(1);

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

          sheets.push({
            name: sheetName,
            columns: headers.filter(Boolean),
            rows,
            rowCount: rows.length,
          });
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
