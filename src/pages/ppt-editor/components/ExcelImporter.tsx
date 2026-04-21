import { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, Check } from 'lucide-react';
import { parseExcelFile, type ParsedSheet } from '../../../utils/excelParser';

interface Props {
  onParsed: (sheets: ParsedSheet[]) => void;
  onCancel: () => void;
}

export default function ExcelImporter({ onParsed, onCancel }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('请上传 .xlsx 或 .xls 格式的 Excel 文件');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) {
        setError('Excel 文件为空或无法解析出有效表格');
        return;
      }
      setSheets(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败');
    } finally {
      setLoading(false);
    }
  };

  const totalTables = sheets.reduce((sum, s) => sum + s.tables.length, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-green-600" />
          Excel 数据导入
        </h3>
        <button onClick={onCancel} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {sheets.length === 0 ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {loading ? '正在解析...' : '点击上传 Excel 文件'}
            </p>
            <p className="text-xs text-gray-400">支持 .xlsx / .xls 格式</p>
          </button>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Check className="w-4 h-4 text-green-500" />
            <span>
              解析成功：共 {sheets.length} 个 Sheet，{totalTables} 个表格
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sheets.map((sheet, sheetIdx) => (
              <div
                key={sheetIdx}
                className="p-3 rounded-md bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {sheet.name}
                  </p>
                  <span className="text-xs text-gray-400">
                    {sheet.tables.length} 个表格
                  </span>
                </div>
                <div className="mt-1 space-y-1">
                  {sheet.tables.map((table) => (
                    <p key={table.id} className="text-xs text-gray-500 dark:text-gray-400 pl-2">
                      · {table.title}（{table.rowCount} 行 × {table.columns.length} 列）
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setSheets([]);
                setError('');
              }}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              重新上传
            </button>
            <button
              onClick={() => onParsed(sheets)}
              className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              生成幻灯片
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
