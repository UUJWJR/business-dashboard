# 页面制作（PPT 编辑器）重构设计文档

## 背景

当前实现的"页面制作"功能过于简陋，仅支持单画布、4种基础组件（标题/文字/表格/图表），无属性面板，图表无专业样式，表格不可编辑，与用户对"专业 PPT 编辑器"的期望差距较大。本设计目标是将该模块升级为对标 PowerPoint/WPS 的演示文稿编辑器。

## 需求总结（经用户确认）

1. **多幻灯片管理** — 左侧缩略图列表，支持新建/删除/切换幻灯片
2. **16:9 画布** — 支持网格样式切换（无/点阵/网格线），间距可调
3. **丰富组件** — 标题、文字、表格、图表、形状、图片
4. **右侧属性面板** — 根据选中元素类型动态显示属性编辑表单
5. **拖拽系统** — 从组件面板拖拽到画布，画布内自由移动/缩放
6. **标题/文字** — 双击编辑，支持字体大小、颜色、粗细、对齐
7. **表格** — 画布内双击编辑单元格，支持增删行列、合并/拆分单元格、单元格样式（背景色/文字色/加粗/对齐）、列宽/行高拖拽调整
8. **图表** — 6种类型（折线/柱状/饼图/散点/雷达/瀑布），3种主题可切换（麦肯锡/国标大厂/科技风），右侧属性面板以表格形式编辑数据，切换图表类型时数据自动适配
9. **保存/提交** — 保存 = localStorage 草稿可继续编辑；提交 = 锁定只读但可撤回；两者均可导出 PPT/PDF
10. **图表主题不受暗色模式影响** — 专业配色固定

## 实现方案：渐进式升级（方案 A）

保留现有 `react-rnd` 拖拽骨架和 `@dnd-kit` 放置系统，在其上扩展：
- 多幻灯片管理层（SlideManager）
- 右侧属性面板（PropertyPanel）
- 升级各组件编辑能力
- 引入图表主题系统
- 引入表格编辑器

优势：复用现有基础、风险低、与项目风格一致。

## 架构设计

### 整体布局

```
┌──────────────────────────────────────────────────────────────┐
│ ModuleLayout (Navbar + Sidebar)                              │
├──────────┬─────────────────────────────┬─────────────────────┤
│          │                             │                     │
│  Slide   │        Canvas (16:9)        │   Property Panel    │
│  Panel   │        [当前幻灯片]          │   [选中元素属性]     │
│          │                             │                     │
│  + 幻灯片  │                             │                     │
│  [缩略图]  │                             │   字体: 18px        │
│  [缩略图]  │                             │   颜色: #333        │
│  [缩略图]  │                             │   对齐: 居中         │
│          │                             │                     │
├──────────┼─────────────────────────────┼─────────────────────┤
│ Component│                             │                     │
│ Panel    │                             │                     │
│ [标题]   │                             │                     │
│ [文字]   │                             │                     │
│ [表格]   │                             │                     │
│ [图表]   │                             │                     │
│ [形状]   │                             │                     │
│ [图片]   │                             │                     │
└──────────┴─────────────────────────────┴─────────────────────┘
```

### 状态结构

```ts
interface Slide {
  id: string;
  name: string;
  elements: PageBuilderElement[];
  background: string; // '#ffffff' 或渐变
}

interface PageBuilderState {
  slides: Slide[];
  activeSlideId: string;
  selectedElementId: string | null;
  gridType: 'none' | 'dot' | 'grid';
  gridSize: number; // 8 / 12 / 20
  isSubmitted: boolean; // 提交后锁定
  submittedAt: string | null;
}
```

### 关键模块

| 模块 | 职责 | 文件 |
|---|---|---|
| SlidePanel | 左侧幻灯片缩略图列表 | `SlidePanel.tsx` |
| SlideThumbnail | 单个缩略图渲染 | `SlideThumbnail.tsx` |
| Canvas | 16:9 画布容器 | `Canvas.tsx` |
| CanvasElement | 画布元素包裹层（Rnd） | `CanvasElement.tsx` |
| ComponentPanel | 底部/左侧组件库 | `ComponentPanel.tsx` |
| PropertyPanel | 右侧属性面板 | `PropertyPanel.tsx` |
| TextProperties | 文字/标题属性表单 | `properties/TextProperties.tsx` |
| TableProperties | 表格属性+数据编辑器 | `properties/TableProperties.tsx` |
| ChartProperties | 图表属性+数据编辑器 | `properties/ChartProperties.tsx` |
| ShapeProperties | 形状属性 | `properties/ShapeProperties.tsx` |
| ImageProperties | 图片属性 | `properties/ImageProperties.tsx` |
| usePageBuilder | 全局状态管理 hook | `hooks/usePageBuilder.ts` |
| chartThemes | 图表主题配置 | `utils/chartThemes.ts` |
| tableUtils | 表格操作工具 | `utils/tableUtils.ts` |

## 幻灯片管理

