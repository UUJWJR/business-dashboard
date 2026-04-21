import { useState, useMemo, useCallback } from 'react';
import { Upload, Sparkles, Loader2, Palette } from 'lucide-react';
import type { PptSlideData, PptTemplate, ContentBlock } from '../../../types/ppt';
import { PPT_TEMPLATES } from '../../../utils/pptTemplates';
import ExcelImporter from '../components/ExcelImporter';
import DraggableSlideList from '../components/DraggableSlideList';
import TemplateDesigner from '../components/TemplateDesigner';
import { useAIConfigContext } from '../../../contexts/AIConfigContext';
import { generateConclusion } from '../../../hooks/useAIConfig';
import type { ParsedSheet, ParsedTable } from '../../../utils/excelParser';

interface Props {
  initialSlides?: PptSlideData[];
  initialTemplateId?: string;
  onSubmit: (slides: PptSlideData[], templateId: string) => void;
}

const CUSTOM_TEMPLATES_KEY = 'dashboard-ppt-custom-templates';

function loadCustomTemplates(): PptTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCustomTemplates(templates: PptTemplate[]) {
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
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

function createSlidesFromSheets(sheets: ParsedSheet[]): PptSlideData[] {
  return sheets.map((sheet, i) => ({
    id: `slide-${Date.now()}-${i}`,
    title: sheet.name,
    conclusion: '',
    content: {
      type: 'mixed' as const,
      blocks: sheet.tables.map((t, idx) => tableToBlock(t, idx)),
    },
    note: '',
    pageNumber: i + 1,
  }));
}

export default function Step2Template({ initialSlides, initialTemplateId, onSubmit }: Props) {
  const [customTemplates, setCustomTemplates] = useState<PptTemplate[]>(loadCustomTemplates);
  const allTemplates = useMemo(() => [...PPT_TEMPLATES, ...customTemplates], [customTemplates]);

  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    const templates = [...PPT_TEMPLATES, ...loadCustomTemplates()];
    return initialTemplateId || templates[0]?.id || PPT_TEMPLATES[0].id;
  });
  const [slides, setSlides] = useState<PptSlideData[]>(initialSlides || []);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showImporter, setShowImporter] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const { config, isConfigured } = useAIConfigContext();

  const selectedTemplate = allTemplates.find((t) => t.id === selectedTemplateId)!;

  const updateSlide = (index: number, field: keyof PptSlideData, value: string) => {
    setSlides((prev) => {
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
    setSlides((prev) => {
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
    setSlides(reordered);
  };

  const hasErrors = useMemo(() => {
    return slides.some((slide, i) => {
      return (
        slide.title.length > 20 ||
        slide.conclusion.length > 150 ||
        slide.note.length > 40 ||
        errors[`${i}-title`] ||
        errors[`${i}-conclusion`] ||
        errors[`${i}-note`]
      );
    });
  }, [slides, errors]);

  const handleSubmit = () => {
    if (hasErrors) return;
    onSubmit(slides, selectedTemplateId);
  };

  const handleParsed = (sheets: ParsedSheet[]) => {
    const newSlides = createSlidesFromSheets(sheets);
    setSlides(newSlides);
    setShowImporter(false);
  };

  const handleSaveTemplate = (template: PptTemplate) => {
    const next = [...customTemplates, template];
    setCustomTemplates(next);
    saveCustomTemplates(next);
    setSelectedTemplateId(template.id);
    setShowDesigner(false);
  };

  const handleBulkGenerate = useCallback(async () => {
    if (!isConfigured) return;

    const tableBlocks: { slideIndex: number; blockId: string; table: ParsedTable; title: string }[] = [];

    slides.forEach((slide, slideIndex) => {
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
          config.apiKey,
          config.model,
          config.baseUrl,
          { columns: table.columns, rows: table.rows },
          title
        );
        updateBlockConclusion(slideIndex, blockId, result);
      } catch {
        // Skip failed blocks
      }
    }

    setBulkGenerating(false);
  }, [isConfigured, slides, config]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Template selection */}
      <div className="lg:w-72 flex-shrink-0 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              选择模板
            </label>
            <button
              onClick={() => setShowDesigner(true)}
              className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              <Palette className="w-3 h-3" />
              自定义
            </button>
          </div>
          <div className="space-y-2">
            {allTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedTemplateId === template.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{
                      backgroundColor: template.backgroundColor,
                      borderColor: template.headerStyle.color,
                    }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</p>
                    <p className="text-xs text-gray-400">{template.backgroundColor === '#0f172a' ? '深色' : '浅色'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Mini preview */}
        <div
          className="rounded-lg border p-4 aspect-video flex flex-col justify-between"
          style={{
            backgroundColor: selectedTemplate.backgroundColor,
            borderColor: selectedTemplate.headerStyle.color + '40',
          }}
        >
          <div
            className="text-lg font-bold"
            style={{ color: selectedTemplate.headerStyle.color }}
          >
            预览标题
          </div>
          <div
            className="text-sm px-2 py-1 rounded border-l-4"
            style={{
              color: selectedTemplate.conclusionStyle?.color || '#1A1A1A',
              backgroundColor: selectedTemplate.conclusionStyle?.backgroundColor || '#D6E7F515',
              borderLeftColor: selectedTemplate.conclusionStyle?.borderColor || '#0070C0',
            }}
          >
            预览结论区文本
          </div>
          <div className="text-right text-xs opacity-50">第 1 页 / 共 {slides.length || 1} 页</div>
        </div>
      </div>

      {/* Right: Slide list */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            页面配置（共 {slides.length} 页）
          </h3>
          <div className="flex items-center gap-2">
            {slides.length > 0 && (
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

        {slides.length === 0 && !showImporter && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <Upload className="w-10 h-10 mb-3 opacity-50" />
            <p className="text-sm">暂无幻灯片，请先导入 Excel</p>
          </div>
        )}

        <DraggableSlideList
          slides={slides}
          errors={errors}
          onReorder={handleReorder}
          onUpdateSlide={updateSlide}
          onUpdateBlockConclusion={updateBlockConclusion}
        />

        {slides.length > 0 && (
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={hasErrors}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium rounded-btn transition-colors"
            >
              下一步
            </button>
          </div>
        )}
      </div>

      {showDesigner && (
        <TemplateDesigner onSave={handleSaveTemplate} onCancel={() => setShowDesigner(false)} />
      )}
    </div>
  );
}
