# PPT 报告撰写模块设计文档

> 替代原 `docs/pdf-report.md` 的开发计划。
> 设计日期：2026-04-21
> 状态：已确认，待实施

---

## 一、背景与原始计划的问题

原始文档 `docs/pdf-report.md` 描述了一个 7 步 PPT 生成工作流，但存在以下关键问题：

1. **架构冲突**：项目为纯前端 SPA（React + Vite），无后端服务。原始计划要求的服务器端文件系统操作（`/review/ppt-md`、`/review/pdf-exprot`、`/review/ppt-template`）在浏览器端不可行。
2. **范围失控**：7 步工作流包含富文本编辑、拖拽排版、Excel 解析、AI 分析、模板设计器，开发量约 4-6 周，但缺少优先级和分阶段策略。
3. **AI 集成未定义**：大模型调用方式、API Key 安全、提示词工程、错误处理全部缺失。
4. **状态管理缺失**：复杂 wizard 缺少状态机设计，仅重复说"自动更新源 MD 文档"。
5. **与现有代码脱节**：项目已有成熟的 `pdfExport.ts`、`slideSummary.ts`、`SlideSection.tsx` 和 `WeekReview.tsx` 幻灯片导出管线，原始计划完全无视这些基础设施。
6. **其他细节问题**：Excel 映射僵化（sheet1 对应第 1 页）、术语模糊（"DM 文档"、"Smart 图表"）、无错误处理、中文文件名编码风险。

---

## 二、设计目标与约束

### 目标
在现有 dashboard 中新增"撰写 PPT"模块，让用户能够基于现有业务数据快速生成符合 `ppt-design-system.md` 规范的 PDF 报告。

### 约束
- **纯浏览器端**：无后端服务，所有功能在浏览器内完成。
- **复用优先**：最大化复用现有 `pdfExport.ts`、`SlideSection.tsx`、`slideSummary.ts`、`dataGenerator.ts` 等基础设施。
- **渐进交付**：分阶段实现，每阶段都有可上线的产出。
- **中文 UI**：界面语言为简体中文。

---

## 三、架构设计

### 3.1 路由设计

在 `App.tsx` 中新增顶级路由 `/ppt-editor/*`，采用与现有模块一致的嵌套路由模式：

| 路径 | 用途 |
|------|------|
| `/ppt-editor` | 重定向到 `/ppt-editor/list` |
| `/ppt-editor/list` | 报告列表页：展示历史报告、支持删除和重新编辑 |
| `/ppt-editor/create` | 新建报告 wizard（3 步） |
| `/ppt-editor/edit/:id` | 编辑已有报告：加载报告数据，进入 wizard 第 1 步并预填所有字段 |

### 3.2 目录结构

```
src/
├── pages/
│   └── ppt-editor/
│       ├── PptEditor.tsx          # 顶层路由壳，配置子路由
│       ├── ReportList.tsx         # 报告列表页（空状态 + 列表 + 删除）
│       ├── CreateReport.tsx       # 3 步 wizard 容器：管理 currentStep 和 reportDraft 状态
│       ├── steps/
│       │   ├── Step1Info.tsx      # 填写报告信息（名称、部门、日期、作者）
│       │   ├── Step2Template.tsx  # 选择模板 + 配置每页内容（标题、结论、备注可编辑）
│       │   └── Step3Preview.tsx   # 预览全部页面 + 导出 PDF
│       └── components/
│           ├── WizardNav.tsx      # 进度条：3 个节点，支持已完成步骤回退
│           └── PptSlide.tsx       # 单页渲染：注入模板样式，根据 content.type 渲染图表/表格/文本
├── hooks/
│   └── usePptStorage.ts           # localStorage 读写封装（报告列表的 CRUD）
├── types/
│   └── ppt.ts                     # PPT 相关 TypeScript 类型
├── utils/
│   ├── pptTemplates.ts            # 预设模板配置数组
│   └── pptDesignTokens.ts         # 从 ppt-design-system.md 提取的样式常量
```

### 3.3 架构原则

