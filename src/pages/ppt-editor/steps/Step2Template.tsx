import { useState, useMemo, useRef, useEffect } from 'react';
import { Palette, FileText, List, LayoutGrid, CheckCircle, GripVertical } from 'lucide-react';
import type { PptSlideData, PptTemplate } from '../../../types/ppt';
import { PPT_TEMPLATES } from '../../../utils/pptTemplates';
import TemplateDesigner from '../components/TemplateDesigner';
import PptSlide from '../components/PptSlide';

interface Props {
  info: { name: string; department: string; date: string; author: string };
  initialTemplateId?: string;
  onSubmit: (slides: PptSlideData[], templateId: string) => void;
}

const CUSTOM_TEMPLATES_KEY = 'dashboard-ppt-custom-templates';
const TEMPLATE_ORDER_KEY = 'dashboard-ppt-template-order';

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

function loadTemplateOrder(): string[] {
  try {
    const raw = localStorage.getItem(TEMPLATE_ORDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTemplateOrder(order: string[]) {
  localStorage.setItem(TEMPLATE_ORDER_KEY, JSON.stringify(order));
}

function orderTemplates(templates: PptTemplate[], order: string[]): PptTemplate[] {
  const map = new Map(templates.map((t) => [t.id, t]));
  const ordered: PptTemplate[] = [];
  const seen = new Set<string>();
  for (const id of order) {
    const t = map.get(id);
    if (t) {
      ordered.push(t);
      seen.add(id);
    }
  }
  for (const t of templates) {
    if (!seen.has(t.id)) ordered.push(t);
  }
  return ordered;
}

const builtinIds = new Set(PPT_TEMPLATES.map((t) => t.id));

function getCustomTemplates(ordered: PptTemplate[]): PptTemplate[] {
  return ordered.filter((t) => !builtinIds.has(t.id));
}

function createFixedSlides(info: Props['info']): PptSlideData[] {
  return [
    {
      id: `slide-cover`,
      title: info.name,
      conclusion: `${info.department} · ${info.date} · ${info.author}`,
      kind: 'cover',
      content: { type: 'text', body: '' },
      note: '',
      pageNumber: 1,
    },
    {
      id: `slide-outline`,
      title: '目录',
      conclusion: '',
      kind: 'outline',
      content: { type: 'text', body: '正文内容将在下一步配置后自动更新' },
      note: '',
      pageNumber: 2,
    },
    {
      id: `slide-end`,
      title: '谢谢观看',
      conclusion: info.department,
      kind: 'end',
      content: { type: 'text', body: '' },
      note: '',
      pageNumber: 3,
    },
  ];
}

export default function Step2Template({ info, initialTemplateId, onSubmit }: Props) {
  const [orderedTemplates, setOrderedTemplates] = useState<PptTemplate[]>(() => {
    const custom = loadCustomTemplates();
    const all = [...PPT_TEMPLATES, ...custom];
    return orderTemplates(all, loadTemplateOrder());
  });
  const currentTemplatesRef = useRef(orderedTemplates);

  useEffect(() => {
    currentTemplatesRef.current = orderedTemplates;
  }, [orderedTemplates]);

  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    const all = orderTemplates([...PPT_TEMPLATES, ...loadCustomTemplates()], loadTemplateOrder());
    const exists = all.find((t) => t.id === initialTemplateId);
    return exists?.id || all[0]?.id || PPT_TEMPLATES[0].id;
  });
  const [showDesigner, setShowDesigner] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const selectedTemplate = orderedTemplates.find((t) => t.id === selectedTemplateId) || orderedTemplates[0];

  const previewSlides = useMemo(() => {
    const fixed = createFixedSlides(info);
    const bodyPlaceholder: PptSlideData = {
      id: 'slide-body-placeholder',
      title: '正文页占位',
      conclusion: '正文内容将在第三步通过 Excel 导入后自动生成',
      kind: 'body',
      content: { type: 'text', body: '' },
      note: '',
      pageNumber: 3,
    };
    return [
      fixed[0],
      fixed[1],
      bodyPlaceholder,
      { ...fixed[2], pageNumber: 4 },
    ];
  }, [info]);

  const handleSaveTemplate = (template: PptTemplate) => {
    const next = [...currentTemplatesRef.current, template];
    currentTemplatesRef.current = next;
    setOrderedTemplates(next);
    saveCustomTemplates(getCustomTemplates(next));
    saveTemplateOrder(next.map((t) => t.id));
    setSelectedTemplateId(template.id);
    setShowDesigner(false);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const next = [...currentTemplatesRef.current];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(index, 0, dragged);
    currentTemplatesRef.current = next;
    setOrderedTemplates(next);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    const final = currentTemplatesRef.current;
    saveCustomTemplates(getCustomTemplates(final));
    saveTemplateOrder(final.map((t) => t.id));
    setDragIndex(null);
  };

  const handleSubmit = () => {
    const slides = createFixedSlides(info);
    onSubmit(slides, selectedTemplateId);
  };

  const pageLabels = [
    { icon: FileText, label: '封面页' },
    { icon: List, label: '大纲页' },
    { icon: LayoutGrid, label: '正文页' },
    { icon: CheckCircle, label: '结束页' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-60 flex-shrink-0 space-y-4">
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
              {orderedTemplates.map((template, index) => (
                <div
                  key={template.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`w-full p-2.5 rounded-lg border text-left transition-colors cursor-move ${
                    selectedTemplateId === template.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${dragIndex === index ? 'opacity-50' : 'opacity-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: template.headerStyle.color }}
                    >
                      {template.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{template.name}</p>
                      <p className="text-xs text-gray-400">
                        {builtinIds.has(template.id) ? '内置模板' : '自定义模板'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            页面结构预览
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewSlides.map((slide, index) => {
              const PageIcon = pageLabels[index].icon;
              return (
                <div key={slide.id} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <PageIcon className="w-3.5 h-3.5" />
                    <span>{pageLabels[index].label}</span>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <span>第 {index + 1} 页</span>
                  </div>
                  <div className="relative overflow-hidden rounded-lg border border-gray-100/80 aspect-video">
                    <div className="absolute top-0 left-0 w-[181.8%] h-[181.8%] origin-top-left scale-[0.55]">
                      <PptSlide
                        slide={slide}
                        template={selectedTemplate}
                        totalPages={previewSlides.length}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-btn transition-colors"
        >
          下一步
        </button>
      </div>

      {showDesigner && (
        <TemplateDesigner onSave={handleSaveTemplate} onCancel={() => setShowDesigner(false)} />
      )}
    </div>
  );
}
