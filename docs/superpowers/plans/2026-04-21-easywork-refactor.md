# EasyWork 工作台重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有仪表盘 SPA 重构为 EasyWork 工作台，删除非保留业务模块，统一品牌标识。

**Architecture:** 基于现有 React + Vite + TypeScript 框架，通过删除文件和清理代码实现精简。保留登录、首页、销售收入、页面制作四个核心入口。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, react-router-dom, lucide-react

---

## 文件结构映射

### 删除的文件与目录
```
src/pages/CustomerAcquisition.tsx
src/pages/Broadband.tsx
src/pages/SmartHome.tsx
src/pages/RightsProducts.tsx
src/pages/HomeNetworking.tsx
src/pages/customer-acquisition/
src/pages/broadband/
src/pages/smart-home/
src/pages/rights-products/
src/pages/home-networking/
src/components/charts/RevenueLineChart.tsx
src/components/charts/UserGrowthBarChart.tsx
src/components/charts/MarketSharePieChart.tsx
src/components/charts/ChannelComboChart.tsx
src/components/charts/BusinessRadarChart.tsx
```

### 修改的文件
```
index.html                           — 修改 <title>
src/App.tsx                          — 删除已移除模块的路由和 import
src/components/layout/Navbar.tsx     — 左上角品牌名 Dashboard → EasyWork工作台
src/components/layout/Sidebar.tsx    — 精简菜单项，移除未使用 icon import
src/pages/Login.tsx                  — 修改标题和副标题文案
src/pages/Home.tsx                   — 精简模块预览卡片
src/types/index.ts                   — 删除未使用的业务数据类型
src/utils/dataGenerator.ts           — 删除未使用的生成函数
src/hooks/useModuleData.ts           — 精简 ModuleKey 和 generators
```

---

## Task 1: 删除不保留的业务页面文件

**Files:**
- Delete: `src/pages/CustomerAcquisition.tsx`
- Delete: `src/pages/Broadband.tsx`
- Delete: `src/pages/SmartHome.tsx`
- Delete: `src/pages/RightsProducts.tsx`
- Delete: `src/pages/HomeNetworking.tsx`
- Delete: `src/pages/customer-acquisition/` (目录及全部子文件)
- Delete: `src/pages/broadband/` (目录及全部子文件)
- Delete: `src/pages/smart-home/` (目录及全部子文件)
- Delete: `src/pages/rights-products/` (目录及全部子文件)
- Delete: `src/pages/home-networking/` (目录及全部子文件)

- [ ] **Step 1: 删除页面文件**

```bash
rm -f src/pages/CustomerAcquisition.tsx
rm -f src/pages/Broadband.tsx
rm -f src/pages/SmartHome.tsx
rm -f src/pages/RightsProducts.tsx
rm -f src/pages/HomeNetworking.tsx
rm -rf src/pages/customer-acquisition
rm -rf src/pages/broadband
rm -rf src/pages/smart-home
rm -rf src/pages/rights-products
rm -rf src/pages/home-networking
```

- [ ] **Step 2: 验证删除**

Run: `ls src/pages/`
Expected: 只保留 Broadband.tsx（哦不，这个也要删除）... 预期保留：Home.tsx, Login.tsx, PageBuilder.tsx, SalesRevenue.tsx 及 sales-revenue/ 目录

---

## Task 2: 删除死代码图表组件

**Files:**
- Delete: `src/components/charts/RevenueLineChart.tsx`
- Delete: `src/components/charts/UserGrowthBarChart.tsx`
- Delete: `src/components/charts/MarketSharePieChart.tsx`
- Delete: `src/components/charts/ChannelComboChart.tsx`
- Delete: `src/components/charts/BusinessRadarChart.tsx`

- [ ] **Step 1: 删除图表组件文件**

```bash
rm -f src/components/charts/RevenueLineChart.tsx
rm -f src/components/charts/UserGrowthBarChart.tsx
rm -f src/components/charts/MarketSharePieChart.tsx
rm -f src/components/charts/ChannelComboChart.tsx
rm -f src/components/charts/BusinessRadarChart.tsx
```

- [ ] **Step 2: 验证删除**

Run: `ls src/components/charts/`
Expected: 保留 ChartCard.tsx, SimpleBarChart.tsx, SimpleLineChart.tsx, SimplePieChart.tsx, RadarChart.tsx, ScatterChart.tsx, WaterfallChart.tsx

---

## Task 3: 修改 index.html 页面标题

**Files:**
- Modify: `index.html:8`

- [ ] **Step 1: 修改 title**

```html
<!-- index.html line 8 -->
<title>EasyWork工作台</title>
```

- [ ] **Step 2: 验证修改**

Run: `grep -n "title" index.html`
Expected: `<title>EasyWork工作台</title>`

---

## Task 4: 修改 App.tsx 路由表

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: 删除已移除模块的 import**

删除以下 import 行：
```typescript
import CustomerAcquisition from './pages/CustomerAcquisition';
import Broadband from './pages/Broadband';
import SmartHome from './pages/SmartHome';
import RightsProducts from './pages/RightsProducts';
import HomeNetworking from './pages/HomeNetworking';
```

