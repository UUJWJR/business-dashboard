import type { PptSlideData, PptTemplate, ContentBlock } from '../../../types/ppt';
import SlideTable from './SlideTable';

interface PptSlideProps {
  slide: PptSlideData;
  template: PptTemplate;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                         */
/* ------------------------------------------------------------------ */

function getBlockLayoutClass(count: number, index: number): string {
  if (count === 1) return 'col-span-full';
  if (count === 2) return 'col-span-1';
  if (count === 3) return index === 0 ? 'col-span-full' : 'col-span-1';
  if (count === 4) return 'col-span-1';
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

/* ------------------------------------------------------------------ */
/*  封面页 — 按品牌分治                                                  */
/* ------------------------------------------------------------------ */

function CoverChinaMobile({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      {/* 顶部蓝色渐变条 */}
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: accent }} />
      {/* 右上角淡蓝装饰 */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.06]"
        style={{ backgroundColor: accent }}
      />
      {/* 底部绿色细线 */}
      <div className="absolute bottom-0 left-0 w-full h-1" style={{ backgroundColor: '#00A650' }} />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-10 md:px-16">
        <div className="text-center max-w-3xl">
          <div className="w-12 h-0.5 mx-auto mb-6 rounded-full" style={{ backgroundColor: accent }} />
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6" style={{ color: accent }}>
            {slide.title}
          </h1>
          <div className="w-20 h-1 mx-auto mb-6 rounded-full" style={{ backgroundColor: accent }} />
          <p className="text-base md:text-lg tracking-wide" style={{ color: '#595959' }}>
            {slide.conclusion}
          </p>
        </div>
      </div>
    </section>
  );
}

function CoverAlibaba({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      {/* 右下角橙色大圆装饰 */}
      <div
        className="absolute -bottom-24 -right-24 w-72 h-72 md:w-96 md:h-96 rounded-full opacity-[0.08]"
        style={{ backgroundColor: accent }}
      />
      {/* 底部通栏线 */}
      <div className="absolute bottom-0 left-0 w-full h-1.5" style={{ backgroundColor: accent }} />
      {/* 左侧竖条 */}
      <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: accent }} />

      <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-20">
        <div className="max-w-3xl">
          <div className="w-16 h-1 mb-6 rounded-full" style={{ backgroundColor: accent }} />
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6" style={{ color: '#1A1A1A' }}>
            {slide.title}
          </h1>
          <p className="text-base md:text-lg tracking-wide" style={{ color: '#595959' }}>
            {slide.conclusion}
          </p>
        </div>
      </div>
    </section>
  );
}

function CoverTencent({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      {/* 左侧蓝色竖块 */}
      <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: accent }} />
      {/* 右上角淡蓝圆 */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-[0.06]"
        style={{ backgroundColor: accent }}
      />
      {/* 底部细线 */}
      <div className="absolute bottom-0 left-0 w-full h-0.5" style={{ backgroundColor: '#E5E5E5' }} />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-10 md:px-16">
        <div className="text-center max-w-3xl">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6" style={{ color: accent }}>
            {slide.title}
          </h1>
          <div className="w-20 h-0.5 mx-auto mb-6 rounded-full" style={{ backgroundColor: accent }} />
          <p className="text-base md:text-lg tracking-wide" style={{ color: '#595959' }}>
            {slide.conclusion}
          </p>
        </div>
      </div>
    </section>
  );
}