### 功能
- 左侧垂直排列缩略图
- 每张缩略图显示 16:9 比例的微缩预览
- 点击缩略图切换当前编辑幻灯片
- 底部"+"按钮新建幻灯片
- 缩略图右上角悬浮删除按钮
- 支持拖拽排序（可选，v2）

### 数据结构
```ts
const defaultSlide = (): Slide => ({
  id: `slide-${Date.now()}`,
  name: '幻灯片 1',
  elements: [],
  background: '#ffffff',
});
```

## 画布系统

### 网格背景
- `gridType`: 'none' | 'dot' | 'grid'
- `gridSize`: 8 / 12 / 20（像素）
- 通过 CSS `background-image` 实现
- 画布背景色可设置（纯色或渐变）

### 元素系统
- 继续使用百分比坐标（相对画布宽高）
- `react-rnd` 负责拖拽和缩放
- `dragGrid` / `resizeGrid` 根据 `gridSize` 和画布尺寸动态计算
- 元素 `zIndex` 自动管理（点击置顶）

## 组件详细设计

### 1. 标题 / 文字

**画布表现：**
- 双击进入编辑模式（`contentEditable`）
- 失去焦点自动保存内容
- Enter 键退出编辑（标题）/ Shift+Enter 换行（文字）

**属性面板：**
- 字体大小（input number + 下拉）
- 字体颜色（颜色选择器）
- 加粗 / 斜体 / 下划线（toggle 按钮）
- 对齐方式（左/中/右/两端）
- 行高
- 字间距

### 2. 表格

**画布表现：**
- 双击单元格进入编辑（`contentEditable`）
- 选中单元格（点击后蓝色边框）
- 列宽/行高通过拖拽边框调整（类似 Excel）

**属性面板：**
- **数据编辑器**：迷你表格，可直接编辑单元格内容
- **增删行列**：在指定位置前/后插入行/列，删除选中行/列
- **合并/拆分**：选中多个单元格合并（内容取左上角单元格）；选中已合并单元格拆分
- **单元格样式**：背景色、文字颜色、加粗、对齐
- **表格样式**：边框颜色、边框粗细、表头背景色

**数据结构升级：**
```ts
interface TableCell {
  value: string;
  rowSpan?: number;
  colSpan?: number;
  style?: {
    backgroundColor?: string;
    color?: string;
    fontWeight?: 'normal' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
  };
}

interface TablePayload {
  cells: TableCell[][]; // 二维数组
  colWidths: number[];  // 每列宽度百分比
  rowHeights: number[]; // 每行高度百分比
  headerRowCount: number;
}
```

### 3. 图表

**6 种图表类型：**
1. 折线图（line）— `SimpleLineChart`
2. 柱状图（bar）— `SimpleBarChart`
3. 饼图/环形图（pie/donut）— `SimplePieChart`
4. 散点图（scatter）— 新增 `ScatterChart`
5. 雷达图（radar）— 新增 `RadarChart`
6. 瀑布图（waterfall）— 新增 `WaterfallChart`，正值绿色/负值红色自动着色

**3 种主题：**
1. **麦肯锡**：主色 `#003087`，辅色 `#6CACE4`/`#A5ACAF`，无圆角，Arial，极简网格
2. **国标大厂**：主色 `#C41230`，辅色 `#D4AF37`/`#333333`，圆角 4px，阴影，黑体
3. **科技风**：主色 `#06b6d4`，辅色 `#3b82f6`/`#8b5cf6`，渐变填充，深色背景

**属性面板：**
- 图表类型选择（下拉切换）
- 主题选择（下拉切换）
- 数据编辑器（表格形式）
- 系列名称、颜色（可覆盖主题色）
- 标题编辑

**数据编辑器表格：**
- 行 = 数据系列/分类
- 列 = 维度
- 切换图表类型时，数据自动转换（如饼图切到柱状图时，将单系列数据转为多系列）

### 4. 形状

**类型：** 矩形、圆角矩形、圆形、三角形、箭头、线条

**属性面板：**
- 填充颜色/渐变
- 边框颜色/粗细
- 圆角大小（仅圆角矩形）
- 不透明度

### 5. 图片

**来源：** 本地文件上传（FileReader）或 URL

**属性面板：**
- 替换图片
- 圆角
- 阴影
- 不透明度
- 裁剪（可选，v2）

## 右侧属性面板设计

```
┌─────────────────────┐
│ 属性                │
├─────────────────────┤
│ 【公共】            │
│ X: 10%  Y: 20%     │
│ W: 30%  H: 25%     │
│ 层级: 5             │
├─────────────────────┤
│ 【类型专属】         │
│ 根据选中元素类型     │
│ 动态渲染不同表单     │
└─────────────────────┘
```

- 未选中元素时：显示画布/幻灯片属性（背景色、网格设置）
- 选中元素时：显示公共属性 + 类型专属属性
- 所有输入框支持实时预览（debounce 200ms）

## 保存/提交机制

### 保存（Save）
- 快捷键：`Ctrl+S`
- 将完整 `PageBuilderState` 序列化为 JSON
- 存储到 `localStorage`（key: `page-builder-draft`）
- 同时提供"下载 JSON"按钮，可保存为文件备份
- 每次自动保存（debounce 3s）