1. **Wizard 状态不持久化**：`currentStep` 和 `reportDraft` 仅存于 React state。用户刷新页面从第 1 步重来，简单可靠。在 `beforeunload` 事件中提示"离开将丢失未保存的进度"。
2. **报告数据仅在完成时写入**：第 3 步点击"导出 PDF"或"保存"后才调用 `usePptStorage.saveReport()`，形成一条完整记录。
3. **编辑即重新进入 wizard**：`edit/:id` 加载已有报告数据，作为 `initialData` 传入 `CreateReport`，从第 1 步开始，所有字段预填。

---

## 四、数据模型与存储

### 4.1 核心类型（`src/types/ppt.ts`）

```typescript
export interface PptReport {
  id: string;              // 唯一ID，格式：report-{timestamp}
  name: string;            // 报告名称
  department: string;      // 部门
  date: string;            // 日期，格式 YYYY-MM-DD
  author: string;          // 作者
  templateId: string;      // 选用的模板ID
  slides: PptSlideData[];  // 页面列表
  createdAt: number;       // 创建时间戳
  updatedAt: number;       // 最后更新时间戳
}

export interface PptSlideData {
  id: string;              // 页面唯一ID，格式：slide-{index}
  title: string;           // 标题区，最多 20 字
  conclusion: string;      // 结论区，最多 150 字，分 2-3 行
  content: SlideContent;   // 内容区
  note: string;            // 备注区，最多 40 字，一行显示
  pageNumber: number;
}

export type SlideContent =
  | { type: 'chart'; chartType: 'line' | 'bar' | 'pie'; data: unknown }
  | { type: 'table'; columns: string[]; rows: TableRow[] }
  | { type: 'text'; body: string }
  | { type: 'mixed'; blocks: Array<{ type: 'chart' | 'table' | 'text'; config: unknown }> };

export interface PptTemplate {
  id: string;
  name: string;
  backgroundColor: string;
  backgroundImage?: string;    // base64 或 CSS 渐变字符串
  headerStyle: {
    fontSize: number;
    color: string;
    fontWeight: string;
  };
}
```

### 4.2 存储方案（`src/hooks/usePptStorage.ts`）

使用 `localStorage`，键名为 `dashboard-ppt-reports`。

```typescript
function getAllReports(): PptReport[]
function getReportById(id: string): PptReport | undefined
function saveReport(report: PptReport): void   // 存在则更新，不存在则插入
function deleteReport(id: string): void
```

**容量预估**：单个报告约 50KB（含图表数据），100 个报告约 5MB，低于 localStorage 典型限制（5-10MB）。

**超限处理**：保存前检查序列化后长度，超过 4MB 时抛错，UI 层捕获并提示用户"报告数量过多，请删除旧报告后重试"。

**数据损坏处理**：`JSON.parse` 包 try-catch，失败时从 localStorage 移除损坏项，Toast 提示用户。

### 4.3 预设模板（`src/utils/pptTemplates.ts`）

第一阶段内置 3 套模板，遵循 `docs/ppt-design-system.md` 规范：

| 模板ID | 名称 | 背景色 | 标题色 | 说明 |
|--------|------|--------|--------|------|
| `brand-blue` | 品牌蓝（默认） | `#FFFFFF` | `#00467F` | 内部分析报告标准风格 |
| `light-gray` | 浅灰商务 | `#F5F6F8` | `#1A1A1A` | 柔和中性风格 |
| `dark-luxury` | 深色高端 | `#0f172a` | `#FFFFFF` | 深色模式，强调色 `#418FDE` |

模板配置为纯 TypeScript 常量，第一阶段不支持用户自定义模板。

---

## 五、Wizard 三步详细设计

### 5.1 Step 1：填写报告信息

**表单字段**：
- 报告名称（`<input type="text">`，必填，maxLength=30）
- 部门（`<input type="text">`，必填）
- 日期（`<input type="date">`，默认值为当天）
- 作者（`<input type="text">`，默认值从 `useAuth` 读取当前登录用户名）

**交互**：
- 所有字段填写后才可点击"下一步"
- 无额外复杂验证规则