function CoverByteDance({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      {/* 顶部蓝紫渐变条 */}
      <div
        className="absolute top-0 left-0 w-full h-1.5"
        style={{ background: `linear-gradient(90deg, ${accent} 0%, #8B5CF6 100%)` }}
      />
      {/* 左下蓝圆 + 右下红点（字节感） */}
      <div className="absolute bottom-8 left-8 w-4 h-4 rounded-full opacity-20" style={{ backgroundColor: accent }} />
      <div className="absolute bottom-8 left-14 w-4 h-4 rounded-full opacity-20" style={{ backgroundColor: '#FE2C55' }} />
      {/* 背景淡色大圆 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.03]"
        style={{ backgroundColor: accent }}
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-10 md:px-16">
        <div className="text-center max-w-3xl">
          <div className="w-12 h-0.5 mx-auto mb-6 rounded-full" style={{ backgroundColor: accent }} />
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-6" style={{ color: accent }}>
            {slide.title}
          </h1>
          <div className="w-20 h-1 mx-auto mb-6 rounded-full" style={{ backgroundColor: accent }} />
          <p className="text-base md:text-lg tracking-wide" style={{ color: '#595959' }}>
            {slide.conclusion}
          </p>
        </div>
      </div>
    </section>
  );
}

function CoverMcKinsey({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      {/* 极简：顶部一条极细深蓝线 */}
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: accent }} />
      {/* 左侧细竖线 */}
      <div className="absolute top-12 left-12 w-px h-16" style={{ backgroundColor: '#D9D9D9' }} />

      <div className="relative z-10 h-full flex flex-col justify-center px-12 md:px-20">
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: '#8C8C8C' }}>
            Presentation
          </p>
          <h1 className="text-3xl md:text-[2.75rem] font-semibold tracking-tight leading-tight mb-8" style={{ color: accent }}>
            {slide.title}
          </h1>
          <div className="w-12 h-px mb-6" style={{ backgroundColor: '#D9D9D9' }} />
          <p className="text-sm md:text-base" style={{ color: '#595959' }}>
            {slide.conclusion}
          </p>
        </div>
      </div>
    </section>
  );
}

function CoverSlide({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  switch (template.id) {
    case 'china-mobile':
      return <CoverChinaMobile slide={slide} template={template} />;
    case 'alibaba':
      return <CoverAlibaba slide={slide} template={template} />;
    case 'tencent':
      return <CoverTencent slide={slide} template={template} />;
    case 'bytedance':
      return <CoverByteDance slide={slide} template={template} />;
    case 'mckinsey':
      return <CoverMcKinsey slide={slide} template={template} />;
    default:
      return <CoverChinaMobile slide={slide} template={template} />;
  }
}

/* ------------------------------------------------------------------ */
/*  目录页 — 按品牌分治                                                  */
/* ------------------------------------------------------------------ */

function OutlineChinaMobile({ slide, template, totalPages }: { slide: PptSlideData; template: PptTemplate; totalPages: number }) {
  const accent = template.headerStyle.color;
  const items = slide.content.type === 'text' && slide.content.body ? slide.content.body.split('\n').filter((l) => l.trim()) : [];
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      <div className="h-full flex flex-col px-8 md:px-12 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-1 h-8 md:h-9 rounded-sm flex-shrink-0" style={{ backgroundColor: accent }} />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: accent }}>{slide.title}</h2>
          <span className="text-xs md:text-sm ml-2 tracking-widest uppercase" style={{ color: '#8C8C8C' }}>Contents</span>
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
            {items.length > 0 ? items.map((item, i) => {
              const num = String(i + 1).padStart(2, '0');
              const title = item.replace(/^\d+\.\s*/, '');
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg md:text-xl font-bold w-8 text-right flex-shrink-0" style={{ color: `${accent}40` }}>{num}</span>
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                  <span className="text-sm md:text-base font-medium truncate" style={{ color: '#1A1A1A' }}>{title}</span>
                </div>
              );
            }) : <div className="col-span-full text-center text-sm" style={{ color: '#8C8C8C' }}>暂无目录内容</div>}
          </div>
        </div>
        <div className="absolute bottom-3 right-4 text-xs font-medium" style={{ color: '#8C8C8C' }}>第 {slide.pageNumber} 页 / 共 {totalPages} 页</div>
      </div>
    </section>
  );
}

