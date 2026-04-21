import { useRef } from 'react';
import { ExportButton } from '../../../components/common/ExportButton';
import { exportSlidesToPDF } from '../../../utils/pdfExport';
import PptSlide from '../components/PptSlide';
import { getTemplateById } from '../../../utils/pptTemplates';
import type { PptReport } from '../../../types/ppt';

interface Props {
  report: Omit<PptReport, 'id' | 'createdAt' | 'updatedAt'>;
  onSave: (report: PptReport) => void;
}

export default function Step3Preview({ report, onSave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const template = getTemplateById(report.templateId)!;

  const handleExport = async () => {
    const filename = `${report.name}-${report.department}-${report.date}-${report.author}`;
    await exportSlidesToPDF('#ppt-preview-slides', filename);

    // Save report after export
    const now = Date.now();
    const fullReport: PptReport = {
      ...report,
      id: `report-${now}`,
      createdAt: now,
      updatedAt: now,
    };
    onSave(fullReport);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{report.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {report.department} · {report.date} · {report.author}
          </p>
        </div>
        <ExportButton onExport={handleExport} label="导出PDF" />
      </div>

      <div id="ppt-preview-slides" ref={containerRef} className="space-y-6">
        {report.slides.map((slide) => (
          <PptSlide
            key={slide.id}
            slide={slide}
            template={template}
            totalPages={report.slides.length}
          />
        ))}
      </div>
    </div>
  );
}
