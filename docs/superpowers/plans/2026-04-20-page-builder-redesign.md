# 页面制作（PPT 编辑器）重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有的单画布页面制作器升级为支持多幻灯片、右侧属性面板、专业图表主题、可编辑表格、形状/图片组件的类 PowerPoint 编辑器。

**Architecture:** 渐进式升级现有 `react-rnd` + `@dnd-kit` 骨架。新增 `Slide` 管理层级，`usePageBuilder` hook 管理全局状态（slides + activeSlideId + selectedElementId），右侧 `PropertyPanel` 根据选中元素类型动态渲染属性表单。

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + `@dnd-kit/core` + `react-rnd` + `echarts-for-react` + `react-colorful` (新增)

---

## 文件结构总览

### 新增文件
- `src/types/pageBuilder.ts` — 扩展类型定义（Slide、TableCell、ChartTheme 等）
- `src/hooks/usePageBuilder.ts` — 扩展状态管理（slides 数组、activeSlideId）
- `src/components/page-builder/SlidePanel.tsx` — 左侧幻灯片缩略图列表
- `src/components/page-builder/SlideThumbnail.tsx` — 单个缩略图
- `src/components/page-builder/PropertyPanel.tsx` — 右侧属性面板容器
- `src/components/page-builder/GridOverlay.tsx` — 画布网格背景（无/点阵/网格线）
- `src/components/page-builder/properties/TextProperties.tsx` — 文字/标题属性
- `src/components/page-builder/properties/TableProperties.tsx` — 表格属性+数据编辑器
- `src/components/page-builder/properties/ChartProperties.tsx` — 图表属性+数据编辑器
- `src/components/page-builder/properties/ShapeProperties.tsx` — 形状属性
- `src/components/page-builder/properties/ImageProperties.tsx` — 图片属性
- `src/components/page-builder/properties/CanvasProperties.tsx` — 画布/幻灯片属性
- `src/components/page-builder/element-renderers/ShapeElement.tsx` — 形状渲染
- `src/components/page-builder/element-renderers/ImageElement.tsx` — 图片渲染
- `src/components/charts/ScatterChart.tsx` — 散点图
- `src/components/charts/RadarChart.tsx` — 雷达图
- `src/components/charts/WaterfallChart.tsx` — 瀑布图
- `src/utils/chartThemes.ts` — 图表主题配置（麦肯锡/国标大厂/科技风）
- `src/utils/tableUtils.ts` — 表格操作工具（合并/拆分/插入/删除）

### 修改文件
- `src/pages/PageBuilder.tsx` — 重构为三栏布局（SlidePanel + Canvas + PropertyPanel）
- `src/components/page-builder/Canvas.tsx` — 支持 gridType/gridSize 传入，移除内联网格样式
- `src/components/page-builder/CanvasElement.tsx` — 增加 shape/image 渲染分支
- `src/components/page-builder/element-renderers/TitleElement.tsx` — 支持样式属性传入
- `src/components/page-builder/element-renderers/TextElement.tsx` — 支持样式属性传入
- `src/components/page-builder/element-renderers/TableElement.tsx` — 支持双击编辑、合并单元格渲染
- `src/components/page-builder/element-renderers/ChartElement.tsx` — 支持主题切换
- `src/components/page-builder/ComponentPanel.tsx` — 增加形状、图片组件
- `src/App.tsx` — 路由（已有）
- `src/components/layout/Sidebar.tsx` — 菜单（已有）

---

## Phase 1: 核心框架

### Task 1: 扩展类型定义

**Files:**
- Create: `src/types/pageBuilder.ts`（完全替换现有内容）

- [ ] **Step 1: 编写完整类型定义**

```typescript
import type { TrendChartData, DistributionData, RegionData } from './index';

export type PageBuilderElementType = 'title' | 'text' | 'table' | 'chart' | 'shape' | 'image';
export type GridType = 'none' | 'dot' | 'grid';
export type ChartType = 'bar' | 'line' | 'pie' | 'scatter' | 'radar' | 'waterfall';
export type ChartThemeName = 'mckinsey' | 'china' | 'tech';
export type ShapeType = 'rect' | 'roundedRect' | 'circle' | 'triangle' | 'arrow' | 'line';

export interface Position {
  x: number; // percentage 0-100
  y: number;
}

export interface Size {
  width: number;  // percentage 0-100
  height: number;
}

export interface TextStyle {
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  textDecoration?: 'none' | 'underline' | 'line-through';
}

export interface TitlePayload extends TextStyle {
  text: string;
}

export interface TextPayload extends TextStyle {
  text: string;
}

export interface TableCellStyle {
  backgroundColor?: string;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
}

export interface TableCell {
  value: string;
  rowSpan?: number;
  colSpan?: number;
  style?: TableCellStyle;
}

export interface TablePayload {
  cells: TableCell[][];
  colWidths: number[];  // percentage per column
  rowHeights: number[]; // percentage per row
  headerRowCount: number;
}

export interface ChartPayload {
  chartType: ChartType;
  chartTheme: ChartThemeName;
  title: string;
  data: TrendChartData | DistributionData[] | RegionData[] | ScatterData | RadarData;
}

export interface ScatterData {
  series: { name: string; data: [number, number][] }[];
}

export interface RadarData {
  indicator: { name: string; max: number }[];
  series: { name: string; data: number[] }[];
}

export interface ShapePayload {
  shapeType: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface ImagePayload {
  src: string;
  borderRadius?: number;
  opacity?: number;
}

export type ElementPayload = TitlePayload | TextPayload | TablePayload | ChartPayload | ShapePayload | ImagePayload;

export interface PageBuilderElement {
  id: string;
  type: PageBuilderElementType;
  position: Position;
  size: Size;
  content: ElementPayload;
  zIndex: number;
}

export interface Slide {
  id: string;
  name: string;
  elements: PageBuilderElement[];
  background: string;
}

export interface PageBuilderState {
  slides: Slide[];
  activeSlideId: string;
  selectedId: string | null;
  gridType: GridType;
  gridSize: number;
  isSubmitted: boolean;
  submittedAt: string | null;
}

export interface CanvasSize {
  width: number;
  height: number;
}
```

- [ ] **Step 2: 验证无类型错误**

