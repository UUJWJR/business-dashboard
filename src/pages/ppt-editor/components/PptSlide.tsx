import type { PptSlideData, PptTemplate, ContentBlock } from '../../../types/ppt';
import SlideTable from './SlideTable';

interface PptSlideProps {
  slide: PptSlideData;
  template: PptTemplate;
  totalPages: number;
}

function getBlockLayoutClass(count: number, index: number): string {
  if (count === 1) return 'col-span-full';
  if (count === 2) return 'col-span-1';
  if (count === 3) {
    return index === 0 ? 'col-span-full' : 'col-span-1';
  }
  if (count === 4) return 'col-span-1';
  // 5+: first full, rest 3 per row
  if (index === 0) return 'col-span-full';
  return 'col-span-1';
}

function getGridCols(count: number): string {
  if (count <= 4) return 'grid-cols-2';
  return 'grid-cols-3';
}

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case 'table': {
      const cfg = block.config as { columns: string[]; rows: Record<string, string | number>[] };
      return (
        <div className="flex flex-col h-full">
          {block.conclusion && (
            <div className="mb-2 px-2 py-1.5 rounded border-l-2 border-primary-400 bg-primary-50/30 dark:bg-primary-900/10 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {block.conclusion}
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-auto">
            <SlideTable columns={cfg.columns} rows={cfg.rows} />
          </div>
        </div>
      );
    }
    case 'text': {
      const cfg = block.config as { body: string };
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
            {cfg.body || '暂无内容'}
          </p>
        </div>
      );
    }
    case 'chart':
    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
          <p>图表内容（将在后续阶段支持）</p>
        </div>
      );
  }
}

export default function PptSlide({ slide, template, totalPages }: PptSlideProps) {
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
      {slide.conclusion && (
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
      )}

      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-auto px-6 pt-3 pb-2">
        {slide.content.type === 'mixed' && slide.content.blocks.length > 0 ? (
          (() => {
            const blocks = slide.content.blocks;
            return (
              <div className={`grid ${getGridCols(blocks.length)} gap-3 h-full`}>
                {blocks.map((block, i) => (
                  <div
                    key={block.id}
                    className={`${getBlockLayoutClass(blocks.length, i)} min-h-0 overflow-hidden`}
                  >
                    {renderBlock(block)}
                  </div>
                ))}
              </div>
            );
          })()
        ) : slide.content.type === 'table' ? (
          <SlideTable columns={slide.content.columns} rows={slide.content.rows} />
        ) : slide.content.type === 'text' ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap">
              {slide.content.body || '暂无内容'}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            <p>暂无内容</p>
          </div>
        )}
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