### 提交（Submit）
- 点击"提交"按钮，弹出确认对话框
- 提交后 `isSubmitted = true`
- 画布变为只读（不可编辑、不可拖拽）
- 显示"已提交"状态标签
- 提供"撤回提交"按钮，将 `isSubmitted` 重置为 `false`
- 提交后仍可导出 PPT/PDF

### 导出
- **导出 PNG**：将当前幻灯片画布截图下载
- **导出 PDF**：将所有幻灯片按顺序合并为 PDF（每页一个幻灯片）
- **导出 PPT**（v2）：生成 `.pptx` 文件（需要引入 `pptxgenjs`）

## 技术栈调整

### 新增依赖
| 库 | 版本 | 用途 |
|---|---|---|
| `react-colorful` | `^5.6.1` | 颜色选择器 |
| `pptxgenjs` | `^3.12.0` | 导出 .pptx（v2） |

### 现有依赖复用
- `@dnd-kit/core` — 组件面板拖拽
- `react-rnd` — 画布内移动/缩放
- `echarts` + `echarts-for-react` — 图表渲染
- `html2canvas` + `jspdf` — 导出 PDF/PNG
- `framer-motion` — 幻灯片切换动画
- `lucide-react` — 图标

## 文件结构

```
src/
├── pages/
│   └── PageBuilder.tsx
├── components/page-builder/
│   ├── SlidePanel.tsx
│   ├── SlideThumbnail.tsx
│   ├── Canvas.tsx
│   ├── CanvasElement.tsx
│   ├── ComponentPanel.tsx
│   ├── PropertyPanel.tsx
│   ├── GridOverlay.tsx
│   ├── properties/
│   │   ├── TextProperties.tsx      # 标题+文字共用
│   │   ├── TableProperties.tsx
│   │   ├── ChartProperties.tsx
│   │   ├── ShapeProperties.tsx
│   │   ├── ImageProperties.tsx
│   │   └── CanvasProperties.tsx    # 画布/幻灯片属性
│   └── element-renderers/
│       ├── TitleElement.tsx
│       ├── TextElement.tsx
│       ├── TableElement.tsx
│       ├── ChartElement.tsx        # 支持主题切换
│       ├── ShapeElement.tsx
│       └── ImageElement.tsx
├── components/charts/
│   ├── ScatterChart.tsx            # 新增
│   ├── RadarChart.tsx              # 新增
│   └── WaterfallChart.tsx          # 新增
├── types/
│   └── pageBuilder.ts              # 扩展类型定义
├── hooks/
│   └── usePageBuilder.ts           # 扩展状态管理
├── utils/
│   ├── chartThemes.ts              # 图表主题配置
│   ├── tableUtils.ts               # 表格操作工具
│   └── pageBuilderExport.ts        # 导出功能
└── App.tsx                         # 路由（已有）
```

## 暗色模式策略

- 整个编辑器框架（SlidePanel、PropertyPanel、Canvas 背景）跟随系统暗色模式
- **图表不受暗色模式影响** — 图表使用固定的主题配色（麦肯锡/国标大厂/科技风），确保导出后颜色一致
- 表格单元格样式由用户自定义，也不受暗色模式影响

## 实施阶段建议

由于功能较多，建议分阶段实施：

**Phase 1（核心框架）：**
1. 多幻灯片管理（SlidePanel）
2. 右侧属性面板框架（PropertyPanel + CanvasProperties）
3. 网格样式切换

**Phase 2（组件升级）：**
4. 标题/文字属性编辑（字体大小、颜色、对齐）
5. 表格编辑（增删行列、合并单元格、单元格样式）
6. 列宽/行高拖拽调整
7. 形状组件（矩形、圆角矩形、圆形、三角形、箭头、线条）

**Phase 3（图表系统）：**
8. 3种图表主题系统
9. 新增散点图、雷达图、瀑布图（正值绿/负值红）
10. 图表数据编辑器（属性面板表格）

**Phase 4（完善）：**
11. 图片组件
12. 保存/提交机制完善
13. PPT 导出（pptxgenjs）

## 验证清单

- [ ] 可新建/删除/切换幻灯片
- [ ] 画布网格可在无/点阵/网格线之间切换
- [ ] 标题/文字可双击编辑，属性面板可改字体大小/颜色/对齐
- [ ] 表格可双击编辑单元格，支持增删行列、合并/拆分单元格
- [ ] 表格列宽/行高可拖拽调整
- [ ] 图表支持6种类型，3种主题可切换
- [ ] 图表数据可在属性面板表格中编辑
- [ ] 切换图表类型时数据自动适配
- [ ] 保存后刷新页面可恢复
- [ ] 提交后画布变为只读，可撤回
- [ ] 可导出 PNG 和 PDF
- [ ] 暗色模式下编辑器框架正确切换，图表颜色不受影响
- [ ] `npm run build` 无 TypeScript 错误