Run: `npx tsc --noEmit`
Expected: 无 `pageBuilder.ts` 相关错误（可能有其他文件因类型变更报错，后续修复）

- [ ] **Step 3: Commit**

```bash
git add src/types/pageBuilder.ts
git commit -m "types: extend page builder types for multi-slide, table cell, chart theme"
```

---

### Task 2: 重构 usePageBuilder Hook

**Files:**
- Modify: `src/hooks/usePageBuilder.ts`（完全替换）

- [ ] **Step 1: 编写重构后的 usePageBuilder**

```typescript
import { useReducer, useCallback, useEffect } from 'react';
import type {
  PageBuilderElement,
  PageBuilderElementType,
  Position,
  Size,
  Slide,
  PageBuilderState,
  GridType,
  ElementPayload,
} from '../types/pageBuilder';

const STORAGE_KEY = 'page-builder-draft';

function createDefaultSlide(id: number): Slide {
  return {
    id: `slide-${Date.now()}-${id}`,
    name: `幻灯片 ${id + 1}`,
    elements: [],
    background: '#ffffff',
  };
}

function createDefaultContent(type: PageBuilderElementType): ElementPayload {
  switch (type) {
    case 'title':
      return { text: '请输入标题', fontSize: 24, color: '#1e293b', textAlign: 'left' };
    case 'text':
      return { text: '请输入正文内容', fontSize: 14, color: '#334155', textAlign: 'left', lineHeight: 1.6 };
    case 'table':
      return {
        cells: [
          [{ value: '列1' }, { value: '列2' }, { value: '列3' }],
          [{ value: '数据1' }, { value: '数据2' }, { value: '数据3' }],
          [{ value: '数据4' }, { value: '数据5' }, { value: '数据6' }],
        ],
        colWidths: [33.33, 33.33, 33.34],
        rowHeights: [33.33, 33.33, 33.34],
        headerRowCount: 1,
      };
    case 'chart':
      return {
        chartType: 'bar',
        chartTheme: 'mckinsey',
        title: '图表标题',
        data: {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [{ name: '系列1', values: [120, 200, 150, 80, 70, 110], color: '#6366f1' }],
        },
      };
    case 'shape':
      return { shapeType: 'rect', fillColor: '#3b82f6', strokeColor: '#2563eb', strokeWidth: 0, opacity: 1 };
    case 'image':
      return { src: '', opacity: 1, borderRadius: 0 };
    default:
      return { text: '' };
  }
}

function createDefaultSize(type: PageBuilderElementType): Size {
  switch (type) {
    case 'title': return { width: 40, height: 8 };
    case 'text': return { width: 35, height: 15 };
    case 'table': return { width: 50, height: 25 };
    case 'chart': return { width: 45, height: 35 };
    case 'shape': return { width: 20, height: 20 };
    case 'image': return { width: 30, height: 25 };
    default: return { width: 30, height: 20 };
  }
}

type Action =
  | { type: 'LOAD_STATE'; state: PageBuilderState }
  | { type: 'ADD_SLIDE' }
  | { type: 'DELETE_SLIDE'; slideId: string }
  | { type: 'SET_ACTIVE_SLIDE'; slideId: string }
  | { type: 'UPDATE_SLIDE'; slideId: string; partial: Partial<Slide> }
  | { type: 'ADD_ELEMENT'; slideId: string; element: PageBuilderElement }
  | { type: 'UPDATE_ELEMENT'; slideId: string; elementId: string; partial: Partial<PageBuilderElement> }
  | { type: 'REMOVE_ELEMENT'; slideId: string; elementId: string }
  | { type: 'SELECT_ELEMENT'; id: string | null }
  | { type: 'BRING_TO_FRONT'; slideId: string; elementId: string }
  | { type: 'SET_GRID'; gridType: GridType; gridSize: number }
  | { type: 'SUBMIT' }
  | { type: 'UNDO_SUBMIT' }
  | { type: 'CLEAR_ALL' };

function getActiveSlide(state: PageBuilderState): Slide | undefined {
  return state.slides.find((s) => s.id === state.activeSlideId);
}

function reducer(state: PageBuilderState, action: Action): PageBuilderState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.state;
    case 'ADD_SLIDE': {
      const newSlide = createDefaultSlide(state.slides.length);
      return { ...state, slides: [...state.slides, newSlide], activeSlideId: newSlide.id };
    }
    case 'DELETE_SLIDE': {
      if (state.slides.length <= 1) return state;
      const newSlides = state.slides.filter((s) => s.id !== action.slideId);
      const newActive = state.activeSlideId === action.slideId ? newSlides[0].id : state.activeSlideId;
      return { ...state, slides: newSlides, activeSlideId: newActive, selectedId: null };
    }
    case 'SET_ACTIVE_SLIDE':
      return { ...state, activeSlideId: action.slideId, selectedId: null };
    case 'UPDATE_SLIDE':
      return {
        ...state,
        slides: state.slides.map((s) => (s.id === action.slideId ? { ...s, ...action.partial } : s)),
      };
    case 'ADD_ELEMENT': {
      const newState = {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.slideId ? { ...s, elements: [...s.elements, action.element] } : s
        ),
        selectedId: action.element.id,
      };
      saveState(newState);
      return newState;
    }
    case 'UPDATE_ELEMENT': {
      const newState = {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.slideId
            ? {
                ...s,
                elements: s.elements.map((el) =>
                  el.id === action.elementId ? { ...el, ...action.partial } : el
                ),
              }
            : s
        ),
      };
      saveState(newState);
      return newState;
    }
    case 'REMOVE_ELEMENT': {
      const newState = {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.slideId
            ? { ...s, elements: s.elements.filter((el) => el.id !== action.elementId) }
            : s
        ),
        selectedId: state.selectedId === action.elementId ? null : state.selectedId,
      };
      saveState(newState);
      return newState;
    }
    case 'SELECT_ELEMENT':
      return { ...state, selectedId: action.id };
    case 'BRING_TO_FRONT': {
      const slide = state.slides.find((s) => s.id === action.slideId);
      const maxZ = Math.max(0, ...(slide?.elements || []).map((el) => el.zIndex));
      const newState = {
        ...state,
        slides: state.slides.map((s) =>
          s.id === action.slideId
            ? {
                ...s,
                elements: s.elements.map((el) =>
                  el.id === action.elementId ? { ...el, zIndex: maxZ + 1 } : el
                ),
              }
            : s
        ),
      };
      saveState(newState);
      return newState;
    }
    case 'SET_GRID':
      return { ...state, gridType: action.gridType, gridSize: action.gridSize };
    case 'SUBMIT':
      return { ...state, isSubmitted: true, submittedAt: new Date().toISOString() };
    case 'UNDO_SUBMIT':
      return { ...state, isSubmitted: false, submittedAt: null };
    case 'CLEAR_ALL': {
      const newSlide = createDefaultSlide(0);
      const newState = {
        slides: [newSlide],
        activeSlideId: newSlide.id,
        selectedId: null,
        gridType: 'grid' as GridType,
        gridSize: 20,
        isSubmitted: false,
        submittedAt: null,
      };
      saveState(newState);
      return newState;
    }
    default:
      return state;
  }
}

function saveState(state: PageBuilderState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function loadState(): PageBuilderState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // 兼容旧格式（单页无 slides）
      if (!parsed.slides && parsed.elements) {
        const newSlide = createDefaultSlide(0);
        newSlide.elements = parsed.elements;
        return {
          slides: [newSlide],
          activeSlideId: newSlide.id,
          selectedId: parsed.selectedId || null,
          gridType: 'grid',
          gridSize: 20,
          isSubmitted: false,
          submittedAt: null,
        };
      }
      return parsed as PageBuilderState;
    }
  } catch {
    // ignore
  }
  const firstSlide = createDefaultSlide(0);
  return {
    slides: [firstSlide],
    activeSlideId: firstSlide.id,
    selectedId: null,
    gridType: 'grid',
    gridSize: 20,
    isSubmitted: false,
    submittedAt: null,
  };
}

export function usePageBuilder() {
  const [state, dispatch] = useReducer(reducer, loadState()!);

  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: 'LOAD_STATE', state: saved });
  }, []);

  const activeSlide = state.slides.find((s) => s.id === state.activeSlideId);
  const elements = activeSlide?.elements || [];

  const addSlide = useCallback(() => dispatch({ type: 'ADD_SLIDE' }), []);
  const deleteSlide = useCallback((slideId: string) => dispatch({ type: 'DELETE_SLIDE', slideId }), []);
  const setActiveSlide = useCallback((slideId: string) => dispatch({ type: 'SET_ACTIVE_SLIDE', slideId }), []);
  const updateSlide = useCallback((slideId: string, partial: Partial<Slide>) => dispatch({ type: 'UPDATE_SLIDE', slideId, partial }), []);

  const addElement = useCallback(
    (type: PageBuilderElementType, position: Position) => {
      const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const maxZ = Math.max(0, ...elements.map((el) => el.zIndex));
      const element: PageBuilderElement = {
        id,
        type,
        position,
        size: createDefaultSize(type),
        content: createDefaultContent(type),
        zIndex: maxZ + 1,
      };
      dispatch({ type: 'ADD_ELEMENT', slideId: state.activeSlideId, element });
      return id;
    },
    [elements, state.activeSlideId]
  );

  const updateElement = useCallback(
    (elementId: string, partial: Partial<PageBuilderElement>) =>
      dispatch({ type: 'UPDATE_ELEMENT', slideId: state.activeSlideId, elementId, partial }),
    [state.activeSlideId]
  );

  const removeElement = useCallback(
    (elementId: string) => dispatch({ type: 'REMOVE_ELEMENT', slideId: state.activeSlideId, elementId }),
    [state.activeSlideId]
  );

  const selectElement = useCallback((id: string | null) => dispatch({ type: 'SELECT_ELEMENT', id }), []);

  const bringToFront = useCallback(
    (elementId: string) => dispatch({ type: 'BRING_TO_FRONT', slideId: state.activeSlideId, elementId }),
    [state.activeSlideId]
  );

  const setGrid = useCallback((gridType: GridType, gridSize: number) => dispatch({ type: 'SET_GRID', gridType, gridSize }), []);
  const submit = useCallback(() => dispatch({ type: 'SUBMIT' }), []);
  const undoSubmit = useCallback(() => dispatch({ type: 'UNDO_SUBMIT' }), []);
  const clearAll = useCallback(() => dispatch({ type: 'CLEAR_ALL' }), []);

  return {
    ...state,
    elements,
    activeSlide,
    addSlide,
    deleteSlide,
    setActiveSlide,
    updateSlide,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    bringToFront,
    setGrid,
    submit,
    undoSubmit,
    clearAll,
  };
}
```