### 5.2 Step 2：选择模板 + 配置页面内容

**界面布局**：左右分栏（左 30%，右 70%）

**左栏 — 模板选择**：
- 3 个模板卡片垂直排列
- 每个卡片显示模板名称 + 缩略色块（模拟背景色和标题色）
- 点击选中，右侧实时预览更新

**右栏 — 页面配置**：
- 顶部：选择"数据来源模块"（下拉选择：销售收入、客户新增、宽带新增、智家产品、权益产品、家庭组网、周四复盘）
- 选择后，系统调用 `dataGenerator.ts` 中对应模块的生成函数 + `slideSummary.ts` 中对应 `xxxSummary` 函数，自动生成页面列表
- 页面列表：垂直折叠面板（Accordion），每页显示预填充的标题和结论
- 点击展开后，可编辑：
  - 标题（input，maxLength=20，实时字数统计）
  - 结论（textarea，maxLength=150，实时字数统计）
  - 备注（input，maxLength=40，实时字数统计）
- 任意字段超限时，边框变红，阻止进入下一步

**第一阶段限制**：
- 页面数量由数据来源模块固定决定，不支持新增/删除页面
- 不支持拖拽排序（第四阶段）
- 不支持修改页面布局结构（第四阶段）

### 5.3 Step 3：预览 + 导出

**界面布局**：
- 顶部栏：报告名称 + "导出 PDF"按钮（复用 `ExportButton`）
- 主体：垂直排列的 PPT 页面，每页 16:9 比例，宽度占满容器
- 每页结构：标题区（上）、结论区（中上）、内容区（中下）、备注区（下，12pt 灰色）、页码区（右下角）

**导出流程**：
1. 用户点击"导出 PDF"
2. 调用 `exportSlidesToPDF('#ppt-preview-slides', filename)`
3. 文件名格式：`{报告名称}-{部门}-{日期}-{作者}.pdf`
4. 下载完成后，自动调用 `saveReport()` 存档到 localStorage

**视觉规范**：
- 严格遵循 `docs/ppt-design-system.md` 的色彩、字体、字号、边距规范
- 通过 `pptDesignTokens.ts` 统一引用，禁止硬编码

### 5.4 Wizard 进度条

**组件**：`WizardNav`

**视觉**：
```
[ 1.填写信息 ] ——— [ 2.配置内容 ] ——— [ 3.预览导出 ]
   ✓ 完成            当前步骤           未开始
```
- 已完成：绿色圆点 + 对勾图标，节点间连线绿色
- 当前：蓝色圆点 + 数字
- 未完成：灰色圆点 + 数字，节点间连线灰色
- 节点下方显示步骤名称

**交互**：
- 点击已完成的步骤可回退到该步
- 当前步骤和未开始步骤不可点击

---

## 六、组件设计

### 6.1 复用现有组件

| 现有组件 | 复用方式 |
|---------|---------|
| `SlideSection.tsx` | 直接复用。已有 `title`、`description`（结论区）、`pageNumber`、`totalPages`、`children`（内容区）props。若结论区样式需支持 2-3 行，增加可选 `conclusionClassName` prop，不影响现有调用方。 |
| `pdfExport.ts` | 直接复用。通过 `data-slide` 属性识别页面。容器 id 传 `#ppt-preview-slides`。 |
| `ModuleLayout.tsx` | `CreateReport` 和 `ReportList` 用它包裹页面内容，保持与现有模块一致的标题栏风格。 |
| `ExportButton.tsx` | Step 3 直接复用，传入 `onExport` 调用 `exportSlidesToPDF`。 |

### 6.2 新增组件

**`WizardNav`**：
```typescript
interface WizardNavProps {
  steps: { label: string; description?: string }[];
  currentStep: number; // 0-based
  onStepClick?: (step: number) => void; // 仅允许点击已完成的步骤
}
```

