import { useState, useMemo, useCallback, useEffect } from 'react';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import type { PptSlideData, ContentBlock } from '../../../types/ppt';
import ExcelImporter from '../components/ExcelImporter';
import DraggableSlideList from '../components/DraggableSlideList';
import { useAIConfigContext } from '../../../contexts/AIConfigContext';
import { generateConclusion } from '../../../hooks/useAIConfig';
import type { ParsedSheet, ParsedTable } from '../../../utils/excelParser';

interface Props {
  initialSlides?: PptSlideData[];
  initialTemplateId?: string;
  onSubmit: (slides: PptSlideData[]) => void;
}

function tableToBlock(table: ParsedTable, index: number): ContentBlock {
  return {
    id: `block-${index}`,
    type: 'table',
    title: table.title,
    conclusion: '',
    config: { columns: table.columns, rows: table.rows },
  };
}

function createBodySlidesFromSheets(sheets: ParsedSheet[]): PptSlideData[] {
  return sheets.map((sheet, i) => ({
    id: `slide-body-${Date.now()}-${i}`,
    title: sheet.name,
    conclusion: '',
    kind: 'body' as const,
    content: {
      type: 'mixed' as const,
      blocks: sheet.tables.map((t, idx) => tableToBlock(t, idx)),
    },
    note: '',
    pageNumber: i + 1,
  }));
}

export default function Step3Content({ initialSlides, onSubmit }: Props) {
  const [bodySlides, setBodySlides] = useState<PptSlideData[]>(
    initialSlides?.filter((s) => s.kind === 'body') || []
  );
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showImporter, setShowImporter] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const { config, isConfigured } = useAIConfigContext();

  useEffect(() => {
    setBodySlides(initialSlides?.filter((s) => s.kind === 'body') || []);
  }, [initialSlides]);

  const updateSlide = (index: number, field: keyof PptSlideData, value: string) => {
    setBodySlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });

    const limits: Record<string, number> = { title: 20, conclusion: 150, note: 40 };
    if (limits[field] !== undefined) {
      setErrors((prev) => ({ ...prev, [`${index}-${field}`]: value.length > limits[field] }));
    }
  };

  const updateBlockConclusion = (slideIndex: number, blockId: string, value: string) => {
    setBodySlides((prev) => {
      const next = [...prev];
      const slide = { ...next[slideIndex] };
      if (slide.content.type === 'mixed') {
        slide.content = {
          ...slide.content,
          blocks: slide.content.blocks.map((b) =>
            b.id === blockId ? { ...b, conclusion: value } : b
          ),
        };
      }
      next[slideIndex] = slide;
      return next;
    });
  };

  const handleReorder = (reordered: PptSlideData[]) => {
    setBodySlides(reordered);
  };

  const hasErrors = useMemo(() => {
    return bodySlides.some((slide, i) => {
      return (
        slide.title.length > 20 ||
        slide.conclusion.length > 150 ||
        slide.note.length > 40 ||
        errors[`${i}-title`] ||
        errors[`${i}-conclusion`] ||
        errors[`${i}-note`]
      );
    });
  }, [bodySlides, errors]);

  const handleSubmit = () => {
    if (hasErrors) return;
    onSubmit(bodySlides);
  };

  const handleParsed = (sheets: ParsedSheet[]) => {
    const newSlides = createBodySlidesFromSheets(sheets);
    setBodySlides(newSlides);
    setShowImporter(false);
  };

  const handleBulkGenerate = useCallback(async () => {
    if (!isConfigured) return;

    const tableBlocks: { slideIndex: number; blockId: string; table: ParsedTable; title: string }[] = [];

    bodySlides.forEach((slide, slideIndex) => {
      if (slide.content.type !== 'mixed') return;
      slide.content.blocks.forEach((block) => {
        if (block.type === 'table') {
          tableBlocks.push({
            slideIndex,
            blockId: block.id,
            table: block.config as ParsedTable,
            title: slide.title,
          });
        }
      });
    });

    if (tableBlocks.length === 0) return;

    setBulkGenerating(true);

    for (const { slideIndex, blockId, table, title } of tableBlocks) {
      try {
        const result = await generateConclusion(
          config,
          { columns: table.columns, rows: table.rows },
          title
        );
        updateBlockConclusion(slideIndex, blockId, result);
      } catch {
        // Skip failed blocks
      }
    }

    setBulkGenerating(false);
  }, [isConfigured, bodySlides, config]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          正文页面配置（共 {bodySlides.length} 页）
        </h3>
        <div className="flex items-center gap-2">
          {bodySlides.length > 0 && (
            <button
              onClick={handleBulkGenerate}
              disabled={bulkGenerating || !isConfigured}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-md transition-colors disabled:opacity-50"
            >
              {bulkGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              一键生成全部分析结论
            </button>
          )}
          <button
            onClick={() => setShowImporter((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {showImporter ? '取消导入' : '导入 Excel'}
          </button>
        </div>
      </div>

      {showImporter && (
        <ExcelImporter
          onParsed={handleParsed}
          onCancel={() => setShowImporter(false)}
        />
      )}

      {bodySlides.length === 0 && !showImporter && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
          <Upload className="w-10 h-10 mb-3 opacity-50" />
          <p className="text-sm">暂无正文页，请先导入 Excel</p>
        </div>
      )}

      {bodySlides.length > 0 && (
        <DraggableSlideList
          slides={bodySlides}
          errors={errors}
          onReorder={handleReorder}
          onUpdateSlide={updateSlide}
          onUpdateBlockConclusion={updateBlockConclusion}
        />
      )}

      {bodySlides.length > 0 && (
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSubmit}
            disabled={hasErrors}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium rounded-btn transition-colors"
          >
            下一步
          </button>
        </div>
      )}
    </div>
  );
}