- [ ] **Step 2: 修复类型兼容问题**

由于 `createDefaultContent` 返回类型与 `ElementPayload` 的精确匹配可能有差异，运行：

Run: `npx tsc --noEmit`
Expected: 修复所有 `usePageBuilder.ts` 内的类型错误（主要是 `as` 断言或类型收窄）

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePageBuilder.ts
git commit -m "feat: refactor usePageBuilder for multi-slide support"
```

---

### Task 3: 画布网格组件

**Files:**
- Create: `src/components/page-builder/GridOverlay.tsx`

- [ ] **Step 1: 实现 GridOverlay 组件**

```tsx
import type { GridType } from '../../types/pageBuilder';

interface GridOverlayProps {
  gridType: GridType;
  gridSize: number;
}

export default function GridOverlay({ gridType, gridSize }: GridOverlayProps) {
  if (gridType === 'none') return null;

  const size = `${gridSize}px`;

  if (gridType === 'dot') {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: `${size} ${size}`,
        }}
      />
    );
  }

  // grid
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
        backgroundSize: `${size} ${size}`,
      }}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/page-builder/GridOverlay.tsx
git commit -m "feat: add GridOverlay component for canvas grid"
```

---

### Task 4: 幻灯片缩略图面板

**Files:**
- Create: `src/components/page-builder/SlideThumbnail.tsx`
- Create: `src/components/page-builder/SlidePanel.tsx`

- [ ] **Step 1: 实现 SlideThumbnail**

```tsx
import { X } from 'lucide-react';
import type { Slide } from '../../types/pageBuilder';