**`PptSlide`**：
```typescript
interface PptSlideProps {
  slide: PptSlideData;
  template: PptTemplate;
  totalPages: number;
}
```
- 根据 `template` 生成背景色、标题样式 CSS 类
- 根据 `slide.content.type` 渲染内容：
  - `chart` → 复用现有图表组件（`RevenueLineChart`、`SimpleBarChart`、`SimplePieChart` 等）
  - `table` → 新增 `SlideTable`（纯 HTML table + Tailwind 样式，无外边框，斑马纹）
  - `text` → 纯文本块，支持简单 Markdown（`**粗体**`、换行）
  - `mixed` → 按 `blocks` 顺序垂直排列子块

**`SlideTable`**：
- 表头：背景 `#D6E7F5`，文字 `#00467F`，字号 14pt
- 数据行：交替白色 / `#F5F6F8`
- 边框：仅水平分割线 `#D9D9D9`，无垂直边框
- 单元格内边距：紧凑，适应 PPT 画布

---

## 七、错误处理与边界情况

| 场景 | 处理策略 |
|------|---------|
| localStorage 写入超限（QuotaExceededError） | 保存前检查序列化长度 > 4MB 时，UI 提示"报告数量过多，请删除旧报告后重试" |
| 报告数据解析失败（用户篡改 localStorage） | `JSON.parse` try-catch，失败时移除损坏项，Toast 提示"部分报告数据损坏，已自动清理" |
| PDF 导出失败（html2canvas 跨域、内存不足） | `exportSlidesToPDF` Promise catch，Toast 提示"导出失败，请重试或刷新页面" |
| 单页内容溢出（文字过多） | Step 2 编辑时实时字数统计，标题 >20、结论 >150、备注 >40 时红色提示并禁用"下一步" |
| 用户刷新 wizard 页面 | 状态不持久化，刷新从 Step 1 开始。`beforeunload` 提示"离开将丢失未保存的进度" |
| 无历史报告访问 `/ppt-editor/list` | 显示空状态插画 + "暂无报告，点击新建"按钮，引导用户创建 |
| 用户直接访问 `/ppt-editor/edit/:invalidId` | 跳转回 `/ppt-editor/list`，Toast 提示"报告不存在或已被删除" |

---

## 八、与现有代码集成点

### 8.1 Sidebar（`src/components/layout/Sidebar.tsx`）

在 `menuItems` 数组末尾新增：
```typescript
{ id: 'ppt-editor', label: '撰写PPT', icon: FileEdit, path: '/ppt-editor' }
```
需从 `lucide-react` 导入 `FileEdit` 图标。

### 8.2 App.tsx 路由（`src/App.tsx`）

新增导入和路由：
```typescript
import PptEditor from './pages/ppt-editor/PptEditor';
// ...
<Route path="/ppt-editor/*" element={<ProtectedRoute><PptEditor /></ProtectedRoute>} />
```

### 8.3 数据生成器（`src/utils/dataGenerator.ts`）

复用现有 `generateWeekReviewData`、`generateSalesRevenueData` 等函数。Step 2 用户选择数据来源模块后，调用对应函数生成 mock 数据，再传给 `slideSummary.ts` 生成结论文字。

### 8.4 幻灯片摘要（`src/utils/slideSummary.ts`）

复用现有 `salesRevenueOverviewSummary`、`weekReviewOverviewSummary` 等函数，预填充每页结论区。

### 8.5 样式常量（新增 `src/utils/pptDesignTokens.ts`）

将 `docs/ppt-design-system.md` 中的色彩体系提取为常量对象，供 `pptTemplates.ts` 和 `SlideSection` 样式统一引用，禁止硬编码。

---

## 九、分阶段路线图

### 第一阶段：MVP（约 2 周）

**目标**：用户能填写信息、选择模板、基于现有业务模块数据生成 PPT、预览并导出 PDF。

**任务清单**：
1. 新增路由 + Sidebar 入口
2. 实现 `usePptStorage` hook
3. 实现 `pptTemplates.ts` + `pptDesignTokens.ts`
4. 实现 `ReportList` 页面（列表 + 删除 + 新建）
5. 实现 Wizard 容器 + `WizardNav`
6. 实现 Step 1（信息表单）
7. 实现 Step 2（模板选择 + 页面配置 + 数据来源选择）
8. 实现 Step 3（预览 + PDF 导出）
9. 端到端集成测试

