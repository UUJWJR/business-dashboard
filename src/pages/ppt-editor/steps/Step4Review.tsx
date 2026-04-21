import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, GripVertical, Eye, EyeOff } from 'lucide-react';
import PptSlide from '../components/PptSlide';
import { getTemplateById, PPT_TEMPLATES } from '../../../utils/pptTemplates';
import MarkdownEditor from '../components/MarkdownEditor';
import type { PptReport, PptSlideData } from '../../../types/ppt';

interface Props {
  report: Omit<PptReport, 'id' | 'createdAt' | 'updatedAt'>;
  onBack: () => void;
  onNext: () => void;
  onUpdateSlide: (slide: PptSlideData) => void;
  onReorderBodySlides: (bodySlides: PptSlideData[]) => void;
}

const kindLabel: Record<string, string> = {
  cover: '封面',
  outline: '大纲',
  body: '正文',
  end: '结束',
};

export default function Step4Review({
  report,
  onBack,
  onNext,
  onUpdateSlide,
  onReorderBodySlides,
}: Props) {
  const template = getTemplateById(report.templateId) || PPT_TEMPLATES[0];
  const slides = report.slides;

  const [selectedId, setSelectedId] = useState(slides[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isGlobalPreview, setIsGlobalPreview] = useState(false);
  const [editForm, setEditForm] = useState<{
    title: string;
    conclusion: string;
    note: string;
    blockConclusions: Record<string, string>;
  }>({ title: '', conclusion: '', note: '', blockConclusions: {} });
  const [dragBodyIndex, setDragBodyIndex] = useState<number | null>(null);

  const bodySlidesRef = useRef<PptSlideData[]>([]);

  useEffect(() => {
    bodySlidesRef.current = slides.filter((s) => s.kind === 'body');
  }, [slides]);

  // 确保选中项始终有效
  useEffect(() => {
    const exists = slides.find((s) => s.id === selectedId);
    if (!exists && slides.length > 0) {
      setSelectedId(slides[0].id);
    }
  }, [slides, selectedId]);

  const selectedSlide = slides.find((s) => s.id === selectedId) || slides[0];

  // 分解 slides
  const coverSlide = slides.find((s) => s.kind === 'cover');
  const outlineSlide = slides.find((s) => s.kind === 'outline');
  const endSlide = slides.find((s) => s.kind === 'end');
  const bodySlides = slides.filter((s) => s.kind === 'body');

  // 进入编辑模式
  const enterEdit = useCallback(() => {
    if (!selectedSlide) return;
    const blockConclusions: Record<string, string> = {};
    if (selectedSlide.content.type === 'mixed') {
      selectedSlide.content.blocks.forEach((b) => {
        blockConclusions[b.id] = b.conclusion;
      });
    }
    setEditForm({
      title: selectedSlide.title,
      conclusion: selectedSlide.conclusion,
      note: selectedSlide.note,
      blockConclusions,
    });
    setIsEditing(true);
  }, [selectedSlide]);

  // 保存编辑
  const saveEdit = useCallback(() => {
    if (!selectedSlide) return;
    let updatedContent = selectedSlide.content;
    if (selectedSlide.content.type === 'mixed') {
      updatedContent = {
        ...selectedSlide.content,
        blocks: selectedSlide.content.blocks.map((b) => ({
          ...b,
          conclusion: editForm.blockConclusions[b.id] ?? b.conclusion,
        })),
      };
    }
    const updated: PptSlideData = {
      ...selectedSlide,
      title: editForm.title,
      conclusion: editForm.conclusion,
      note: editForm.note,
      content: updatedContent,
    };
    onUpdateSlide(updated);
    setIsEditing(false);
  }, [selectedSlide, editForm, onUpdateSlide]);

  // 取消编辑
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  // 拖拽排序 —— 只在 body slides 之间
  const handleBodyDragStart = (index: number) => {
    setDragBodyIndex(index);
  };

  const handleBodyDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragBodyIndex === null || dragBodyIndex === index) return;
    const next = [...bodySlidesRef.current];
    const [dragged] = next.splice(dragBodyIndex, 1);
    next.splice(index, 0, dragged);
    bodySlidesRef.current = next;
    onReorderBodySlides(next);
    setDragBodyIndex(index);
  };

  const handleBodyDragEnd = () => {
    setDragBodyIndex(null);
  };

  // 渲染缩略图项
  const renderThumbnail = (
    slide: PptSlideData,
    opts?: {
      isDraggable?: boolean;
      onDragStart?: () => void;
      onDragOver?: (e: React.DragEvent) => void;
    }
  ) => {
    const isSelected = selectedId === slide.id;
    const isDragging = opts?.isDraggable && dragBodyIndex !== null && bodySlides[dragBodyIndex]?.id === slide.id;

    return (
      <div
        key={slide.id}
        draggable={opts?.isDraggable}
        onDragStart={opts?.onDragStart}
        onDragOver={opts?.onDragOver}
        onDragEnd={handleBodyDragEnd}
        onClick={() => {
          setSelectedId(slide.id);
          setIsEditing(false);
        }}
        className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
          isSelected
            ? 'border-primary-500 shadow-md'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      >
        {opts?.isDraggable && (
          <div className="absolute top-1 left-1 z-20 bg-white/80 dark:bg-black/50 rounded p-0.5">
            <GripVertical className="w-3 h-3 text-gray-500" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/60 text-white text-[10px] px-1.5 py-0.5 flex justify-between items-center">
          <span>{kindLabel[slide.kind || 'body']}</span>
          <span>第 {slide.pageNumber} 页</span>
        </div>
        <div className="relative aspect-video overflow-hidden bg-gray-50 dark:bg-gray-800">
          <div
            className="absolute top-0 left-0"
            style={{
              width: '500%',
              height: '500%',
              transform: 'scale(0.2)',
              transformOrigin: 'top left',
            }}
          >
            <PptSlide slide={slide} template={template} totalPages={slides.length} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
      {/* 报告信息 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{report.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {report.department} · {report.date} · {report.author}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsGlobalPreview((v) => !v);
              setIsEditing(false);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-btn transition-colors"
          >
            {isGlobalPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                退出全局预览
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                全局预览
              </>
            )}
          </button>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-btn transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回修改
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-btn transition-colors"
          >
            下一步
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 gap-5 min-h-0 overflow-hidden">
        {/* 左侧缩略图列表 —— 全局预览时收缩隐藏 */}
        <div
          className={`flex-shrink-0 flex flex-col min-h-0 transition-all duration-300 ease-out ${
            isGlobalPreview ? 'w-0 opacity-0 overflow-hidden' : 'w-52 opacity-100'
          }`}
        >
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">
            共 {slides.length} 页 · 点击选中，拖拽正文排序
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-2">
            {coverSlide && renderThumbnail(coverSlide)}
            {outlineSlide && renderThumbnail(outlineSlide)}

            {/* body slides — 可拖拽区域 */}
            {bodySlides.length > 0 && (
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-1" />
            )}
            {bodySlides.map((slide, bodyIndex) =>
              renderThumbnail(slide, {
                isDraggable: true,
                onDragStart: () => handleBodyDragStart(bodyIndex),
                onDragOver: (e) => handleBodyDragOver(e, bodyIndex),
              })
            )}
            {bodySlides.length > 0 && (
              <div className="border-t border-dashed border-gray-200 dark:border-gray-700 my-1" />
            )}

            {endSlide && renderThumbnail(endSlide)}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div
          className={`min-h-0 overflow-y-auto transition-all duration-300 ease-out ${
            isGlobalPreview ? 'w-full' : 'flex-1'
          }`}
        >
          {isGlobalPreview ? (
            /* 全局预览模式 —— 显示所有页面 */
            <div className="space-y-6 pb-4">
              {slides.map((slide) => (
                <div key={slide.id} className="relative">
                  <div className="absolute -top-3 left-0 z-10">
                    <span className="text-xs text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-1 rounded shadow-sm">
                      {kindLabel[slide.kind || 'body']} · 第 {slide.pageNumber} 页
                    </span>
                  </div>
                  <PptSlide slide={slide} template={template} totalPages={slides.length} />
                </div>
              ))}
            </div>
          ) : isEditing ? (
            /* 编辑模式 */
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">编辑页面</h3>
                <span className="text-xs text-gray-400">
                  {kindLabel[selectedSlide?.kind || 'body']} · 第 {selectedSlide?.pageNumber} 页
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  标题
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-400 mt-1">{editForm.title.length} / 20 字</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  结论
                </label>
                <MarkdownEditor
                  value={editForm.conclusion}
                  onChange={(value) =>
                    setEditForm((prev) => ({ ...prev, conclusion: value }))
                  }
                  rows={3}
                />
                <p className="text-xs text-gray-400 mt-1">{editForm.conclusion.length} / 150 字</p>
              </div>

              {selectedSlide?.content.type === 'mixed' &&
                selectedSlide.content.blocks.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      表格分析结论
                    </p>
                    {selectedSlide.content.blocks.map((block, idx) => (
                      <div
                        key={block.id}
                        className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
                      >
                        <p className="text-xs text-gray-500 mb-1">
                          {block.title || `表格 ${idx + 1}`}
                        </p>
                        <MarkdownEditor
                          value={editForm.blockConclusions[block.id] || ''}
                          onChange={(value) =>
                            setEditForm((prev) => ({
                              ...prev,
                              blockConclusions: {
                                ...prev.blockConclusions,
                                [block.id]: value,
                              },
                            }))
                          }
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  备注
                </label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-400 mt-1">{editForm.note.length} / 40 字</p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  保存修改
                </button>
              </div>
            </div>
          ) : (
            /* 默认单页预览 */
            <div
              onDoubleClick={enterEdit}
              className="relative cursor-pointer group"
            >
              {selectedSlide && (
                <PptSlide
                  slide={selectedSlide}
                  template={template}
                  totalPages={slides.length}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-card pointer-events-none">
                <span className="text-sm text-gray-700 bg-white/90 dark:bg-gray-800/90 dark:text-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
                  双击编辑
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 隐藏的 PDF 导出容器 */}
      <div
        id="ppt-preview-slides"
        className="absolute left-[-9999px] top-0"
        style={{ width: 960 }}
      >
        {slides.map((slide) => (
          <div key={slide.id}>
            <PptSlide
              slide={slide}
              template={template}
              totalPages={slides.length}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