interface SlideThumbnailProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function SlideThumbnail({ slide, index, isActive, onClick, onDelete }: SlideThumbnailProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full aspect-video rounded-md border-2 overflow-hidden bg-white transition-all ${
          isActive
            ? 'border-primary-500 ring-2 ring-primary-200'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
        }`}
      >
        <div className="p-1 h-full overflow-hidden">
          <div className="text-[6px] leading-tight text-gray-400 text-center mb-0.5">{slide.name}</div>
          <div className="relative w-full h-full">
            {slide.elements.slice(0, 3).map((el) => (
              <div
                key={el.id}
                className="absolute bg-primary-200 rounded-sm"
                style={{
                  left: `${el.position.x}%`,
                  top: `${el.position.y}%`,
                  width: `${Math.min(el.size.width, 30)}%`,
                  height: `${Math.min(el.size.height, 20)}%`,
                }}
              />
            ))}
          </div>
        </div>
      </button>
      <div className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <div className="absolute bottom-1 left-1 text-[8px] bg-gray-800/60 text-white px-1 rounded">{index + 1}</div>
    </div>
  );
}
```

- [ ] **Step 2: 实现 SlidePanel**

```tsx
import { Plus } from 'lucide-react';
import type { Slide } from '../../types/pageBuilder';
import SlideThumbnail from './SlideThumbnail';

interface SlidePanelProps {
  slides: Slide[];
  activeSlideId: string;
  onAddSlide: () => void;
  onDeleteSlide: (id: string) => void;
  onSetActiveSlide: (id: string) => void;
}

export default function SlidePanel({ slides, activeSlideId, onAddSlide, onDeleteSlide, onSetActiveSlide }: SlidePanelProps) {
  return (
    <div className="w-44 flex-shrink-0 bg-white dark:bg-surface-900 border-r border-gray-200/80 dark:border-white/[0.06] flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200/80 dark:border-white/[0.06]">
        <span className="text-xs font-semibold text-gray-900 dark:text-white">幻灯片</span>
        <button
          onClick={onAddSlide}
          className="w-6 h-6 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center hover:bg-primary-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            index={index}
            isActive={slide.id === activeSlideId}
            onClick={() => onSetActiveSlide(slide.id)}
            onDelete={() => onDeleteSlide(slide.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/page-builder/SlideThumbnail.tsx src/components/page-builder/SlidePanel.tsx
git commit -m "feat: add SlidePanel and SlideThumbnail components"
```

---

### Task 5: 画布组件适配

**Files:**
- Modify: `src/components/page-builder/Canvas.tsx`

- [ ] **Step 1: 修改 Canvas 支持 gridType/gridSize 传入，使用 GridOverlay**

```tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { PageBuilderElement, CanvasSize, GridType } from '../../types/pageBuilder';
import CanvasElement from './CanvasElement';
import GridOverlay from './GridOverlay';

interface CanvasProps {
  elements: PageBuilderElement[];
  selectedId: string | null;
  gridType: GridType;
  gridSize: number;
  isSubmitted: boolean;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, partial: Partial<PageBuilderElement>) => void;
  onBringToFront: (id: string) => void;
  onRemoveElement: (id: string) => void;
}

export default function Canvas({
  elements,
  selectedId,
  gridType,
  gridSize,
  isSubmitted,
  onSelectElement,
  onUpdateElement,
  onBringToFront,
  onRemoveElement,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({ width: 0, height: 0 });

  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-area' });

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onSelectElement(null);
    },
    [onSelectElement]
  );

  return (
    <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-gray-50/50 dark:bg-black/20">
      <div
        ref={(node) => {
          setNodeRef(node);
          (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        onClick={handleCanvasClick}
        className={`relative w-full max-w-[1200px] aspect-video bg-white dark:bg-surface-900 rounded-card shadow-card dark:shadow-card-dark overflow-hidden transition-colors ${
          isOver ? 'ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-surface-950' : ''
        }`}
      >
        <GridOverlay gridType={gridType} gridSize={gridSize} />
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            canvasSize={canvasSize}
            isSelected={element.id === selectedId}
            isReadOnly={isSubmitted}
            onSelect={() => {
              onSelectElement(element.id);
              onBringToFront(element.id);
            }}
            onUpdate={onUpdateElement}
            onRemove={onRemoveElement}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/page-builder/Canvas.tsx
git commit -m "feat: adapt Canvas for GridOverlay and readOnly mode"
```

---

### Task 6: 右侧属性面板框架

**Files:**
- Create: `src/components/page-builder/properties/CanvasProperties.tsx`
- Create: `src/components/page-builder/PropertyPanel.tsx`

- [ ] **Step 1: 实现 CanvasProperties（画布/幻灯片属性）**

```tsx
import type { GridType } from '../../../types/pageBuilder';

interface CanvasPropertiesProps {
  background: string;
  gridType: GridType;
  gridSize: number;
  onUpdateBackground: (bg: string) => void;
  onSetGrid: (type: GridType, size: number) => void;
}

export default function CanvasProperties({ background, gridType, gridSize, onUpdateBackground, onSetGrid }: CanvasPropertiesProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">背景颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={background}
            onChange={(e) => onUpdateBackground(e.target.value)}
            className="w-8 h-8 rounded border border-gray-200 dark:border-white/[0.06] cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">{background}</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">网格样式</label>
        <div className="flex gap-1">
          {(['none', 'dot', 'grid'] as GridType[]).map((type) => (
            <button
              key={type}
              onClick={() => onSetGrid(type, gridSize)}
              className={`flex-1 py-1.5 text-xs rounded-btn border transition-colors ${
                gridType === type
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400'
              }`}
            >
              {type === 'none' ? '无' : type === 'dot' ? '点阵' : '网格'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">网格间距</label>
        <div className="flex gap-1">
          {[8, 12, 20].map((size) => (
            <button
              key={size}
              onClick={() => onSetGrid(gridType, size)}
              className={`flex-1 py-1.5 text-xs rounded-btn border transition-colors ${
                gridSize === size
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700 dark:text-primary-300'
                  : 'bg-white dark:bg-surface-800 border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400'
              }`}
            >
              {size}px
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 实现 PropertyPanel 容器**

```tsx
import type { PageBuilderElement, Slide, GridType } from '../../types/pageBuilder';
import CanvasProperties from './properties/CanvasProperties';

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
    if (selectedElement) {
      // TODO: Phase 2/3 根据类型渲染不同属性表单
      return (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1.5">类型</label>
            <div className="text-sm text-gray-900 dark:text-white capitalize">{selectedElement.type}</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.position.x * 10) / 10}
                onChange={(e) => onUpdateElement(selectedElement.id, { position: { ...selectedElement.position, x: parseFloat(e.target.value) || 0 } })}
                className="w-full mt-1 px-2 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.position.y * 10) / 10}
                onChange={(e) => onUpdateElement(selectedElement.id, { position: { ...selectedElement.position, y: parseFloat(e.target.value) || 0 } })}
                className="w-full mt-1 px-2 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">宽</label>
              <input
                type="number"
                value={Math.round(selectedElement.size.width * 10) / 10}
                onChange={(e) => onUpdateElement(selectedElement.id, { size: { ...selectedElement.size, width: parseFloat(e.target.value) || 0 } })}
                className="w-full mt-1 px-2 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">高</label>
              <input
                type="number"
                value={Math.round(selectedElement.size.height * 10) / 10}
                onChange={(e) => onUpdateElement(selectedElement.id, { size: { ...selectedElement.size, height: parseFloat(e.target.value) || 0 } })}
                className="w-full mt-1 px-2 py-1 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      );
    }

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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/page-builder/PropertyPanel.tsx src/components/page-builder/properties/CanvasProperties.tsx
git commit -m "feat: add PropertyPanel with CanvasProperties"
```

---

### Task 7: 重构 PageBuilder 页面（三栏布局）

**Files:**
- Modify: `src/pages/PageBuilder.tsx`（完全替换）

- [ ] **Step 1: 重写 PageBuilder 为三栏布局**

```tsx
import { useCallback, useRef } from 'react';
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { Presentation, Download, FileImage, Trash2, CheckCircle, RotateCcw } from 'lucide-react';
import ModuleLayout from '../components/layout/ModuleLayout';
import SlidePanel from '../components/page-builder/SlidePanel';
import ComponentPanel from '../components/page-builder/ComponentPanel';
import Canvas from '../components/page-builder/Canvas';
import PropertyPanel from '../components/page-builder/PropertyPanel';
import { usePageBuilder } from '../hooks/usePageBuilder';
import { exportToPNG, exportToPDF } from '../utils/pageBuilderExport';
import type { PageBuilderElementType } from '../types/pageBuilder';