function OutlineAlibaba({ slide, template, totalPages }: { slide: PptSlideData; template: PptTemplate; totalPages: number }) {
  const accent = template.headerStyle.color;
  const items = slide.content.type === 'text' && slide.content.body ? slide.content.body.split('\n').filter((l) => l.trim()) : [];
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      {/* 右下角装饰圆 */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-[0.06]" style={{ backgroundColor: accent }} />
      <div className="h-full flex flex-col px-8 md:px-12 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-1 h-8 md:h-9 rounded-sm flex-shrink-0" style={{ backgroundColor: accent }} />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: '#1A1A1A' }}>{slide.title}</h2>
          <span className="text-xs md:text-sm ml-2 tracking-widest uppercase" style={{ color: '#8C8C8C' }}>Contents</span>
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
            {items.length > 0 ? items.map((item, i) => {
              const num = String(i + 1).padStart(2, '0');
              const title = item.replace(/^\d+\.\s*/, '');
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg md:text-xl font-bold w-8 text-right flex-shrink-0" style={{ color: `${accent}50` }}>{num}</span>
                  <div className="w-1.5 h-1.5 rounded-sm flex-shrink-0 rotate-45" style={{ backgroundColor: accent }} />
                  <span className="text-sm md:text-base font-medium truncate" style={{ color: '#1A1A1A' }}>{title}</span>
                </div>
              );
            }) : <div className="col-span-full text-center text-sm" style={{ color: '#8C8C8C' }}>暂无目录内容</div>}
          </div>
        </div>
        <div className="absolute bottom-3 right-4 text-xs font-medium" style={{ color: '#8C8C8C' }}>第 {slide.pageNumber} 页 / 共 {totalPages} 页</div>
      </div>
    </section>
  );
}

function OutlineTencent({ slide, template, totalPages }: { slide: PptSlideData; template: PptTemplate; totalPages: number }) {
  const accent = template.headerStyle.color;
  const items = slide.content.type === 'text' && slide.content.body ? slide.content.body.split('\n').filter((l) => l.trim()) : [];
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      <div className="h-full flex flex-col px-8 md:px-12 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-1 h-8 md:h-9 rounded-sm flex-shrink-0" style={{ backgroundColor: accent }} />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: accent }}>{slide.title}</h2>
          <span className="text-xs md:text-sm ml-2 tracking-widest uppercase" style={{ color: '#8C8C8C' }}>Contents</span>
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
            {items.length > 0 ? items.map((item, i) => {
              const num = String(i + 1).padStart(2, '0');
              const title = item.replace(/^\d+\.\s*/, '');
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg md:text-xl font-bold w-8 text-right flex-shrink-0" style={{ color: `${accent}40` }}>{num}</span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                  <span className="text-sm md:text-base font-medium truncate" style={{ color: '#1A1A1A' }}>{title}</span>
                </div>
              );
            }) : <div className="col-span-full text-center text-sm" style={{ color: '#8C8C8C' }}>暂无目录内容</div>}
          </div>
        </div>
        <div className="absolute bottom-3 right-4 text-xs font-medium" style={{ color: '#8C8C8C' }}>第 {slide.pageNumber} 页 / 共 {totalPages} 页</div>
      </div>
    </section>
  );
}

function OutlineByteDance({ slide, template, totalPages }: { slide: PptSlideData; template: PptTemplate; totalPages: number }) {
  const accent = template.headerStyle.color;
  const items = slide.content.type === 'text' && slide.content.body ? slide.content.body.split('\n').filter((l) => l.trim()) : [];
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      {/* 顶部渐变条 */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${accent} 0%, #8B5CF6 100%)` }} />
      <div className="h-full flex flex-col px-8 md:px-12 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-1 h-8 md:h-9 rounded-sm flex-shrink-0" style={{ backgroundColor: accent }} />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: accent }}>{slide.title}</h2>
          <span className="text-xs md:text-sm ml-2 tracking-widest uppercase" style={{ color: '#8C8C8C' }}>Contents</span>
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
            {items.length > 0 ? items.map((item, i) => {
              const num = String(i + 1).padStart(2, '0');
              const title = item.replace(/^\d+\.\s*/, '');
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg md:text-xl font-bold w-8 text-right flex-shrink-0" style={{ color: `${accent}40` }}>{num}</span>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
                  <span className="text-sm md:text-base font-medium truncate" style={{ color: '#161823' }}>{title}</span>
                </div>
              );
            }) : <div className="col-span-full text-center text-sm" style={{ color: '#8C8C8C' }}>暂无目录内容</div>}
          </div>
        </div>
        <div className="absolute bottom-3 right-4 text-xs font-medium" style={{ color: '#8C8C8C' }}>第 {slide.pageNumber} 页 / 共 {totalPages} 页</div>
      </div>
    </section>
  );
}