保留：
```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import SalesRevenue from './pages/SalesRevenue';
import PageBuilder from './pages/PageBuilder';
```

- [ ] **Step 2: 删除已移除模块的 Route**

删除以下 Route 定义：
```tsx
<Route path="/customer-acquisition/*" element={...} />
<Route path="/broadband/*" element={...} />
<Route path="/smart-home/*" element={...} />
<Route path="/rights-products/*" element={...} />
<Route path="/home-networking/*" element={...} />
```

保留：
```tsx
<Route path="/login" element={<Login />} />
<Route path="/" element={<ProtectedRoute><Navigate to="/home" replace /></ProtectedRoute>} />
<Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
<Route path="/sales-revenue/*" element={<ProtectedRoute><SalesRevenue /></ProtectedRoute>} />
<Route path="/page-builder" element={<ProtectedRoute><PageBuilder /></ProtectedRoute>} />
```

- [ ] **Step 3: 验证修改**

Run: `npm run build`
Expected: TypeScript 编译通过（此时可能因其他文件引用报错，继续后续任务）

---

## Task 5: 修改 Sidebar.tsx 菜单

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: 精简 lucide-react import**

从 import 中删除未使用的图标：
```typescript
import {
  Home,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Presentation,
  BarChart3,
} from 'lucide-react';
```

删除：Users, Wifi, Gift, Network, Smartphone

- [ ] **Step 2: 精简 menuItems 数组**

```typescript
const menuItems: MenuItem[] = [
  { id: 'home', label: '首页', icon: Home, path: '/home' },
  { id: 'sales-revenue', label: '销售收入', icon: TrendingUp, path: '/sales-revenue' },
  { id: 'page-builder', label: '页面制作', icon: Presentation, path: '/page-builder' },
];
```

- [ ] **Step 3: 修改移动端 drawer 标题**

将 Sidebar.tsx 中移动端 drawer 的标题从 "菜单" 改为 "EasyWork工作台"：
```tsx
<span className="text-lg font-semibold text-gray-900 dark:text-white">
  EasyWork工作台
</span>
```

- [ ] **Step 4: 验证修改**

Run: `npm run build`
Expected: 编译通过（或仅因其他文件报错）

---

## Task 6: 修改 Navbar.tsx 品牌名

**Files:**
- Modify: `src/components/layout/Navbar.tsx:48-50`

- [ ] **Step 1: 修改左上角标题**

```tsx
<span className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block tracking-tight">
  EasyWork工作台
</span>
```

- [ ] **Step 2: 验证修改**

Run: `grep -n "EasyWork" src/components/layout/Navbar.tsx`
Expected: 包含 "EasyWork工作台"

---

## Task 7: 修改 Login.tsx 品牌标识

**Files:**
- Modify: `src/pages/Login.tsx:72-77`

- [ ] **Step 1: 修改主标题和副标题**

```tsx
<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
  欢迎登录 EasyWork工作台
</h1>
<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
  登录 EasyWork工作台
</p>
```

- [ ] **Step 2: 验证修改**

Run: `grep -n "EasyWork" src/pages/Login.tsx`
Expected: 包含 "欢迎登录 EasyWork工作台" 和 "登录 EasyWork工作台"

---

## Task 8: 修改 Home.tsx 模块卡片

**Files:**
- Modify: `src/utils/dataGenerator.ts:855-927`（generateHomePreviewData 函数）

- [ ] **Step 1: 精简 generateHomePreviewData 返回的模块列表**

将 generateHomePreviewData 函数中的 modules 数组只保留销售收入和页面制作：

```typescript
export function generateHomePreviewData(): HomePreviewData {
  const modules = [
    {
      id: 'sales-revenue',
      name: '销售收入',
      icon: 'TrendingUp',
      color: 'primary',
      path: '/sales-revenue',
      kpis: [
        { title: '本月收入', value: Math.round(random(80, 130) * 10) / 10, unit: '亿元', trend: random(2, 10) },
        { title: '收入增长率', value: Math.round(random(3, 12) * 100) / 100, unit: '%', trend: random(1, 5) },
      ],
    },
    {
      id: 'page-builder',
      name: '页面制作',
      icon: 'Presentation',
      color: 'info',
      path: '/page-builder',
      kpis: [
        { title: '幻灯片数', value: Math.round(random(3, 12)), unit: '页', trend: random(0, 5) },
        { title: '完成率', value: Math.round(random(60, 95) * 100) / 100, unit: '%', trend: random(1, 5) },
      ],
    },
  ];

  return { modules };
}
```

- [ ] **Step 2: 验证修改**

Run: `npm run build`
Expected: 编译通过（或仅因其他文件报错）

---

## Task 9: 清理 types/index.ts

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: 删除未使用的业务数据类型**