export default function PageBuilder() {
  const {
    slides,
    activeSlideId,
    elements,
    selectedId,
    gridType,
    gridSize,
    isSubmitted,
    activeSlide,
    addSlide,
    deleteSlide,
    setActiveSlide,
    updateSlide,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    bringToFront,
    setGrid,
    submit,
    undoSubmit,
    clearAll,
  } = usePageBuilder();

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { distance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || over.id !== 'canvas-drop-area') return;
      const type = active.data.current?.type as PageBuilderElementType;
      if (!type) return;
      const overRect = over.rect;
      const translatedLeft = active.rect.current.translated?.left;
      const translatedTop = active.rect.current.translated?.top;
      if (translatedLeft == null || translatedTop == null) return;
      const relativeX = translatedLeft - overRect.left;
      const relativeY = translatedTop - overRect.top;
      addElement(type, {
        x: Math.max(0, Math.min(95, (relativeX / overRect.width) * 100)),
        y: Math.max(0, Math.min(95, (relativeY / overRect.height) * 100)),
      });
    },
    [addElement]
  );

  const handleExportPNG = useCallback(async () => {
    const canvasEl = canvasContainerRef.current?.querySelector('.aspect-video') as HTMLElement;
    if (canvasEl) await exportToPNG(canvasEl, activeSlide?.name || '幻灯片');
  }, [activeSlide]);

  const handleExportPDF = useCallback(async () => {
    const canvasEl = canvasContainerRef.current?.querySelector('.aspect-video') as HTMLElement;
    if (canvasEl) await exportToPDF(canvasEl, activeSlide?.name || '幻灯片');
  }, [activeSlide]);

  const selectedElement = elements.find((el) => el.id === selectedId) || null;

  return (
    <ModuleLayout
      title="页面制作"
      icon={<Presentation className="w-6 h-6" />}
      actions={
        <>
          {isSubmitted && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-btn">
              <CheckCircle className="w-3.5 h-3.5" />
              已提交
            </span>
          )}
          <button onClick={handleExportPNG} className="..."> <FileImage className="w-4 h-4" /> 导出图片 </button>
          <button onClick={handleExportPDF} className="..."> <Download className="w-4 h-4" /> 导出PDF </button>
          {isSubmitted ? (
            <button onClick={undoSubmit} className="..."> <RotateCcw className="w-4 h-4" /> 撤回提交 </button>
          ) : (
            <button onClick={submit} className="..."> <CheckCircle className="w-4 h-4" /> 提交 </button>
          )}
          <button onClick={clearAll} className="..."> <Trash2 className="w-4 h-4" /> 清空 </button>
        </>
      }
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div ref={canvasContainerRef} className="relative flex h-[calc(100vh-8rem)] rounded-card overflow-hidden border border-gray-200/80 dark:border-white/[0.06] bg-white dark:bg-surface-900">
          <SlidePanel
            slides={slides}
            activeSlideId={activeSlideId}
            onAddSlide={addSlide}
            onDeleteSlide={deleteSlide}
            onSetActiveSlide={setActiveSlide}
          />
          <div className="flex flex-col flex-1 min-w-0">
            <Canvas
              elements={elements}
              selectedId={selectedId}
              gridType={gridType}
              gridSize={gridSize}
              isSubmitted={isSubmitted}
              onSelectElement={selectElement}
              onUpdateElement={updateElement}
              onBringToFront={bringToFront}
              onRemoveElement={removeElement}
            />
            <ComponentPanel />
          </div>
          <PropertyPanel
            selectedElement={selectedElement}
            activeSlide={activeSlide}
            gridType={gridType}
            gridSize={gridSize}
            onUpdateElement={updateElement}
            onUpdateSlide={updateSlide}
            onSetGrid={setGrid}
          />
        </div>
      </DndContext>
    </ModuleLayout>
  );
}
```

注意：actions 中的按钮 className 使用与现有项目一致的样式：
```
flex items-center gap-2 px-3 py-2 rounded-btn text-sm font-medium bg-white dark:bg-surface-900 border border-gray-200/80 dark:border-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-white/[0.04] transition-colors
```
提交按钮使用 `text-primary-600 dark:text-primary-400` 代替灰色文字。
清空按钮保持 `text-red-600 dark:text-red-400`。

- [ ] **Step 2: 修复类型和构建错误**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/PageBuilder.tsx
git commit -m "feat: refactor PageBuilder to three-column layout with slides and properties"
```

