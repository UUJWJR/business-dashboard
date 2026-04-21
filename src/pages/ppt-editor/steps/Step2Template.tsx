import { useState, useMemo, useCallback } from 'react';
import { Upload, Sparkles, Loader2, Settings, Palette } from 'lucide-react';
import type { PptSlideData, PptTemplate } from '../../../types/ppt';
import { PPT_TEMPLATES } from '../../../utils/pptTemplates';
import { generateWeekReviewData } from '../../../utils/dataGenerator';
import {
  weekReviewOverviewSummary,
  weekReviewRevenueSummary,
  weekReviewScaleSummary,
  weekReviewExistingSummary,
  weekReviewOtherSummary,
  weekReviewSummarySummary,
} from '../../../utils/slideSummary';
import ExcelImporter from '../components/ExcelImporter';
import DraggableSlideList from '../components/DraggableSlideList';
import TemplateDesigner from '../components/TemplateDesigner';
import AISettings from '../components/AISettings';
import { useAIConfig, generateConclusion } from '../../../hooks/useAIConfig';
import type { ParsedSheet } from '../../../utils/excelParser';

interface Props {
  initialSlides?: PptSlideData[];
  initialTemplateId?: string;
  onSubmit: (slides: PptSlideData[], templateId: string) => void;
}

const DATA_SOURCES = [
  { id: 'week-review', label: '周四复盘', pageCount: 6 },
];

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

function generateSlides(sourceId: string): PptSlideData[] {
  if (sourceId !== 'week-review') return [];

  const data = generateWeekReviewData('30d');
  const summaries = [
    weekReviewOverviewSummary(data),
    weekReviewRevenueSummary(data),
    weekReviewScaleSummary(data),
    weekReviewExistingSummary(data),
    weekReviewOtherSummary(data),
    weekReviewSummarySummary(data),
  ];
  const titles = ['总览', '聚焦收入', '两个规模', '存量运营', '其他重点', '落后改善与汇总'];

  return titles.map((title, i) => ({
    id: `slide-${i}`,
    title: `周四复盘 — ${title}`,
    conclusion: summaries[i],
    content: { type: 'text' as const, body: '' },
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
  const [selectedSource, setSelectedSource] = useState(DATA_SOURCES[0].id);
  const [slides, setSlides] = useState<PptSlideData[]>(initialSlides || generateSlides(DATA_SOURCES[0].id));
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showImporter, setShowImporter] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [bulkGenerating, setBulkGenerating] = useState(false);

  const { config, isConfigured } = useAIConfig();

  const selectedTemplate = allTemplates.find((t) => t.id === selectedTemplateId)!;

  const handleSourceChange = (sourceId: string) => {
    setSelectedSource(sourceId);
    setSlides(generateSlides(sourceId));
    setErrors({});
  };

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

  const applyExcelMappings = (
    mappings: { sheetIndex: number; slideIndex: number }[],
    sheets: ParsedSheet[]
  ) => {
    setSlides((prev) => {
      const next = [...prev];
      mappings.forEach((mapping) => {
        const sheet = sheets[mapping.sheetIndex];
        if (!sheet || mapping.slideIndex >= next.length) return;
        next[mapping.slideIndex] = {
          ...next[mapping.slideIndex],
          content: {
            type: 'table',
            columns: sheet.columns,
            rows: sheet.rows,
          },
        };
      });
      return next;
    });
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
    if (!isConfigured) {
      setShowAISettings(true);
      return;
    }

    const tableSlides = slides
      .map((slide, index) => ({ slide, index }))
      .filter(({ slide }) => slide.content.type === 'table');

    if (tableSlides.length === 0) return;

    setBulkGenerating(true);

    for (const { slide, index } of tableSlides) {
      try {
        const tableData = slide.content as {
          type: 'table';
          columns: string[];
          rows: Record<string, string | number>[];
        };
        const result = await generateConclusion(
          config.apiKey,
          config.model,
          config.baseUrl,
          tableData,
          slide.title
        );
        updateSlide(index, 'conclusion', result);
      } catch {
        // Skip failed slides, continue with others
      }
    }

    setBulkGenerating(false);
  }, [isConfigured, slides, config]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Template selection */}
      <div className="lg:w-72 flex-shrink-0 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择数据来源
          </label>
          <select
            value={selectedSource}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {DATA_SOURCES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}（{s.pageCount}页）
              </option>
            ))}
          </select>
        </div>

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
          <div className="text-right text-xs opacity-50">第 1 页 / 共 6 页</div>
        </div>
      </div>

      {/* Right: Slide list */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            页面配置（共 {slides.length} 页）
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAISettings(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              AI 配置
            </button>
            <button
              onClick={handleBulkGenerate}
              disabled={bulkGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-md transition-colors disabled:opacity-50"
            >
              {bulkGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              一键生成全部分析结论
            </button>
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
            slideCount={slides.length}
            slideTitles={slides.map((s) => s.title)}
            onApply={applyExcelMappings}
            onCancel={() => setShowImporter(false)}
          />
        )}

        <DraggableSlideList
          slides={slides}
          errors={errors}
          onReorder={handleReorder}
          onUpdateSlide={updateSlide}
        />

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={hasErrors}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium rounded-btn transition-colors"
          >
            下一步
          </button>
        </div>
      </div>

      {showDesigner && (
        <TemplateDesigner onSave={handleSaveTemplate} onCancel={() => setShowDesigner(false)} />
      )}
      {showAISettings && <AISettings onClose={() => setShowAISettings(false)} />}
    </div>
  );
}