删除以下类型定义：
- `SalesRevenueData` 保留
- `CustomerAcquisitionData` 删除
- `BroadbandData` 删除
- `SmartHomeData` 删除
- `RightsProductsData` 删除
- `HomeNetworkingData` 删除
- `DashboardData` 删除
- `RevenueData` 删除
- `UserGrowthData` 删除
- `MarketShareData` 删除
- `RadarData` 删除
- `ComboData` 删除

保留：
- `TimeRange`
- `KPIData`
- `KPIMetric`
- `TrendChartData`
- `DistributionData`
- `RegionData`
- `ModuleConfig`
- `HomePreviewData`

- [ ] **Step 2: 验证修改**

Run: `npm run build`
Expected: 若其他文件引用了被删除的类型，会报错，根据报错继续清理

---

## Task 10: 清理 utils/dataGenerator.ts

**Files:**
- Modify: `src/utils/dataGenerator.ts`

- [ ] **Step 1: 删除未使用的生成函数**

删除以下函数：
- `generateKPIs`
- `generateRevenue`
- `generateUserGrowth`
- `generateMarketShare`
- `generateRadar`
- `generateCombo`
- `generateAllData`
- `updateKPIsRandomly`
- `generateCustomerAcquisitionData`
- `generateBroadbandData`
- `generateSmartHomeData`
- `generateRightsProductsData`
- `generateHomeNetworkingData`

保留：
- `generateSalesRevenueData`
- `generateHomePreviewData`
- `makeTrend`（内部辅助函数）
- `normalizeDistribution`（内部辅助函数）
- `random`, `randomInt`（内部辅助函数）
- `formatWan`（内部辅助函数）
- `seasonalFactor`, `weekdayFactor`（内部辅助函数）

- [ ] **Step 2: 同步更新 import 导出**

确保 `src/utils/dataGenerator.ts` 顶部的 import 只保留被保留函数使用的类型。

- [ ] **Step 3: 验证修改**

Run: `npm run build`
Expected: 编译通过

---

## Task 11: 清理 hooks/useModuleData.ts

**Files:**
- Modify: `src/hooks/useModuleData.ts`

- [ ] **Step 1: 精简 ModuleKey 类型**

```typescript
export type ModuleKey = 'sales-revenue' | 'home-preview';
```

- [ ] **Step 2: 精简 generators 对象和 import**

```typescript
import { generateSalesRevenueData, generateHomePreviewData } from '../utils/dataGenerator';

const generators = {
  'sales-revenue': generateSalesRevenueData,
} as const;
```

- [ ] **Step 3: 验证修改**

Run: `npm run build`
Expected: 编译通过

---

## Task 12: 最终构建验证

**Files:** 全局

- [ ] **Step 1: 运行 TypeScript 类型检查**

Run: `npm run build`
Expected: 零错误通过

- [ ] **Step 2: 启动开发服务器进行手动验证**

Run: `npm run dev`
然后验证：
1. 登录页显示 "欢迎登录 EasyWork工作台"
2. 侧边栏仅显示：首页、销售收入、页面制作
3. 首页卡片仅显示销售收入和页面制作
4. 销售收入模块所有子页面正常加载
5. 页面制作器正常加载
6. 已删除模块路由（如 /broadband）返回 404

- [ ] **Step 3: 提交所有变更**

```bash
git add -A
git status
# 确认删除和修改的文件列表正确
git commit -m "refactor: remove unused modules and rebrand to EasyWork工作台

- Delete customer-acquisition, broadband, smart-home, rights-products, home-networking modules
- Remove dead chart components (RevenueLineChart, UserGrowthBarChart, etc.)
- Clean up unused types and data generators
- Rebrand all UI labels to EasyWork工作台
- Retain login, home, sales-revenue, and page-builder modules

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## 自审检查清单

### Spec 覆盖
| 设计规范要求 | 对应任务 |
|---|---|
| 删除不保留的业务模块页面 | Task 1 |
| 删除死代码图表组件 | Task 2 |
| 修改 index.html 标题 | Task 3 |
| 修改 App.tsx 路由 | Task 4 |
| 修改 Sidebar.tsx 菜单 | Task 5 |
| 修改 Navbar.tsx 品牌 | Task 6 |
| 修改 Login.tsx 品牌 | Task 7 |
| 修改 Home.tsx 卡片 | Task 8 |
| 清理 types/index.ts | Task 9 |
| 清理 utils/dataGenerator.ts | Task 10 |
| 清理 hooks/useModuleData.ts | Task 11 |
| 构建验证 | Task 12 |

### Placeholder 扫描
- [x] 无 "TBD"/"TODO"
- [x] 无 "add appropriate error handling"
- [x] 无 "similar to Task N"
- [x] 每个修改步骤包含具体代码

### 类型一致性
- [x] `ModuleKey` 在 Task 11 中定义为 `'sales-revenue' | 'home-preview'`，与 useModuleData 中一致
- [x] `generateHomePreviewData` 在 Task 8 中保留的模块 id 与 Sidebar 菜单 id 一致
- [x] 保留的类型 `SalesRevenueData` 在 Task 9 中未被删除