---

## Phase 2: 组件升级

### Task 8: 文字/标题属性面板

**Files:**
- Create: `src/components/page-builder/properties/TextProperties.tsx`

- [ ] **Step 1: 实现 TextProperties**

```tsx
import type { TextStyle } from '../../../types/pageBuilder';

interface TextPropertiesProps {
  content: TextStyle;
  onUpdate: (content: TextStyle) => void;
}

export default function TextProperties({ content, onUpdate }: TextPropertiesProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">字号</label>
        <input
          type="number"
          value={content.fontSize || 14}
          onChange={(e) => onUpdate({ ...content, fontSize: parseInt(e.target.value) || 14 })}
          className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-surface-800 border border-gray-200 dark:border-white/[0.06] rounded text-gray-900 dark:text-white"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">颜色</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={content.color || '#1e293b'}
            onChange={(e) => onUpdate({ ...content, color: e.target.value })}
            className="w-8 h-8 rounded border border-gray-200 dark:border-white/[0.06] cursor-pointer"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">{content.color || '#1e293b'}</span>
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">对齐</label>
        <div className="flex gap-1">
          {(['left', 'center', 'right', 'justify'] as const).map((align) => (
            <button
              key={align}
              onClick={() => onUpdate({ ...content, textAlign: align })}
              className={`flex-1 py-1 text-xs rounded border transition-colors ${
                content.textAlign === align
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
                  : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
              }`}
            >
              {align === 'left' ? '左' : align === 'center' ? '中' : align === 'right' ? '右' : '两端'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onUpdate({ ...content, fontWeight: content.fontWeight === 'bold' ? 'normal' : 'bold' })}
          className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
            content.fontWeight === 'bold'
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
              : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => onUpdate({ ...content, fontStyle: content.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
            content.fontStyle === 'italic'
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
              : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
          }`}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => onUpdate({ ...content, textDecoration: content.textDecoration === 'underline' ? 'none' : 'underline' })}
          className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
            content.textDecoration === 'underline'
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 text-primary-700'
              : 'bg-white dark:bg-surface-800 border-gray-200 text-gray-600'
          }`}
        >
          <u>U</u>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在 PropertyPanel 中集成 TextProperties**

Modify `src/components/page-builder/PropertyPanel.tsx`，在 `renderProperties` 的 `selectedElement` 分支中，根据 `selectedElement.type` 判断：
- `'title'` 或 `'text'` → 渲染 `TextProperties`，传入 `content` 和 `onUpdate` 回调

```tsx
import TextProperties from './properties/TextProperties';

// 在 renderProperties 中：
if (selectedElement.type === 'title' || selectedElement.type === 'text') {
  return (
    <>
      {/* 公共位置/尺寸 */}
      <TextProperties
        content={selectedElement.content as any}
        onUpdate={(content) => onUpdateElement(selectedElement.id, { content: { ...selectedElement.content, ...content } })}
      />
    </>
  );
}
```

- [ ] **Step 3: 更新 TitleElement 和 TextElement 支持样式属性**

修改 `TitleElement.tsx` 和 `TextElement.tsx`，将 `content` 中的 `fontSize`、`color`、`textAlign` 等样式属性应用到元素上。

TitleElement 当前已有 `fontSize`、`align`，需要增加 `color`、`fontWeight`、`fontStyle`、`textDecoration`。

TextElement 需要增加 `fontSize`、`color`、`textAlign`、`fontWeight`、`fontStyle`、`textDecoration`、`lineHeight`。

- [ ] **Step 4: Commit**

```bash
git add src/components/page-builder/properties/TextProperties.tsx src/components/page-builder/PropertyPanel.tsx src/components/page-builder/element-renderers/TitleElement.tsx src/components/page-builder/element-renderers/TextElement.tsx
git commit -m "feat: add text properties panel with font size, color, alignment, style"
```

---

### Task 9: 表格编辑功能

**Files:**
- Create: `src/utils/tableUtils.ts`
- Modify: `src/components/page-builder/element-renderers/TableElement.tsx`
- Create: `src/components/page-builder/properties/TableProperties.tsx`

- [ ] **Step 1: 实现 tableUtils**

```typescript
import type { TableCell, TablePayload } from '../types/pageBuilder';

export function insertRow(payload: TablePayload, rowIndex: number): TablePayload {
  const newCells = payload.cells.map((row) => [...row]);
  const colCount = newCells[0]?.length || 1;
  newCells.splice(rowIndex, 0, Array.from({ length: colCount }, () => ({ value: '' })));
  const newHeights = [...payload.rowHeights];
  newHeights.splice(rowIndex, 0, 100 / newCells.length);
  return { ...payload, cells: newCells, rowHeights: normalizeArray(newHeights) };
}

export function deleteRow(payload: TablePayload, rowIndex: number): TablePayload {
  if (payload.cells.length <= 1) return payload;
  const newCells = payload.cells.filter((_, i) => i !== rowIndex);
  const newHeights = payload.rowHeights.filter((_, i) => i !== rowIndex);
  return { ...payload, cells: newCells, rowHeights: normalizeArray(newHeights) };
}

export function insertCol(payload: TablePayload, colIndex: number): TablePayload {
  const newCells = payload.cells.map((row) => {
    const newRow = [...row];
    newRow.splice(colIndex, 0, { value: '' });
    return newRow;
  });
  const newWidths = [...payload.colWidths];
  newWidths.splice(colIndex, 0, 100 / newCells[0].length);
  return { ...payload, cells: newCells, colWidths: normalizeArray(newWidths) };
}

export function deleteCol(payload: TablePayload, colIndex: number): TablePayload {
  if ((payload.cells[0]?.length || 0) <= 1) return payload;
  const newCells = payload.cells.map((row) => row.filter((_, i) => i !== colIndex));
  const newWidths = payload.colWidths.filter((_, i) => i !== colIndex);
  return { ...payload, cells: newCells, colWidths: normalizeArray(newWidths) };
}

