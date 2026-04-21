import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Upload } from 'lucide-react';
import type { PptSlideData } from '../../../types/ppt';
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
import type { ParsedSheet } from '../../../utils/excelParser';

interface Props {
  initialSlides?: PptSlideData[];
  initialTemplateId?: string;
  onSubmit: (slides: PptSlideData[], templateId: string) => void;
}

const DATA_SOURCES = [
  { id: 'week-review', label: '周四复盘', pageCount: 6 },
];

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
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTemplateId || PPT_TEMPLATES[0].id);
  const [selectedSource, setSelectedSource] = useState(DATA_SOURCES[0].id);
  const [slides, setSlides] = useState<PptSlideData[]>(initialSlides || generateSlides(DATA_SOURCES[0].id));
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showImporter, setShowImporter] = useState(false);

  const selectedTemplate = PPT_TEMPLATES.find((t) => t.id === selectedTemplateId)!;

  const handleSourceChange = (sourceId: string) => {
    setSelectedSource(sourceId);
    setSlides(generateSlides(sourceId));
    setExpandedIndex(0);
    setErrors({});
  };

  const updateSlide = (index: number, field: keyof PptSlideData, value: string) => {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });

    // Clear error for this field if within limit
    const limits: Record<string, number> = { title: 20, conclusion: 150, note: 40 };
    if (limits[field] !== undefined) {
      setErrors((prev) => ({ ...prev, [`${index}-${field}`]: value.length > limits[field] }));
    }
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            选择模板
          </label>
          <div className="space-y-2">
            {PPT_TEMPLATES.map((template) => (
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
          <button
            onClick={() => setShowImporter((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {showImporter ? '取消导入' : '导入 Excel'}
          </button>
        </div>

        {showImporter && (
          <ExcelImporter
            slideCount={slides.length}
            slideTitles={slides.map((s) => s.title)}
            onApply={applyExcelMappings}
            onCancel={() => setShowImporter(false)}
          />
        )}

        {slides.map((slide, index) => {
          const isExpanded = expandedIndex === index;
          const titleError = slide.title.length > 20 || errors[`${index}-title`];
          const conclusionError = slide.conclusion.length > 150 || errors[`${index}-conclusion`];
          const noteError = slide.note.length > 40 || errors[`${index}-note`];

          return (
            <div
              key={slide.id}
              className={`rounded-lg border bg-white dark:bg-gray-800 overflow-hidden ${
                isExpanded
                  ? 'border-primary-200 dark:border-primary-800'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-xs flex items-center justify-center text-gray-600 dark:text-gray-300">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[300px]">
                    {slide.title}
                  </span>
                  {(titleError || conclusionError || noteError) && (
                    <span className="text-xs text-red-500">字数超限</span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      标题（最多20字）
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSlide(index, 'title', e.target.value)}
                      maxLength={25}
                      className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                        titleError
                          ? 'border-red-300 focus:ring-red-200 bg-red-50 dark:bg-red-900/10'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-primary-200 bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-white`}
                    />
                    <p className={`mt-0.5 text-xs text-right ${titleError ? 'text-red-500' : 'text-gray-400'}`}>
                      {slide.title.length}/20
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      结论（最多150字）
                    </label>
                    <textarea
                      value={slide.conclusion}
                      onChange={(e) => updateSlide(index, 'conclusion', e.target.value)}
                      rows={3}
                      className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 resize-none ${
                        conclusionError
                          ? 'border-red-300 focus:ring-red-200 bg-red-50 dark:bg-red-900/10'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-primary-200 bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-white`}
                    />
                    <p className={`mt-0.5 text-xs text-right ${conclusionError ? 'text-red-500' : 'text-gray-400'}`}>
                      {slide.conclusion.length}/150
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      备注（最多40字）
                    </label>
                    <input
                      type="text"
                      value={slide.note}
                      onChange={(e) => updateSlide(index, 'note', e.target.value)}
                      maxLength={45}
                      className={`w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 ${
                        noteError
                          ? 'border-red-300 focus:ring-red-200 bg-red-50 dark:bg-red-900/10'
                          : 'border-gray-200 dark:border-gray-700 focus:ring-primary-200 bg-white dark:bg-gray-800'
                      } text-gray-900 dark:text-white`}
                    />
                    <p className={`mt-0.5 text-xs text-right ${noteError ? 'text-red-500' : 'text-gray-400'}`}>
                      {slide.note.length}/40
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

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
    </div>
  );
}