**交付标准**：
- 能完整走完 3 步 wizard 并下载 PDF
- PDF 样式符合 `ppt-design-system.md`
- 历史报告列表正常显示、可重新编辑、可删除
- 无 console.log，代码通过 TypeScript 编译

### 第二阶段：数据增强（约 1-2 周）

**新增功能**：
- Excel 导入（复用现有 `xlsx` 依赖解析 `.xlsx` 文件）
- `sheet → 页面` 映射配置界面
- 解析后的表格数据自动填充到 `SlideContent`（`type: 'table'`）
- 支持手动调整映射关系和解析结果

### 第三阶段：AI 增强（约 1-2 周）

**新增功能**：
- 设置面板：用户输入 OpenAI API Key，仅存储在 localStorage（可选启用）
- Excel 数据导入后，调用大模型 API 生成分析结论，自动填入结论区
- 支持对单页结论单独调用 AI 润色/扩写
- "一键生成全部分析结论"按钮

**安全说明**：API Key 仅存在于用户浏览器本地，不会上传至任何服务器。用户需自行保管密钥安全。

### 第四阶段：编辑器增强（可选，约 2 周）

**新增功能**：
- 页面拖拽排序（`@dnd-kit`）
- 轻量 Markdown 富文本编辑器（结论区和内容文本块）
- 自定义模板设计器（背景图上传、颜色调整），模板数据存入 localStorage

---

## 十、安全与性能

### 安全
- 无用户输入直接渲染为 HTML（避免 XSS）。表格和文本使用纯文本或安全渲染。
- 若第三阶段接入 AI，API Key 仅存 localStorage，不出现在网络请求的日志或源码中。

### 性能
- PDF 导出使用现有 `pdfExport.ts`，已优化 canvas 替换、布局冻结、DPR 处理。
- 图表组件懒加载：Step 3 预览时，不在视口内的页面图表可延迟初始化（可选优化）。
- localStorage 读写频率低（仅在 wizard 完成时写入），无性能瓶颈。

---

## 十一、原始问题对照表

| 原始问题 | 本设计解决方案 |
|---------|-------------|
| 服务器端文件系统不可行 | 使用 localStorage 替代，模板内置为 TS 常量 |
| 7 步工作流范围失控 | 压缩为 3 步 wizard，分 4 阶段渐进交付 |
| AI 集成未定义 | 放到第三阶段，明确 API Key 由用户自行配置 |
| 状态管理缺失 | Wizard 状态用 React state，报告数据 `PptReport` 类型明确定义 |
| 与现有代码脱节 | 复用 `pdfExport.ts`、`SlideSection.tsx`、`slideSummary.ts`、`dataGenerator.ts` |
| Excel 映射僵化 | 第二阶段引入映射配置界面，用户可手动调整 |
| 术语模糊 | 去除"DM 文档"、"Smart 图表"等不明术语，统一为图表/表格/文本 |
| 无错误处理 | 第七章明确列出 7 种边界场景的处理策略 |
| 中文文件名风险 | 导出时文件名格式明确为 `{名称}-{部门}-{日期}-{作者}.pdf` |

---

## 十二、附录：与现有代码的复用清单

| 文件 | 复用方式 | 是否需要修改 |
|------|---------|------------|
| `src/utils/pdfExport.ts` | 直接调用 `exportSlidesToPDF` | 否 |
| `src/components/common/SlideSection.tsx` | 直接作为 PPT 页容器 | 可能增加 `conclusionClassName` prop |
| `src/components/layout/ModuleLayout.tsx` | 包裹 `ReportList` 和 `CreateReport` | 否 |
| `src/components/common/ExportButton.tsx` | Step 3 复用 | 否 |
| `src/utils/slideSummary.ts` | 调用 `xxxSummary` 函数预填充结论 | 否 |
| `src/utils/dataGenerator.ts` | 调用对应模块生成函数获取数据 | 否 |
| `docs/ppt-design-system.md` | 提取为 `pptDesignTokens.ts` | 否（新增文件） |