export function mergeCells(payload: TablePayload, startRow: number, startCol: number, endRow: number, endCol: number): TablePayload {
  const newCells = payload.cells.map((row, ri) =>
    row.map((cell, ci) => {
      if (ri === startRow && ci === startCol) {
        return { ...cell, rowSpan: endRow - startRow + 1, colSpan: endCol - startCol + 1 };
      }
      if (ri >= startRow && ri <= endRow && ci >= startCol && ci <= endCol && (ri !== startRow || ci !== startCol)) {
        return { ...cell, value: '', rowSpan: 1, colSpan: 1, hidden: true };
      }
      return cell;
    })
  );
  return { ...payload, cells: newCells };
}

export function splitCell(payload: TablePayload, row: number, col: number): TablePayload {
  const cell = payload.cells[row]?.[col];
  if (!cell?.rowSpan && !cell?.colSpan) return payload;
  const newCells = payload.cells.map((r, ri) =>
    r.map((c, ci) => {
      if (ri === row && ci === col) {
        return { ...c, rowSpan: undefined, colSpan: undefined };
      }
      // Un-hide cells that were covered
      const inSpan = ri >= row && ri < row + (cell.rowSpan || 1) && ci >= col && ci < col + (cell.colSpan || 1);
      if (inSpan && c.hidden) {
        return { ...c, hidden: false };
      }
      return c;
    })
  );
  return { ...payload, cells: newCells };
}

function normalizeArray(arr: number[]): number[] {
  const sum = arr.reduce((a, b) => a + b, 0);
  if (sum === 0) return arr.map(() => 100 / arr.length);
  return arr.map((v) => (v / sum) * 100);
}
```

- [ ] **Step 2: 重写 TableElement 支持双击编辑和合并单元格渲染**

TableElement 需要：
1. 支持双击单元格进入编辑模式
2. 支持单元格样式（背景色、文字颜色、加粗、对齐）
3. 正确渲染 `rowSpan` / `colSpan` 和 `hidden` 单元格
4. 列宽/行高通过百分比实现

- [ ] **Step 3: 实现 TableProperties（属性面板）**

TableProperties 包含：
1. 迷你数据编辑器（表格形式，可直接编辑）
2. 增删行列按钮
3. 合并/拆分按钮（需先选中单元格范围）
4. 单元格样式编辑（背景色、文字颜色、加粗、对齐）

- [ ] **Step 4: Commit**

```bash
git add src/utils/tableUtils.ts src/components/page-builder/element-renderers/TableElement.tsx src/components/page-builder/properties/TableProperties.tsx
git commit -m "feat: add full table editing with merge/split/insert/delete and cell styling"
```

---

### Task 10: 形状组件

**Files:**
- Create: `src/components/page-builder/element-renderers/ShapeElement.tsx`
- Create: `src/components/page-builder/properties/ShapeProperties.tsx`

- [ ] **Step 1: 实现 ShapeElement**

根据 `shapeType` 渲染不同 SVG 形状：
- `rect` → `<rect>`
- `roundedRect` → `<rect rx="8">`
- `circle` → `<circle>`
- `triangle` → `<polygon points="...">`
- `arrow` → `<path>`
- `line` → `<line>`

使用 `fillColor`、`strokeColor`、`strokeWidth`、`opacity` 样式。

- [ ] **Step 2: 实现 ShapeProperties**

属性面板包含：
- 形状类型选择（下拉）
- 填充颜色
- 边框颜色
- 边框粗细
- 不透明度（0-1 滑块）

- [ ] **Step 3: 在 PropertyPanel 和 CanvasElement 中接入 shape 分支**

- [ ] **Step 4: 在 ComponentPanel 中添加形状组件项**

- [ ] **Step 5: Commit**

```bash
git add src/components/page-builder/element-renderers/ShapeElement.tsx src/components/page-builder/properties/ShapeProperties.tsx src/components/page-builder/PropertyPanel.tsx src/components/page-builder/CanvasElement.tsx src/components/page-builder/ComponentPanel.tsx
git commit -m "feat: add shape component with 6 shape types and property panel"
```

---

## Phase 3: 图表系统

### Task 11: 图表主题配置

**Files:**
- Create: `src/utils/chartThemes.ts`

- [ ] **Step 1: 定义三种图表主题**

```typescript
export interface ChartTheme {
  name: string;
  colors: string[];
  backgroundColor?: string;
  textColor: string;
  axisColor: string;
  gridColor: string;
  fontFamily: string;
  barRadius?: number;
  lineWidth?: number;
  symbolSize?: number;
  areaOpacity?: number;
}

