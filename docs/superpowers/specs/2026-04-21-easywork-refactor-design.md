# EasyWork 工作台重构设计

## 背景与目标

将现有中文仪表盘 SPA 重构为 **EasyWork 工作台**，保留系统框架、页面布局、登录功能、销售收入模块和页面制作器，删除其他业务模块，并将系统名称统一改为 EasyWork 工作台。

## 保留范围

### 页面与组件（不动结构）
- `src/App.tsx` — 路由框架（删减路由）
- `src/pages/Login.tsx` — 登录页（仅修改文案和标识）
- `src/pages/Home.tsx` — 工作台首页（仅筛选展示卡片）
- `src/pages/SalesRevenue.tsx` + `src/pages/sales-revenue/*` — 销售收入模块及全部子路由（overview、by-region、by-product、by-channel）
- `src/pages/PageBuilder.tsx` + `src/components/page-builder/*` — 页面制作器全部组件
- `src/components/layout/Navbar.tsx`、`Sidebar.tsx`、`ModuleLayout.tsx`
- `src/components/common/ProtectedRoute.tsx`、`ExportButton.tsx`、`TimeRangeSelector.tsx`、`SubIconNav.tsx` 等通用组件
- `src/components/charts/*`、`src/components/kpi/*`
- `src/contexts/AuthContext.tsx`
- `src/hooks/useAuth.ts`、`src/hooks/useTheme.ts`
- `src/utils/numberAnimation.ts`

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
```

## 修改清单

### 1. App.tsx
- 删除已移除模块的 `import` 语句
- 删除对应模块的 `<Route>` 定义
- 保留：Login、Home、SalesRevenue、PageBuilder

### 2. Sidebar.tsx
- `menuItems` 数组仅保留：
  - 首页 (`/home`)
  - 销售收入 (`/sales-revenue`)
  - 页面制作 (`/page-builder`)
- 移除未使用模块对应的 `lucide-react` import

### 3. Home.tsx
- `generateHomePreviewData()` 返回的模块列表仅保留：销售收入、页面制作
- 移除对已删除模块的引用

### 4. types/index.ts
- 删除类型：
  - `CustomerAcquisitionData`
  - `BroadbandData`
  - `SmartHomeData`
  - `RightsProductsData`
  - `HomeNetworkingData`
  - `DashboardData`
  - `RevenueData`
  - `UserGrowthData`
  - `MarketShareData`
  - `RadarData`
  - `ComboData`
- 保留类型：`TimeRange`、`KPIData`、`KPIMetric`、`TrendChartData`、`DistributionData`、`RegionData`、`SalesRevenueData`、`HomePreviewData`、`ModuleConfig`

### 5. utils/dataGenerator.ts
- 删除函数：
  - `generateCustomerAcquisitionData`
  - `generateBroadbandData`
  - `generateSmartHomeData`
  - `generateRightsProductsData`
  - `generateHomeNetworkingData`
- 删除函数：
  - `generateKPIs`
  - `generateRevenue`
  - `generateUserGrowth`
  - `generateMarketShare`
  - `generateRadar`
  - `generateCombo`
  - `generateAllData`
  - `updateKPIsRandomly`
- `generateHomePreviewData` 仅返回保留模块的预览数据

### 6. hooks/useModuleData.ts
- `ModuleKey` 仅保留：
  - `'sales-revenue'`
  - `'home-preview'`
- `generators` 对象仅映射保留模块

### 7. utils/excelExport.ts
- 保留所有通用转换函数，不做主动删除（避免破坏保留模块的导出功能）
- 实际未使用的函数将在构建时通过 tree-shaking 自动排除

### 8. 品牌重命名

| 位置 | 当前文案 | 新文案 |
|------|---------|--------|
| `index.html` `<title>` | 待确认 | EasyWork工作台 |
| `Navbar.tsx` 左上角标题 | Dashboard | EasyWork工作台 |
| `Login.tsx` 主标题 | 欢迎登录 | 欢迎登录 EasyWork工作台 |
| `Login.tsx` 副标题 | 请输入您的账号和密码 | 登录 EasyWork工作台 |
| `Sidebar.tsx` 移动端 drawer 标题 | 菜单 | EasyWork工作台 |

## 数据流与错误处理

- 本重构不涉及 API 调用变更，所有数据仍为客户端 mock 数据
- `useModuleData` 的 `ModuleKey` 类型收窄后，TypeScript 会在编译期捕获非法模块 key
- 删除文件后若存在残留 import，构建（`npm run build`）会直接报错，需全部清理干净

## 验证方式

1. `npm run build` — 必须零错误通过 TypeScript 类型检查
2. `npm run dev` — 手动验证：
   - 登录页显示 EasyWork 工作台标识
   - 侧边栏仅显示 首页、销售收入、页面制作
   - 首页卡片仅显示保留模块
   - 销售收入模块所有子页面正常
   - 页面制作器正常
   - 已删除模块路由返回 404（或自动跳转）