function OutlineMcKinsey({ slide, template, totalPages }: { slide: PptSlideData; template: PptTemplate; totalPages: number }) {
  const accent = template.headerStyle.color;
  const items = slide.content.type === 'text' && slide.content.body ? slide.content.body.split('\n').filter((l) => l.trim()) : [];
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      {/* 极简：顶部细线 */}
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: accent }} />
      <div className="h-full flex flex-col px-12 md:px-16 py-8 md:py-10">
        <div className="mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: accent }}>{slide.title}</h2>
          <div className="w-8 h-px mt-3" style={{ backgroundColor: '#D9D9D9' }} />
        </div>
        <div className="flex-1 flex items-center">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 md:gap-y-4">
            {items.length > 0 ? items.map((item, i) => {
              const num = String(i + 1).padStart(2, '0');
              const title = item.replace(/^\d+\.\s*/, '');
              return (
                <div key={i} className="flex items-baseline gap-3">
                  <span className="text-sm font-semibold w-6 flex-shrink-0" style={{ color: accent }}>{num}</span>
                  <span className="text-sm md:text-base font-normal truncate" style={{ color: '#1A1A1A' }}>{title}</span>
                </div>
              );
            }) : <div className="col-span-full text-center text-sm" style={{ color: '#8C8C8C' }}>暂无目录内容</div>}
          </div>
        </div>
        <div className="absolute bottom-3 right-4 text-xs font-medium" style={{ color: '#8C8C8C' }}>第 {slide.pageNumber} 页 / 共 {totalPages} 页</div>
      </div>
    </section>
  );
}

function OutlineSlide({ slide, template, totalPages }: { slide: PptSlideData; template: PptTemplate; totalPages: number }) {
  switch (template.id) {
    case 'china-mobile':
      return <OutlineChinaMobile slide={slide} template={template} totalPages={totalPages} />;
    case 'alibaba':
      return <OutlineAlibaba slide={slide} template={template} totalPages={totalPages} />;
    case 'tencent':
      return <OutlineTencent slide={slide} template={template} totalPages={totalPages} />;
    case 'bytedance':
      return <OutlineByteDance slide={slide} template={template} totalPages={totalPages} />;
    case 'mckinsey':
      return <OutlineMcKinsey slide={slide} template={template} totalPages={totalPages} />;
    default:
      return <OutlineChinaMobile slide={slide} template={template} totalPages={totalPages} />;
  }
}

/* ------------------------------------------------------------------ */
/*  结束页 — 按品牌分治                                                  */
/* ------------------------------------------------------------------ */

function EndChinaMobile({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: accent }} />
      <div className="absolute bottom-0 left-0 w-full h-1" style={{ backgroundColor: '#00A650' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full opacity-[0.04]" style={{ backgroundColor: accent }} />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: accent }}>{slide.title}</h1>
          <div className="w-16 h-1 mx-auto mb-5 rounded-full" style={{ backgroundColor: accent }} />
          {slide.conclusion && <p className="text-base md:text-lg" style={{ color: '#595959' }}>{slide.conclusion}</p>}
        </div>
      </div>
    </section>
  );
}

function EndAlibaba({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: accent }} />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full opacity-[0.06]" style={{ backgroundColor: accent }} />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: '#1A1A1A' }}>{slide.title}</h1>
          <div className="w-16 h-1 mx-auto mb-5 rounded-full" style={{ backgroundColor: accent }} />
          {slide.conclusion && <p className="text-base md:text-lg" style={{ color: '#595959' }}>{slide.conclusion}</p>}
        </div>
      </div>
    </section>
  );
}

function EndTencent({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accent }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full opacity-[0.04]" style={{ backgroundColor: accent }} />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-10">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: accent }}>{slide.title}</h1>
          <div className="w-16 h-0.5 mx-auto mb-5 rounded-full" style={{ backgroundColor: accent }} />
          {slide.conclusion && <p className="text-base md:text-lg" style={{ color: '#595959' }}>{slide.conclusion}</p>}
        </div>
      </div>
    </section>
  );
}

function EndByteDance({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${accent} 0%, #8B5CF6 100%)` }} />
      <div className="absolute bottom-8 left-8 w-4 h-4 rounded-full opacity-20" style={{ backgroundColor: accent }} />
      <div className="absolute bottom-8 left-14 w-4 h-4 rounded-full opacity-20" style={{ backgroundColor: '#FE2C55' }} />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: accent }}>{slide.title}</h1>
          <div className="w-16 h-1 mx-auto mb-5 rounded-full" style={{ backgroundColor: accent }} />
          {slide.conclusion && <p className="text-base md:text-lg" style={{ color: '#595959' }}>{slide.conclusion}</p>}
        </div>
      </div>
    </section>
  );
}