export const chartThemes: Record<string, ChartTheme> = {
  mckinsey: {
    name: '麦肯锡',
    colors: ['#003087', '#6CACE4', '#A5ACAF', '#D9D9D9', '#333333', '#666666'],
    textColor: '#333333',
    axisColor: '#CCCCCC',
    gridColor: '#EEEEEE',
    fontFamily: 'Arial, sans-serif',
    barRadius: 0,
    lineWidth: 2,
    symbolSize: 4,
    areaOpacity: 0.1,
  },
  china: {
    name: '国标大厂',
    colors: ['#C41230', '#D4AF37', '#333333', '#999999', '#666666', '#CC9966'],
    textColor: '#333333',
    axisColor: '#DDDDDD',
    gridColor: '#F5F5F5',
    fontFamily: '"Microsoft YaHei", "SimHei", sans-serif',
    barRadius: 4,
    lineWidth: 3,
    symbolSize: 6,
    areaOpacity: 0.15,
  },
  tech: {
    name: '科技风',
    colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'],
    backgroundColor: '#0f172a',
    textColor: '#e2e8f0',
    axisColor: '#334155',
    gridColor: '#1e293b',
    fontFamily: '"Inter", -apple-system, sans-serif',
    barRadius: 6,
    lineWidth: 3,
    symbolSize: 8,
    areaOpacity: 0.25,
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/chartThemes.ts
git commit -m "feat: add chart themes (McKinsey, China, Tech)"
```

---

### Task 12: 新增图表组件（散点图、雷达图、瀑布图）

**Files:**
- Create: `src/components/charts/ScatterChart.tsx`
- Create: `src/components/charts/RadarChart.tsx`
- Create: `src/components/charts/WaterfallChart.tsx`

- [ ] **Step 1: ScatterChart**

使用 `echarts-for-react`，series type 为 `scatter`。接收 `ScatterData` 类型数据。

- [ ] **Step 2: RadarChart**

使用 `echarts-for-react`，series type 为 `radar`。接收 `RadarData` 类型数据。

- [ ] **Step 3: WaterfallChart**

使用 `echarts-for-react`，通过堆叠柱状图实现：
- 辅助系列（透明）作为基线
- 正值用绿色（`#22c55e`）
- 负值用红色（`#ef4444`）
- 总计用蓝色（`#3b82f6`）

数据格式：`{ name: string; value: number; isTotal?: boolean }[]`

- [ ] **Step 4: Commit**

```bash
git add src/components/charts/ScatterChart.tsx src/components/charts/RadarChart.tsx src/components/charts/WaterfallChart.tsx
git commit -m "feat: add scatter, radar, and waterfall chart components"
```

---

### Task 13: 图表属性面板与数据编辑器

**Files:**
- Create: `src/components/page-builder/properties/ChartProperties.tsx`
- Modify: `src/components/page-builder/element-renderers/ChartElement.tsx`

- [ ] **Step 1: ChartProperties**

包含：
- 图表类型下拉（bar/line/pie/scatter/radar/waterfall）
- 主题下拉（麦肯锡/国标大厂/科技风）
- 标题输入框
- 数据编辑器表格（根据 chartType 动态列头）
- 切换 chartType 时数据自动转换（如 pie → bar 时，将单系列 values 转为多系列）

- [ ] **Step 2: ChartElement 适配主题**

ChartElement 接收 `chartTheme` 属性，在渲染 ECharts option 时应用对应主题配色（覆盖现有 `SimpleBarChart` 等组件的颜色配置）。

如果现有 chart 组件不支持传入主题配置，则在 ChartElement 中直接调用 `echarts-for-react` 并自行构建 option（基于主题配置）。

- [ ] **Step 3: Commit**

```bash
git add src/components/page-builder/properties/ChartProperties.tsx src/components/page-builder/element-renderers/ChartElement.tsx
git commit -m "feat: add chart properties panel with theme switching and data editor"
```

---

## Phase 4: 完善

### Task 14: 图片组件

**Files:**
- Create: `src/components/page-builder/element-renderers/ImageElement.tsx`
- Create: `src/components/page-builder/properties/ImageProperties.tsx`

- [ ] **Step 1: ImageElement**

使用 `<img>` 标签，支持 `src`、`opacity`、`borderRadius`。

空 src 时显示占位符（上传提示）。

- [ ] **Step 2: ImageProperties**

包含：
- 文件上传 input（`type="file" accept="image/*"`）
- URL 输入框
- 圆角输入
- 不透明度滑块

上传使用 `FileReader.readAsDataURL` 转为 base64 存储。

- [ ] **Step 3: Commit**

```bash
git add src/components/page-builder/element-renderers/ImageElement.tsx src/components/page-builder/properties/ImageProperties.tsx
git commit -m "feat: add image component with upload and property panel"
```

---

### Task 15: 保存/提交机制完善

**Files:**
- Modify: `src/utils/pageBuilderExport.ts`
- Modify: `src/pages/PageBuilder.tsx`

- [ ] **Step 1: 扩展导出功能**

在 `pageBuilderExport.ts` 中增加：
- `exportSlidesToPDF(slides, canvasRefs)` — 将所有幻灯片按顺序生成多页 PDF
- `downloadJSON(state, filename)` — 下载 JSON 备份文件

- [ ] **Step 2: PageBuilder 集成保存/提交/导出**

- "保存"按钮：触发 `localStorage` 保存（已有自动保存，按钮可手动触发并 toast 提示）
- "提交"按钮：设置 `isSubmitted=true`，画布变只读
- "撤回提交"按钮：设置 `isSubmitted=false`
- "下载 JSON"按钮：导出完整 state 为 `.json` 文件
- CanvasElement 在 `isReadOnly` 时禁用拖拽和编辑

- [ ] **Step 3: Commit**

```bash
git add src/utils/pageBuilderExport.ts src/pages/PageBuilder.tsx
git commit -m "feat: complete save/submit/export workflow"
```

---

### Task 16: 最终验证

- [ ] **Step 1: TypeScript 编译**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 2: 功能验证清单**

1. 新建/删除/切换幻灯片 ✓
2. 画布网格切换（无/点阵/网格线）和间距调整 ✓
3. 标题/文字属性编辑（字号、颜色、对齐、加粗、斜体、下划线）✓
4. 表格双击编辑单元格 ✓
5. 表格增删行列 ✓
6. 表格合并/拆分单元格（取左上角内容）✓
7. 表格单元格样式（背景色、文字颜色、加粗、对齐）✓
8. 形状组件（6种类型）及属性编辑 ✓
9. 图片上传及属性编辑 ✓
10. 图表6种类型渲染 ✓
11. 图表3种主题切换 ✓
12. 图表数据编辑器 ✓
13. 切换图表类型数据自动适配 ✓
14. 瀑布图正负值自动着色 ✓
15. 保存后刷新恢复 ✓
16. 提交后画布只读，可撤回 ✓
17. 导出 PNG/PDF ✓
18. 暗色模式下编辑器框架正确，图表颜色固定 ✓

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat: complete page builder redesign with multi-slide, properties panel, chart themes, table editing"
```

---

## Spec 覆盖检查

| 需求 | 对应 Task |
|---|---|
| 多幻灯片管理 | Task 4, Task 7 |
| 16:9 画布 + 网格切换 | Task 3, Task 5, Task 6 |
| 标题/文字属性编辑 | Task 8 |
| 表格编辑（增删行列/合并拆分/样式） | Task 9 |
| 图表6种类型 | Task 12, Task 13 |
| 图表3种主题 | Task 11, Task 13 |
| 瀑布图正负值着色 | Task 12 (WaterfallChart) |
| 形状组件 | Task 10 |
| 图片组件 | Task 14 |
| 保存/提交/撤回 | Task 15 |
| 导出 PNG/PDF | Task 15 |
| 暗色模式适配 | 各组件遵循 dark: 模式，图表颜色固定 |

**无遗漏。**
