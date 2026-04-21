import type { PageBuilderElement, Slide, GridType, TitlePayload, TextPayload, TablePayload, ShapePayload, ImagePayload, ChartPayload } from '../../types/pageBuilder';
import CanvasProperties from './properties/CanvasProperties';
import TextProperties from './properties/TextProperties';
import TableProperties from './properties/TableProperties';
import ShapeProperties from './properties/ShapeProperties';
import ImageProperties from './properties/ImageProperties';
import ChartProperties from './properties/ChartProperties';

interface PropertyPanelProps {
  selectedElement: PageBuilderElement | null;
  activeSlide: Slide | null;
  gridType: GridType;
  gridSize: number;
  onUpdateElement: (id: string, partial: Partial<PageBuilderElement>) => void;
  onUpdateSlide: (id: string, partial: Partial<Slide>) => void;
  onSetGrid: (type: GridType, size: number) => void;
}

export default function PropertyPanel({
  selectedElement,
  activeSlide,
  gridType,
  gridSize,
  onUpdateElement,
  onUpdateSlide,
  onSetGrid,
}: PropertyPanelProps) {
  const renderProperties = () => {
    if (!selectedElement) {
      if (activeSlide) {
        return (
          <CanvasProperties
            background={activeSlide.background}
            gridType={gridType}
            gridSize={gridSize}
            onUpdateBackground={(bg) => onUpdateSlide(activeSlide.id, { background: bg })}
            onSetGrid={onSetGrid}
          />
        );
      }
      return <div className="text-xs text-gray-400 dark:text-gray-500">选中元素或幻灯片查看属性</div>;
    }

    // Common position/size controls
    const commonControls = (
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">X</label>
          <input
            type="number"
            value={Math.round(selectedElement.position.x * 10) / 10}
            onChange={(e) =>
              onUpdateElement(selectedElement.id, {
                position: { ...selectedElement.position, x: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-full mt-1 px-2 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">Y</label>
          <input
            type="number"
            value={Math.round(selectedElement.position.y * 10) / 10}
            onChange={(e) =>
              onUpdateElement(selectedElement.id, {
                position: { ...selectedElement.position, y: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-full mt-1 px-2 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">宽</label>
          <input
            type="number"
            value={Math.round(selectedElement.size.width * 10) / 10}
            onChange={(e) =>
              onUpdateElement(selectedElement.id, {
                size: { ...selectedElement.size, width: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-full mt-1 px-2 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400">高</label>
          <input
            type="number"
            value={Math.round(selectedElement.size.height * 10) / 10}
            onChange={(e) =>
              onUpdateElement(selectedElement.id, {
                size: { ...selectedElement.size, height: parseFloat(e.target.value) || 0 },
              })
            }
            className="w-full mt-1 px-2 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
          />
        </div>
      </div>
    );

    switch (selectedElement.type) {
      case 'title':
      case 'text': {
        const content = selectedElement.content as TitlePayload | TextPayload;
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">类型</label>
              <div className="text-sm text-gray-900 dark:text-white capitalize">{selectedElement.type === 'title' ? '标题' : '文字'}</div>
            </div>
            {commonControls}
            <TextProperties
              content={content}
              onUpdate={(updated) => onUpdateElement(selectedElement.id, { content: { ...content, ...updated } as TitlePayload | TextPayload })}
            />
          </div>
        );
      }
      case 'table': {
        const content = selectedElement.content as TablePayload;
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">类型</label>
              <div className="text-sm text-gray-900 dark:text-white">表格</div>
            </div>
            {commonControls}
            <TableProperties
              content={content}
              onUpdate={(updated) => onUpdateElement(selectedElement.id, { content: updated })}
            />
          </div>
        );
      }
      case 'shape': {
        const content = selectedElement.content as ShapePayload;
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">类型</label>
              <div className="text-sm text-gray-900 dark:text-white">形状</div>
            </div>
            {commonControls}
            <ShapeProperties
              content={content}
              onUpdate={(updated) => onUpdateElement(selectedElement.id, { content: { ...content, ...updated } })}
            />
          </div>
        );
      }
      case 'image': {
        const content = selectedElement.content as ImagePayload;
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">类型</label>
              <div className="text-sm text-gray-900 dark:text-white">图片</div>
            </div>
            {commonControls}
            <ImageProperties
              content={content}
              onUpdate={(updated) => onUpdateElement(selectedElement.id, { content: { ...content, ...updated } })}
            />
          </div>
        );
      }
      case 'chart': {
        const content = selectedElement.content as ChartPayload;
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">类型</label>
              <div className="text-sm text-gray-900 dark:text-white">图表</div>
            </div>
            {commonControls}
            <ChartProperties
              content={content}
              onUpdate={(updated) => onUpdateElement(selectedElement.id, { content: updated })}
            />
          </div>
        );
      }
      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">类型</label>
              <div className="text-sm text-gray-900 dark:text-white capitalize">{selectedElement.type}</div>
            </div>
            {commonControls}
          </div>
        );
    }
  };

  return (
    <div className="w-56 flex-shrink-0 bg-white dark:bg-surface-900 border-l border-gray-200/80 dark:border-white/[0.06] flex flex-col">
      <div className="px-3 py-2 border-b border-gray-200/80 dark:border-white/[0.06]">
        <span className="text-xs font-semibold text-gray-900 dark:text-white">属性</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">{renderProperties()}</div>
    </div>
  );
}