function EndMcKinsey({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  const accent = template.headerStyle.color;
  return (
    <section
      data-slide
      className="relative w-full overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: template.backgroundColor }}
    >
      <div className="absolute top-0 left-0 w-full h-0.5" style={{ backgroundColor: accent }} />
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-10">
        <div className="text-center">
          <h1 className="text-3xl md:text-[2.75rem] font-semibold tracking-tight mb-6" style={{ color: accent }}>{slide.title}</h1>
          <div className="w-12 h-px mx-auto mb-5" style={{ backgroundColor: '#D9D9D9' }} />
          {slide.conclusion && <p className="text-sm md:text-base" style={{ color: '#595959' }}>{slide.conclusion}</p>}
        </div>
      </div>
    </section>
  );
}

function EndSlide({ slide, template }: { slide: PptSlideData; template: PptTemplate }) {
  switch (template.id) {
    case 'china-mobile':
      return <EndChinaMobile slide={slide} template={template} />;
    case 'alibaba':
      return <EndAlibaba slide={slide} template={template} />;
    case 'tencent':
      return <EndTencent slide={slide} template={template} />;
    case 'bytedance':
      return <EndByteDance slide={slide} template={template} />;
    case 'mckinsey':
      return <EndMcKinsey slide={slide} template={template} />;
    default:
      return <EndChinaMobile slide={slide} template={template} />;
  }
}

/* ------------------------------------------------------------------ */
/*  正文页 — 通用，颜色随模板变化                                        */
/* ------------------------------------------------------------------ */

function BodySlide({ slide, template, totalPages }: { slide: PptSlideData; template: PptTemplate; totalPages: number }) {
  const bgColor = template.backgroundColor;
  const headerColor = template.headerStyle.color;
  const conclusionBg = template.conclusionStyle?.backgroundColor || `${template.headerStyle.color}15`;
  const conclusionBorder = template.conclusionStyle?.borderColor || template.headerStyle.color;
  const conclusionText = template.conclusionStyle?.color || '#1A1A1A';
  const noteColor = template.noteStyle?.color || '#595959';
  const pageNumColor = template.pageNumberStyle?.color || '#8C8C8C';

  return (
    <section
      data-slide
      className="relative w-full flex flex-col overflow-hidden rounded-card border border-gray-100/80 shadow-card"
      style={{ aspectRatio: '16 / 9', backgroundColor: bgColor }}
    >
      {/* Title area */}
      <div className="flex-none px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 md:h-8 rounded-sm flex-shrink-0" style={{ backgroundColor: headerColor }} />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ color: headerColor }}>
            {slide.title}
          </h2>
        </div>
      </div>

      {/* Conclusion area */}
      {slide.conclusion && (
        <div className="flex-none mx-6 px-3 py-2.5 rounded-md border-l-4" style={{ backgroundColor: conclusionBg, borderLeftColor: conclusionBorder }}>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: conclusionText }}>
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
                  <div key={block.id} className={`${getBlockLayoutClass(blocks.length, i)} min-h-0 overflow-hidden`}>
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
            <p className="text-sm text-gray-500 whitespace-pre-wrap">{slide.content.body || '暂无内容'}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            <p>暂无内容</p>
          </div>
        )}
      </div>

      {/* Note area */}
      {slide.note && (
        <div className="flex-none px-6 pb-1">
          <p className="text-xs truncate" style={{ color: noteColor }}>{slide.note}</p>
        </div>
      )}

      {/* Page number */}
      <div className="absolute bottom-3 right-4 text-xs font-medium" style={{ color: pageNumColor }}>
        第 {slide.pageNumber} 页 / 共 {totalPages} 页
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Dispatcher                                                        */
/* ------------------------------------------------------------------ */
export default function PptSlide({ slide, template, totalPages }: PptSlideProps) {
  switch (slide.kind) {
    case 'cover':
      return <CoverSlide slide={slide} template={template} />;
    case 'outline':
      return <OutlineSlide slide={slide} template={template} totalPages={totalPages} />;
    case 'end':
      return <EndSlide slide={slide} template={template} />;
    case 'body':
    default:
      return <BodySlide slide={slide} template={template} totalPages={totalPages} />;
  }
}
