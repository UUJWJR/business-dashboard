import type { PptSlideData, PptTemplate } from '../../../types/ppt';

interface PptSlideProps {
  slide: PptSlideData;
  template: PptTemplate;
  totalPages: number;
  children?: React.ReactNode;
}

export default function PptSlide({ slide, template, totalPages, children }: PptSlideProps) {
  const isDark = template.id === 'dark-luxury';
  const bgColor = template.backgroundColor;
  const headerColor = template.headerStyle.color;
  const conclusionBg = template.conclusionStyle?.backgroundColor || `${template.headerStyle.color}15`;
  const conclusionBorder = template.conclusionStyle?.borderColor || template.headerStyle.color;
  const conclusionText = template.conclusionStyle?.color || (isDark ? '#e5e7eb' : '#1A1A1A');
  const noteColor = template.noteStyle?.color || (isDark ? '#9ca3af' : '#595959');
  const pageNumColor = template.pageNumberStyle?.color || (isDark ? '#9ca3af' : '#8C8C8C');

  return (
    <section
      data-slide
      className="relative w-full flex flex-col overflow-hidden rounded-card border border-gray-100/80 dark:border-white/[0.06] shadow-card dark:shadow-card-dark"
      style={{
        aspectRatio: '16 / 9',
        backgroundColor: bgColor,
      }}
    >
      {/* Title area */}
      <div className="flex-none px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-7 md:h-8 rounded-sm flex-shrink-0"
            style={{ backgroundColor: template.headerStyle.color }}
          />
          <h2
            className="text-xl md:text-2xl font-bold tracking-tight"
            style={{ color: headerColor }}
          >
            {slide.title}
          </h2>
        </div>
      </div>

      {/* Conclusion area */}
      <div
        className="flex-none mx-6 px-3 py-2.5 rounded-md border-l-4"
        style={{
          backgroundColor: conclusionBg,
          borderLeftColor: conclusionBorder,
        }}
      >
        <p
          className="text-sm md:text-base leading-relaxed"
          style={{ color: conclusionText }}
        >
          {slide.conclusion}
        </p>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-auto px-6 pt-3 pb-2">
        {children}
      </div>

      {/* Note area */}
      {slide.note && (
        <div className="flex-none px-6 pb-1">
          <p
            className="text-xs truncate"
            style={{ color: noteColor }}
          >
            {slide.note}
          </p>
        </div>
      )}

      {/* Page number */}
      <div
        className="absolute bottom-3 right-4 text-xs font-medium"
        style={{ color: pageNumColor }}
      >
        第 {slide.pageNumber} 页 / 共 {totalPages} 页
      </div>
    </section>
  );
}
