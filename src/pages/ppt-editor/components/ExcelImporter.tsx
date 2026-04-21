import { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, Check } from 'lucide-react';
import { parseExcelFile, type ParsedSheet } from '../../../utils/excelParser';

interface SheetMapping {
  sheetIndex: number;
  slideIndex: number;
}

interface Props {
  slideCount: number;
  slideTitles: string[];
  onApply: (mappings: SheetMapping[], sheets: ParsedSheet[]) => void;
  onCancel: () => void;
}

export default function ExcelImporter({ slideCount, slideTitles, onApply, onCancel }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [mappings, setMappings] = useState<SheetMapping[]>([]);
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
        setError('Excel 文件为空或无法解析');
        return;
      }
      setSheets(parsed);
      // Auto-map: sheet i -> slide i (if within range)
      const autoMappings: SheetMapping[] = [];
      parsed.forEach((_, sheetIdx) => {
        if (sheetIdx < slideCount) {
          autoMappings.push({ sheetIndex: sheetIdx, slideIndex: sheetIdx });
        }
      });
      setMappings(autoMappings);
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败');
    } finally {
      setLoading(false);
    }
  };

  const updateMapping = (sheetIndex: number, slideIndex: number | null) => {
    setMappings((prev) => {
      const filtered = prev.filter((m) => m.sheetIndex !== sheetIndex);
      if (slideIndex !== null) {
        return [...filtered, { sheetIndex, slideIndex }];
      }
      return filtered;
    });
  };

  const getMappedSlide = (sheetIndex: number) => {
    const mapping = mappings.find((m) => m.sheetIndex === sheetIndex);
    return mapping?.slideIndex ?? null;
  };

  const handleApply = () => {
    onApply(mappings, sheets);
  };

  const isMapped = (slideIndex: number) => {
    return mappings.some((m) => m.slideIndex === slideIndex);
  };

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
          <p className="text-xs text-gray-500 dark:text-gray-400">
            共解析出 {sheets.length} 个 Sheet，请将每个 Sheet 映射到对应的 PPT 页面
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sheets.map((sheet, sheetIdx) => (
              <div
                key={sheetIdx}
                className="flex items-center gap-3 p-3 rounded-md bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {sheet.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {sheet.rowCount} 行 × {sheet.columns.length} 列
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">映射到</span>
                  <select
                    value={getMappedSlide(sheetIdx) ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateMapping(sheetIdx, val === '' ? null : Number(val));
                    }}
                    className="text-sm px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">不映射</option>
                    {Array.from({ length: slideCount }, (_, i) => (
                      <option key={i} value={i}>
                        第{i + 1}页：{slideTitles[i]?.slice(0, 12) || `页面${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Slide mapping summary */}
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: slideCount }, (_, i) => {
              const mapped = isMapped(i);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs ${
                    mapped
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-gray-50 dark:bg-gray-700/50 text-gray-400'
                  }`}
                >
                  {mapped ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-gray-300" />
                  )}
                  <span className="truncate">第{i + 1}页</span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setSheets([]);
                setMappings([]);
                setError('');
              }}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              重新上传
            </button>
            <button
              onClick={handleApply}
              disabled={mappings.length === 0}
              className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              应用映射
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
