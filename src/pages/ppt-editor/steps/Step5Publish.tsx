import { useState, useCallback } from 'react';
import { ArrowLeft, Save, FileText, Layout, Calendar, Building2, User } from 'lucide-react';
import { ExportButton } from '../../../components/common/ExportButton';
import { exportSlidesToPDF } from '../../../utils/pdfExport';
import PptSlide from '../components/PptSlide';
import { getTemplateById, PPT_TEMPLATES } from '../../../utils/pptTemplates';
import type { PptReport, PptSlideData } from '../../../types/ppt';

interface Props {
  report: Omit<PptReport, 'id' | 'createdAt' | 'updatedAt'>;
  editId?: string;
  originalCreatedAt?: number;
  onSave: (report: PptReport) => void;
  onBack: () => void;
}

const kindLabel: Record<string, string> = {
  cover: '封面',
  outline: '大纲',
  body: '正文',
  end: '结束',
};

export default function Step5Publish({ report, editId, originalCreatedAt, onSave, onBack }: Props) {
  const template = getTemplateById(report.templateId) || PPT_TEMPLATES[0];
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveReport = useCallback(() => {
    setSaving(true);
    const now = Date.now();
    const fullReport: PptReport = {
      ...report,
      id: editId || `report-${now}`,
      createdAt: editId ? (originalCreatedAt ?? now) : now,
      updatedAt: now,
    };
    onSave(fullReport);
    setSaved(true);
    setSaving(false);
  }, [report, editId, onSave]);

  const handleExport = async () => {
    const filename = `${report.name}-${report.department}-${report.date}-${report.author}`;
    await exportSlidesToPDF('#ppt-export-slides', filename);
  };

  const renderMiniThumbnail = (slide: PptSlideData) => (
    <div
      key={slide.id}
      className="relative rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800"
    >
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/60 text-white text-[10px] px-1.5 py-0.5 flex justify-between items-center">
        <span>{kindLabel[slide.kind || 'body']}</span>
        <span>第 {slide.pageNumber} 页</span>
      </div>
      <div className="relative aspect-video overflow-hidden">
        <div
          className="absolute top-0 left-0"
          style={{
            width: '500%',
            height: '500%',
            transform: 'scale(0.2)',
            transformOrigin: 'top left',
          }}
        >
          <PptSlide slide={slide} template={template} totalPages={report.slides.length} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[960px] mx-auto space-y-6">
      {/* 报告信息卡片 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{report.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {report.department}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {report.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {report.author}
              </span>
              <span className="inline-flex items-center gap-1">
                <Layout className="w-3.5 h-3.5" />
                {report.slides.length} 页
              </span>
              <span className="inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                模板：{template.name}
              </span>
            </div>
          </div>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
              已保存
            </span>
          )}
        </div>
      </div>

      {/* 页面缩略图预览 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          页面预览（共 {report.slides.length} 页）
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {report.slides.map((slide) => renderMiniThumbnail(slide))}
        </div>
      </div>

      {/* 操作按钮区 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-btn transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回审核
        </button>

        <div className="flex items-center gap-3">
          <ExportButton onExport={handleExport} label="下载PDF" />
          <button
            onClick={handleSaveReport}
            disabled={saving || saved}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white text-sm font-medium rounded-btn transition-colors"
          >
            {saving ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? '已保存' : '保存报告'}
          </button>
        </div>
      </div>

      {/* 隐藏的 PDF 导出容器 */}
      <div
        id="ppt-export-slides"
        className="absolute left-[-9999px] top-0"
        style={{ width: 960 }}
      >
        {report.slides.map((slide) => (
          <div key={slide.id}>
            <PptSlide
              slide={slide}
              template={template}
              totalPages={report.slides.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
